# FILE: Backend/app/main.py

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio
import psutil

from app.api.v1.routes_upload import router as http_upload_router
from app.api.v1 import routes_auth, routes_download, routes_batch_upload
from app.db.mongodb import db
from app.models.file import UploadStatus, StorageLocation
from app.core.config import settings
# Use the new, stable backup service
from app.services import backup_service
from app.services.google_drive_account_service import GoogleDriveAccountService
from app.services.google_drive_service import gdrive_pool_manager
# Priority queue middleware
from app.middleware.priority_middleware import PriorityMiddleware
# New parallel upload services
from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.services.memory_monitor import memory_monitor
from app.services.parallel_chunk_processor import sequential_chunk_processor
from app.services.streaming_chunk_processor import streaming_chunk_processor

# Strict concurrency limiter for server stability
BACKUP_TASK_SEMAPHORE = asyncio.Semaphore(1)

# --- NEW: PROCESSOR SELECTION LOGIC ---
def get_upload_processor():
    """Select the appropriate upload processor based on configuration"""
    if not getattr(settings, 'ENABLE_STREAMING_UPLOADS', False):
        return sequential_chunk_processor
    
    # Check percentage-based rollout
    streaming_percentage = getattr(settings, 'STREAMING_UPLOAD_PERCENTAGE', 0)
    if streaming_percentage <= 0:
        return sequential_chunk_processor
    elif streaming_percentage >= 100:
        return streaming_chunk_processor
    else:
        # Random selection based on percentage
        import random
        if random.random() < (streaming_percentage / 100):
            return streaming_chunk_processor
        else:
            return sequential_chunk_processor

# --- The rest of the main.py file is largely the same ---
class ConnectionManager:
    # ...
    def __init__(self): 
        self.active_connections: List[WebSocket] = []
        self._periodic_task_started = False
        # Don't start periodic task during init - will start lazily when needed
        
    def _ensure_periodic_task_started(self):
        """Start periodic task if it hasn't been started yet"""
        if not self._periodic_task_started:
            try:
                # Only start task if we're in an async context
                loop = asyncio.get_running_loop()
                loop.create_task(self.periodic_updates())
                self._periodic_task_started = True
            except RuntimeError:
                # No running loop, task will start when needed
                pass
        
    async def connect(self, websocket: WebSocket): 
        # Ensure periodic task is started
        self._ensure_periodic_task_started()
        
        await websocket.accept()
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket): 
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
    async def broadcast(self, data: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"[WebSocket] Failed to send to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn)
    
    async def periodic_updates(self):
        """Send periodic system updates to connected admin clients"""
        while True:
            try:
                await asyncio.sleep(30)  # Send update every 30 seconds
                if self.active_connections:
                    import time
                    from app.db.mongodb import db
                    
                    # Get basic system stats
                    total_files = db.files.count_documents({})
                    total_users = db.users.count_documents({})
                    
                    await self.broadcast({
                        "type": "system_update",
                        "message": f"[System] {time.strftime('%H:%M:%S')} - Files: {total_files}, Users: {total_users}, Connections: {len(self.active_connections)}"
                    })
            except Exception as e:
                print(f"[WebSocket] Periodic update error: {e}")
                await asyncio.sleep(60)  # Wait longer on error

manager = ConnectionManager()
app = FastAPI(title="File Transfer Service")

def configure_cors(app):
    """
    Configure CORS middleware with environment-based settings
    """
    from app.core.config import settings, validate_cors_security
    
    allowed_origins = settings.get_allowed_origins()
    cors_methods = settings.get_cors_methods()
    cors_headers = settings.get_cors_headers()
    
    # Log CORS configuration for debugging (but not in production)
    if settings.DEBUG:
        print(f"CORS Configuration:")
        print(f"  Allowed Origins: {allowed_origins}")
        print(f"  Allow Credentials: {settings.CORS_ALLOW_CREDENTIALS}")
        print(f"  Allowed Methods: {cors_methods}")
        print(f"  Allowed Headers: {cors_headers}")
    
    # Validate that we're not using wildcard in production
    if "*" in allowed_origins and not settings.DEBUG:
        print("ERROR: Wildcard CORS origin (*) detected in production mode!")
        print("This is a serious security risk. Please configure specific origins.")
        # Fail hard in production (recommended)
        raise ValueError("Wildcard CORS origins not allowed in production")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=cors_methods,
        allow_headers=cors_headers,
    )

