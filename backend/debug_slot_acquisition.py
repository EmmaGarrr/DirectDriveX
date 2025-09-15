#!/usr/bin/env python3
"""
Debug Script: Detailed Slot Acquisition Analysis
Debugs exactly why slot acquisition is failing
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.core.config import settings

async def debug_slot_acquisition():
    """Debug slot acquisition step by step"""
    print("=== Detailed Slot Acquisition Debug ===")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_user_id = "test_user_123"
    test_file_id = "debug_test_file"
    
    print(f"Debugging slot acquisition for:")
    print(f"  File size: {test_file_size / (1024**3):.2f} GB")
    print(f"  User ID: {test_user_id}")
    print(f"  File ID: {test_file_id}")
    
    # Step 1: Check memory availability
    print("\n--- Step 1: Memory Availability Check ---")
    required_memory = int(test_file_size * 0.1)
    print(f"Required memory: {required_memory / (1024**2):.2f} MB")
    
    can_allocate = upload_concurrency_manager._can_allocate_memory(required_memory)
    print(f"Can allocate memory: {can_allocate}")
    
    if not can_allocate:
        print("Memory allocation failed - detailed analysis:")
        import psutil
        memory = psutil.virtual_memory()
        print(f"  Current memory usage: {memory.percent:.1f}%")
        print(f"  Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
        print(f"  Available memory: {memory.available / (1024**2):.2f} MB")
        print(f"  Reserved memory: {upload_concurrency_manager.reserved_memory_bytes / (1024**2):.2f} MB")
        print(f"  Available after reserve: {(memory.available - upload_concurrency_manager.reserved_memory_bytes) / (1024**2):.2f} MB")
        print(f"  Total allocated: {sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values()) / (1024**2):.2f} MB")
        print(f"  Required: {required_memory / (1024**2):.2f} MB")
        return
    
    # Step 2: Check global semaphore
    print("\n--- Step 2: Global Semaphore Check ---")
    global_sem_value = upload_concurrency_manager.global_upload_semaphore._value
    print(f"Global semaphore value: {global_sem_value}")
    print(f"Max concurrent users: {upload_concurrency_manager.max_concurrent_users}")
    
    if global_sem_value <= 0:
        print("Global semaphore exhausted")
        return
    
    # Step 3: Check user semaphore
    print("\n--- Step 3: User Semaphore Check ---")
    user_sem_exists = test_user_id in upload_concurrency_manager.user_upload_semaphores
    print(f"User semaphore exists: {user_sem_exists}")
    
    if user_sem_exists:
        user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
        user_sem_value = user_sem._value
        print(f"User semaphore value: {user_sem_value}")
        
        if user_sem_value <= 0:
            print("User semaphore exhausted")
            return
    else:
        print("User semaphore doesn't exist yet - will be created")
    
    # Step 4: Simulate slot acquisition with detailed logging
    print("\n--- Step 4: Slot Acquisition Simulation ---")
    
    # Manually simulate the slot acquisition logic with detailed logging
    async with upload_concurrency_manager._lock:
        print("Acquired lock for slot acquisition")
        
        # Check memory again (inside lock)
        if not upload_concurrency_manager._can_allocate_memory(required_memory):
            print("Memory check failed inside lock")
            return
        
        # Check user semaphore
        if test_user_id not in upload_concurrency_manager.user_upload_semaphores:
            print(f"Creating user semaphore for {test_user_id}")
            upload_concurrency_manager.user_upload_semaphores[test_user_id] = asyncio.Semaphore(5)
        
        user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
        user_sem_value = user_sem._value
        print(f"User semaphore value after creation/retrieval: {user_sem_value}")
        
        if user_sem_value <= 0:
            print("User semaphore has no available slots")
            return
        
        # Check global semaphore
        global_sem_value = upload_concurrency_manager.global_upload_semaphore._value
        print(f"Global semaphore value: {global_sem_value}")
        
        if global_sem_value <= 0:
            print("Global semaphore has no available slots")
            return
        
        # Try to acquire semaphores
        print("Attempting to acquire global semaphore...")
        try:
            upload_concurrency_manager.global_upload_semaphore.acquire()
            print("Global semaphore acquired")
            
            print("Attempting to acquire user semaphore...")
            user_sem.acquire()
            print("User semaphore acquired")
            
            # Create upload slot
            print("Creating upload slot...")
            upload_slot = upload_concurrency_manager.UploadSlot(
                user_id=test_user_id,
                file_id=test_file_id,
                file_size=test_file_size,
                start_time=asyncio.get_event_loop().time(),
                memory_usage=required_memory
            )
            
            # Track the upload
            upload_concurrency_manager.active_uploads[test_file_id] = upload_slot
            print(f"Upload slot created and tracked: {test_file_id}")
            
            print("Slot acquisition simulation SUCCESS!")
            
            # Clean up for testing
            upload_concurrency_manager.global_upload_semaphore.release()
            user_sem.release()
            del upload_concurrency_manager.active_uploads[test_file_id]
            print("Cleaned up test slot")
            
        except Exception as e:
            print(f"Exception during semaphore acquisition: {e}")
            # Clean up any partially acquired resources
            try:
                upload_concurrency_manager.global_upload_semaphore.release()
            except:
                pass
            try:
                user_sem.release()
            except:
                pass

if __name__ == "__main__":
    asyncio.run(debug_slot_acquisition())