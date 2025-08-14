import asyncio
import time
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import httpx
from app.services.chunk_buffer_pool import chunk_buffer_pool
from app.services.memory_monitor import memory_monitor
from app.core.config import settings

logger = logging.getLogger(__name__)

@dataclass
class ChunkTask:
    """Represents a chunk upload task"""
    file_id: str
    gdrive_url: str
    start_byte: int
    end_byte: int
    chunk_size: int
    chunk_number: int
    chunk_data: bytes  # ACTUAL chunk data from frontend
    retry_count: int = 0
    max_retries: int = 3

@dataclass
class UploadProgress:
    """Tracks upload progress"""
    total_chunks: int
    completed_chunks: int
    failed_chunks: int
    bytes_uploaded: int
    total_bytes: int
    start_time: float
    estimated_completion: Optional[float] = None

class ParallelChunkProcessor:
    """Processes file uploads with parallel chunk handling for optimal performance"""
    
    def __init__(self):
        # Get configuration from settings
        self.max_concurrent_chunks = getattr(settings, 'PARALLEL_UPLOAD_MAX_CONCURRENT_CHUNKS', 8)
        self.default_chunk_size = getattr(settings, 'PARALLEL_UPLOAD_CHUNK_SIZE_MB', 16) * 1024 * 1024
        self.max_chunk_size = self.default_chunk_size * 2  # 32MB
        self.min_chunk_size = self.default_chunk_size // 2  # 8MB
        
        # Chunk processing semaphore
        self.chunk_semaphore = asyncio.Semaphore(self.max_concurrent_chunks)
        
        # Progress tracking
        self.upload_progress: Dict[str, UploadProgress] = {}
        
        # HTTP client configuration
        self.http_timeout = httpx.Timeout(30.0, read=1800.0, write=1800.0)
        self.http_limits = httpx.Limits(
            max_keepalive_connections=20,
            max_connections=50,
            keepalive_expiry=30.0
        )
        
        logger.info(f"ParallelChunkProcessor initialized with {self.max_concurrent_chunks} concurrent chunks, {self.default_chunk_size // (1024*1024)}MB default chunk size")
    
    def get_optimal_chunk_size(self, file_size: int) -> int:
        """Determine optimal chunk size based on file size"""
        if file_size < 100 * 1024 * 1024:  # < 100MB
            return self.min_chunk_size  # 8MB
        elif file_size < 1 * 1024 * 1024 * 1024:  # < 1GB
            return self.default_chunk_size  # 16MB
        else:  # >= 1GB
            return self.max_chunk_size  # 32MB
    
    async def process_upload_from_websocket(self, websocket, file_id: str, gdrive_url: str, total_size: int) -> str:
        """Process upload by receiving chunks from WebSocket and uploading them in parallel"""
        # Calculate optimal chunk size
        optimal_chunk_size = self.get_optimal_chunk_size(total_size)
        
        # Initialize progress tracking
        self.upload_progress[file_id] = UploadProgress(
            total_chunks=0,  # Will be calculated as we receive chunks
            completed_chunks=0,
            failed_chunks=0,
            bytes_uploaded=0,
            total_bytes=total_size,
            start_time=time.time()
        )
        
        try:
            # Create HTTP client for Google Drive uploads
            async with httpx.AsyncClient(timeout=self.http_timeout, limits=self.http_limits) as client:
                # Process chunks as they arrive from WebSocket
                bytes_received = 0
                chunk_number = 0
                chunk_tasks = []
                
                while bytes_received < total_size:
                    # Receive chunk from WebSocket
                    message = await websocket.receive()
                    chunk_data = message.get("bytes")
                    
                    if not chunk_data:
                        continue
                    
                    # Create chunk task
                    chunk_size = len(chunk_data)
                    start_byte = bytes_received
                    end_byte = bytes_received + chunk_size
                    
                    chunk_task = ChunkTask(
                        file_id=file_id,
                        gdrive_url=gdrive_url,
                        start_byte=start_byte,
                        end_byte=end_byte,
                        chunk_size=chunk_size,
                        chunk_number=chunk_number,
                        chunk_data=chunk_data  # REAL chunk data
                    )
                    
                    chunk_tasks.append(chunk_task)
                    chunk_number += 1
                    bytes_received += chunk_size
                    
                    # Update progress
                    self.upload_progress[file_id].total_chunks = chunk_number
                    
                    # Send progress update to frontend
                    progress_percent = int((bytes_received / total_size) * 100)
                    await websocket.send_json({"type": "progress", "value": progress_percent})
                    
                    # If we have enough chunks or this is the last chunk, process them in parallel
                    if len(chunk_tasks) >= self.max_concurrent_chunks or bytes_received >= total_size:
                        # Process chunks in parallel
                        await self._process_chunks_parallel(chunk_tasks, client)
                        chunk_tasks = []  # Reset for next batch
                
                # Finalize upload
                return await self._finalize_upload(file_id, gdrive_url, client)
                
        except Exception as e:
            logger.error(f"Parallel upload failed for file {file_id}: {e}")
            raise
        finally:
            # Cleanup progress tracking
            if file_id in self.upload_progress:
                del self.upload_progress[file_id]
    
    async def _process_chunks_parallel(self, chunk_tasks: List[ChunkTask], client: httpx.AsyncClient):
        """Process multiple chunks in parallel"""
        # Create tasks for all chunks
        chunk_coroutines = [
            self._process_chunk_with_semaphore(chunk_task, client)
            for chunk_task in chunk_tasks
        ]
        
        # Execute all chunks with controlled concurrency
        results = await asyncio.gather(*chunk_coroutines, return_exceptions=True)
        
        # Check for failures
        failed_chunks = [r for r in results if isinstance(r, Exception)]
        if failed_chunks:
            raise Exception(f"Upload failed: {len(failed_chunks)} chunks failed")
    
    async def _process_chunk_with_semaphore(self, chunk_task: ChunkTask, client: httpx.AsyncClient) -> bool:
        """Process a single chunk with semaphore control"""
        async with self.chunk_semaphore:
            return await self._process_chunk(chunk_task, client)
    
    async def _process_chunk(self, chunk_task: ChunkTask, client: httpx.AsyncClient) -> bool:
        """Process a single chunk with retry logic"""
        for attempt in range(chunk_task.max_retries):
            try:
                # Upload chunk using REAL data
                success = await self._upload_chunk_to_gdrive(chunk_task, client)
                
                if success:
                    # Update progress
                    await self._update_progress(chunk_task.file_id, chunk_task.chunk_size)
                    logger.debug(f"Chunk {chunk_task.chunk_number} uploaded successfully for file {chunk_task.file_id}")
                    return True
                
            except Exception as e:
                logger.warning(f"Chunk {chunk_task.chunk_number} attempt {attempt + 1} failed: {e}")
                
                if attempt == chunk_task.max_retries - 1:
                    # Final attempt failed
                    await self._update_failed_chunk(chunk_task.file_id)
                    raise Exception(f"Chunk {chunk_task.chunk_number} failed after {chunk_task.max_retries} attempts: {e}")
                
                # Wait before retry with exponential backoff
                wait_time = (2 ** attempt) * 1.0  # 1s, 2s, 4s
                await asyncio.sleep(wait_time)
        
        return False
    
    async def _upload_chunk_to_gdrive(self, chunk_task: ChunkTask, client: httpx.AsyncClient) -> bool:
        """Upload a single chunk to Google Drive using REAL data"""
        # Prepare headers for resumable upload
        headers = {
            'Content-Length': str(chunk_task.chunk_size),
            'Content-Range': f'bytes {chunk_task.start_byte}-{chunk_task.end_byte - 1}/{chunk_task.total_size}'
        }
        
        # Use REAL chunk data from frontend
        content = chunk_task.chunk_data
        
        try:
            response = await client.put(
                chunk_task.gdrive_url,
                content=content,
                headers=headers
            )
            
            # Check response status
            if response.status_code in [200, 201, 308]:
                return True
            else:
                logger.error(f"Google Drive API error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"HTTP error uploading chunk {chunk_task.chunk_number}: {e}")
            return False
    
    async def _update_progress(self, file_id: str, bytes_uploaded: int):
        """Update upload progress"""
        if file_id in self.upload_progress:
            progress = self.upload_progress[file_id]
            progress.completed_chunks += 1
            progress.bytes_uploaded += bytes_uploaded
            
            # Calculate estimated completion
            if progress.completed_chunks > 0:
                elapsed_time = time.time() - progress.start_time
                chunks_per_second = progress.completed_chunks / elapsed_time
                remaining_chunks = progress.total_chunks - progress.completed_chunks
                progress.estimated_completion = time.time() + (remaining_chunks / chunks_per_second)
    
    async def _update_failed_chunk(self, file_id: str):
        """Update progress when a chunk fails"""
        if file_id in self.upload_progress:
            self.upload_progress[file_id].failed_chunks += 1
    
    async def _finalize_upload(self, file_id: str, gdrive_url: str, client: httpx.AsyncClient) -> str:
        """Finalize the upload and get the final file ID"""
        try:
            # Send final request to complete upload
            response = await client.put(
                gdrive_url,
                content=b'',  # Empty content for finalization
                headers={'Content-Length': '0', 'Content-Range': f'bytes */{self.upload_progress[file_id].total_bytes}'}
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
    
    def get_upload_progress(self, file_id: str) -> Optional[dict]:
        """Get current upload progress for monitoring"""
        if file_id not in self.upload_progress:
            return None
        
        progress = self.upload_progress[file_id]
        elapsed_time = time.time() - progress.start_time
        
        return {
            "file_id": file_id,
            "total_chunks": progress.total_chunks,
            "completed_chunks": progress.completed_chunks,
            "failed_chunks": progress.failed_chunks,
            "bytes_uploaded": progress.bytes_uploaded,
            "total_bytes": progress.total_bytes,
            "progress_percent": round((progress.bytes_uploaded / progress.total_bytes) * 100, 1),
            "elapsed_time": round(elapsed_time, 1),
            "estimated_completion": progress.estimated_completion,
            "chunks_per_second": round(progress.completed_chunks / elapsed_time, 2) if elapsed_time > 0 else 0
        }

# Global instance
parallel_chunk_processor = ParallelChunkProcessor()
