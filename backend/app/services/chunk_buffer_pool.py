import asyncio
from typing import List, Set, Optional
import logging

logger = logging.getLogger(__name__)

class ChunkBufferPool:
    """Manages a pool of reusable buffers for chunk processing to reduce memory allocation overhead"""
    
    def __init__(self,
                 max_buffers: int = 15,
                 buffer_size: int = 16 * 1024 * 1024,  # 16MB default
                 max_buffer_size: int = 32 * 1024 * 1024):  # 32MB max
        
        self.max_buffers = max_buffers
        self.buffer_size = buffer_size
        self.max_buffer_size = max_buffer_size
        
        # Buffer pools for different sizes
        self.buffer_pools: dict = {
            buffer_size: asyncio.Queue(maxsize=max_buffers),
            buffer_size * 2: asyncio.Queue(maxsize=max_buffers // 2),  # 32MB buffers
            buffer_size // 2: asyncio.Queue(maxsize=max_buffers * 2),  # 8MB buffers
        }
        
        # Track buffer usage
        self.allocated_buffers: Set[bytes] = set()
        self.total_allocated = 0
        self._lock = asyncio.Lock()
        
        # Pre-allocate buffers
        self._preallocate_buffers()
    
    def _preallocate_buffers(self):
        """Pre-allocate buffers for common sizes"""
        try:
            # Pre-allocate 16MB buffers (most common)
            for _ in range(self.max_buffers):
                buffer = bytearray(self.buffer_size)
                self.buffer_pools[self.buffer_size].put_nowait(buffer)
            
            # Pre-allocate some 32MB buffers for large files
            for _ in range(self.max_buffers // 4):
                buffer = bytearray(self.buffer_size * 2)
                self.buffer_pools[self.buffer_size * 2].put_nowait(buffer)
            
            # Pre-allocate some 8MB buffers for small chunks
            for _ in range(self.max_buffers // 2):
                buffer = bytearray(self.buffer_size // 2)
                self.buffer_pools[self.buffer_size // 2].put_nowait(buffer)
                
            logger.info(f"Pre-allocated {self.max_buffers} buffers in pool")
            
        except Exception as e:
            logger.error(f"Failed to pre-allocate buffers: {e}")
    
    async def get_buffer(self, size: int) -> bytearray:
        """Get a buffer of appropriate size from the pool"""
        # Find the best buffer size for the requested size
        best_size = self._find_best_buffer_size(size)
        
        try:
            # Try to get from pool
            if not self.buffer_pools[best_size].empty():
                buffer = await self.buffer_pools[best_size].get()
                async with self._lock:
                    self.allocated_buffers.add(id(buffer))
                    self.total_allocated += 1
                logger.debug(f"Got buffer of size {best_size} from pool")
                return buffer
        except asyncio.QueueEmpty:
            pass
        
        # If pool is empty, create new buffer
        logger.debug(f"Pool empty for size {best_size}, creating new buffer")
        buffer = bytearray(best_size)
        async with self._lock:
            self.allocated_buffers.add(id(buffer))
            self.total_allocated += 1
        return buffer
    
    def _find_best_buffer_size(self, requested_size: int) -> int:
        """Find the best buffer size for the requested size"""
        available_sizes = sorted(self.buffer_pools.keys())
        
        for size in available_sizes:
            if size >= requested_size:
                return size
        
        # If no suitable size found, return the largest available
        return max(available_sizes)
    
    async def return_buffer(self, buffer: bytearray):
        """Return buffer to the pool for reuse"""
        if not buffer:
            return
        
        buffer_size = len(buffer)
        
        # Clear buffer content
        buffer.clear()
        
        # Find appropriate pool
        if buffer_size in self.buffer_pools:
            try:
                # Try to return to pool (non-blocking)
                self.buffer_pools[buffer_size].put_nowait(buffer)
                async with self._lock:
                    self.allocated_buffers.discard(id(buffer))
                    self.total_allocated = max(0, self.total_allocated - 1)
                logger.debug(f"Returned buffer of size {buffer_size} to pool")
            except asyncio.QueueFull:
                # Pool is full, discard buffer
                async with self._lock:
                    self.allocated_buffers.discard(id(buffer))
                    self.total_allocated = max(0, self.total_allocated - 1)
                logger.debug(f"Pool full, discarded buffer of size {buffer_size}")
        else:
            # Unknown size, discard
            async with self._lock:
                self.allocated_buffers.discard(id(buffer))
                self.total_allocated = max(0, self.total_allocated - 1)
            logger.debug(f"Unknown buffer size {buffer_size}, discarded")
    
    def get_pool_status(self) -> dict:
        """Get current pool status for monitoring"""
        return {
            "pools": {
                size: {
                    "available": queue.qsize(),
                    "max_size": queue.maxsize
                }
                for size, queue in self.buffer_pools.items()
            },
            "usage": {
                "total_allocated": self.total_allocated,
                "total_available": sum(queue.qsize() for queue in self.buffer_pools.values()),
                "total_capacity": sum(queue.maxsize for queue in self.buffer_pools.values())
            },
            "buffer_sizes": {
                "default_mb": self.buffer_size // (1024 * 1024),
                "max_mb": self.max_buffer_size // (1024 * 1024)
            }
        }
    
    async def cleanup(self):
        """Cleanup and reset the buffer pool"""
        async with self._lock:
            # Clear all pools
            for queue in self.buffer_pools.values():
                while not queue.empty():
                    try:
                        queue.get_nowait()
                    except asyncio.QueueEmpty:
                        break
            
            # Reset counters
            self.allocated_buffers.clear()
            self.total_allocated = 0
            
            # Re-preallocate
            self._preallocate_buffers()
            
            logger.info("Buffer pool cleaned up and reset")

# Global instance
chunk_buffer_pool = ChunkBufferPool()
