#!/usr/bin/env python3
"""
Final Root Cause Analysis Script
Pinpoints the exact location and reason for slot acquisition failure
"""

import asyncio
import sys
import os
import traceback
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.core.config import settings

async def detailed_root_cause_analysis():
    """Detailed analysis to find exact root cause"""
    print("=== FINAL ROOT CAUSE ANALYSIS ===")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_user_id = "test_user_123"
    test_file_id = "final_test_file"
    
    print(f"Analyzing slot acquisition failure:")
    print(f"  File size: {test_file_size / (1024**3):.2f} GB")
    print(f"  User ID: {test_user_id}")
    print(f"  File ID: {test_file_id}")
    
    # Get current status
    print("\n--- Current System Status ---")
    status = upload_concurrency_manager.get_status()
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    # Test the actual acquire_upload_slot method with detailed error capture
    print("\n--- Testing acquire_upload_slot Method ---")
    try:
        result = await upload_concurrency_manager.acquire_upload_slot(
            user_id=test_user_id,
            file_id=test_file_id,
            file_size=test_file_size
        )
        print(f"Slot acquisition result: {result}")
        
        if result:
            print("SUCCESS: Slot acquired!")
            # Clean up
            await upload_concurrency_manager.release_upload_slot(test_user_id, test_file_id)
            print("Slot released for cleanup")
        else:
            print("FAILURE: Slot acquisition failed - investigating why...")
            
            # Check each condition that could cause failure
            print("\n--- Failure Analysis ---")
            
            # Check 1: Memory availability
            required_memory = int(test_file_size * 0.1)
            print(f"1. Memory check:")
            print(f"   Required: {required_memory / (1024**2):.2f} MB")
            memory_ok = upload_concurrency_manager._can_allocate_memory(required_memory)
            print(f"   Available: {memory_ok}")
            
            # Check 2: User semaphore setup
            print(f"2. User semaphore check:")
            user_sem_exists = test_user_id in upload_concurrency_manager.user_upload_semaphores
            print(f"   User semaphore exists: {user_sem_exists}")
            
            if user_sem_exists:
                user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
                print(f"   User semaphore value: {user_sem._value}")
            else:
                print(f"   User semaphore doesn't exist (normal for first test)")
            
            # Check 3: Global semaphore
            print(f"3. Global semaphore check:")
            print(f"   Global semaphore value: {upload_concurrency_manager.global_upload_semaphore._value}")
            print(f"   Max concurrent users: {upload_concurrency_manager.max_concurrent_users}")
            
            # Check 4: Active uploads
            print(f"4. Active uploads check:")
            print(f"   Number of active uploads: {len(upload_concurrency_manager.active_uploads)}")
            for file_id, slot in upload_concurrency_manager.active_uploads.items():
                print(f"     - {file_id}: {slot.file_size / (1024**3):.2f} GB")
            
            # Check 5: System resources
            print(f"5. System resources check:")
            import psutil
            memory = psutil.virtual_memory()
            print(f"   Total memory: {memory.total / (1024**3):.2f} GB")
            print(f"   Available memory: {memory.available / (1024**3):.2f} GB")
            print(f"   Memory usage: {memory.percent:.1f}%")
            print(f"   Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
            
            # Hypothesis: The issue might be in the exception handling
            print(f"\n--- Exception Handling Analysis ---")
            print("The acquire_upload_slot method has a try-catch block that might be")
            print("catching an exception and returning False instead of propagating the error.")
            print("Let's test this hypothesis...")
            
            # Test semaphore acquisition directly
            print(f"\n--- Direct Semaphore Test ---")
            try:
                # Test if we can acquire the global semaphore directly
                print("Testing global semaphore acquisition...")
                await upload_concurrency_manager.global_upload_semaphore.acquire()
                print("Global semaphore acquired successfully")
                upload_concurrency_manager.global_upload_semaphore.release()
                print("Global semaphore released successfully")
                
                # Test user semaphore creation and acquisition
                print("Testing user semaphore...")
                if test_user_id not in upload_concurrency_manager.user_upload_semaphores:
                    upload_concurrency_manager.user_upload_semaphores[test_user_id] = asyncio.Semaphore(5)
                
                user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
                await user_sem.acquire()
                print("User semaphore acquired successfully")
                user_sem.release()
                print("User semaphore released successfully")
                
                print("CONCLUSION: Semaphores work correctly")
                print("ROOT CAUSE: The exception handling in acquire_upload_slot is masking the real error")
                
            except Exception as e:
                print(f"Direct semaphore test failed: {e}")
                print(f"Exception type: {type(e)}")
                print(f"Exception traceback: {traceback.format_exc()}")
        
    except Exception as e:
        print(f"Exception during slot acquisition test: {e}")
        print(f"Exception type: {type(e)}")
        print(f"Exception traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(detailed_root_cause_analysis())