#!/usr/bin/env python3
"""
Test Script 1: Upload Limits Service Analysis
Tests the upload limits service to identify production initiation failures
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_limits_service import upload_limits_service
from app.core.config import settings

async def test_upload_limits_service():
    """Test upload limits service with various scenarios"""
    print("=== Upload Limits Service Test ===")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_user_id = "test_user_123"
    test_ip = "127.0.0.1"
    
    print(f"Testing with file size: {test_file_size / (1024**3):.2f} GB")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Upload limits enabled: {getattr(settings, 'ENABLE_UPLOAD_LIMITS', 'NOT_SET')}")
    print(f"Production upload limits: {getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', 'NOT_SET')}")
    print(f"Development upload limits: {getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', 'NOT_SET')}")
    
    # Test 1: Authenticated user with large file
    print("\n--- Test 1: Authenticated User Large File ---")
    result = await upload_limits_service.check_upload_limits(
        user_id=test_user_id,
        ip_address=test_ip,
        file_sizes=[test_file_size],
        is_batch=False
    )
    print(f"Result: {result}")
    
    # Test 2: Anonymous user with large file
    print("\n--- Test 2: Anonymous User Large File ---")
    result = await upload_limits_service.check_upload_limits(
        user_id=None,
        ip_address=test_ip,
        file_sizes=[test_file_size],
        is_batch=False
    )
    print(f"Result: {result}")
    
    # Test 3: Check service limits
    print("\n--- Test 3: Service Limits ---")
    print(f"Authenticated single file limit: {upload_limits_service.AUTHENTICATED_SINGLE_FILE_LIMIT / (1024**3):.2f} GB")
    print(f"Anonymous single file limit: {upload_limits_service.ANONYMOUS_SINGLE_FILE_LIMIT / (1024**3):.2f} GB")
    print(f"Authenticated daily limit: {upload_limits_service.AUTHENTICATED_DAILY_LIMIT / (1024**3):.2f} GB")
    print(f"Anonymous daily limit: {upload_limits_service.ANONYMOUS_DAILY_LIMIT / (1024**3):.2f} GB")
    
    # Test 4: Get quota info
    print("\n--- Test 4: Quota Info ---")
    quota_info = await upload_limits_service.get_quota_info(test_user_id, test_ip)
    print(f"Quota info: {quota_info}")
    
    # Test 5: Check current daily usage
    print("\n--- Test 5: Current Daily Usage ---")
    current_usage = await upload_limits_service._get_daily_usage(test_user_id, test_ip)
    print(f"Current daily usage: {current_usage / (1024**3):.2f} GB")

if __name__ == "__main__":
    asyncio.run(test_upload_limits_service())