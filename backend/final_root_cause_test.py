#!/usr/bin/env python3
"""
Final Root Cause Test
This test will definitively identify why memory check fails inside lock but passes outside
"""

import asyncio
import sys
import os
import psutil
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.upload_concurrency_manager import upload_concurrency_manager

def final_root_cause_analysis():
    """Final analysis to find the exact root cause"""
    print("=== FINAL ROOT CAUSE ANALYSIS ===")
    print("We know memory check fails inside lock but passes outside")
    print("This test will find exactly why...")
    
    test_file_size = 3624892618  # 3.38 GB
    required_memory = int(test_file_size * 0.1)
    
    print(f"\nTest Configuration:")
    print(f"File size: {test_file_size / (1024**3):.2f} GB")
    print(f"Required memory: {required_memory / (1024**2):.2f} MB")
    
    # Step 1: Test memory check outside lock
    print(f"\n--- Step 1: Memory Check OUTSIDE Lock ---")
    memory_outside = upload_concurrency_manager._can_allocate_memory(required_memory)
    print(f"Memory check OUTSIDE lock: {memory_outside}")
    
    # Show detailed memory state outside lock
    memory_outside_state = psutil.virtual_memory()
    print(f"Memory usage outside lock: {memory_outside_state.percent:.1f}%")
    print(f"Available memory outside lock: {memory_outside_state.available / (1024**2):.2f} MB")
    
    # Step 2: Test memory check inside lock with detailed debugging
    print(f"\n--- Step 2: Memory Check INSIDE Lock ---")
    
    async def test_memory_inside_lock():
        print("Acquiring lock...")
        async with upload_concurrency_manager._lock:
            print("Lock acquired")
            
            # Check memory immediately after acquiring lock
            memory_inside_state = psutil.virtual_memory()
            print(f"Memory usage inside lock: {memory_inside_state.percent:.1f}%")
            print(f"Available memory inside lock: {memory_inside_state.available / (1024**2):.2f} MB")
            
            # Compare memory states
            usage_diff = memory_inside_state.percent - memory_outside_state.percent
            available_diff = memory_inside_state.available - memory_outside_state.available
            
            print(f"Memory usage difference: {usage_diff:.2f}%")
            print(f"Available memory difference: {available_diff / (1024**2):.2f} MB")
            
            # Now test the actual memory check
            print("Testing _can_allocate_memory inside lock...")
            memory_inside = upload_concurrency_manager._can_allocate_memory(required_memory)
            print(f"Memory check INSIDE lock: {memory_inside}")
            
            # Debug the _can_allocate_memory function step by step
            print("Debugging _can_allocate_memory step by step...")
            
            # Step 1: Check memory usage percentage
            current_usage = memory_inside_state.percent
            max_usage = upload_concurrency_manager.max_memory_usage_percent
            print(f"Step 1 - Current usage: {current_usage:.1f}% vs Max: {max_usage}%")
            print(f"Step 1 result: {current_usage <= max_usage}")
            
            if current_usage > max_usage:
                print("FAILED: Memory usage too high")
                return False
            
            # Step 2: Check total allocated memory
            total_allocated = sum(slot.memory_usage for slot in upload_concurrency_manager.active_uploads.values())
            print(f"Step 2 - Total allocated: {total_allocated / (1024**2):.2f} MB")
            
            # Step 3: Check available memory after reserve
            available_memory = memory_inside_state.available - upload_concurrency_manager.reserved_memory_bytes
            print(f"Step 3 - Available after reserve: {available_memory / (1024**2):.2f} MB")
            
            # Step 4: Check if required memory fits
            will_fit = total_allocated + required_memory < available_memory
            print(f"Step 4 - Required + Allocated: {(total_allocated + required_memory) / (1024**2):.2f} MB")
            print(f"Step 4 - Will it fit? {will_fit}")
            
            # Detailed calculation
            print("Detailed calculation:")
            print(f"  Required memory: {required_memory / (1024**2):.2f} MB")
            print(f"  Total allocated: {total_allocated / (1024**2):.2f} MB")
            print(f"  Sum: {(total_allocated + required_memory) / (1024**2):.2f} MB")
            print(f"  Available: {available_memory / (1024**2):.2f} MB")
            print(f"  Difference: {(available_memory - (total_allocated + required_memory)) / (1024**2):.2f} MB")
            
            if not will_fit:
                print("FAILED: Insufficient memory")
                return False
            
            print("All checks passed - memory should be available")
            return memory_inside
    
    memory_inside_result = asyncio.run(test_memory_inside_lock())
    
    # Step 3: Analyze the results
    print(f"\n--- Step 3: Results Analysis ---")
    print(f"Memory check OUTSIDE lock: {memory_outside}")
    print(f"Memory check INSIDE lock: {memory_inside_result}")
    
    if memory_outside != memory_inside_result:
        print("CRITICAL DISCOVERY: Memory check discrepancy confirmed!")
        
        print(f"\n--- Step 4: Deep Dive Analysis ---")
        print("Investigating why memory check fails inside lock...")
        
        # Test if the issue is with active_uploads tracking
        print("Checking active_uploads tracking...")
        print(f"Number of active uploads: {len(upload_concurrency_manager.active_uploads)}")
        for file_id, slot in upload_concurrency_manager.active_uploads.items():
            print(f"  - {file_id}: {slot.file_size / (1024**3):.2f} GB, memory: {slot.memory_usage / (1024**2):.2f} MB")
        
        # Test if the issue is with psutil consistency
        print("Testing psutil consistency...")
        memory_samples = []
        for i in range(5):
            mem = psutil.virtual_memory()
            memory_samples.append(mem.available)
            print(f"Sample {i+1}: {mem.available / (1024**2):.2f} MB")
            time.sleep(0.1)
        
        memory_variance = max(memory_samples) - min(memory_samples)
        print(f"Memory variance: {memory_variance / (1024**2):.2f} MB")
        
        if memory_variance > 10 * 1024 * 1024:  # 10MB variance
            print("WARNING: High memory variance detected")
            print("This could cause inconsistent results")
        
        # Test if the issue is with integer conversion
        print("Testing integer conversion...")
        test_sizes = [3624892618, 3624892619, 3624892620]
        for size in test_sizes:
            mem_required = int(size * 0.1)
            print(f"Size {size}: required memory {mem_required / (1024**2):.2f} MB")
        
        return True
    else:
        print("Memory check is consistent - issue may be elsewhere")
        return False

