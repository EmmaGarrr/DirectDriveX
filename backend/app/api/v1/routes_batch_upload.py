# File: Backend/app/api/v1/routes_batch_upload.py

import uuid
import os
import re
from pathlib import Path
from typing import Optional, List, Tuple
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime

from app.models.batch import BatchMetadata, InitiateBatchRequest, InitiateBatchResponse
from app.models.file import FileMetadataCreate, UploadStatus, FileMetadataInDB
from app.models.user import UserInDB
from app.db.mongodb import db
from app.services.auth_service import get_current_user_optional
# --- MODIFIED: Import the pool manager and helper functions ---
from app.services.google_drive_service import gdrive_pool_manager, create_resumable_upload_session
from app.services import zipping_service
# --- NEW: Import upload limits service and IP extraction ---
from app.services.upload_limits_service import upload_limits_service
from app.services.admin_auth_service import get_client_ip
from app.core.config import settings

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

# --- SECURITY: Filename sanitization functions (duplicated from routes_upload.py) ---
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

router = APIRouter()

@router.post("/initiate", response_model=InitiateBatchResponse)
async def initiate_batch_upload(
    request: InitiateBatchRequest,
    client_request: Request,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
):
    # --- NEW: Extract client IP address ---
    client_ip = get_client_ip(client_request)
    user_id = current_user.id if current_user else None
    
    # --- SECURITY: Input validation layer (BEFORE business logic) ---
    # Validate all file sizes in batch for input safety
    for i, file_info in enumerate(request.files):
        try:
            validate_file_size_input(file_info.size)
        except HTTPException as e:
            raise HTTPException(
                status_code=400,
                detail=f"File {i+1} ('{file_info.filename}'): {e.detail}"
            )
    
    # --- SECURITY: Validate all files in batch BEFORE processing ---
    for file_info in request.files:
        is_safe, safety_error = validate_file_safety(file_info.filename, file_info.content_type)
        if not is_safe:
            raise HTTPException(
                status_code=400, 
                detail=f"Upload rejected: dangerous file '{file_info.filename}' detected. {safety_error}"
            )
    
    # --- SECURITY: Sanitize all filenames in batch ---
    for file_info in request.files:
        sanitized_filename, was_modified = sanitize_filename(file_info.filename)
        if was_modified:
            print(f"SECURITY: Batch file sanitized from '{file_info.filename}' to '{sanitized_filename}'")
        # Store original filename for reference
        file_info.original_filename = file_info.filename
        # Update with sanitized filename
        file_info.filename = sanitized_filename
    
    # --- NEW: Check upload limits based on environment ---
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    enable_limits = False
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', True)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)
    
    if enable_limits:
        file_sizes = [file_info.size for file_info in request.files]
        limits_check = await upload_limits_service.check_upload_limits(
            user_id=user_id,
            ip_address=client_ip,
            file_sizes=file_sizes,
            is_batch=True
        )
        
        if not limits_check['allowed']:
            raise HTTPException(
                status_code=400, 
                detail=limits_check['reason']
            )
    
    # --- NEW: Get an active account from the pool for the entire batch ---
    active_account = await gdrive_pool_manager.get_active_account()
    if not active_account:
        raise HTTPException(status_code=503, detail="All storage accounts are currently busy or unavailable. Please try again in a minute.")

    batch_id = str(uuid.uuid4())
    file_upload_info_list = []
    file_ids_for_batch = []
    total_batch_size = 0

    for file_info in request.files:
        file_id = str(uuid.uuid4())
        total_batch_size += file_info.size

        try:
            # --- MODIFIED: Pass the same active account for every file in the batch ---
            gdrive_upload_url = create_resumable_upload_session(
                filename=file_info.filename,
                filesize=file_info.size,
                account=active_account
            )
        except Exception as e:
            print(f"!!! FAILED to create Google Drive resumable session for {file_info.filename}: {e}")
            raise HTTPException(status_code=503, detail=f"Cloud storage service is currently unavailable for file: {file_info.filename}")

        owner_id = user_id
        file_meta = FileMetadataCreate(
            _id=file_id,
            filename=file_info.filename,  # This is now the sanitized filename
            original_filename=getattr(file_info, 'original_filename', None),  # Store original filename
            size_bytes=file_info.size,
            content_type=file_info.content_type,
            owner_id=owner_id,
            status=UploadStatus.PENDING,
            batch_id=batch_id,
            # --- NEW: Save which account was used ---
            gdrive_account_id=active_account.id,
            # --- NEW: Add IP tracking and anonymous user info ---
            ip_address=client_ip,
            is_anonymous=user_id is None,
            daily_quota_used=file_info.size
        )
        db.files.insert_one(file_meta.model_dump(by_alias=True))

        file_upload_info_list.append(
            InitiateBatchResponse.FileUploadInfo(
                file_id=file_id,
                gdrive_upload_url=gdrive_upload_url,
                original_filename=file_info.filename
            )
        )
        file_ids_for_batch.append(file_id)

    # --- NEW: Increment upload volume once for the whole batch ---
    gdrive_pool_manager.tracker.increment_upload_volume(active_account.id, total_batch_size)

    # --- NEW: Record batch upload for quota tracking ---
    if enable_limits:
        file_sizes = [file_info.size for file_info in request.files]
        await upload_limits_service.record_upload(user_id, client_ip, file_sizes)

    owner_id = user_id
    batch_meta = BatchMetadata(
        _id=batch_id,
        file_ids=file_ids_for_batch,
        owner_id=owner_id
    )
    db.batches.insert_one(batch_meta.model_dump(by_alias=True))

    print(f"[BATCH_UPLOAD] Initiated batch {batch_id} on {active_account.id} with {len(file_ids_for_batch)} files.")

    return InitiateBatchResponse(
        batch_id=batch_id,
        files=file_upload_info_list
    )