# Add priority middleware first (before CORS)
app.add_middleware(PriorityMiddleware)

# Configure CORS with environment-based settings
configure_cors(app)

# --- SECURITY HEADERS MIDDLEWARE IMPLEMENTATION ---
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Security Headers Middleware for DirectDriveX Application
    
    Automatically adds comprehensive HTTP security headers to all responses
    to protect against common web vulnerabilities including:
    - Clickjacking attacks (X-Frame-Options)
    - MIME-type sniffing attacks (X-Content-Type-Options)
    - XSS attacks (X-XSS-Protection, Content-Security-Policy)
    - Information disclosure (Referrer-Policy)
    
    Headers are environment-aware with stricter policies in production.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.logger = logging.getLogger(__name__)
        
        # Environment-based Content Security Policy configuration
        if getattr(settings, 'ENVIRONMENT', 'development') == "production":
            # PRODUCTION CSP: Strict security, no unsafe-eval
            self.csp_policy = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        else:
            # DEVELOPMENT CSP: More permissive for development tools
            self.csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https: blob:; "
                "font-src 'self' data:; "
                "connect-src 'self' ws: wss:; "
                "frame-ancestors 'none'; "
                "base-uri 'self'"
            )
        
        self.logger.info(f"SecurityHeadersMiddleware initialized for {getattr(settings, 'ENVIRONMENT', 'development')} environment")
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request and add security headers to response
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/route handler in chain
            
        Returns:
            Response: Original response with security headers added
        """
        
        # Process request through next middleware/handler
        response = await call_next(request)
        
        # Add comprehensive security headers to response
        security_headers = {
            # Clickjacking protection - prevent page embedding in frames
            "X-Frame-Options": "DENY",
            
            # MIME-type sniffing protection - force browsers to respect content-type
            "X-Content-Type-Options": "nosniff",
            
            # XSS protection - enable browser's built-in XSS filtering
            "X-XSS-Protection": "1; mode=block",
            
            # Referrer policy - control referrer information sharing
            "Referrer-Policy": "strict-origin-when-cross-origin",
            
            # Content Security Policy - comprehensive XSS and injection protection
            "Content-Security-Policy": self.csp_policy,
            
            # Additional security headers for enhanced protection
            "X-Permitted-Cross-Domain-Policies": "none",  # Prevent cross-domain policy abuse
            "X-Download-Options": "noopen"               # Prevent file execution in IE
        }
        
        # Apply all security headers to response
        for header_name, header_value in security_headers.items():
            response.headers[header_name] = header_value
        
        # Log security headers application for monitoring (DEBUG level only)
        if self.logger.isEnabledFor(logging.DEBUG):
            self.logger.debug(f"Applied security headers to {request.method} {request.url.path}")
        
        return response

# Add SecurityHeadersMiddleware to FastAPI application
# IMPORTANT: Add this AFTER existing middleware but BEFORE route includes
app.add_middleware(SecurityHeadersMiddleware)

# Log middleware registration
logging.getLogger(__name__).info("SecurityHeadersMiddleware registered successfully")

# --- Startup hooks for storage account health and pool sync ---
@app.on_event("startup")
async def startup_storage_management():
    # CORS Security Validation
    from app.core.config import settings, validate_cors_security
    if not validate_cors_security(settings):
        if not settings.DEBUG:
            raise ValueError("CORS security validation failed")
        else:
            print("WARNING: CORS security issues detected in development mode")
    
    try:
        # Ensure accounts collection exists, migrate from env on first run, and sync
        await GoogleDriveAccountService.initialize_service()
        # Prefer DB-backed pool over env; reload once at startup
        await gdrive_pool_manager.reload_from_db()  # type: ignore
        print("[MAIN] Google Drive account service initialized and pool reloaded from DB")
    except Exception as e:
        print(f"[MAIN] Startup storage management init failed: {e}")

    # Periodically refresh quota/health to keep gating accurate
    async def periodic_account_health_refresh():
        while True:
            try:
                await GoogleDriveAccountService.update_all_accounts_quota()
            except Exception as e:
                print(f"[MAIN] Periodic account quota refresh failed: {e}")
            # Refresh every 15 minutes
            await asyncio.sleep(900)

    try:
        asyncio.create_task(periodic_account_health_refresh())
        print("[MAIN] Scheduled periodic account health refresh task")
    except Exception as e:
        print(f"[MAIN] Failed to schedule periodic account health refresh: {e}")

@app.websocket("/ws_admin")
async def websocket_admin_endpoint(websocket: WebSocket, token: str = ""):
    """Admin WebSocket endpoint with real-time database role verification"""
    from app.services.admin_auth_service import get_current_admin
    from app.models.admin import AdminUserInDB
    from jose import JWTError, jwt
    from datetime import datetime
    from typing import Tuple, Optional
    
    def verify_admin_access(user_identifier: str) -> Tuple[bool, str]:
        """
        Verify user has current admin access by checking database
        
        Args:
            user_identifier: User ID or email from JWT token
        
        Returns:
            Tuple of (is_authorized: bool, message: str)
        """
        try:
            # Always check current database state, never trust JWT claims
            # Try to find user by ID first, then by email
            user = db.users.find_one({"_id": user_identifier}) or db.users.find_one({"email": user_identifier})
            
            if not user:
                return False, "User not found in database"
            
            # Check if user account is active (if you have account status)
            if user.get("status") == "disabled" or user.get("is_active") == False:
                return False, "User account is disabled"
            
            # Verify current role is admin or superadmin
            user_role = user.get("role", "").lower()
            if user_role not in ["admin", "superadmin"]:
                return False, f"User role '{user_role}' is not authorized for admin access"
            
            return True, f"User authorized with role: {user_role}"
            
        except Exception as e:
            # Log the error for debugging but don't expose internal details
            print(f"SECURITY ERROR: Database verification failed for user {user_identifier}: {e}")
            return False, "Authorization verification failed"

    def get_user_id_from_jwt(token: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract user identifier from JWT token without trusting role claims
        
        Args:
            token: JWT token string
        
        Returns:
            Tuple of (user_identifier: Optional[str], error_message: Optional[str])
        """
        try:
            # Decode JWT but only trust user identification, not role claims
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            
            # Try multiple possible user identification fields
            # Admin tokens typically use 'sub' for email, but also check other fields
            user_identifier = payload.get("user_id") or payload.get("sub") or payload.get("id") or payload.get("email")
            if not user_identifier:
                return None, "No user identifier found in token"
            
            return user_identifier, None
            
        except jwt.ExpiredSignatureError:
            return None, "Token has expired"
        except JWTError:
            return None, "Invalid token"
        except Exception as e:
            print(f"JWT decode error: {e}")
            return None, "Token processing failed"

    def log_websocket_security_event(event_type: str, user_id: str, message: str, success: bool = True):
        """
        Log security events for WebSocket connections
        """
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "event_type": event_type,
            "user_id": user_id,
            "message": message,
            "success": success,
            "endpoint": "admin_websocket"
        }
        
        # Log to console (replace with your preferred logging system)
        status = "SUCCESS" if success else "SECURITY_VIOLATION"
        print(f"[{timestamp}] {status}: {event_type} - User {user_id}: {message}")
        
        # Optional: Store security events in database for audit trail
        try:
            db.security_logs.insert_one(log_entry)
        except Exception as e:
            print(f"Failed to log security event: {e}")
    
    # Validate JWT token and extract user information
    try:
        if not token:
            await websocket.close(code=1008, reason="No authentication token provided")
            return
        
        # Step 1: Extract user identifier from token (don't trust role claims)
        user_identifier, jwt_error = get_user_id_from_jwt(token)
        if jwt_error or not user_identifier:
            log_websocket_security_event("token_validation_failed", user_identifier or "unknown", f"Token validation failed: {jwt_error}", False)
            await websocket.close(code=1008, reason=f"Token validation failed: {jwt_error}")
            return
        
        # Step 2: SECURITY - Always verify current database role
        is_authorized, auth_message = verify_admin_access(user_identifier)
        
        if not is_authorized:
            # Log security violation
            log_websocket_security_event("unauthorized_access_attempt", user_identifier, f"Unauthorized WebSocket access attempt: {auth_message}", False)
            
            # Close connection immediately with appropriate reason
            await websocket.close(code=1008, reason="Unauthorized: Admin access required")
            return
        
        # Step 3: Get user details for logging (now that we know they're authorized)
        user = db.users.find_one({"_id": user_identifier}) or db.users.find_one({"email": user_identifier})
        if not user:
            log_websocket_security_event("user_not_found", user_identifier, "User not found after successful role verification", False)
            await websocket.close(code=1008, reason="User verification failed")
            return
            
        # Create admin object for logging
        admin = AdminUserInDB(**user)
        
    except JWTError as e:
        log_websocket_security_event("jwt_error", "unknown", f"JWT validation error: {e}", False)
        await websocket.close(code=1008, reason="Invalid JWT token")
        return
    except Exception as e:
        log_websocket_security_event("authentication_error", "unknown", f"Authentication failed: {e}", False)
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Step 4: Accept connection only after successful authorization
    await manager.connect(websocket)
    
    # Log successful admin connection
    log_websocket_security_event("websocket_connection_authorized", user_identifier, f"Admin WebSocket connection authorized: {auth_message}", True)
    print(f"[WebSocket] Admin connected: {admin.email} (Role: {admin.role})")
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "system",
            "message": f"[WebSocket] Connected as {admin.role}: {admin.email}"
        })
        
        # Send initial system status
        import time
        await websocket.send_json({
            "type": "status",
            "message": f"[System] Admin panel connected at {time.strftime('%Y-%m-%d %H:%M:%S')}"
        })
        
        # Keep connection alive and handle messages
        while True:
            try:
                message = await websocket.receive_text()
                
                # Optional: Re-verify admin access periodically for long-running connections
                # This prevents privilege escalation during active sessions
                is_still_authorized, _ = verify_admin_access(user_identifier)
                if not is_still_authorized:
                    log_websocket_security_event("authorization_revoked", user_identifier, "Authorization revoked during active session", False)
                    await websocket.close(code=1008, reason="Authorization revoked")
                    break
                
                # Echo received messages and broadcast to demonstrate real-time capability
                response_msg = f"[{admin.role.upper()}] {admin.email}: {message}"
                
                # Broadcast to all connected admin clients
                await manager.broadcast({
                    "type": "admin_message",
                    "message": response_msg
                })
                
            except Exception as e:
                print(f"[WebSocket] Message handling error: {e}")
                break
                
    except WebSocketDisconnect:
        log_websocket_security_event("websocket_disconnected", user_identifier, f"Admin WebSocket disconnected: {admin.email}", True)
        print(f"[WebSocket] Admin disconnected: {admin.email}")
    except Exception as e:
        log_websocket_security_event("websocket_error", user_identifier, f"WebSocket connection error: {e}", False)
        print(f"[WebSocket] Connection error: {e}")
    finally:
        manager.disconnect(websocket)

