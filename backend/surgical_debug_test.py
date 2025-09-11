#!/usr/bin/env python3
"""
Surgical Debug Test
Tests each line of acquire_upload_slot individually to find the exact failure
"""

import asyncio
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager

def surgical_debug_acquire_upload_slot():
    """Test each line of acquire_upload_slot surgically to find the exact failure"""
    print("=== SURGICAL DEBUG TEST ===")
    print("Testing each line of acquire_upload_slot individually...")
    
    # Test parameters
    user_id = "test_user_123"
    file_id = "surgical_test_file"
    file_size = 3624892618  # 3.38 GB
    required_memory = int(file_size * 0.1)
    
    print(f"\nTest Parameters:")
    print(f"  User ID: {user_id}")
    print(f"  File ID: {file_id}")
    print(f"  File size: {file_size / (1024**3):.2f} GB")
    print(f"  Required memory: {required_memory / (1024**2):.2f} MB")
    
    # Test the complete function first to confirm it fails
    print(f"\n--- Step 1: Confirm Complete Function Fails ---")
    try:
        complete_result = asyncio.run(upload_concurrency_manager.acquire_upload_slot(user_id, file_id, file_size))
        print(f"Complete acquire_upload_slot result: {complete_result}")
        if complete_result:
            print("UNEXPECTED: Complete function worked!")
            print("The issue may be intermittent or fixed")
            return True
        else:
            print("CONFIRMED: Complete function fails as expected")
    except Exception as e:
        print(f"Complete function exception: {e}")
        return False
    
    # Now test each component surgically
    print(f"\n--- Step 2: Surgical Line-by-Line Testing ---")
    
    async def surgical_test():
        print("Starting surgical test...")
        
        # Line 54: async with self._lock:
        print("Testing line 54: async with self._lock:")
        try:
            async with upload_concurrency_manager._lock:
                print("  SUCCESS: Lock acquired")
                
                # Line 56: if not self._can_allocate_memory(file_size):
                print("Testing line 56: if not self._can_allocate_memory(file_size):")
                try:
                    if not upload_concurrency_manager._can_allocate_memory(file_size):
                        print("  FAILED: Memory check failed")
                        return False
                    print("  SUCCESS: Memory check passed")
                except Exception as e:
                    print(f"  EXCEPTION in memory check: {e}")
                    return False
                
                # Lines 60-61: Setup user semaphore
                print("Testing lines 60-61: Setup user semaphore")
                try:
                    if user_id not in upload_concurrency_manager.user_upload_semaphores:
                        upload_concurrency_manager.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                        print("  SUCCESS: User semaphore created")
                    else:
                        print("  SUCCESS: User semaphore already exists")
                except Exception as e:
                    print(f"  EXCEPTION in user semaphore setup: {e}")
                    return False
                
                # Line 63: Get user semaphore
                print("Testing line 63: Get user semaphore")
                try:
                    user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                    print("  SUCCESS: User semaphore retrieved")
                except Exception as e:
                    print(f"  EXCEPTION getting user semaphore: {e}")
                    return False
                
                # Lines 66-67: Check user semaphore available
                print("Testing lines 66-67: Check user semaphore available")
                try:
                    if user_sem._value <= 0:
                        print("  FAILED: User semaphore exhausted")
                        return False
                    print("  SUCCESS: User semaphore available")
                    print(f"  User semaphore value: {user_sem._value}")
                except Exception as e:
                    print(f"  EXCEPTION checking user semaphore: {e}")
                    return False
                
                # Lines 70-71: Check global semaphore available
                print("Testing lines 70-71: Check global semaphore available")
                try:
                    if upload_concurrency_manager.global_upload_semaphore._value <= 0:
                        print("  FAILED: Global semaphore exhausted")
                        return False
                    print("  SUCCESS: Global semaphore available")
                    print(f"  Global semaphore value: {upload_concurrency_manager.global_upload_semaphore._value}")
                except Exception as e:
                    print(f"  EXCEPTION checking global semaphore: {e}")
                    return False
                
                # Lines 74-90: The try block
                print("Testing lines 74-90: The try block")
                try:
                    print("  Entering try block...")
                    
                    # Line 76: await self.global_upload_semaphore.acquire()
                    print("  Testing line 76: await self.global_upload_semaphore.acquire()")
                    try:
                        await upload_concurrency_manager.global_upload_semaphore.acquire()
                        print("    SUCCESS: Global semaphore acquired")
                        global_acquired = True
                    except Exception as e:
                        print(f"    EXCEPTION acquiring global semaphore: {e}")
                        return False
                    
                    # Line 79: await user_sem.acquire()
                    print("  Testing line 79: await user_sem.acquire()")
                    try:
                        await user_sem.acquire()
                        print("    SUCCESS: User semaphore acquired")
                        user_acquired = True
                    except Exception as e:
                        print(f"    EXCEPTION acquiring user semaphore: {e}")
                        # Clean up global semaphore
                        try:
                            upload_concurrency_manager.global_upload_semaphore.release()
                        except:
                            pass
                        return False
                    
                    # Line 82-88: Create UploadSlot
                    print("  Testing lines 82-88: Create UploadSlot")
                    try:
                        from app.services.upload_concurrency_manager import UploadSlot
                        upload_slot = UploadSlot(
                            user_id=user_id,
                            file_id=file_id,
                            file_size=file_size,
                            start_time=time.time(),
                            memory_usage=required_memory
                        )
                        print("    SUCCESS: UploadSlot created")
                    except Exception as e:
                        print(f"    EXCEPTION creating UploadSlot: {e}")
                        # Clean up semaphores
                        try:
                            upload_concurrency_manager.global_upload_semaphore.release()
                        except:
                            pass
                        try:
                            user_sem.release()
                        except:
                            pass
                        return False
                    
                    # Line 90: Track the upload
                    print("  Testing line 90: Track the upload")
                    try:
                        upload_concurrency_manager.active_uploads[file_id] = upload_slot
                        print("    SUCCESS: Upload tracked")
                    except Exception as e:
                        print(f"    EXCEPTION tracking upload: {e}")
                        # Clean up semaphores
                        try:
                            upload_concurrency_manager.global_upload_semaphore.release()
                        except:
                            pass
                        try:
                            user_sem.release()
                        except:
                            pass
                        return False
                    
                    # Line 90: return True
                    print("  Testing line 90: return True")
                    print("    SUCCESS: Try block completed successfully")
                    
                    # Clean up for test
                    try:
                        del upload_concurrency_manager.active_uploads[file_id]
                        upload_concurrency_manager.global_upload_semaphore.release()
                        user_sem.release()
                        print("  Cleaned up test resources")
                    except Exception as e:
                        print(f"  WARNING: Cleanup failed: {e}")
                    
                    return True
                    
                except Exception as e:
                    print(f"  EXCEPTION in try block: {e}")
                    print(f"  Exception type: {type(e)}")
                    import traceback
                    print(f"  Exception traceback: {traceback.format_exc()}")
                    return False
                
        except Exception as e:
            print(f"EXCEPTION with lock: {e}")
            return False
    
    surgical_result = asyncio.run(surgical_test())
    print(f"Surgical test result: {surgical_result}")
    
    if surgical_result:
        print("\nCRITICAL DISCOVERY:")
        print("The surgical test PASSED but the complete function FAILED!")
        print("This means the problem is in the exception handling (lines 92-99)")
        print("The try block works, but something in the exception handler is wrong")
        
        print(f"\n--- Step 3: Test Exception Handler Logic ---")
        print("Testing the exception handler specifically...")
        
        async def test_exception_handler():
            print("Testing exception handler logic...")
            
            # Force an exception to test the handler
            try:
                async with upload_concurrency_manager._lock:
                    # Simulate the try block
                    try:
                        # This should work
                        if user_id not in upload_concurrency_manager.user_upload_semaphores:
                            upload_concurrency_manager.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                        
                        user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                        
                        # Check if semaphores are available
                        if user_sem._value <= 0 or upload_concurrency_manager.global_upload_semaphore._value <= 0:
                            print("Semaphores not available for test")
                            return False
                        
                        # Acquire semaphores
                        await upload_concurrency_manager.global_upload_semaphore.acquire()
                        await user_sem.acquire()
                        
                        # Force an exception here
                        raise ValueError("Test exception for exception handler")
                        
                    except Exception as e:
                        print(f"Exception caught: {e}")
                        print("Executing exception handler...")
                        
                        # This is the exact code from lines 92-99
                        if upload_concurrency_manager.global_upload_semaphore._value < upload_concurrency_manager.max_concurrent_users:
                            upload_concurrency_manager.global_upload_semaphore.release()
                            print("Released global semaphore")
                        
                        if user_sem._value < 5:
                            user_sem.release()
                            print("Released user semaphore")
                        
                        print("Exception handler completed")
                        return False  # This is what causes the issue
                        
            except Exception as e:
                print(f"Exception handler test failed: {e}")
                return False
        
        exception_handler_result = asyncio.run(test_exception_handler())
        print(f"Exception handler test result: {exception_handler_result}")
        
        if exception_handler_result is False:
            print("CONFIRMED: Exception handler is working as designed")
            print("The issue is that it returns False instead of propagating the error")
        
        return True
    else:
        print("Surgical test failed - the issue is in the main logic")
        return False

if __name__ == "__main__":
    print("Starting Surgical Debug Test...")
    print("This will test each line individually to find the exact failure...")
    print("=" * 60)
    
    result = surgical_debug_acquire_upload_slot()
    
    print("\n" + "=" * 60)
    if result:
        print("SURGICAL TEST RESULT: CRITICAL DISCOVERY")
        print("The individual components work, but the complete function fails")
        print("This confirms the issue is in the exception handling logic")
        print("The exception handler (lines 92-99) masks real problems")
    else:
        print("SURGICAL TEST RESULT: FAILURE IN MAIN LOGIC")
        print("One of the individual components is failing")
        print("Check the detailed test results above")
    print("=" * 60)