@router.get("/{batch_id}", response_model=List[FileMetadataInDB])
async def get_batch_files_metadata(batch_id: str):
    batch_doc = db.batches.find_one({"_id": batch_id})
    if not batch_doc:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    file_docs_cursor = db.files.find({"batch_id": batch_id})
    files_list = [file for file in file_docs_cursor]
    
    if not files_list:
        raise HTTPException(status_code=404, detail="No files found for this batch")
    return files_list

@router.get("/download-zip/{batch_id}")
async def download_batch_as_zip(batch_id: str):
    zip_filename = f"batch_{batch_id}.zip"
    headers = {
        'Content-Disposition': f'attachment; filename="{zip_filename}"'
    }
    # The zipping service will now need to handle getting the right account for each file
    return StreamingResponse(
        zipping_service.stream_zip_archive(batch_id),
        media_type="application/zip",
        headers=headers
    )

@router.post("/cancel/{batch_id}")
async def cancel_batch_upload(batch_id: str):
    """Cancel an entire batch upload and all its files"""
    
    # 1. Find the batch
    batch_doc = db.batches.find_one({"_id": batch_id})
    if not batch_doc:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # 2. Get all files in the batch
    file_docs = list(db.files.find({"batch_id": batch_id}))
    if not file_docs:
        raise HTTPException(status_code=404, detail="No files found for this batch")
    
    # 3. Cancel all files in the batch
    cancelled_count = 0
    for file_doc in file_docs:
        if file_doc.get("status") in [UploadStatus.PENDING, UploadStatus.UPLOADING]:
            update_result = db.files.update_one(
                {"_id": file_doc["_id"]}, 
                {
                    "$set": {
                        "status": "cancelled", 
                        "cancelled_at": datetime.utcnow(),
                        "cancelled_by": "batch_cancel"
                    }
                }
            )
            if update_result.modified_count > 0:
                cancelled_count += 1
    
    # 4. Update batch status
    db.batches.update_one(
        {"_id": batch_id}, 
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.utcnow(),
                "cancelled_files_count": cancelled_count
            }
        }
    )
    
    print(f"[BATCH_CANCEL] Batch {batch_id} cancelled successfully. {cancelled_count} files cancelled.")
    
    return {
        "message": "Batch upload cancelled successfully",
        "batch_id": batch_id,
        "cancelled_files_count": cancelled_count,
        "total_files_in_batch": len(file_docs),
        "cancelled_at": datetime.utcnow().isoformat()
    }