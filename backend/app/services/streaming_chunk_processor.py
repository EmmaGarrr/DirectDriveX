import json
import base64
import asyncio
import logging
import time
import random
from typing import Optional, Dict, Any
from dataclasses import dataclass
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

@dataclass
class StreamingUploadProgress:
    """Tracks upload progress for streaming uploads"""
    total_bytes: int
    bytes_uploaded: int
    start_time: float
    last_progress_time: float
    chunks_processed: int
    estimated_completion: Optional[float] = None

class StreamingChunkProcessor:
    """Memory-efficient streaming chunk processor that processes chunks immediately"""
    
    def __init__(self):
        # Get configuration from settings
        self.chunk_size = getattr(settings, 'STREAMING_CHUNK_SIZE_MB', 4) * 1024 * 1024  # 4MB default
        self.max_concurrent_chunks = getattr(settings, 'PARALLEL_UPLOAD_MAX_CONCURRENT_CHUNKS', 8)
        
        # Sequential processing semaphore (Google Drive requirement)
        self.chunk_semaphore = asyncio.Semaphore(1)  # Force sequential processing for memory efficiency
        
        # Progress tracking
        self.upload_progress: Dict[str, StreamingUploadProgress] = {}
        self._lock = asyncio.Lock()
        
        # HTTP client configuration
        self.http_timeout = httpx.Timeout(30.0, read=1800.0, write=1800.0)
        self.http_limits = httpx.Limits(
            max_keepalive_connections=10,  # Reduced from 50
            max_connections=20,  # Reduced from 50
            keepalive_expiry=30.0
        )
        
        # Flow control
        self.min_chunk_delay = 0.01  # 10ms minimum between chunks
        self.max_chunk_delay = 1.0   # 1s maximum delay
        
        logger.info(f"StreamingChunkProcessor initialized with {self.chunk_size // (1024*1024)}MB chunks, sequential processing")
    
    async def process_upload_from_websocket(self, websocket, file_id: str, gdrive_url: str, total_size: int) -> str:
        """Process upload by streaming chunks immediately without accumulation"""
        logger.info(f"Starting streaming upload for file {file_id} ({total_size} bytes)")
        
        # Initialize progress tracking
        async with self._lock:
            self.upload_progress[file_id] = StreamingUploadProgress(
                total_bytes=total_size,
                bytes_uploaded=0,
                start_time=time.time(),
                last_progress_time=time.time(),
                chunks_processed=0
            )
        
        try:
            # Create HTTP client for Google Drive uploads
            async with httpx.AsyncClient(timeout=self.http_timeout, limits=self.http_limits) as client:
                # Process chunks as they arrive from WebSocket
                bytes_received = 0
                chunk_number = 0
                
                while bytes_received < total_size:
                    # Receive single chunk from WebSocket
                    chunk_data = await self._receive_single_chunk(websocket)
                    if not chunk_data:
                        logger.warning(f"Received empty chunk for file {file_id}")
                        break
                    
                    # Process chunk immediately (no storage)
                    success = await self._process_chunk_immediately(
                        chunk_data, client, file_id, gdrive_url, chunk_number, total_size
                    )
                    
                    if not success:
                        raise Exception(f"Failed to process chunk {chunk_number}")
                    
                    # Update progress
                    chunk_size = len(chunk_data)
                    bytes_received += chunk_size
                    chunk_number += 1
                    
                    # Update progress tracking
                    await self._update_progress(file_id, chunk_size)
                    
                    # Send progress update to frontend
                    progress_percent = int((bytes_received / total_size) * 100)
                    await self._send_progress_update(websocket, progress_percent)
                    
                    # Flow control - prevent overwhelming the system
                    await self._flow_control()
                
                logger.info(f"Streaming upload completed for file {file_id}")
                # Finalize upload
                return await self._finalize_upload(file_id, gdrive_url, client)
                
        except Exception as e:
            logger.error(f"Streaming upload failed for file {file_id}: {e}")
            raise
        finally:
            # Cleanup progress tracking
            async with self._lock:
                if file_id in self.upload_progress:
                    del self.upload_progress[file_id]
    
    async def _receive_single_chunk(self, websocket) -> Optional[bytes]:
        """Receive and decode a single chunk from WebSocket"""
        try:
            message = await websocket.receive()
            
            # Handle different message types
            if message.get("type") == "websocket.disconnect":
                logger.warning("WebSocket disconnected during chunk reception")
                return None
            
            # Skip control messages
            if message.get("type") in ["progress", "control", "text"]:
                if message.get("text") == "DONE":
                    return None  # End of upload
                return None
            
            # Handle base64 encoded chunk data
            if "bytes" in message:
                chunk_data = message.get("bytes")
                if isinstance(chunk_data, str):
                    # Decode base64 string to bytes
                    try:
                        chunk_data = base64.b64decode(chunk_data)
                    except Exception as e:
                        logger.error(f"Failed to decode base64 chunk: {e}")
                        return None
                elif isinstance(chunk_data, bytes):
                    # Already in bytes format
                    pass
                else:
                    logger.error(f"Invalid chunk data type: {type(chunk_data)}")
                    return None
                
                return chunk_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error receiving chunk: {e}")
            return None
    
    async def _process_chunk_immediately(self, chunk_data: bytes, client: httpx.AsyncClient, 
                                       file_id: str, gdrive_url: str, chunk_number: int, 
                                       total_size: int) -> bool:
        """Process a single chunk immediately with retry logic"""
        async with self.chunk_semaphore:
            max_retries = 3
            
            for attempt in range(max_retries):
                try:
                    # Calculate byte range for this chunk
                    start_byte = chunk_number * self.chunk_size
                    end_byte = start_byte + len(chunk_data) - 1
                    
                    # Prepare headers for resumable upload
                    headers = {
                        'Content-Length': str(len(chunk_data)),
                        'Content-Range': f'bytes {start_byte}-{end_byte}/{total_size}'
                    }
                    
                    # Upload chunk immediately to Google Drive
                    response = await client.put(
                        gdrive_url,
                        content=chunk_data,
                        headers=headers
                    )
                    
                    # Check response status
                    if response.status_code in [200, 201, 308]:
                        logger.debug(f"Chunk {chunk_number} uploaded successfully for file {file_id}")
                        return True
                    else:
                        logger.warning(f"Google Drive API error: {response.status_code} - {response.text}")
                        
                except Exception as e:
                    logger.warning(f"Chunk {chunk_number} attempt {attempt + 1} failed: {e}")
                    
                    if attempt == max_retries - 1:
                        # Final attempt failed
                        logger.error(f"Chunk {chunk_number} failed after {max_retries} attempts")
                        return False
                    
                    # Wait before retry with exponential backoff
                    wait_time = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s
                    await asyncio.sleep(wait_time)
            
            return False
    
    async def _update_progress(self, file_id: str, bytes_uploaded: int):
        """Update upload progress tracking"""
        async with self._lock:
            if file_id in self.upload_progress:
                progress = self.upload_progress[file_id]
                progress.bytes_uploaded += bytes_uploaded
                progress.chunks_processed += 1
                progress.last_progress_time = time.time()
                
                # Calculate estimated completion
                if progress.chunks_processed > 0:
                    elapsed_time = time.time() - progress.start_time
                    chunks_per_second = progress.chunks_processed / elapsed_time
                    remaining_bytes = progress.total_bytes - progress.bytes_uploaded
                    remaining_chunks = remaining_bytes / self.chunk_size
                    progress.estimated_completion = time.time() + (remaining_chunks / chunks_per_second)
    
    async def _send_progress_update(self, websocket, progress_percent: int):
        """Send progress update to frontend"""
        try:
            await websocket.send_json({"type": "progress", "value": progress_percent})
        except Exception as e:
            logger.error(f"Failed to send progress update: {e}")
    
    async def _flow_control(self):
        """Implement flow control to prevent system overload"""
        # Small delay to prevent overwhelming the system
        await asyncio.sleep(self.min_chunk_delay)
    
    async def _finalize_upload(self, file_id: str, gdrive_url: str, client: httpx.AsyncClient) -> str:
        """Finalize the upload and get the final file ID"""
        try:
            # Get total file size from progress tracking
            total_bytes = 0
            async with self._lock:
                if file_id in self.upload_progress:
                    total_bytes = self.upload_progress[file_id].total_bytes
            
            # Send final request to complete upload
            response = await client.put(
                gdrive_url,
                content=b'',  # Empty content for finalization
                headers={'Content-Length': '0', 'Content-Range': f'bytes */{total_bytes}'}
            )
            
            if response.status_code in [200, 201]:
                # Parse response to get file ID
                response_data = response.json()
                gdrive_id = response_data.get('id')
                
                if gdrive_id:
                    logger.info(f"Upload finalized successfully for file {file_id}, GDrive ID: {gdrive_id}")
                    return gdrive_id
                else:
                    raise Exception("Upload succeeded but no file ID returned")
            else:
                raise Exception(f"Failed to finalize upload: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Failed to finalize upload for file {file_id}: {e}")
            raise
    
    async def get_upload_progress(self, file_id: str) -> Optional[dict]:
        """Get current upload progress for monitoring (compatible interface)"""
        async with self._lock:
            if file_id not in self.upload_progress:
                return None
            
            progress = self.upload_progress[file_id]
            elapsed_time = time.time() - progress.start_time
            
            return {
                "file_id": file_id,
                "total_chunks": progress.chunks_processed,  # Approximate
                "completed_chunks": progress.chunks_processed,
                "failed_chunks": 0,  # Streaming doesn't track failed chunks separately
                "bytes_uploaded": progress.bytes_uploaded,
                "total_bytes": progress.total_bytes,
                "progress_percent": round((progress.bytes_uploaded / progress.total_bytes) * 100, 1),
                "elapsed_time": round(elapsed_time, 1),
                "estimated_completion": progress.estimated_completion,
                "chunks_per_second": round(progress.chunks_processed / elapsed_time, 2) if elapsed_time > 0 else 0,
                "upload_type": "streaming"  # Add identifier for monitoring
            }
    
    def get_chunk_buffer_pool_status(self) -> dict:
        """Get chunk buffer pool status (compatible interface - streaming doesn't use buffer pool)"""
        return {
            "pools": {
                "streaming": {
                    "available": 1,  # Always available (no buffer pool)
                    "max_size": 1
                }
            },
            "usage": {
                "total_allocated": 0,  # No pre-allocation
                "total_available": 1,  # Always available
                "total_capacity": 1
            },
            "buffer_sizes": {
                "default_mb": self.chunk_size // (1024 * 1024),
                "max_mb": self.chunk_size // (1024 * 1024)
            },
            "processor_type": "streaming"  # Add identifier for monitoring
        }
    
    def get_max_concurrent_chunks(self) -> int:
        """Get max concurrent chunks (compatible interface)"""
        return self.max_concurrent_chunks
    
    def get_chunk_semaphore_value(self) -> int:
        """Get chunk semaphore value (compatible interface)"""
        return self.chunk_semaphore._value
    
    def get_active_uploads_count(self) -> int:
        """Get active uploads count (compatible interface)"""
        return len(self.upload_progress)
    
    def get_processor_status(self) -> dict:
        """Get comprehensive processor status for monitoring"""
        return {
            "processor_type": "streaming",
            "max_concurrent_chunks": self.max_concurrent_chunks,
            "active_uploads": len(self.upload_progress),
            "chunk_semaphore_value": self.chunk_semaphore._value,
            "chunk_size_mb": self.chunk_size // (1024 * 1024),
            "memory_efficiency": "high"  # Streaming is memory efficient
        }

# Global instance
streaming_chunk_processor = StreamingChunkProcessor()