async def run_controlled_backup(file_id: str):
    """Wrapper to run the backup task with the semaphore."""
    async with BACKUP_TASK_SEMAPHORE:
        print(f"[MAIN][Semaphore Acquired] Starting controlled backup for {file_id}")
        # Call the new backup service
        await backup_service.transfer_gdrive_to_hetzner(file_id)
    print(f"[MAIN][Semaphore Released] Finished controlled backup for {file_id}")

@app.websocket("/ws_api/upload/{file_id}")
async def websocket_upload_proxy(websocket: WebSocket, file_id: str, gdrive_url: str):
    await websocket.accept()
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc: await websocket.close(code=1008, reason="File ID not found"); return
    if not gdrive_url: await websocket.close(code=1008, reason="gdrive_url query parameter is missing."); return
    
    total_size = file_doc.get("size_bytes", 0)
    
    # --- NEW: Background task to check for cancellation ---
    cancellation_detected = False
    
    async def check_cancellation():
        nonlocal cancellation_detected
        while not cancellation_detected:
            try:
                await asyncio.sleep(0.5)  # Check every 500ms for instant detection
                current_file_doc = db.files.find_one({"_id": file_id})
                if current_file_doc and current_file_doc.get("status") == "cancelled":
                    cancellation_detected = True
                    print(f"[{file_id}] Background task detected cancellation, stopping upload")
                    break
            except Exception as e:
                print(f"[{file_id}] Error in cancellation check: {e}")
                break
    
    # Start the background cancellation checker
    cancellation_task = asyncio.create_task(check_cancellation())
    
    try:
        # Simplified upload proxy logic
        async with httpx.AsyncClient(timeout=None) as client:
            bytes_sent = 0
            while bytes_sent < total_size:
                # --- NEW: Check for cancellation before processing each chunk ---
                if cancellation_detected:
                    print(f"[{file_id}] Cancellation detected, stopping upload immediately")
                    break
                
                current_file_doc = db.files.find_one({"_id": file_id})
                if not current_file_doc:
                    print(f"[{file_id}] File document not found during upload, stopping")
                    break
                
                current_status = current_file_doc.get("status")
                if current_status == "cancelled":
                    print(f"[{file_id}] Upload detected as cancelled, stopping immediately")
                    cancellation_detected = True
                    break  # Exit immediately, no more Google Drive API calls
                
                if current_status not in ["pending", "uploading"]:
                    print(f"[{file_id}] File status changed to {current_status}, stopping upload")
                    break
                
                # --- END: Cancellation check ---
                
                message = await websocket.receive()
                chunk = message.get("bytes")
                if not chunk: continue
                
                start_byte = bytes_sent
                end_byte = bytes_sent + len(chunk) - 1
                headers = {'Content-Length': str(len(chunk)), 'Content-Range': f'bytes {start_byte}-{end_byte}/{total_size}'}
                
                # Update file status to uploading if this is the first chunk
                if bytes_sent == 0:
                    db.files.update_one({"_id": file_id}, {"$set": {"status": "uploading"}})
                
                response = await client.put(gdrive_url, content=chunk, headers=headers)
                
                if response.status_code not in [200, 201, 308]:
                    raise HTTPException(status_code=response.status_code, detail=f"Google Drive API Error: {response.text}")

                bytes_sent += len(chunk)
                await websocket.send_json({"type": "progress", "value": int((bytes_sent / total_size) * 100)})

        # Get final GDrive ID from the last response
        gdrive_response_data = response.json() if 'response' in locals() and response else {}
        gdrive_id = gdrive_response_data.get('id')
        if not gdrive_id and total_size > 0:
            raise Exception("Upload to GDrive succeeded, but no file ID was returned.")

        db.files.update_one({"_id": file_id}, {"$set": {"gdrive_id": gdrive_id, "status": UploadStatus.COMPLETED, "storage_location": StorageLocation.GDRIVE }})
        await websocket.send_json({"type": "success", "value": f"/api/v1/download/stream/{file_id}"})

        # Update Google Drive account stats promptly after successful upload
        try:
            updated_doc = db.files.find_one({"_id": file_id})
            if updated_doc and updated_doc.get("gdrive_account_id"):
                from app.services.google_drive_account_service import GoogleDriveAccountService
                await GoogleDriveAccountService.update_account_after_file_operation(
                    updated_doc.get("gdrive_account_id"),
                    updated_doc.get("size_bytes", 0)
                )
        except Exception as e:
            print(f"[MAIN] Failed to update account stats after upload {file_id}: {e}")
        
        print(f"[MAIN] Triggering silent Hetzner backup for file_id: {file_id}")
        asyncio.create_task(run_controlled_backup(file_id))

    except Exception as e:
        print(f"!!! [{file_id}] Upload proxy failed: {e}")
        # Only update status if it's not already cancelled
        current_file_doc = db.files.find_one({"_id": file_id})
        if current_file_doc and current_file_doc.get("status") != "cancelled":
            db.files.update_one({"_id": file_id}, {"$set": {"status": UploadStatus.FAILED}})
            try: await websocket.send_json({"type": "error", "value": "Upload failed."})
            except RuntimeError: pass
    finally:
        # Cancel the background task
        cancellation_task.cancel()
        try:
            await cancellation_task
        except asyncio.CancelledError:
            pass
        
        if websocket.client_state != "DISCONNECTED": await websocket.close()

