#!/usr/bin/env python3
"""
Test Script 2: Concurrency Manager Analysis
Tests the upload concurrency manager to identify slot acquisition failures
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.core.config import settings
import psutil

async def test_concurrency_manager():
    """Test concurrency manager with various scenarios"""
    print("=== Concurrency Manager Test ===")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB in bytes
    test_user_id = "test_user_123"
    test_file_id = "test_file_456"
    
    print(f"Testing with file size: {test_file_size / (1024**3):.2f} GB")
    print(f"Environment: {upload_concurrency_manager.environment}")
    print(f"Max concurrent users: {upload_concurrency_manager.max_concurrent_users}")
    print(f"Max memory usage percent: {upload_concurrency_manager.max_memory_usage_percent}")
    print(f"Reserved memory bytes: {upload_concurrency_manager.reserved_memory_bytes / (1024**2):.2f} MB")
    
    # Get current system status
    print("\n--- System Status ---")
    memory = psutil.virtual_memory()
    print(f"Total memory: {memory.total / (1024**3):.2f} GB")
    print(f"Available memory: {memory.available / (1024**3):.2f} GB")
    print(f"Memory usage: {memory.percent:.1f}%")
    
    # Get concurrency manager status
    print("\n--- Concurrency Manager Status ---")
    status = upload_concurrency_manager.get_status()
    print(f"Active uploads: {status['active_uploads']}")
    print(f"Global upload slots available: {status['global_upload_slots_available']}")
    print(f"Memory usage percent: {status['memory_usage_percent']:.1f}%")
    print(f"Memory limit percent: {status['memory_limit_percent']:.1f}%")
    
    # Test 1: Memory availability check
    print("\n--- Test 1: Memory Availability Check ---")
    required_memory = int(test_file_size * 0.1)  # 10% of file size
    print(f"Required memory estimate: {required_memory / (1024**2):.2f} MB")
    
    # Check if memory can be allocated
    can_allocate = upload_concurrency_manager._can_allocate_memory(required_memory)
    print(f"Can allocate memory: {can_allocate}")
    
    if not can_allocate:
        print("Memory allocation would fail. Detailed analysis:")
        print(f"  Current memory usage: {memory.percent:.1f}%")
        print(f"  Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
        print(f"  Total allocated memory: {sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values()) / (1024**2):.2f} MB")
        print(f"  Available memory after reserve: {(memory.available - upload_concurrency_manager.reserved_memory_bytes) / (1024**2):.2f} MB")
        print(f"  Required memory: {required_memory / (1024**2):.2f} MB")
    
    # Test 2: Semaphore availability check
    print("\n--- Test 2: Semaphore Availability ---")
    print(f"Global semaphore value: {upload_concurrency_manager.global_upload_semaphore._value}")
    print(f"User semaphore exists: {test_user_id in upload_concurrency_manager.user_upload_semaphores}")
    
    if test_user_id in upload_concurrency_manager.user_upload_semaphores:
        user_sem = upload_concurrency_manager.user_upload_semaphores[test_user_id]
        print(f"User semaphore value: {user_sem._value}")
    
    # Test 3: Slot acquisition simulation
    print("\n--- Test 3: Slot Acquisition Simulation ---")
    try:
        slot_acquired = await upload_concurrency_manager.acquire_upload_slot(
            user_id=test_user_id,
            file_id=test_file_id,
            file_size=test_file_size
        )
        print(f"Slot acquired: {slot_acquired}")
        
        if slot_acquired:
            print("Slot acquisition successful!")
            # Release the slot for testing
            await upload_concurrency_manager.release_upload_slot(test_user_id, test_file_id)
            print("Slot released for testing")
        else:
            print("Slot acquisition failed - this indicates the root cause!")
            
    except Exception as e:
        print(f"Exception during slot acquisition: {e}")
    
    # Test 4: Active uploads analysis
    print("\n--- Test 4: Active Uploads Analysis ---")
    if upload_concurrency_manager.active_uploads:
        print("Current active uploads:")
        for file_id, slot in upload_concurrency_manager.active_uploads.items():
            print(f"  File {file_id}: {slot.file_size / (1024**3):.2f} GB, User: {slot.user_id}")
    else:
        print("No active uploads")

if __name__ == "__main__":
    asyncio.run(test_concurrency_manager())