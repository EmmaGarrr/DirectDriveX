# In file: Backend/app/api/v1/routes_upload.py

import uuid
import os
import re
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.file import FileMetadataCreate, FileMetadataInDB, InitiateUploadRequest, UploadStatus, sanitize_filename_for_display
from app.models.user import UserInDB
from app.db.mongodb import db
from app.services.auth_service import get_current_user_optional, get_current_user
# --- MODIFIED: Import the pool manager instead of the whole service ---
from app.services.google_drive_service import gdrive_pool_manager, create_resumable_upload_session
# --- NEW: Import upload limits service and IP extraction ---
from app.services.upload_limits_service import upload_limits_service
from app.services.admin_auth_service import get_client_ip
from app.core.config import settings
# from app.ws_manager import manager # Assuming you have a WebSocket manager for admin logs

# --- SECURITY: File type validation constants ---
BLOCKED_EXTENSIONS = {
    '.exe', '.bat', '.scr', '.com', '.cmd', 
    '.ps1', '.vbs', '.jar', '.msi', '.deb', 
    '.rpm', '.dmg', '.pkg', '.app', '.pif',
    '.scf', '.lnk', '.inf', '.reg'
}

BLOCKED_MIME_TYPES = {
    'application/x-msdownload',
    'application/x-executable', 
    'application/executable',
    'application/x-winexe',
    'application/x-msdos-program',
    'application/x-dosexec',
    'application/x-ms-dos-executable',
    'application/x-bat',
    'application/x-sh'
}

# --- SECURITY: File size input validation functions ---
def safe_size_validation(size: int) -> tuple[bool, str]:
    """
    Safely validate file size with overflow protection and input safety checks
    
    Args:
        size: File size value to validate
    
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    try:
        # Check if size is an integer
        if not isinstance(size, int):
            return False, "File size must be a valid integer"
        
        # Check for negative values
        if size <= 0:
            return False, "Invalid file size: File size must be greater than 0 bytes"
        
        # Check against maximum input validation limit (10GB)
        max_size = settings.MAX_FILE_SIZE_INPUT_VALIDATION
        if size > max_size:
            max_size_gb = settings.MAX_FILE_SIZE_INPUT_VALIDATION_GB
            return False, f"Invalid file size: File size exceeds maximum allowed limit of {max_size_gb}GB"
        
        return True, "File size is valid"
        
    except (OverflowError, ValueError, TypeError) as e:
        return False, f"Invalid file size: Please provide a valid file size ({str(e)})"

def validate_file_size_input(size: int) -> None:
    """
    Validate file size input and raise HTTPException if invalid
    
    Args:
        size: File size to validate
    
    Raises:
        HTTPException: If file size is invalid
    """
    is_valid, error_message = safe_size_validation(size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

def validate_file_safety(filename: str, content_type: str) -> tuple[bool, str]:
    """
    Validate file safety for upload to prevent malicious files
    
    Args:
        filename: The original filename from the client
        content_type: The MIME type provided by the client
    
    Returns:
        tuple: (is_safe: bool, error_message: str)
    """
    # Extract file extension (case-insensitive)
    file_ext = os.path.splitext(filename.lower())[1]
    
    # Check against blocked extensions
    if file_ext in BLOCKED_EXTENSIONS:
        return False, f"File type '{file_ext}' is not allowed for security reasons"
    
    # Check against blocked MIME types
    if content_type.lower() in BLOCKED_MIME_TYPES:
        return False, f"File type '{content_type}' is not allowed for security reasons"
    
    return True, "File type is safe"

# --- SECURITY: Filename sanitization functions ---
def sanitize_filename(filename: str, max_length: int = 255) -> Tuple[str, bool]:
    """
    Sanitize filename to prevent path traversal attacks and ensure safe storage
    
    Args:
        filename: Original filename from user
        max_length: Maximum allowed filename length (default 255)
    
    Returns:
        Tuple of (sanitized_filename: str, was_modified: bool)
    """
    if not filename or not isinstance(filename, str):
        return generate_safe_default_filename(), True
    
    original_filename = filename
    
    # Step 1: Remove/replace path separators and traversal attempts
    # Remove any path separators (forward slash, backslash)
    sanitized = filename.replace('/', '_').replace('\\', '_')
    
    # Remove path traversal patterns
    sanitized = sanitized.replace('..', '_')
    sanitized = sanitized.replace('./', '_')
    sanitized = sanitized.replace('.\\', '_')
    
    # Step 2: Remove control characters and dangerous characters
    # Remove control characters (ASCII 0-31 and 127)
    sanitized = ''.join(char for char in sanitized if ord(char) >= 32 and ord(char) != 127)
    
    # Remove other dangerous characters for file systems
    dangerous_chars = '<>:"|?*'
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Step 3: Handle Windows reserved names
    windows_reserved = [
        'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 
        'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 
        'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ]
    
    filename_without_ext = os.path.splitext(sanitized)[0]
    if filename_without_ext.upper() in windows_reserved:
        sanitized = f"file_{sanitized}"
    
    # Step 4: Handle length restrictions
    if len(sanitized) > max_length:
        # Try to preserve file extension if possible
        name, ext = os.path.splitext(sanitized)
        if ext:
            max_name_length = max_length - len(ext)
            sanitized = name[:max_name_length] + ext
        else:
            sanitized = sanitized[:max_length]
    
    # Step 5: Ensure filename is not empty or just dots/underscores
    sanitized = sanitized.strip('. ')
    if not sanitized or sanitized in ['.', '..', '_', '__', '___']:
        sanitized = generate_safe_default_filename()
        return sanitized, True
    
    # Step 6: Ensure filename doesn't start with dot (hidden files)
    if sanitized.startswith('.'):
        sanitized = 'file_' + sanitized[1:]
    
    was_modified = sanitized != original_filename
    return sanitized, was_modified

def generate_safe_default_filename() -> str:
    """
    Generate a safe default filename when original is invalid
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"file_{timestamp}_{unique_id}.txt"