# --- NEW: PARALLEL UPLOAD WEBSOCKET HANDLER ---
@app.websocket("/ws_api/upload_parallel/{file_id}")
async def websocket_upload_proxy_parallel(websocket: WebSocket, file_id: str, gdrive_url: str):
    """Parallel upload handler with improved performance and concurrency control"""
    print(f"[DEBUG] 🌐 WebSocket connection request for file {file_id}")
    
    await websocket.accept()
    print(f"[DEBUG] ✅ WebSocket accepted for file {file_id}")
    
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        print(f"[DEBUG] ❌ File ID {file_id} not found in database")
        await websocket.close(code=1008, reason="File ID not found")
        return
    
    if not gdrive_url:
        print(f"[DEBUG] ❌ gdrive_url query parameter missing for file {file_id}")
        await websocket.close(code=1008, reason="gdrive_url query parameter is missing.")
        return
    
    total_size = file_doc.get("size_bytes", 0)
    user_id = file_doc.get("owner_id", "anonymous")
    
    print(f"[DEBUG] 📊 File details - Size: {total_size} bytes, User: {user_id}")
    print(f"[PARALLEL_UPLOAD] Starting parallel upload for file {file_id} ({total_size} bytes)")
    
    # Check concurrency limits
    print(f"[DEBUG] 🔒 Checking concurrency limits...")
    if not await upload_concurrency_manager.acquire_upload_slot(user_id, file_id, total_size):
        print(f"[DEBUG] ❌ Failed to acquire upload slot for file {file_id}")
        await websocket.close(code=1008, reason="Upload limit exceeded or insufficient resources")
        return
    
    print(f"[DEBUG] ✅ Upload slot acquired for file {file_id}")
    
    # Allocate memory for upload
    # Dynamic memory allocation based on file size
    def calculate_memory_requirement(file_size: int) -> int:
        """Smart memory calculation based on file size"""
        if file_size < 100 * 1024 * 1024:  # Less than 100MB
            return int(file_size * 0.2)  # 20% for small files
        elif file_size < 1024 * 1024 * 1024:  # Less than 1GB
            return int(file_size * 0.1)  # 10% for medium files (unchanged)
        else:  # 1GB or larger
            return min(int(file_size * 0.05), 100 * 1024 * 1024)  # 5% but max 100MB

    estimated_memory = calculate_memory_requirement(total_size)
    print(f"[DEBUG] 💾 Allocating {estimated_memory // (1024*1024)} MB for file {file_id}")
    
    if not await memory_monitor.allocate_memory(file_id, estimated_memory):
        print(f"[DEBUG] ❌ Failed to allocate memory for file {file_id}")
        await upload_concurrency_manager.release_upload_slot(user_id, file_id)
        await websocket.close(code=1008, reason="Insufficient memory for upload")
        return
    
    print(f"[DEBUG] ✅ Memory allocated for file {file_id}")
    
    try:
        # Update file status to uploading
        print(f"[DEBUG] 📝 Updating file status to uploading...")
        db.files.update_one({"_id": file_id}, {"$set": {"status": "uploading"}})
        print(f"[DEBUG] ✅ File status updated")
        
        # Select appropriate processor and start processing
        processor = get_upload_processor()
        processor_type = "streaming" if processor == streaming_chunk_processor else "sequential"
        print(f"[DEBUG] 🚀 Starting {processor_type} chunk processor...")
        gdrive_id = await processor.process_upload_from_websocket(
            websocket, file_id, gdrive_url, total_size
        )
        print(f"[DEBUG] ✅ {processor_type} processing completed, GDrive ID: {gdrive_id}")
        
        # Update database with success
        print(f"[DEBUG] 💾 Updating database with success...")
        db.files.update_one(
            {"_id": file_id}, 
            {
                "$set": {
                    "gdrive_id": gdrive_id, 
                    "status": UploadStatus.COMPLETED, 
                    "storage_location": StorageLocation.GDRIVE
                }
            }
        )
        print(f"[DEBUG] ✅ Database updated successfully")
        
        # Send success response
        print(f"[DEBUG] 📤 Sending success response to frontend...")
        await websocket.send_json({
            "type": "success", 
            "value": f"/api/v1/download/stream/{file_id}"
        })
        print(f"[DEBUG] ✅ Success response sent")
        
        # Update Google Drive account stats
        try:
            print(f"[DEBUG] 📊 Updating Google Drive account stats...")
            updated_doc = db.files.find_one({"_id": file_id})
            if updated_doc and updated_doc.get("gdrive_account_id"):
                await GoogleDriveAccountService.update_account_after_file_operation(
                    updated_doc.get("gdrive_account_id"),
                    updated_doc.get("size_bytes", 0)
                )
                print(f"[DEBUG] ✅ Account stats updated")
        except Exception as e:
            print(f"[DEBUG] ⚠️ Failed to update account stats: {e}")
        
        # Trigger backup
        print(f"[PARALLEL_UPLOAD] Triggering backup for file_id: {file_id}")
        asyncio.create_task(run_controlled_backup(file_id))
        
        print(f"[PARALLEL_UPLOAD] Successfully completed upload for file {file_id}")
        
    except Exception as e:
        print(f"[DEBUG] ❌ Exception occurred: {e}")
        print(f"!!! [PARALLEL_UPLOAD] Upload failed for file {file_id}: {e}")
        
        # Update status to failed
        current_file_doc = db.files.find_one({"_id": file_id})
        if current_file_doc and current_file_doc.get("status") != "cancelled":
            db.files.update_one({"_id": file_id}, {"$set": {"status": UploadStatus.FAILED}})
        
        # Send error response
        try:
            await websocket.send_json({"type": "error", "value": f"Upload failed: {str(e)}"})
        except RuntimeError:
            pass
    
    finally:
        print(f"[DEBUG] 🧹 Starting cleanup...")
        # Cleanup resources
        await memory_monitor.release_memory(file_id)
        await upload_concurrency_manager.release_upload_slot(user_id, file_id)
        
        # Only close WebSocket if it's not already closed
        try:
            if websocket.client_state != "DISCONNECTED" and websocket.client_state != "CLOSED":
                print(f"[DEBUG] 🔒 Closing WebSocket...")
                await websocket.close()
                print(f"[DEBUG] ✅ WebSocket closed")
        except Exception as e:
            print(f"[DEBUG] ⚠️ WebSocket close error (ignored): {e}")
            pass
        
        print(f"[DEBUG] ✅ Cleanup completed for file {file_id}")

