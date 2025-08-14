# In file: Backend/app/api/v1/routes_upload.py

import uuid
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from app.models.file import FileMetadataCreate, FileMetadataInDB, InitiateUploadRequest, UploadStatus
from app.models.user import UserInDB
from app.db.mongodb import db
from app.services.auth_service import get_current_user_optional, get_current_user
# --- MODIFIED: Import the pool manager instead of the whole service ---
from app.services.google_drive_service import gdrive_pool_manager, create_resumable_upload_session
# from app.ws_manager import manager # Assuming you have a WebSocket manager for admin logs

router = APIRouter()

@router.post("/upload/initiate", response_model=dict)
async def initiate_upload(
    request: InitiateUploadRequest,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
):
    file_id = str(uuid.uuid4())
    
    # --- NEW: Get an active account from the pool ---
    active_account = await gdrive_pool_manager.get_active_account()
    if not active_account:
        raise HTTPException(status_code=503, detail="All storage accounts are currently busy or unavailable. Please try again in a minute.")

    try:
        # --- MODIFIED: Pass the active account to the session creator ---
        gdrive_upload_url = create_resumable_upload_session(
            filename=request.filename,
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

    file_meta = FileMetadataCreate(
        _id=file_id,
        filename=request.filename,
        size_bytes=request.size,
        content_type=request.content_type,
        owner_id=current_user.id if current_user else None,
        status=UploadStatus.PENDING,
        # --- NEW: Save which account was used ---
        gdrive_account_id=active_account.id
    )
    db.files.insert_one(file_meta.model_dump(by_alias=True))
    
    # Background refresh of the target account's quota and stats so Admin UI updates quickly
    try:
        from app.services.google_drive_account_service import GoogleDriveAccountService
        import asyncio
        asyncio.create_task(GoogleDriveAccountService.update_account_after_file_operation(active_account.id, request.size))
    except Exception as e:
        print(f"[UPLOAD] Failed to schedule account stat refresh for {active_account.id}: {e}")

    return {"file_id": file_id, "gdrive_upload_url": gdrive_upload_url}

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
        "cancelled_at": datetime.utcnow().isoformat()
    }

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