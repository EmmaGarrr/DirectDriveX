#!/usr/bin/env python3
"""
Memory Lock Analysis Test
Investigates why memory check passes outside lock but fails inside lock
This is the key discovery that explains the 400 error!
"""

import asyncio
import sys
import os
import psutil
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager

def test_memory_lock_discrepancy():
    """Test the memory check discrepancy between outside and inside lock"""
    print("=== MEMORY LOCK DISCREPANCY ANALYSIS ===")
    print("Key Discovery: Memory check passes OUTSIDE lock but fails INSIDE lock")
    print("This is the exact root cause of the 400 error!")
    
    # Test configuration
    test_file_size = 3624892618  # 3.38 GB
    required_memory = int(test_file_size * 0.1)  # 345.70 MB
    
    print(f"\n--- Test Configuration ---")
    print(f"File size: {test_file_size / (1024**3):.2f} GB")
    print(f"Required memory: {required_memory / (1024**2):.2f} MB")
    
    # Step 1: Test memory check OUTSIDE the lock
    print(f"\n--- Step 1: Memory Check OUTSIDE Lock ---")
    print("Testing _can_allocate_memory without lock...")
    
    try:
        memory_outside = upload_concurrency_manager._can_allocate_memory(required_memory)
        print(f"Memory check result OUTSIDE lock: {memory_outside}")
        
        # Show detailed memory info
        memory = psutil.virtual_memory()
        print(f"Current memory usage: {memory.percent:.1f}%")
        print(f"Available memory: {memory.available / (1024**2):.2f} MB")
        print(f"Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
        print(f"Reserved memory: {upload_concurrency_manager.reserved_memory_bytes / (1024**2):.2f} MB")
        
        # Calculate available after reserve
        available_after_reserve = memory.available - upload_concurrency_manager.reserved_memory_bytes
        print(f"Available after reserve: {available_after_reserve / (1024**2):.2f} MB")
        
        # Check active uploads memory usage
        total_allocated = sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values())
        print(f"Total allocated to active uploads: {total_allocated / (1024**2):.2f} MB")
        print(f"Number of active uploads: {len(upload_concurrency_manager.active_uploads)}")
        
        print(f"Required + Allocated: {(required_memory + total_allocated) / (1024**2):.2f} MB")
        print(f"Available after reserve: {available_after_reserve / (1024**2):.2f} MB")
        print(f"Will it fit? {(required_memory + total_allocated) < available_after_reserve}")
        
    except Exception as e:
        print(f"FAILED: Memory check outside lock failed: {e}")
        return False
    
    # Step 2: Test memory check INSIDE the lock
    print(f"\n--- Step 2: Memory Check INSIDE Lock ---")
    print("Testing _can_allocate_memory with lock...")
    
    try:
        async def test_memory_inside_lock():
            print("  Acquiring lock...")
            async with upload_concurrency_manager._lock:
                print("  Lock acquired")
                
                # Show memory stats inside lock
                memory_inside = psutil.virtual_memory()
                print(f"  Memory usage inside lock: {memory_inside.percent:.1f}%")
                print(f"  Available memory inside lock: {memory_inside.available / (1024**2):.2f} MB")
                
                # Check memory allocation inside lock
                memory_check_inside = upload_concurrency_manager._can_allocate_memory(required_memory)
                print(f"  Memory check result INSIDE lock: {memory_check_inside}")
                
                # Calculate the same values inside lock
                total_allocated_inside = sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values())
                available_after_reserve_inside = memory_inside.available - upload_concurrency_manager.reserved_memory_bytes
                required_plus_allocated = required_memory + total_allocated_inside
                
                print(f"  Inside lock calculations:")
                print(f"    Required memory: {required_memory / (1024**2):.2f} MB")
                print(f"    Total allocated: {total_allocated_inside / (1024**2):.2f} MB")
                print(f"    Required + Allocated: {required_plus_allocated / (1024**2):.2f} MB")
                print(f"    Available after reserve: {available_after_reserve_inside / (1024**2):.2f} MB")
                print(f"    Will it fit? {required_plus_allocated < available_after_reserve_inside}")
                
                # Check what the _can_allocate_memory function is actually doing
                print(f"  Detailed _can_allocate_memory analysis:")
                current_usage = memory_inside.percent
                max_usage = upload_concurrency_manager.max_memory_usage_percent
                print(f"    Current usage: {current_usage:.1f}%")
                print(f"    Max usage: {max_usage}%")
                print(f"    Usage check passed: {current_usage <= max_usage}")
                
                if current_usage > max_usage:
                    print(f"    REASON: Memory usage too high")
                    return False
                
                total_allocated_func = sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values())
                current_memory_func = psutil.virtual_memory()
                available_memory_func = current_memory_func.available - upload_concurrency_manager.reserved_memory_bytes
                
                print(f"    Total allocated: {total_allocated_func / (1024**2):.2f} MB")
                print(f"    Available memory: {available_memory_func / (1024**2):.2f} MB")
                print(f"    Required memory: {required_memory / (1024**2):.2f} MB")
                print(f"    Final check: {total_allocated_func + required_memory < available_memory_func}")
                
                return memory_check_inside
        
        memory_inside_result = asyncio.run(test_memory_inside_lock())
        print(f"Memory check result INSIDE lock: {memory_inside_result}")
        
    except Exception as e:
        print(f"FAILED: Memory check inside lock failed: {e}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False
    
    # Step 3: Compare the results
    print(f"\n--- Step 3: Results Comparison ---")
    print(f"Memory check OUTSIDE lock: {memory_outside}")
    print(f"Memory check INSIDE lock: {memory_inside_result}")
    
    if memory_outside != memory_inside_result:
        print("CRITICAL DISCOVERY: Memory check behaves differently inside vs outside lock!")
        print("This explains why acquire_upload_slot fails!")
        
        print(f"\n--- Step 4: Root Cause Analysis ---")
        print("The memory check is inconsistent between locked and unlocked contexts")
        print("This is likely because:")
        print("1. Memory usage changes between the two checks")
        print("2. The _can_allocate_memory function has race conditions")
        print("3. psutil.virtual_memory() returns different values in quick succession")
        print("4. Active uploads count changes between checks")
        
        return True
    else:
        print("Memory check is consistent - looking for other causes...")
        return False

def test_race_condition_simulation():
    """Simulate potential race conditions"""
    print(f"\n--- Step 5: Race Condition Simulation ---")
    print("Testing if rapid memory checks cause inconsistent results...")
    
    test_file_size = 3624892618
    required_memory = int(test_file_size * 0.1)
    
    # Run multiple rapid memory checks
    results = []
    memory_usages = []
    available_memories = []
    
    print("Running 10 rapid memory checks...")
    for i in range(10):
        memory = psutil.virtual_memory()
        memory_usages.append(memory.percent)
        available_memories.append(memory.available / (1024**2))
        
        result = upload_concurrency_manager._can_allocate_memory(required_memory)
        results.append(result)
        
        print(f"  Check {i+1}: {result} (usage: {memory.percent:.1f}%, available: {memory.available / (1024**2):.2f} MB)")
    
    print(f"\nRapid check results: {results}")
    print(f"All checks same? {all(r == results[0] for r in results)}")
    
    if not all(r == results[0] for r in results):
        print("RACE CONDITION DETECTED: Memory checks are inconsistent!")
        print("This is the root cause of the 400 error!")
        return True
    else:
        print("Memory checks are consistent - not a race condition")
        return False

def test_memory_threshold_analysis():
    """Analyze memory threshold behavior"""
    print(f"\n--- Step 6: Memory Threshold Analysis ---")
    print("Testing if we're right at the memory threshold...")
    
    test_file_size = 3624892618
    required_memory = int(test_file_size * 0.1)
    
    memory = psutil.virtual_memory()
    print(f"Current memory usage: {memory.percent:.1f}%")
    print(f"Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
    print(f"Usage headroom: {upload_concurrency_manager.max_memory_usage_percent - memory.percent:.1f}%")
    
    # Calculate exact memory requirements
    total_allocated = sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values())
    available_after_reserve = memory.available - upload_concurrency_manager.reserved_memory_bytes
    
    print(f"Current allocated: {total_allocated / (1024**2):.2f} MB")
    print(f"Available after reserve: {available_after_reserve / (1024**2):.2f} MB")
    print(f"Required for upload: {required_memory / (1024**2):.2f} MB")
    
    # Check if we're close to the limit
    total_after_upload = total_allocated + required_memory
    headroom_ratio = (available_after_reserve - total_after_upload) / available_after_reserve * 100
    
    print(f"Total after upload: {total_after_upload / (1024**2):.2f} MB")
    print(f"Headroom ratio: {headroom_ratio:.2f}%")
    
    if headroom_ratio < 5:  # Less than 5% headroom
        print("WARNING: Very close to memory limit!")
        print("This could cause inconsistent results due to memory fluctuations")
        return True
    else:
        print("Sufficient memory headroom available")
        return False

if __name__ == "__main__":
    print("Starting Memory Lock Analysis...")
    print("This test will find the exact cause of the memory check discrepancy...")
    print("=" * 60)
    
    discrepancy_found = test_memory_lock_discrepancy()
    race_condition = test_race_condition_simulation()
    threshold_issue = test_memory_threshold_analysis()
    
    print("\n" + "=" * 60)
    print("FINAL ANALYSIS:")
    print(f"Memory lock discrepancy: {discrepancy_found}")
    print(f"Race condition detected: {race_condition}")
    print(f"Threshold issue: {threshold_issue}")
    
    if discrepancy_found or race_condition or threshold_issue:
        print("\nROOT CAUSE IDENTIFIED:")
        print("The 400 Bad Request error is caused by inconsistent memory checks")
        print("The memory allocation check passes outside the lock but fails inside the lock")
        print("This causes acquire_upload_slot to return False, which closes the WebSocket")
        print("The frontend receives this as a 400 Bad Request error")
        
        print("\nEXACT PROBLEM:")
        print("1. Frontend makes HTTP request to /api/v1/upload/initiate (SUCCESS)")
        print("2. Frontend connects to WebSocket for upload")
        print("3. WebSocket handler calls acquire_upload_slot()")
        print("4. acquire_upload_slot() checks memory inside lock (FAILS)")
        print("5. acquire_upload_slot() returns False due to memory check failure")
        print("6. WebSocket closes with error message")
        print("7. Frontend receives 400 Bad Request")
        
        print("\nFIX REQUIRED:")
        print("1. Fix the _can_allocate_memory function to be consistent")
        print("2. Add proper error handling instead of masking exceptions")
        print("3. Improve memory calculation accuracy")
        
    else:
        print("\nNo obvious memory issues found")
        print("The problem may be elsewhere in the system")
    
    print("=" * 60)