# --- END: PARALLEL UPLOAD HANDLER ---

# Include other routers
app.include_router(routes_auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(http_upload_router, prefix="/api/v1", tags=["Upload"])
app.include_router(routes_download.router, prefix="/api/v1", tags=["Download"])
app.include_router(routes_batch_upload.router, prefix="/api/v1/batch", tags=["Batch Upload"])

# Import and include admin routes
from app.api.v1 import routes_admin_auth, routes_admin_users, routes_admin_files, routes_admin_storage, routes_admin_monitoring, routes_admin_config, routes_admin_notifications, routes_admin_reports
app.include_router(routes_admin_auth.router, prefix="/api/v1/admin/auth", tags=["Admin Authentication"])
app.include_router(routes_admin_users.router, prefix="/api/v1/admin", tags=["Admin User Management"])
app.include_router(routes_admin_files.router, prefix="/api/v1/admin", tags=["Admin File Management"])
app.include_router(routes_admin_storage.router, prefix="/api/v1/admin", tags=["Admin Storage Management"])
app.include_router(routes_admin_monitoring.router, prefix="/api/v1/admin", tags=["Admin System Monitoring"])
app.include_router(routes_admin_config.router, prefix="/api/v1/admin", tags=["Admin Configuration"])
app.include_router(routes_admin_notifications.router, prefix="/api/v1/admin", tags=["Admin Notifications"])
app.include_router(routes_admin_reports.router, prefix="/api/v1/admin", tags=["Admin Reports & Export"])
@app.get("/")
def read_root(): return {"message": "Welcome to the File Transfer API"}

# --- NEW: MONITORING ENDPOINTS FOR PARALLEL UPLOAD SYSTEM ---
@app.get("/api/v1/system/upload-status")
async def get_upload_system_status():
    """Get comprehensive status of the upload system"""
    try:
        # Get current processor configuration
        current_processor = get_upload_processor()
        processor_type = "streaming" if current_processor == streaming_chunk_processor else "sequential"
        
        # Build status response based on current processor
        status = {
            "processor_config": {
                "current_processor": processor_type,
                "streaming_enabled": getattr(settings, 'ENABLE_STREAMING_UPLOADS', False),
                "streaming_percentage": getattr(settings, 'STREAMING_UPLOAD_PERCENTAGE', 0),
                "parallel_enabled": getattr(settings, 'ENABLE_PARALLEL_UPLOADS', False)
            },
            "concurrency_manager": upload_concurrency_manager.get_status(),
            "memory_monitor": memory_monitor.get_memory_status(),
            "system_info": {
                "total_memory_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                "available_memory_gb": round(psutil.virtual_memory().available / (1024**3), 2),
                "memory_usage_percent": psutil.virtual_memory().percent
            }
        }
        
        # Add processor-specific status
        if processor_type == "streaming":
            status["streaming_processor"] = streaming_chunk_processor.get_processor_status()
            status["buffer_pool"] = streaming_chunk_processor.get_chunk_buffer_pool_status()
        else:
            status["sequential_processor"] = {
                "max_concurrent_chunks": sequential_chunk_processor.max_concurrent_chunks,
                "active_uploads": len(sequential_chunk_processor.upload_progress),
                "chunk_semaphore_value": sequential_chunk_processor.chunk_semaphore._value
            }
            status["buffer_pool"] = sequential_chunk_processor.chunk_buffer_pool.get_pool_status()
        
        return status
    except Exception as e:
        return {"error": f"Failed to get system status: {str(e)}"}

@app.get("/api/v1/system/upload-progress/{file_id}")
async def get_upload_progress(file_id: str):
    """Get upload progress for a specific file"""
    try:
        # Try to get progress from both processors
        streaming_progress = await streaming_chunk_processor.get_upload_progress(file_id)
        sequential_progress = sequential_chunk_processor.get_upload_progress(file_id)
        
        # Return the progress that exists
        if streaming_progress:
            return streaming_progress
        elif sequential_progress:
            return sequential_progress
        else:
            return {"error": "File not found or no active upload"}
    except Exception as e:
        return {"error": f"Failed to get progress: {str(e)}"}

# --- END: MONITORING ENDPOINTS ---