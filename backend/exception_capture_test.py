#!/usr/bin/env python3
"""
Exception Capture Test
Creates a modified version of acquire_upload_slot to capture the exact exception
"""

import asyncio
import sys
import os
import time
import traceback
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import UploadSlot, upload_concurrency_manager

class TestUploadConcurrencyManager:
    """Modified version of UploadConcurrencyManager for debugging"""
    
    def __init__(self):
        # Copy the original manager's state
        self.environment = upload_concurrency_manager.environment
        self.max_memory_usage_percent = upload_concurrency_manager.max_memory_usage_percent
        self.reserved_memory_bytes = upload_concurrency_manager.reserved_memory_bytes
        self.max_concurrent_users = upload_concurrency_manager.max_concurrent_users
        
        # Copy the semaphores and tracking
        self.user_upload_semaphores = upload_concurrency_manager.user_upload_semaphores.copy()
        self.user_upload_counts = upload_concurrency_manager.user_upload_counts.copy()
        self.global_upload_semaphore = upload_concurrency_manager.global_upload_semaphore
        self.global_download_semaphore = upload_concurrency_manager.global_download_semaphore
        self.active_uploads = upload_concurrency_manager.active_uploads.copy()
        self._lock = upload_concurrency_manager._lock
    
    async def debug_acquire_upload_slot(self, user_id: str, file_id: str, file_size: int) -> bool:
        """Debug version of acquire_upload_slot that captures the exact exception"""
        print("=== DEBUG ACQUIRE UPLOAD SLOT ===")
        print(f"User ID: {user_id}")
        print(f"File ID: {file_id}")
        print(f"File size: {file_size / (1024**3):.2f} GB")
        
        async with self._lock:
            print("Lock acquired")
            
            # Check memory availability first
            print("Checking memory availability...")
            required_memory = int(file_size * 0.1)
            print(f"Required memory: {required_memory / (1024**2):.2f} MB")
            
            if not self._can_allocate_memory(required_memory):
                print("FAILED: Memory allocation failed")
                return False
            
            print("Memory check passed")
            
            # Check user limits (max 5 concurrent uploads per user)
            print("Setting up user semaphore...")
            if user_id not in self.user_upload_semaphores:
                self.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                print("Created new user semaphore")
            else:
                print("Using existing user semaphore")
            
            user_sem = self.user_upload_semaphores[user_id]
            print(f"User semaphore value: {user_sem._value}")
            
            # Check if user semaphore is available (value > 0)
            if user_sem._value <= 0:
                print("FAILED: User semaphore exhausted")
                return False
            
            print("User semaphore available")
            
            # Check if global semaphore is available (value > 0)
            print(f"Global semaphore value: {self.global_upload_semaphore._value}")
            if self.global_upload_semaphore._value <= 0:
                print("FAILED: Global semaphore exhausted")
                return False
            
            print("Global semaphore available")
            
            # Try to acquire both semaphores - THIS IS WHERE THE EXCEPTION HAPPENS
            print("Entering try block...")
            try:
                print("Step 1: Acquiring global semaphore...")
                await self.global_upload_semaphore.acquire()
                print("SUCCESS: Global semaphore acquired")
                global_acquired = True
                
                print("Step 2: Acquiring user semaphore...")
                await user_sem.acquire()
                print("SUCCESS: User semaphore acquired")
                user_acquired = True
                
                print("Step 3: Creating UploadSlot...")
                print(f"  - user_id: {user_id}")
                print(f"  - file_id: {file_id}")
                print(f"  - file_size: {file_size}")
                print(f"  - start_time: {time.time()}")
                print(f"  - memory_usage: {required_memory}")
                
                # Track the upload
                upload_slot = UploadSlot(
                    user_id=user_id,
                    file_id=file_id,
                    file_size=file_size,
                    start_time=time.time(),
                    memory_usage=required_memory
                )
                print("SUCCESS: UploadSlot created")
                
                print("Step 4: Tracking upload...")
                self.active_uploads[file_id] = upload_slot
                print("SUCCESS: Upload tracked")
                
                print("Step 5: Returning success...")
                return True
                
            except Exception as e:
                print("EXCEPTION CAUGHT IN TRY BLOCK!")
                print(f"Exception type: {type(e)}")
                print(f"Exception message: {e}")
                print(f"Full traceback:")
                print(traceback.format_exc())
                
                # If anything fails, release what we acquired
                print("Releasing acquired resources...")
                
                global_released = False
                user_released = False
                
                if 'global_acquired' in locals() and global_acquired:
                    try:
                        self.global_upload_semaphore.release()
                        print("Released global semaphore")
                        global_released = True
                    except Exception as release_e:
                        print(f"Failed to release global semaphore: {release_e}")
                else:
                    print("Global semaphore was not acquired")
                
                if 'user_acquired' in locals() and user_acquired:
                    try:
                        user_sem.release()
                        print("Released user semaphore")
                        user_released = True
                    except Exception as release_e:
                        print(f"Failed to release user semaphore: {release_e}")
                else:
                    print("User semaphore was not acquired")
                
                # This is the line that masks the real exception
                print(f"Returning False (masking exception: {e})")
                return False
    
    def _can_allocate_memory(self, required_memory: int) -> bool:
        """Check if we can allocate more memory"""
        try:
            import psutil
            current_usage = psutil.virtual_memory().percent
            if current_usage > self.max_memory_usage_percent:
                print(f"Memory usage too high: {current_usage:.1f}% (limit: {self.max_memory_usage_percent}%)")
                return False
            
            # Check if adding this upload would exceed limits
            total_allocated = sum(slot.memory_usage for slot in self.active_uploads.values())
            current_memory = psutil.virtual_memory()
            available_memory = current_memory.available - self.reserved_memory_bytes
            
            return total_allocated + required_memory < available_memory
        except Exception:
            # If psutil fails, be conservative
            return len(self.active_uploads) < 10

