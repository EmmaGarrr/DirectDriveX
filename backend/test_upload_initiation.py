#!/usr/bin/env python3
"""
Test Script 4: Upload Initiation Integration Test
Tests the complete upload initiation flow
"""

import asyncio
import sys
import os
import json
from datetime import datetime
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.v1.routes_upload import safe_size_validation, validate_file_size_input
from app.services.upload_limits_service import upload_limits_service
from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.core.config import settings

def test_upload_initiation_flow():
    """Test the complete upload initiation flow"""
    print("=== Upload Initiation Flow Test ===")
    
    # Test data
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_filename = "large_test_file.mp4"
    test_content_type = "video/mp4"
    test_user_id = "test_user_123"
    test_ip = "127.0.0.1"
    
    print(f"Testing upload initiation for:")
    print(f"  File: {test_filename}")
    print(f"  Size: {test_file_size / (1024**3):.2f} GB")
    print(f"  Type: {test_content_type}")
    print(f"  User: {test_user_id}")
    print(f"  IP: {test_ip}")
    
    # Step 1: File size validation
    print("\n--- Step 1: File Size Validation ---")
    is_valid, error_message = safe_size_validation(test_file_size)
    print(f"File size valid: {is_valid}")
    if not is_valid:
        print(f"Error: {error_message}")
        return False
    
    # Step 2: Upload limits check (environment-based)
    print("\n--- Step 2: Upload Limits Check ---")
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    print(f"Environment: {environment}")
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', False)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)
    
    print(f"Upload limits enabled: {enable_limits}")
    
    if enable_limits:
        limits_result = upload_limits_service.check_upload_limits(
            user_id=test_user_id,
            ip_address=test_ip,
            file_sizes=[test_file_size],
            is_batch=False
        )
        print(f"Limits check result: {limits_result}")
        
        if not limits_result.get('allowed', False):
            print(f"Upload rejected by limits: {limits_result.get('reason', 'Unknown reason')}")
            return False
    else:
        print("Upload limits disabled - skipping checks")
    
    # Step 3: Concurrency check
    print("\n--- Step 3: Concurrency Check ---")
    print(f"Current active uploads: {len(upload_concurrency_manager.active_uploads)}")
    print(f"Global semaphore value: {upload_concurrency_manager.global_upload_semaphore._value}")
    
    # Test slot acquisition
    try:
        slot_acquired = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
            user_id=test_user_id,
            file_id="test_file_789",
            file_size=test_file_size
        ))
        print(f"Slot acquisition test: {slot_acquired}")
        
        if slot_acquired:
            # Clean up
            asyncio.run(upload_concurrency_manager.release_upload_slot(test_user_id, "test_file_789"))
            print("Slot released")
        else:
            print("Slot would fail - potential root cause identified!")
            
    except Exception as e:
        print(f"Slot acquisition error: {e}")
    
    # Step 4: Memory analysis
    print("\n--- Step 4: Memory Analysis ---")
    required_memory = int(test_file_size * 0.1)  # 10% of file size
    print(f"Estimated memory required: {required_memory / (1024**2):.2f} MB")
    
    can_allocate = upload_concurrency_manager._can_allocate_memory(required_memory)
    print(f"Memory allocation possible: {can_allocate}")
    
    if not can_allocate:
        print("Memory constraint identified as potential issue!")
    
    # Step 5: Summary
    print("\n--- Upload Initiation Summary ---")
    issues = []
    
    if enable_limits:
        limits_result = upload_limits_service.check_upload_limits(
            user_id=test_user_id,
            ip_address=test_ip,
            file_sizes=[test_file_size],
            is_batch=False
        )
        if not limits_result.get('allowed', False):
            issues.append(f"Upload limits: {limits_result.get('reason', 'Unknown')}")
    
    slot_acquired = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
        user_id=test_user_id,
        file_id="test_file_summary",
        file_size=test_file_size
    ))
    if not slot_acquired:
        issues.append("Concurrency limits: Unable to acquire upload slot")
    else:
        asyncio.run(upload_concurrency_manager.release_upload_slot(test_user_id, "test_file_summary"))
    
    if not upload_concurrency_manager._can_allocate_memory(required_memory):
        issues.append("Memory constraints: Insufficient memory available")
    
    if issues:
        print("Issues identified:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
        return False
    else:
        print("No issues identified - upload should succeed")
        return True

if __name__ == "__main__":
    success = test_upload_initiation_flow()
    print(f"\nTest result: {'SUCCESS' if success else 'FAILURE'}")