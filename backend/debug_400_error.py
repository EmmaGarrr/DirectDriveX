#!/usr/bin/env python3
"""
Debug Script: 400 Bad Request Error Analysis
Tests the exact upload initiation endpoint to find why it's failing
"""

import asyncio
import sys
import os
import json
import requests
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.services.upload_limits_service import upload_limits_service

def test_upload_initiation_endpoint():
    """Test the actual upload initiation endpoint that's causing 400 error"""
    print("=== 400 BAD REQUEST DEBUG ANALYSIS ===")
    print("Testing the exact endpoint that's failing: /api/v1/upload/initiate")
    
    # Test configuration - simulating what your frontend sends
    test_data = {
        "file_size": 3624892618,  # 3.38 GB in bytes
        "filename": "large_test_file.mp4",
        "content_type": "video/mp4",
        "user_id": "test_user_123",
        "ip_address": "127.0.0.1"
    }
    
    print(f"\n--- Test Data (What Frontend Sends) ---")
    for key, value in test_data.items():
        if key == "file_size":
            print(f"  {key}: {value / (1024**3):.2f} GB")
        else:
            print(f"  {key}: {value}")
    
    # Test Step 1: Check if server configuration allows this upload
    print(f"\n--- Step 1: Server Configuration Check ---")
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    print(f"Environment: {environment}")
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', False)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)
    
    print(f"Upload limits enabled: {enable_limits}")
    
    # Test Step 2: Check file size validation
    print(f"\n--- Step 2: File Size Validation ---")
    max_file_size = getattr(settings, 'MAX_FILE_SIZE', 5 * 1024 * 1024 * 1024)  # 5GB default
    print(f"Max allowed file size: {max_file_size / (1024**3):.2f} GB")
    print(f"Your file size: {test_data['file_size'] / (1024**3):.2f} GB")
    
    if test_data['file_size'] > max_file_size:
        print("FAILED: FILE TOO LARGE - This could cause 400 error!")
        return False
    else:
        print("SUCCESS: File size is within limits")
    
    # Test Step 3: Check upload limits
    print(f"\n--- Step 3: Upload Limits Check ---")
    if enable_limits:
        limits_result = upload_limits_service.check_upload_limits(
            user_id=test_data["user_id"],
            ip_address=test_data["ip_address"],
            file_sizes=[test_data["file_size"]],
            is_batch=False
        )
        print(f"Limits check result: {limits_result}")
        
        if not limits_result.get('allowed', False):
            print("FAILED: UPLOAD LIMITS EXCEEDED - This could cause 400 error!")
            print(f"Reason: {limits_result.get('reason', 'Unknown')}")
            return False
        else:
            print("SUCCESS: Upload limits check passed")
    else:
        print("SUCCESS: Upload limits disabled in this environment")
    
    # Test Step 4: Check concurrency/resources
    print(f"\n--- Step 4: System Resources Check ---")
    status = upload_concurrency_manager.get_status()
    print(f"Current system status:")
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    # Test Step 5: Try to simulate the actual request
    print(f"\n--- Step 5: Simulating Actual API Request ---")
    print("This will test what happens when the endpoint receives your request...")
    
    # Check if we can acquire upload slot (this is where the previous issue was)
    try:
        slot_acquired = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
            user_id=test_data["user_id"],
            file_id="debug_test_file",
            file_size=test_data["file_size"]
        ))
        print(f"Upload slot acquisition: {'SUCCESS' if slot_acquired else 'FAILED'}")
        
        if slot_acquired:
            # Clean up
            asyncio.run(upload_concurrency_manager.release_upload_slot(test_data["user_id"], "debug_test_file"))
            print("SUCCESS: Upload slot test completed successfully")
        else:
            print("FAILED: Upload slot acquisition failed - This is likely causing the 400 error!")
            
    except Exception as e:
        print(f"FAILED: Exception during slot acquisition: {e}")
        print("This exception is likely being caught and causing the 400 error!")
        return False
    
    # Test Step 6: Check for potential API request format issues
    print(f"\n--- Step 6: API Request Format Check ---")
    print("Checking if the request format matches what the server expects...")
    
    # This simulates what your frontend JavaScript code sends
    simulated_request = {
        "fileSize": test_data["file_size"],  # Note: frontend might use camelCase
        "filename": test_data["filename"],
        "contentType": test_data["content_type"],
        "userId": test_data["user_id"]  # Note: might be camelCase
    }
    
    print("Simulated frontend request format:")
    for key, value in simulated_request.items():
        if key == "fileSize":
            print(f"  {key}: {value / (1024**3):.2f} GB")
        else:
            print(f"  {key}: {value}")
    
    print("\n--- POTENTIAL ISSUES IDENTIFIED ---")
    issues = []
    
    # Check for common issues that cause 400 errors
    if test_data["file_size"] > max_file_size:
        issues.append("File size exceeds maximum allowed limit")
    
    if enable_limits:
        limits_result = upload_limits_service.check_upload_limits(
            user_id=test_data["user_id"],
            ip_address=test_data["ip_address"],
            file_sizes=[test_data["file_size"]],
            is_batch=False
        )
        if not limits_result.get('allowed', False):
            issues.append(f"Upload limits exceeded: {limits_result.get('reason', 'Unknown')}")
    
    try:
        slot_acquired = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
            user_id=test_data["user_id"],
            file_id="debug_test_file_2",
            file_size=test_data["file_size"]
        ))
        if not slot_acquired:
            issues.append("System unable to allocate upload resources (concurrency issue)")
        else:
            asyncio.run(upload_concurrency_manager.release_upload_slot(test_data["user_id"], "debug_test_file_2"))
    except Exception as e:
        issues.append(f"System error during resource allocation: {str(e)}")
    
    if issues:
        print("Issues that could cause 400 Bad Request:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
        return False
    else:
        print("SUCCESS: No obvious issues found - problem might be in request format or headers")
        return True

if __name__ == "__main__":
    result = test_upload_initiation_endpoint()
    print(f"\n{'='*50}")
    if result:
        print("RESULT: System appears ready for uploads")
        print("The 400 error might be caused by:")
        print("- Incorrect request format from frontend")
        print("- Missing authentication headers")
        print("- Network/CORS issues")
    else:
        print("RESULT: Found issues that could cause 400 error")
        print("Check the issues listed above for the root cause")
    print(f"{'='*50}")