# In file: Backend/app/services/video_cache_service.py

import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

# Note: Redis is commented out in requirements.txt, so we'll use in-memory cache for now
# import redis

logger = logging.getLogger(__name__)

class VideoCacheService:
    """
    Video caching service for optimized video streaming.
    Reduces server load by caching frequently accessed video chunks.
    """
    
    def __init__(self):
        # In-memory cache (replace with Redis in production)
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 3600  # 1 hour default TTL
        self._max_cache_size = 100  # Maximum number of cached items
        self._chunk_size = 1024 * 1024  # 1MB chunks
        
        # Cache statistics
        self._cache_hits = 0
        self._cache_misses = 0
        self._cache_evictions = 0
        
        logger.info(f"VideoCacheService initialized with {self._max_cache_size} max items, {self._cache_ttl}s TTL")
    
    def _generate_cache_key(self, file_id: str, start: int, end: int) -> str:
        """Generate cache key for video chunk"""
        return f"video_chunk:{file_id}:{start}:{end}"
    
    def _generate_thumbnail_cache_key(self, file_id: str) -> str:
        """Generate cache key for video thumbnail"""
        return f"video_thumbnail:{file_id}"
    
    async def get_cached_video_chunk(self, file_id: str, start: int, end: int) -> Optional[bytes]:
        """
        Get video chunk from cache or return None if not cached
        """
        cache_key = self._generate_cache_key(file_id, start, end)
        
        if cache_key in self._cache:
            cached_data = self._cache[cache_key]
            
            # Check if cache entry is still valid
            if datetime.now() < cached_data['expires_at']:
                self._cache_hits += 1
                logger.debug(f"[CACHE] Hit for {cache_key}")
                return cached_data['data']
            else:
                # Remove expired entry
                del self._cache[cache_key]
                logger.debug(f"[CACHE] Expired entry removed: {cache_key}")
        
        self._cache_misses += 1
        logger.debug(f"[CACHE] Miss for {cache_key}")
        return None
    
    async def cache_video_chunk(self, file_id: str, start: int, end: int, chunk_data: bytes) -> None:
        """
        Cache video chunk for future requests
        """
        cache_key = self._generate_cache_key(file_id, start, end)
        
        # Check cache size and evict if necessary
        if len(self._cache) >= self._max_cache_size:
            await self._evict_oldest_entries()
        
        # Add to cache with expiration
        expires_at = datetime.now() + timedelta(seconds=self._cache_ttl)
        self._cache[cache_key] = {
            'data': chunk_data,
            'expires_at': expires_at,
            'created_at': datetime.now(),
            'size': len(chunk_data)
        }
        
        logger.debug(f"[CACHE] Cached chunk {cache_key} ({len(chunk_data)} bytes) for {self._cache_ttl}s")
    
    async def get_cached_thumbnail(self, file_id: str) -> Optional[str]:
        """
        Get cached thumbnail URL
        """
        cache_key = self._generate_thumbnail_cache_key(file_id)
        
        if cache_key in self._cache:
            cached_data = self._cache[cache_key]
            
            if datetime.now() < cached_data['expires_at']:
                self._cache_hits += 1
                logger.debug(f"[CACHE] Thumbnail hit for {file_id}")
                return cached_data['data']
            else:
                del self._cache[cache_key]
        
        self._cache_misses += 1
        return None
    
    async def cache_thumbnail(self, file_id: str, thumbnail_url: str) -> None:
        """
        Cache thumbnail URL
        """
        cache_key = self._generate_thumbnail_cache_key(file_id)
        
        # Thumbnails can be cached longer
        expires_at = datetime.now() + timedelta(hours=24)  # 24 hours
        
        self._cache[cache_key] = {
            'data': thumbnail_url,
            'expires_at': expires_at,
            'created_at': datetime.now(),
            'size': len(thumbnail_url)
        }
        
        logger.debug(f"[CACHE] Cached thumbnail for {file_id}")
    
    async def prefetch_popular_chunks(self, file_id: str, file_size: int) -> None:
        """
        Prefetch first few chunks of video for better user experience
        """
        popular_chunks = [
            (0, self._chunk_size - 1),  # First 1MB
            (self._chunk_size, 2 * self._chunk_size - 1),  # Second 1MB
            (2 * self._chunk_size, 3 * self._chunk_size - 1)  # Third 1MB
        ]
        
        logger.info(f"[CACHE] Prefetching popular chunks for {file_id}")
        
        for start, end in popular_chunks:
            if end < file_size:
                cache_key = self._generate_cache_key(file_id, start, end)
                if cache_key not in self._cache:
                    # This would trigger actual chunk fetching in a real implementation
                    logger.debug(f"[CACHE] Would prefetch chunk {start}-{end} for {file_id}")
    
    async def _evict_oldest_entries(self) -> None:
        """
        Evict oldest cache entries when cache is full
        """
        if not self._cache:
            return
        
        # Sort by creation time and remove oldest entries
        sorted_entries = sorted(
            self._cache.items(),
            key=lambda x: x[1]['created_at']
        )
        
        # Remove 20% of oldest entries
        entries_to_remove = max(1, len(sorted_entries) // 5)
        
        for i in range(entries_to_remove):
            cache_key = sorted_entries[i][0]
            del self._cache[cache_key]
            self._cache_evictions += 1
        
        logger.info(f"[CACHE] Evicted {entries_to_remove} oldest entries")
    
    async def clear_cache(self) -> None:
        """
        Clear all cached data
        """
        cache_size = len(self._cache)
        self._cache.clear()
        logger.info(f"[CACHE] Cleared {cache_size} cached entries")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        """
        total_requests = self._cache_hits + self._cache_misses
        hit_rate = (self._cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_size": len(self._cache),
            "max_cache_size": self._max_cache_size,
            "cache_hits": self._cache_hits,
            "cache_misses": self._cache_misses,
            "cache_evictions": self._cache_evictions,
            "hit_rate_percent": round(hit_rate, 2),
            "total_requests": total_requests,
            "cache_ttl_seconds": self._cache_ttl
        }
    
    async def cleanup_expired_entries(self) -> None:
        """
        Remove expired cache entries
        """
        current_time = datetime.now()
        expired_keys = []
        
        for cache_key, cached_data in self._cache.items():
            if current_time >= cached_data['expires_at']:
                expired_keys.append(cache_key)
        
        for cache_key in expired_keys:
            del self._cache[cache_key]
        
        if expired_keys:
            logger.info(f"[CACHE] Cleaned up {len(expired_keys)} expired entries")

# Global instance
video_cache_service = VideoCacheService()