def test_exception_capture():
    """Test the exception capture functionality"""
    print("=== EXCEPTION CAPTURE TEST ===")
    print("This test will capture the exact exception being thrown...")
    
    # Create debug manager
    debug_manager = TestUploadConcurrencyManager()
    
    # Test parameters
    user_id = "test_user_123"
    file_id = "exception_test_file"
    file_size = 3624892618  # 3.38 GB
    
    print(f"\nTest Parameters:")
    print(f"User ID: {user_id}")
    print(f"File ID: {file_id}")
    print(f"File size: {file_size / (1024**3):.2f} GB")
    
    # Test the original function first
    print(f"\n--- Testing Original Function ---")
    try:
        original_result = asyncio.run(upload_concurrency_manager.acquire_upload_slot(user_id, file_id, file_size))
        print(f"Original function result: {original_result}")
    except Exception as e:
        print(f"Original function exception: {e}")
        original_result = False
    
    # Test the debug function
    print(f"\n--- Testing Debug Function ---")
    try:
        debug_result = asyncio.run(debug_manager.debug_acquire_upload_slot(user_id, file_id, file_size))
        print(f"Debug function result: {debug_result}")
    except Exception as e:
        print(f"Debug function exception: {e}")
        debug_result = False
    
    # Clean up if needed
    if file_id in debug_manager.active_uploads:
        del debug_manager.active_uploads[file_id]
        if user_id in debug_manager.user_upload_semaphores:
            debug_manager.user_upload_semaphores[user_id].release()
        debug_manager.global_upload_semaphore.release()
        print("Cleaned up debug test resources")
    
    print(f"\n--- Results Comparison ---")
    print(f"Original function result: {original_result}")
    print(f"Debug function result: {debug_result}")
    
    if original_result == debug_result:
        print("Both functions behave the same")
        if original_result:
            print("Both succeeded - issue may be intermittent")
        else:
            print("Both failed - root cause captured in debug function")
    else:
        print("Functions behave differently - this reveals the issue")
    
    return debug_result

def test_multiple_scenarios():
    """Test multiple scenarios to find patterns"""
    print(f"\n--- Multiple Scenario Testing ---")
    
    scenarios = [
        {"user_id": "user_1", "file_id": "file_1", "file_size": 3624892618},
        {"user_id": "user_2", "file_id": "file_2", "file_size": 1000000},
        {"user_id": "user_3", "file_id": "file_3", "file_size": 500000000},
    ]
    
    for i, scenario in enumerate(scenarios):
        print(f"\nScenario {i+1}:")
        print(f"  User: {scenario['user_id']}")
        print(f"  File: {scenario['file_id']}")
        print(f"  Size: {scenario['file_size'] / (1024**3):.2f} GB")
        
        try:
            result = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
                scenario['user_id'],
                scenario['file_id'],
                scenario['file_size']
            ))
            print(f"  Result: {result}")
            
            if result:
                # Clean up
                asyncio.run(upload_concurrency_manager.release_upload_slot(
                    scenario['user_id'],
                    scenario['file_id']
                ))
                print("  Cleaned up")
        except Exception as e:
            print(f"  Exception: {e}")

if __name__ == "__main__":
    print("Starting Exception Capture Test...")
    print("This will capture the exact exception being masked...")
    print("=" * 60)
    
    exception_result = test_exception_capture()
    test_multiple_scenarios()
    
    print("\n" + "=" * 60)
    if exception_result:
        print("EXCEPTION CAPTURE RESULT: SUCCESS")
        print("The debug function worked - this reveals the issue is in the original implementation")
        print("Check the debug output above for the exact exception details")
    else:
        print("EXCEPTION CAPTURE RESULT: FAILURE")
        print("Both functions failed - the debug output shows the exact exception")
        print("This definitively identifies the root cause")
    print("=" * 60)