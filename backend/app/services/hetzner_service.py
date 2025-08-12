# In file: Backend/app/services/hetzner_service.py

import asyncio
import httpx
import uuid
import traceback
import re
import time

from app.core.config import settings
from app.db.mongodb import db
from app.models.file import BackupStatus, StorageLocation
from app.services import google_drive_service

# The Producer-Consumer functions remain the same
async def producer(queue: asyncio.Queue, gdrive_id: str, account):
    try:
        print("[PRODUCER] Starting download from Google Drive...")
        async for chunk in google_drive_service.async_stream_gdrive_file(gdrive_id, account=account):
            await queue.put(chunk)
        print("[PRODUCER] Finished downloading. Placing sentinel in queue.")
        await queue.put(None)
    except Exception as e:
        print(f"!!! [PRODUCER] Error during download: {e}")
        await queue.put(None)
        raise

async def consumer(queue: asyncio.Queue):
    while True:
        chunk = await queue.get()
        if chunk is None:
            print("[CONSUMER] Sentinel received. Ending upload stream.")
            break
        yield chunk
        queue.task_done()

async def transfer_gdrive_to_hetzner(file_id: str):
    if not all([settings.HETZNER_WEBDAV_URL, settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD]):
        print("!!! [HETZNER_BACKUP] CRITICAL ERROR: Hetzner credentials are not configured in the .env file.")
        db.files.update_one({"_id": file_id}, {"$set": {"backup_status": BackupStatus.FAILED}})
        return

    print(f"[HETZNER_BACKUP] Starting backup task for file_id: {file_id}")
    
    try:
        file_doc = db.files.find_one({"_id": file_id})
        if not file_doc:
            print(f"!!! [HETZNER_BACKUP] File {file_id} not found in DB. Aborting.")
            return

        db.files.update_one({"_id": file_id}, {"$set": {"backup_status": BackupStatus.IN_PROGRESS}})

        # Prepare common variables
        remote_path = f"{file_id}/{file_doc.get('filename')}"
        auth = (settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD)
        file_size = file_doc.get("size_bytes", 0)

        # Create the directory on Hetzner - this is always required.
        directory_url = f"{settings.HETZNER_WEBDAV_URL}/{file_id}"
        async with httpx.AsyncClient(auth=auth) as client:
            mkcol_response = await client.request("MKCOL", directory_url)
            if mkcol_response.status_code not in [201, 405]:
                mkcol_response.raise_for_status()

        # --- FINAL FIX: HANDLE 0-BYTE FILES AS A SPECIAL CASE ---
        if file_size == 0:
            print(f"[HETZNER_BACKUP] File {file_id} is 0 bytes. Backup complete after directory creation.")
        else:
            # Only run the complex streaming logic for files with content.
            gdrive_id = file_doc.get("gdrive_id")
            gdrive_account_id = file_doc.get("gdrive_account_id")

            if not gdrive_id or not gdrive_account_id:
                raise ValueError("Missing gdrive_id or gdrive_account_id for non-empty file.")
                
            source_gdrive_account = google_drive_service.gdrive_pool_manager.get_account_by_id(gdrive_account_id)
            if not source_gdrive_account:
                raise ValueError(f"Could not find configuration for Google account: {gdrive_account_id}")

            queue = asyncio.Queue(maxsize=5)
            producer_task = asyncio.create_task(producer(queue, gdrive_id, source_gdrive_account))
            
            headers = {'Content-Length': str(file_size)}
            timeout_config = httpx.Timeout(30.0, read=1800.0, write=1800.0)
            
            file_upload_url = f"{settings.HETZNER_WEBDAV_URL}/{remote_path}"
            async with httpx.AsyncClient(auth=auth, timeout=timeout_config) as client:
                print(f"[HETZNER_BACKUP] Starting upload to Hetzner from consumer...")
                response = await client.put(file_upload_url, content=consumer(queue), headers=headers)
                response.raise_for_status()

            await producer_task
        # --- END OF FIX ---

        print(f"[HETZNER_BACKUP] Successfully transferred file {file_id} to Hetzner.")

        db.files.update_one({"_id": file_id}, {"$set": {"backup_status": BackupStatus.COMPLETED, "backup_location": StorageLocation.HETZNER, "hetzner_remote_path": remote_path}})

    except Exception as e:
        print(f"!!! [HETZNER_BACKUP] An exception occurred for file_id {file_id}. Reason: {e}")
        traceback.print_exc()
        db.files.update_one({"_id": file_id}, {"$set": {"backup_status": BackupStatus.FAILED}})

