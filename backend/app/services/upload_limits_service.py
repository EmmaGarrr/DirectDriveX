# File: backend/app/services/upload_limits_service.py

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from app.db.mongodb import db
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class UploadLimitsService:
    """Service for managing upload limits and daily quotas for anonymous and authenticated users"""
    
    def __init__(self):
        # Anonymous user limits
        self.ANONYMOUS_DAILY_LIMIT = 2 * 1024 * 1024 * 1024  # 2GB
        self.ANONYMOUS_SINGLE_FILE_LIMIT = 2 * 1024 * 1024 * 1024  # 2GB
        
        # Authenticated user limits  
        self.AUTHENTICATED_DAILY_LIMIT = 5 * 1024 * 1024 * 1024  # 5GB
        self.AUTHENTICATED_SINGLE_FILE_LIMIT = 5 * 1024 * 1024 * 1024  # 5GB
        
        # In-memory cache for performance
        self._cache: Dict[str, Dict] = {}
        self._cache_lock = asyncio.Lock()
    
    async def check_upload_limits(
        self, 
        user_id: Optional[str], 
        ip_address: str, 
        file_sizes: List[int],
        is_batch: bool = False
    ) -> Dict[str, any]:
        """
        Check if upload is allowed based on user type and limits
        
        Args:
            user_id: User ID if authenticated, None if anonymous
            ip_address: Client IP address
            file_sizes: List of file sizes in bytes
            is_batch: Whether this is a batch upload
            
        Returns:
            Dict with 'allowed' boolean and 'reason' string
        """
        try:
            # Check single file limits first
            single_file_check = await self._check_single_file_limits(user_id, file_sizes)
            if not single_file_check['allowed']:
                return single_file_check
            
            # Check daily quota limits
            daily_quota_check = await self._check_daily_quota_limits(user_id, ip_address, file_sizes)
            if not daily_quota_check['allowed']:
                return daily_quota_check
            
            return {'allowed': True, 'reason': 'Upload allowed'}
            
        except Exception as e:
            logger.error(f"Error checking upload limits: {e}")
            return {'allowed': False, 'reason': 'System error occurred'}
    
    async def _check_single_file_limits(self, user_id: Optional[str], file_sizes: List[int]) -> Dict[str, any]:
        """Check if individual file sizes are within limits"""
        is_authenticated = user_id is not None
        max_single_file = self.AUTHENTICATED_SINGLE_FILE_LIMIT if is_authenticated else self.ANONYMOUS_SINGLE_FILE_LIMIT
        
        for i, file_size in enumerate(file_sizes):
            if file_size > max_single_file:
                limit_gb = max_single_file // (1024 * 1024 * 1024)
                user_type = "authenticated" if is_authenticated else "anonymous"
                return {
                    'allowed': False,
                    'reason': f"File {i+1} exceeds {limit_gb}GB limit for {user_type} users"
                }
        
        return {'allowed': True, 'reason': 'Single file limits OK'}
    
    async def _check_daily_quota_limits(self, user_id: Optional[str], ip_address: str, file_sizes: List[int]) -> Dict[str, any]:
        """Check if daily quota allows this upload"""
        is_authenticated = user_id is not None
        daily_limit = self.AUTHENTICATED_DAILY_LIMIT if is_authenticated else self.ANONYMOUS_DAILY_LIMIT
        total_requested = sum(file_sizes)
        
        # Get current daily usage
        current_usage = await self._get_daily_usage(user_id, ip_address)
        
        # Check if this upload would exceed daily limit
        if current_usage + total_requested > daily_limit:
            limit_gb = daily_limit // (1024 * 1024 * 1024)
            used_gb = current_usage // (1024 * 1024 * 1024)
            requested_gb = total_requested // (1024 * 1024 * 1024)
            remaining_gb = (daily_limit - current_usage) // (1024 * 1024 * 1024)
            
            user_type = "authenticated" if is_authenticated else "anonymous"
            return {
                'allowed': False,
                'reason': f"Daily {limit_gb}GB limit exceeded for {user_type} users. Used: {used_gb}GB, Requested: {requested_gb}GB, Remaining: {remaining_gb}GB"
            }
        
        return {'allowed': True, 'reason': 'Daily quota OK'}
    
    async def _get_daily_usage(self, user_id: Optional[str], ip_address: str) -> int:
        """Get current daily usage for user or IP"""
        cache_key = f"{user_id or 'anonymous'}_{ip_address}"
        
        async with self._cache_lock:
            # Check cache first
            if cache_key in self._cache:
                cache_data = self._cache[cache_key]
                if datetime.utcnow() < cache_data['expires_at']:
                    return cache_data['usage']
                else:
                    del self._cache[cache_key]
        
        # Query database for current usage
        current_time = datetime.utcnow()
        start_of_day = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Build query based on user type
        if user_id:
            # Authenticated user - track by user_id
            query = {
                "owner_id": user_id,
                "upload_date": {"$gte": start_of_day},
                "status": {"$in": ["completed", "uploading", "pending"]}
            }
        else:
            # Anonymous user - track by IP address
            query = {
                "ip_address": ip_address,
                "owner_id": None,
                "upload_date": {"$gte": start_of_day},
                "status": {"$in": ["completed", "uploading", "pending"]}
            }
        
        # Calculate total usage
        pipeline = [
            {"$match": query},
            {"$group": {"_id": None, "total_size": {"$sum": "$size_bytes"}}}
        ]
        
        result = list(db.files.aggregate(pipeline))
        current_usage = result[0]["total_size"] if result else 0
        
        # Cache the result for 5 minutes
        async with self._cache_lock:
            self._cache[cache_key] = {
                'usage': current_usage,
                'expires_at': current_time + timedelta(minutes=5)
            }
        
        return current_usage
    
    async def record_upload(self, user_id: Optional[str], ip_address: str, file_sizes: List[int]):
        """Record upload for quota tracking"""
        cache_key = f"{user_id or 'anonymous'}_{ip_address}"
        
        async with self._cache_lock:
            if cache_key in self._cache:
                # Update cached usage
                self._cache[cache_key]['usage'] += sum(file_sizes)
        
        logger.info(f"Recorded upload: user_id={user_id}, ip={ip_address}, size={sum(file_sizes)} bytes")
    
    async def get_quota_info(self, user_id: Optional[str], ip_address: str) -> Dict[str, any]:
        """Get quota information for user or IP"""
        is_authenticated = user_id is not None
        daily_limit = self.AUTHENTICATED_DAILY_LIMIT if is_authenticated else self.ANONYMOUS_DAILY_LIMIT
        current_usage = await self._get_daily_usage(user_id, ip_address)
        remaining = daily_limit - current_usage
        
        return {
            'daily_limit_bytes': daily_limit,
            'daily_limit_gb': daily_limit // (1024 * 1024 * 1024),
            'current_usage_bytes': current_usage,
            'current_usage_gb': current_usage // (1024 * 1024 * 1024),
            'remaining_bytes': remaining,
            'remaining_gb': remaining // (1024 * 1024 * 1024),
            'usage_percentage': (current_usage / daily_limit) * 100 if daily_limit > 0 else 0,
            'user_type': 'authenticated' if is_authenticated else 'anonymous'
        }

# Global instance
upload_limits_service = UploadLimitsService()
