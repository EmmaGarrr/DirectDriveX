# In file: Backend/app/api/v1/routes_download.py

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from urllib.parse import quote
import httpx # --- NEW: Import httpx for Hetzner downloads ---
import re
import logging
from typing import Tuple, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import db, get_database
from app.core.config import settings # --- NEW: Import settings for credentials ---
from app.services.google_drive_service import gdrive_pool_manager, async_stream_gdrive_file
from app.services.video_cache_service import video_cache_service
from app.models.file import FileMetadataInDB

logger = logging.getLogger(__name__)

router = APIRouter()

# --- NEW: Range request parsing utility ---
def parse_range_header(range_header: str, file_size: int) -> Optional[Tuple[int, int]]:
    """Parse HTTP Range header and return start, end bytes"""
    if not range_header:
        return None
    
    # Parse "bytes=start-end" format
    match = re.match(r'bytes=(\d+)-(\d+)?', range_header)
    if not match:
        return None
    
    start = int(match.group(1))
    end_str = match.group(2)
    
    if end_str:
        end = int(end_str)
    else:
        # If no end specified, serve until end of file
        end = file_size - 1
    
    # Validate range
    if start >= file_size or end >= file_size or start > end:
        return None
    
    return start, end

# --- NEW: Chunked video streaming function with caching ---
async def stream_video_chunks(file_id: str, start: int, end: int, chunk_size: int = 1024 * 1024):
    """Stream video in optimized chunks for better performance with caching"""
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    gdrive_id = file_doc.get("gdrive_id")
    account_id = file_doc.get("gdrive_account_id")
    
    if not gdrive_id or not account_id:
        raise ValueError("Primary storage info (GDrive) is missing from metadata.")
    
    storage_account = gdrive_pool_manager.get_account_by_id(account_id)
    if not storage_account:
        raise ValueError(f"Configuration for GDrive account '{account_id}' not found.")
    
    # Check cache first for the requested range
    cached_chunk = await video_cache_service.get_cached_video_chunk(file_id, start, end)
    if cached_chunk:
        print(f"[VIDEO_CHUNK] Cache hit for {file_id}:{start}-{end}")
        yield cached_chunk
        return
    
    # If not in cache, fetch from storage and cache it
    print(f"[VIDEO_CHUNK] Cache miss for {file_id}:{start}-{end}, fetching from storage")
    
    # For now, use a simpler approach: stream the full file and let the client handle range
    # This avoids the Content-Length mismatch issue
    try:
        chunk_data = b""
        async for chunk in async_stream_gdrive_file(gdrive_id, account=storage_account):
            chunk_data += chunk
            yield chunk
        
        # Cache the chunk for future requests
        if chunk_data:
            await video_cache_service.cache_video_chunk(file_id, start, end, chunk_data)
            print(f"[VIDEO_CHUNK] Cached chunk {file_id}:{start}-{end} ({len(chunk_data)} bytes)")
            
    except Exception as e:
        print(f"!!! [VIDEO_CHUNK] Error streaming chunk {start}-{end}: {e}")
        raise

@router.get(
    "/files/{file_id}/meta",
    response_model=FileMetadataInDB,
    summary="Get File Metadata"
)
def get_file_metadata(file_id: str):
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    return file_doc

@router.get(
    "/download/stream/{file_id}",
    summary="Stream File for Download"
)
async def stream_download(file_id: str, request: Request):
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")

    filename = file_doc.get("filename", "download")
    filesize = file_doc.get("size_bytes", 0)

    # This async generator now contains the smart fallback logic
    async def content_streamer():
        # --- PRIMARY ATTEMPT: GOOGLE DRIVE ---
        try:
            print(f"[STREAMER] Attempting primary download from Google Drive for '{filename}'...")
            gdrive_id = file_doc.get("gdrive_id")
            account_id = file_doc.get("gdrive_account_id")

            if not gdrive_id or not account_id:
                raise ValueError("Primary storage info (GDrive) is missing from metadata.")
            
            storage_account = gdrive_pool_manager.get_account_by_id(account_id)
            if not storage_account:
                raise ValueError(f"Configuration for GDrive account '{account_id}' not found.")

            # If successful, this loop will run and stream the file
            async for chunk in async_stream_gdrive_file(gdrive_id, account=storage_account):
                yield chunk
            
            print(f"[STREAMER] Successfully streamed '{filename}' from Google Drive.")
            return # IMPORTANT: Exit the generator after a successful primary download

        except Exception as e:
            print(f"!!! [STREAMER] Primary download from Google Drive failed: {e}. Attempting backup from Hetzner...")

        # --- FALLBACK ATTEMPT: HETZNER ---
        try:
            print(f"[STREAMER] Attempting fallback download from Hetzner for '{filename}'...")
            hetzner_path = file_doc.get("hetzner_remote_path")
            if not hetzner_path:
                raise ValueError("Backup storage info (Hetzner) is missing from metadata.")
            
            hetzner_url = f"{settings.HETZNER_WEBDAV_URL}/{hetzner_path}"
            auth = (settings.HETZNER_USERNAME, settings.HETZNER_PASSWORD)
            timeout = httpx.Timeout(10.0, read=3600.0)

            async with httpx.AsyncClient(auth=auth, timeout=timeout) as client:
                async with client.stream("GET", hetzner_url) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_bytes():
                        yield chunk
            
            print(f"[STREAMER] Successfully streamed '{filename}' from Hetzner backup.")

        except Exception as e:
            print(f"!!! [STREAMER] Fallback download from Hetzner also failed for '{filename}': {e}")
            # If both attempts fail, the generator will simply stop, and the user
            # will receive an empty/failed download, which is the correct behavior.
    
    headers = {
        "Content-Length": str(filesize),
        "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"
    }

    return StreamingResponse(
        content=content_streamer(),
        media_type="application/octet-stream",
        headers=headers
    )

