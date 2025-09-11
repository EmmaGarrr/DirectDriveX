#!/usr/bin/env python3
"""
Exception Capture Test
Captures the exact exception being masked by the try-catch block
"""

import asyncio
import sys
import os
import traceback
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.core.config import settings

async def capture_masked_exception():
    """Capture the exact exception being masked"""
    print("=== EXCEPTION CAPTURE TEST ===")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_user_id = "test_user_123"
    test_file_id = "exception_test_file"
    
    print(f"Testing to capture masked exception for:")
    print(f"  File size: {test_file_size / (1024**3):.2f} GB")
    print(f"  User ID: {test_user_id}")
    print(f"  File ID: {test_file_id}")
    
    # We'll manually replicate the acquire_upload_slot logic to see the exception
    print("\n--- Manual Replication of acquire_upload_slot Logic ---")
    
    try:
        # Step 1: Check memory availability
        print("Step 1: Checking memory availability...")
        required_memory = int(test_file_size * 0.1)
        if not upload_concurrency_manager._can_allocate_memory(required_memory):
            print("❌ Memory allocation failed")
            return False
        
        print("SUCCESS: Memory allocation OK")
        
        # Step 2: Check and setup user semaphore
        print("Step 2: Setting up user semaphore...")
        if test_user_id not in upload_concurrency_manager.user_upload_semaphores:
            upload_concurrency_manager.user_upload_semaphores[test_user_id] = asyncio.Semaphore(5)
        
        user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
        
        # Check if user semaphore is available
        if user_sem._value <= 0:
            print("FAILED: User semaphore exhausted")
            return False
        
        print("SUCCESS: User semaphore available")
        
        # Check if global semaphore is available
        if upload_concurrency_manager.global_upload_semaphore._value <= 0:
            print("FAILED: Global semaphore exhausted")
            return False
        
        print("SUCCESS: Global semaphore available")
        
        # Step 3: Try to acquire both semaphores
        print("Step 3: Acquiring semaphores...")
        
        # Acquire global semaphore first
        await upload_concurrency_manager.global_upload_semaphore.acquire()
        print("SUCCESS: Global semaphore acquired")
        
        try:
            # Then acquire user semaphore
            await user_sem.acquire()
            print("SUCCESS: User semaphore acquired")
            
            # Step 4: Try to create UploadSlot - this is likely where the exception occurs
            print("Step 4: Creating UploadSlot...")
            
            # Import UploadSlot class
            from app.services.upload_concurrency_manager import UploadSlot
            
            # Create the upload slot
            import time
            upload_slot = UploadSlot(
                user_id=test_user_id,
                file_id=test_file_id,
                file_size=test_file_size,
                start_time=time.time(),
                memory_usage=required_memory
            )
            
            print("SUCCESS: UploadSlot created successfully")
            
            # Track the upload
            upload_concurrency_manager.active_uploads[test_file_id] = upload_slot
            print("SUCCESS: Upload tracked successfully")
            
            print("SUCCESS: Manual slot acquisition completed!")
            
            # Clean up for testing
            upload_concurrency_manager.global_upload_semaphore.release()
            user_sem.release()
            del upload_concurrency_manager.active_uploads[test_file_id]
            print("Cleaned up test resources")
            
            return True
            
        except Exception as e:
            print(f"FAILED: Exception during user semaphore or UploadSlot creation: {e}")
            print(f"Exception type: {type(e)}")
            print(f"Exception traceback: {traceback.format_exc()}")
            
            # Release global semaphore
            upload_concurrency_manager.global_upload_semaphore.release()
            return False
            
    except Exception as e:
        print(f"FAILED: Exception during global semaphore acquisition: {e}")
        print(f"Exception type: {type(e)}")
        print(f"Exception traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    result = asyncio.run(capture_masked_exception())
    print(f"\nFinal result: {'SUCCESS' if result else 'FAILURE'}")