def validate_filename_safety(filename: str) -> Tuple[bool, str]:
    """
    Validate if a filename is safe without modifying it
    
    Args:
        filename: Filename to validate
    
    Returns:
        Tuple of (is_safe: bool, error_message: str)
    """
    if not filename or not isinstance(filename, str):
        return False, "Filename cannot be empty"
    
    if len(filename) > 255:
        return False, "Filename is too long (maximum 255 characters)"
    
    # Check for path traversal patterns
    dangerous_patterns = ['../', '..\\', '../', '..\\']
    for pattern in dangerous_patterns:
        if pattern in filename:
            return False, "Filename contains path traversal patterns"
    
    # Check for control characters
    for char in filename:
        if ord(char) < 32 or ord(char) == 127:
            return False, "Filename contains invalid control characters"
    
    # Check for dangerous characters
    dangerous_chars = '<>:"|?*'
    for char in dangerous_chars:
        if char in filename:
            return False, f"Filename contains invalid character: {char}"
    
    return True, "Filename is safe"

router = APIRouter()

@router.post("/upload/initiate", response_model=dict)
async def initiate_upload(
    request: InitiateUploadRequest,
    client_request: Request,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
):
    # --- NEW: Extract client IP address ---
    client_ip = get_client_ip(client_request)
    user_id = current_user.id if current_user else None
    
    # --- SECURITY: Input validation layer (BEFORE business logic) ---
    # This validates that the input data is safe and valid, separate from business rules
    validate_file_size_input(request.size)
    
    # --- SECURITY: Validate file safety BEFORE processing ---
    is_safe, safety_error = validate_file_safety(request.filename, request.content_type)
    if not is_safe:
        raise HTTPException(status_code=400, detail=safety_error)
    
    # --- SECURITY: Sanitize filename to prevent path traversal attacks ---
    sanitized_filename, was_modified = sanitize_filename(request.filename)
    
    # Log filename modification for security tracking
    if was_modified:
        print(f"SECURITY: Filename sanitized from '{request.filename}' to '{sanitized_filename}'")
    
    # --- NEW: Check upload limits based on environment ---
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    enable_limits = False
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', False)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)
    
    if enable_limits:
        limits_check = await upload_limits_service.check_upload_limits(
            user_id=user_id,
            ip_address=client_ip,
            file_sizes=[request.size],
            is_batch=False
        )
        
        if not limits_check['allowed']:
            raise HTTPException(
                status_code=400, 
                detail=limits_check['reason']
            )
    
    file_id = str(uuid.uuid4())
    
    # --- NEW: Get an active account from the pool ---
    active_account = await gdrive_pool_manager.get_active_account()
    if not active_account:
        raise HTTPException(status_code=503, detail="All storage accounts are currently busy or unavailable. Please try again in a minute.")

    try:
        # --- MODIFIED: Pass the sanitized filename to the session creator ---
        gdrive_upload_url = create_resumable_upload_session(
            filename=sanitized_filename,
            filesize=request.size,
            account=active_account
        )
    except Exception as e:
        print(f"!!! FAILED to create Google Drive resumable session: {e}")
        raise HTTPException(status_code=503, detail="Cloud storage service is currently unavailable.")
    
    # --- NEW: Increment the upload volume for the chosen account ---
    gdrive_pool_manager.tracker.increment_upload_volume(active_account.id, request.size)

    # timestamp = datetime.utcnow().isoformat()
    # await manager.broadcast(f"[{timestamp}] [API_REQUEST] Google Drive: Initiate Resumable Upload for '{request.filename}'") 

    # --- NEW: Record upload for quota tracking ---
    if enable_limits:
        await upload_limits_service.record_upload(user_id, client_ip, [request.size])

    file_meta = FileMetadataCreate(
        _id=file_id,
        filename=sanitized_filename,  # Use sanitized filename for storage
        original_filename=request.filename,  # Store original filename for reference
        size_bytes=request.size,
        content_type=request.content_type,
        owner_id=user_id,
        status=UploadStatus.PENDING,
        # --- NEW: Save which account was used ---
        gdrive_account_id=active_account.id,
        # --- NEW: Add IP tracking and anonymous user info ---
        ip_address=client_ip,
        is_anonymous=user_id is None,
        daily_quota_used=request.size
    )
    db.files.insert_one(file_meta.model_dump(by_alias=True))
    
    # Background refresh of the target account's quota and stats so Admin UI updates quickly
    try:
        from app.services.google_drive_account_service import GoogleDriveAccountService
        import asyncio
        asyncio.create_task(GoogleDriveAccountService.update_account_after_file_operation(active_account.id, request.size))
    except Exception as e:
        print(f"[UPLOAD] Failed to schedule account stat refresh for {active_account.id}: {e}")

    return {"file_id": file_id, "gdrive_upload_url": gdrive_upload_url, "filename": request.filename, "safe_filename_for_display": sanitize_filename_for_display(request.filename)}