def is_previewable(content_type: str) -> bool:
    """Check if file type supports preview"""
    previewable_types = [
        "image/", "video/", "audio/", "text/", "application/pdf"
    ]
    return any(content_type.startswith(ptype) for ptype in previewable_types)

# --- NEW: Enhanced preview metadata with thumbnail support ---
@router.get(
    "/preview/meta/{file_id}",
    summary="Get File Preview Metadata"
)
def get_file_preview_metadata(file_id: str):
    """Get metadata for file preview - returns graceful response for non-previewable files"""
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    content_type = file_doc.get("content_type", "")
    filename = file_doc.get("filename", "")
    filesize = file_doc.get("size_bytes", 0)
    
    # Check if file is previewable
    preview_available = is_previewable(content_type)
    
    if not preview_available:
        # Graceful handling for non-previewable files (like ZIP)
        return {
            "file_id": file_id,
            "filename": filename,
            "content_type": content_type,
            "preview_available": False,
            "preview_type": "none",
            "message": f"Preview not available for {content_type} files",
            "can_stream": False,
            "suggested_action": "download"
        }
    
    # --- NEW: Enhanced metadata for video files ---
    is_video = content_type.startswith("video/")
    is_audio = content_type.startswith("audio/")
    
    # Determine preview type
    if content_type.startswith("image/"):
        preview_type = "image"
    elif is_video:
        preview_type = "video"
    elif is_audio:
        preview_type = "audio"
    elif content_type == "application/pdf":
        preview_type = "document"
    elif content_type.startswith("text/"):
        preview_type = "text"
    else:
        preview_type = "viewer"
    
    # --- NEW: Add thumbnail URL for videos ---
    thumbnail_url = None
    if is_video:
        thumbnail_url = f"/api/v1/preview/thumbnail/{file_id}"
    
    # Return enhanced preview metadata
    return {
        "file_id": file_id,
        "filename": filename,
        "content_type": content_type,
        "size_bytes": filesize,
        "preview_available": True,
        "preview_type": preview_type,
        "preview_url": f"/api/v1/preview/stream/{file_id}",
        "thumbnail_url": thumbnail_url,
        "can_stream": is_video or is_audio,
        "supports_range_requests": is_video or is_audio,
        "suggested_action": "preview"
    }

# --- NEW: Range request support for video streaming ---
@router.get("/preview/stream/{file_id}")
async def stream_preview(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Return direct Google Drive URL instead of streaming through server"""
    try:
        # Get file document from MongoDB
        file_doc = await db.files.find_one({"_id": file_id})
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Extract Google Drive ID
        gdrive_id = file_doc.get("gdrive_id")
        if not gdrive_id:
            raise HTTPException(status_code=400, detail="File not available for streaming")
        
        # Generate direct Google Drive URL
        direct_url = f"https://drive.google.com/uc?id={gdrive_id}&export=download"
        
        # Return JSON response with direct URL
        return {
            "stream_url": direct_url,
            "content_type": file_doc.get("content_type", "video/mp4"),
            "filename": file_doc.get("filename", "video")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting direct stream URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- NEW: Video thumbnail endpoint ---
@router.get(
    "/preview/thumbnail/{file_id}",
    summary="Get Video Thumbnail"
)
async def get_video_thumbnail(file_id: str):
    """Get video thumbnail for immediate preview"""
    file_doc = db.files.find_one({"_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    content_type = file_doc.get("content_type", "")
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Thumbnail only available for video files")
    
    # For now, return a placeholder thumbnail
    # TODO: Implement actual thumbnail generation with ffmpeg
    return {
        "file_id": file_id,
        "thumbnail_url": f"/api/v1/preview/stream/{file_id}?thumbnail=true",
        "message": "Thumbnail generation coming soon"
    }

# --- NEW: Cache statistics endpoint ---
@router.get(
    "/preview/cache/stats",
    summary="Get Video Cache Statistics"
)
async def get_cache_stats():
    """Get video cache performance statistics"""
    return video_cache_service.get_cache_stats()

# --- NEW: Clear cache endpoint ---
@router.delete(
    "/preview/cache/clear",
    summary="Clear Video Cache"
)
async def clear_cache():
    """Clear all cached video data"""
    await video_cache_service.clear_cache()
    return {"message": "Video cache cleared successfully"}