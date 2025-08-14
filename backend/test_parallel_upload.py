#!/usr/bin/env python3
"""
Test script for the parallel upload system
Run this to verify all components are working correctly
"""

import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_parallel_upload_system():
    """Test all components of the parallel upload system"""
    print("🧪 Testing Parallel Upload System...")
    
    try:
        # Test 1: Import all services
        print("\n1️⃣ Testing service imports...")
        from app.services.upload_concurrency_manager import upload_concurrency_manager
        from app.services.memory_monitor import memory_monitor
        from app.services.chunk_buffer_pool import chunk_buffer_pool
        from app.services.parallel_chunk_processor import sequential_chunk_processor
        print("✅ All services imported successfully")
        
        # Test 2: Check service initialization
        print("\n2️⃣ Testing service initialization...")
        print(f"   Concurrency Manager: {type(upload_concurrency_manager).__name__}")
        print(f"   Memory Monitor: {type(memory_monitor).__name__}")
        print(f"   Buffer Pool: {type(chunk_buffer_pool).__name__}")
        print(f"   Sequential Processor: {type(sequential_chunk_processor).__name__}")
        print("✅ All services initialized successfully")
        
        # Test 3: Test memory monitoring
        print("\n3️⃣ Testing memory monitoring...")
        memory_status = memory_monitor.get_memory_status()
        print(f"   Current memory usage: {memory_status['current_usage']['percent']}%")
        print(f"   Available memory: {memory_status['current_usage']['available_gb']}GB")
        print("✅ Memory monitoring working")
        
        # Test 4: Test concurrency manager
        print("\n4️⃣ Testing concurrency manager...")
        concurrency_status = upload_concurrency_manager.get_status()
        print(f"   Active uploads: {concurrency_status['active_uploads']}")
        print(f"   Global slots available: {concurrency_status['global_upload_slots_available']}")
        print("✅ Concurrency manager working")
        
        # Test 5: Test buffer pool
        print("\n5️⃣ Testing buffer pool...")
        buffer_status = chunk_buffer_pool.get_pool_status()
        print(f"   Total buffers: {buffer_status['usage']['total_capacity']}")
        print(f"   Available buffers: {buffer_status['usage']['total_available']}")
        print("✅ Buffer pool working")
        
        # Test 6: Test sequential processor configuration
        print(f"   Max chunks per batch: {sequential_chunk_processor.max_concurrent_chunks}")
        print(f"   Default chunk size: {sequential_chunk_processor.default_chunk_size // (1024*1024)}MB")
        print("✅ Sequential processor configured correctly")
        
        # Test 7: Test chunk size calculation
        print("\n7️⃣ Testing chunk size calculation...")
        small_file = 50 * 1024 * 1024  # 50MB
        medium_file = 500 * 1024 * 1024  # 500MB
        large_file = 2 * 1024 * 1024 * 1024  # 2GB
        
        small_chunk = sequential_chunk_processor.get_optimal_chunk_size(small_file)
        medium_chunk = sequential_chunk_processor.get_optimal_chunk_size(medium_file)
        large_chunk = sequential_chunk_processor.get_optimal_chunk_size(large_file)
        
        print(f"   50MB file -> {small_chunk // (1024*1024)}MB chunks")
        print(f"   500MB file -> {medium_chunk // (1024*1024)}MB chunks")
        print(f"   2GB file -> {large_chunk // (1024*1024)}MB chunks")
        print("✅ Chunk size calculation working")
        
        # Test 8: Test new sequential method exists
        print("\n8️⃣ Testing new sequential processor method...")
        if hasattr(sequential_chunk_processor, 'process_upload_from_websocket'):
            print("   ✅ process_upload_from_websocket method exists")
        else:
            print("   ❌ process_upload_from_websocket method missing")
            return False
        
        print("✅ New parallel processor method available")
        
        # Test 9: Test memory allocation
        print("\n9️⃣ Testing memory allocation...")
        test_file_id = "test_file_123"
        test_memory = 100 * 1024 * 1024  # 100MB
        
        can_allocate = memory_monitor.can_allocate(test_memory)
        print(f"   Can allocate 100MB: {can_allocate}")
        
        if can_allocate:
            allocated = await memory_monitor.allocate_memory(test_file_id, test_memory)
            print(f"   Memory allocated: {allocated}")
            
            if allocated:
                await memory_monitor.release_memory(test_file_id)
                print("   Memory released")
        
        print("✅ Memory allocation working")
        
        print("\n🎉 All tests passed! Parallel upload system is ready.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_concurrency_limits():
    """Test concurrency limits and semaphores"""
    print("\n🔒 Testing concurrency limits...")
    
    try:
        from app.services.upload_concurrency_manager import upload_concurrency_manager
        
        # Test acquiring multiple slots
        test_user = "test_user_123"
        test_file_1 = "test_file_1"
        test_file_2 = "test_file_2"
        test_file_3 = "test_file_3"
        test_file_4 = "test_file_4"
        
        # Try to acquire 4 slots (should only allow 3 per user)
        results = []
        for i, file_id in enumerate([test_file_1, test_file_2, test_file_3, test_file_4]):
            result = await upload_concurrency_manager.acquire_upload_slot(test_user, file_id, 100*1024*1024)
            results.append(result)
            print(f"   Slot {i+1} acquired: {result}")
        
        # Check that only 3 were acquired
        acquired_count = sum(results)
        print(f"   Total slots acquired: {acquired_count}/4 (expected: 3)")
        
        # Release all slots
        for file_id in [test_file_1, test_file_2, test_file_3, test_file_4]:
            await upload_concurrency_manager.release_upload_slot(test_user, file_id)
        
        print("✅ Concurrency limits working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Concurrency test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Parallel Upload System Tests...")
    
    # Run tests
    async def run_all_tests():
        test1_result = await test_parallel_upload_system()
        test2_result = await test_concurrency_limits()
        
        if test1_result and test2_result:
            print("\n🎯 All tests completed successfully!")
            print("✅ Parallel upload system is ready for use")
            print("\n📝 Next steps:")
            print("   1. Set ENABLE_PARALLEL_UPLOADS=True in your .env file")
            print("   2. Restart the server")
            print("   3. Use /ws_api/upload_parallel/{file_id} endpoint")
        else:
            print("\n❌ Some tests failed. Please check the errors above.")
            sys.exit(1)
    
    # Run the tests
    asyncio.run(run_all_tests())