class HetznerService:
    """Service for managing Hetzner Storage Box operations"""
    
    async def delete_file(self, remote_path: str) -> bool:
        """
        Delete a single file from Hetzner storage
        """
        if not all([settings.HETZNER_WEBDAV_URL, settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD]):
            raise Exception("Hetzner credentials not configured")
        
        try:
            auth = httpx.BasicAuth(settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD)
            file_url = f"{settings.HETZNER_WEBDAV_URL}/{remote_path}"
            
            timeout_config = httpx.Timeout(30.0)
            async with httpx.AsyncClient(auth=auth, timeout=timeout_config) as client:
                response = await client.delete(file_url)
                
                if response.status_code == 204:
                    print(f"[HETZNER_DELETE] Successfully deleted file: {remote_path}")
                    return True
                elif response.status_code == 404:
                    print(f"[HETZNER_DELETE] File not found: {remote_path} (404) - already deleted")
                    return False
                else:
                    response.raise_for_status()
                    return True
                    
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                print(f"[HETZNER_DELETE] File not found: {remote_path} - already deleted")
                return False
            else:
                print(f"!!! [HETZNER_DELETE] HTTP error deleting file {remote_path}: {e}")
                raise e
        except Exception as e:
            print(f"!!! [HETZNER_DELETE] Unexpected error deleting file {remote_path}: {e}")
            raise e

    async def delete_all_files(self) -> dict:
        """
        Delete ALL files and directories from Hetzner storage
        This is a DANGEROUS operation - use with extreme caution!
        Returns dict with deletion statistics
        """
        if not all([settings.HETZNER_WEBDAV_URL, settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD]):
            raise Exception("Hetzner credentials not configured")
        
        try:
            print(f"🚨 [HETZNER_DELETE_ALL] STARTING COMPLETE STORAGE CLEANUP!")
            print(f"🚨 [HETZNER_DELETE_ALL] This will delete ALL data from Hetzner storage!")
            
            # For now, return a placeholder response since we removed the scanning functionality
            # This method can be enhanced later if needed
            return {
                "message": "Delete all files functionality has been removed. Use individual file deletion instead.",
                "deleted_files": 0,
                "deleted_dirs": 0,
                "errors": 0,
                "total_items": 0,
                "storage_cleaned": "0 B"
            }
            
        except Exception as e:
            error_msg = f"Failed to delete all files: {str(e)}"
            print(f"!!! [HETZNER_DELETE_ALL] {error_msg}")
            raise Exception(error_msg)

    async def delete_all_files_force(self) -> dict:
        """
        Force delete ALL files and directories from Hetzner storage WITHOUT scanning
        This is a DANGEROUS operation - use with extreme caution!
        Much faster than delete_all_files() as it skips storage scanning
        Returns dict with deletion statistics
        """
        if not all([settings.HETZNER_WEBDAV_URL, settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD]):
            raise Exception("Hetzner credentials not configured")
        
        try:
            print(f"💥 [HETZNER_FORCE_DELETE] STARTING FORCE STORAGE CLEANUP!")
            print(f"💥 [HETZNER_FORCE_DELETE] This will delete ALL data from Hetzner storage WITHOUT scanning!")
            
            # For now, return a placeholder response since we removed the scanning functionality
            # This method can be enhanced later if needed
            return {
                "message": "Force delete all files functionality has been removed. Use individual file deletion instead.",
                "deleted_files": 0,
                "deleted_dirs": 0,
                "errors": 0,
                "total_items": 0,
                "storage_cleaned": "0 B"
            }
            
        except Exception as e:
            error_msg = f"Failed to force delete all files: {str(e)}"
            print(f"!!! [HETZNER_FORCE_DELETE] {error_msg}")
            raise Exception(error_msg)

    def _format_bytes(self, bytes_value: int) -> str:
        """Helper method to format bytes into human readable format"""
        if bytes_value == 0:
            return "0 B"
        k = 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        i = 0
        while bytes_value >= k and i < len(sizes) - 1:
            bytes_value /= k
            i += 1
        return f"{bytes_value:.2f} {sizes[i]}"