@router.post("/upload/cancel/{file_id}")
async def cancel_upload(file_id: str):
    """Cancel an active upload and clean up resources"""
    
    # 1. Find the file
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    # 2. Check if it's actually in a cancellable state
    current_status = file_doc.get("status")
    if current_status not in [UploadStatus.PENDING, UploadStatus.UPLOADING]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel file with status '{current_status}'. Only pending or uploading files can be cancelled."
        )
    
    # 3. Update status to CANCELLED
    update_result = db.files.update_one(
        {"_id": file_id}, 
        {
            "$set": {
                "status": "cancelled", 
                "cancelled_at": datetime.utcnow(),
                "cancelled_by": "user"  # Track who cancelled it
            }
        }
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update file status")
    
    # 4. Clean up Google Drive session (if possible)
    try:
        # Note: We don't have the gdrive_upload_url stored in the file doc
        # The WebSocket will handle the actual cleanup when it detects disconnection
        print(f"[UPLOAD_CANCEL] File {file_id} marked as cancelled. WebSocket cleanup will handle resource cleanup.")
    except Exception as e:
        print(f"[UPLOAD_CANCEL] Warning: Error during cleanup for {file_id}: {e}")
    
    # 5. Log the cancellation for monitoring
    print(f"[UPLOAD_CANCEL] Upload cancelled successfully for file: {file_id} (filename: {file_doc.get('filename', 'unknown')})")
    
    return {
        "message": "Upload cancelled successfully", 
        "file_id": file_id,
        "filename": file_doc.get("filename"),
        "safe_filename_for_display": sanitize_filename_for_display(file_doc.get("filename", "")),
        "cancelled_at": datetime.utcnow().isoformat()
    }

# --- NEW: Add quota info endpoint ---
@router.get("/upload/quota-info")
async def get_quota_info(
    client_request: Request,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
):
    """Get quota information for current user or IP"""
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    enable_limits = False
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', True)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)

    if not enable_limits:
        return {"message": "Upload limits are disabled"}
    
    client_ip = get_client_ip(client_request)
    user_id = current_user.id if current_user else None
    
    quota_info = await upload_limits_service.get_quota_info(user_id, client_ip)
    return quota_info

# --- HTTP routes for metadata/history remain the same ---
@router.get("/files/{file_id}", response_model=FileMetadataInDB)
async def get_file_metadata(file_id: str):
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    return FileMetadataInDB(**file_doc)

@router.get("/files/me/history", response_model=list[FileMetadataInDB])
async def get_user_file_history(current_user: UserInDB = Depends(get_current_user)):
    files = db.files.find({"owner_id": current_user.id})
    return [FileMetadataInDB(**f) for f in files]