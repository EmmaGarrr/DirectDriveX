import asyncio
import time
from typing import Dict, Optional
from dataclasses import dataclass
import psutil
from app.core.config import settings

@dataclass
class UploadSlot:
    """Represents an active upload slot"""
    user_id: str
    file_id: str
    file_size: int
    start_time: float
    memory_usage: int

class UploadConcurrencyManager:
    """Manages upload concurrency limits and prevents server overload"""
    
    def __init__(self):
        # Get environment-based configuration
        self.environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
        
        # Set memory limits based on environment
        if self.environment == 'production':
            self.max_memory_usage_percent = getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD', 80.0)
            self.reserved_memory_bytes = 2 * 1024 * 1024 * 1024  # 2GB reserved for production
        elif self.environment == 'staging':
            self.max_memory_usage_percent = getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING', 85.0)
            self.reserved_memory_bytes = 1.5 * 1024 * 1024 * 1024  # 1.5GB reserved for staging
        else:  # development
            self.max_memory_usage_percent = getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV', 100.0)
            self.reserved_memory_bytes = 0  # No reserved memory for development (use full memory)
        
        # Get configuration from settings
        self.max_concurrent_users = getattr(settings, 'PARALLEL_UPLOAD_MAX_CONCURRENT_USERS', 20)
        
        # Per-user upload limits
        self.user_upload_semaphores: Dict[str, asyncio.Semaphore] = {}
        self.user_upload_counts: Dict[str, int] = {}
        
        # Global limits
        self.global_upload_semaphore = asyncio.Semaphore(self.max_concurrent_users)
        self.global_download_semaphore = asyncio.Semaphore(30)  # Max 30 concurrent downloads
        
        # Active uploads tracking
        self.active_uploads: Dict[str, UploadSlot] = {}
        self._lock = asyncio.Lock()
        
        print(f"UploadConcurrencyManager initialized for {self.environment} environment with max {self.max_concurrent_users} concurrent users, {self.max_memory_usage_percent}% memory limit")
    
    async def acquire_upload_slot(self, user_id: str, file_id: str, file_size: int) -> bool:
        """Check if user can start new upload and acquire slot"""
        async with self._lock:
            # Check memory availability first
            if not self._can_allocate_memory(file_size):
                return False
            
            # Check user limits (max 5 concurrent uploads per user)
            if user_id not in self.user_upload_semaphores:
                self.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
            
            user_sem = self.user_upload_semaphores[user_id]
            
            # Check if user semaphore is available (value > 0)
            if user_sem._value <= 0:
                return False
            
            # Check if global semaphore is available (value > 0)
            if self.global_upload_semaphore._value <= 0:
                return False
            
            # Try to acquire both semaphores
            try:
                # Acquire global semaphore first
                await self.global_upload_semaphore.acquire()
                
                # Then acquire user semaphore
                await user_sem.acquire()
                
                # Track the upload
                self.active_uploads[file_id] = UploadSlot(
                    user_id=user_id,
                    file_id=file_id,
                    file_size=file_size,
                    start_time=time.time(),
                    memory_usage=int(file_size * 0.1)  # Estimate 10% of file size
                )
                
                return True
                
            except Exception as e:
                # If anything fails, release what we acquired
                if self.global_upload_semaphore._value < self.max_concurrent_users:
                    self.global_upload_semaphore.release()
                if user_sem._value < 5:
                    user_sem.release()
                print(f"Failed to acquire upload slot: {e}")
                return False
    
    async def release_upload_slot(self, user_id: str, file_id: str):
        """Release upload slot and cleanup resources"""
        async with self._lock:
            if file_id in self.active_uploads:
                upload_slot = self.active_uploads[file_id]
                
                # Release user semaphore
                if user_id in self.user_upload_semaphores:
                    self.user_upload_semaphores[user_id].release()
                
                # Release global semaphore
                self.global_upload_semaphore.release()
                
                # Remove from tracking
                del self.active_uploads[file_id]
    
    def _can_allocate_memory(self, required_memory: int) -> bool:
        """Check if we can allocate more memory"""
        try:
            current_usage = psutil.virtual_memory().percent
            if current_usage > self.max_memory_usage_percent:
                print(f"Memory usage too high: {current_usage:.1f}% (limit: {self.max_memory_usage_percent}%)")
                return False
            
            # Check if adding this upload would exceed limits
            total_allocated = sum(slot.memory_usage for slot in self.active_uploads.values())
            available_memory = (4 * 1024 * 1024 * 1024) - self.reserved_memory_bytes
            
            return total_allocated + required_memory < available_memory
        except Exception:
            # If psutil fails, be conservative
            return len(self.active_uploads) < 10
    
    def get_status(self) -> dict:
        """Get current concurrency status for monitoring"""
        return {
            "environment": self.environment,
            "active_uploads": len(self.active_uploads),
            "global_upload_slots_available": self.global_upload_semaphore._value,
            "global_download_slots_available": self.global_download_semaphore._value,
            "user_upload_counts": {user: sem._value for user, sem in self.user_upload_semaphores.items()},
            "memory_usage_percent": psutil.virtual_memory().percent if 'psutil' in globals() else 0,
            "memory_limit_percent": self.max_memory_usage_percent
        }

# Global instance
upload_concurrency_manager = UploadConcurrencyManager()