def test_hypothesis():
    """Test a specific hypothesis about the root cause"""
    print(f"\n--- Step 5: Hypothesis Testing ---")
    print("Hypothesis: The issue is with rapid memory allocation checks")
    print("causing inconsistent results due to memory fluctuations")
    
    test_file_size = 3624892618
    required_memory = int(test_file_size * 0.1)
    
    # Test rapid consecutive calls to _can_allocate_memory
    print("Testing rapid consecutive calls...")
    results = []
    for i in range(10):
        result = upload_concurrency_manager._can_allocate_memory(required_memory)
        results.append(result)
        memory = psutil.virtual_memory()
        print(f"Call {i+1}: {result} (usage: {memory.percent:.1f}%, available: {memory.available / (1024**2):.2f} MB)")
        time.sleep(0.05)  # 50ms delay
    
    print(f"Results: {results}")
    print(f"All consistent: {all(r == results[0] for r in results)}")
    
    if not all(r == results[0] for r in results):
        print("HYPOTHESIS CONFIRMED: Inconsistent memory allocation checks!")
        return True
    else:
        print("Hypothesis not confirmed - memory checks are consistent")
        return False

def test_edge_cases():
    """Test edge cases that might cause the issue"""
    print(f"\n--- Step 6: Edge Case Testing ---")
    
    test_file_size = 3624892618
    required_memory = int(test_file_size * 0.1)
    
    # Test with different file sizes
    edge_cases = [
        test_file_size - 1000,  # Slightly smaller
        test_file_size,         # Exact size
        test_file_size + 1000,  # Slightly larger
        int(test_file_size * 1.1),  # 10% larger
    ]
    
    for size in edge_cases:
        mem_required = int(size * 0.1)
        result = upload_concurrency_manager._can_allocate_memory(mem_required)
        print(f"Size {size / (1024**3):.2f} GB: {result}")
    
    # Test memory calculation edge cases
    print("Testing memory calculation edge cases...")
    test_values = [3624892618, 3624892619, 3624892620, 3624892621]
    for val in test_values:
        calculated = int(val * 0.1)
        print(f"int({val} * 0.1) = {calculated}")
    
    return True

if __name__ == "__main__":
    print("Starting Final Root Cause Analysis...")
    print("This test will definitively identify the root cause...")
    print("=" * 60)
    
    discrepancy_found = final_root_cause_analysis()
    hypothesis_confirmed = test_hypothesis()
    edge_cases_tested = test_edge_cases()
    
    print("\n" + "=" * 60)
    print("FINAL ROOT CAUSE ANALYSIS:")
    print(f"Memory discrepancy found: {discrepancy_found}")
    print(f"Hypothesis confirmed: {hypothesis_confirmed}")
    print(f"Edge cases tested: {edge_cases_tested}")
    
    if discrepancy_found:
        print("\nROOT CAUSE IDENTIFIED:")
        print("The memory check behaves differently inside vs outside the lock")
        print("This causes acquire_upload_slot to fail inconsistently")
        print("The issue is likely:")
        print("1. Memory usage fluctuations between checks")
        print("2. Race conditions in memory allocation")
        print("3. psutil.virtual_memory() returning different values")
        print("4. Active uploads tracking issues")
        
        print("\nEXACT PROBLEM:")
        print("1. HTTP request works (memory check passes outside lock)")
        print("2. WebSocket connection established")
        print("3. acquire_upload_slot called with lock")
        print("4. Memory check fails inside lock (inconsistent behavior)")
        print("5. acquire_upload_slot returns False")
        print("6. WebSocket closed with error")
        print("7. Frontend receives 400 Bad Request")
        
        print("\nSOLUTION:")
        print("1. Fix the _can_allocate_memory function to be consistent")
        print("2. Add retry logic for transient memory allocation failures")
        print("3. Improve memory calculation accuracy")
        print("4. Fix the exception handling to not mask real errors")
        
    else:
        print("\nROOT CAUSE NOT FULLY IDENTIFIED")
        print("The issue may be more complex than initially thought")
        print("Further investigation required")
    
    print("=" * 60)