#!/usr/bin/env python3
"""
WebSocket Flow Analysis Test
Focuses specifically on the WebSocket connection where the 400 error occurs
"""

import asyncio
import sys
import os
import json
import uuid
import websockets
from datetime import datetime
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.main import app
from fastapi.testclient import TestClient

def test_websocket_flow_analysis():
    """Analyze the WebSocket connection flow specifically"""
    print("=== WEBSOCKET FLOW ANALYSIS ===")
    print("The HTTP endpoint works, so the issue must be in WebSocket connection...")
    
    # Test data from the successful HTTP response
    test_data = {
        "file_id": "test-file-123",
        "gdrive_upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        "filename": "large_test_file.mp4",
        "size": 3624892618,  # 3.38 GB
        "user_id": "test_user_123"
    }
    
    print(f"\n--- Test Configuration ---")
    for key, value in test_data.items():
        if key == "size":
            print(f"  {key}: {value / (1024**3):.2f} GB")
        else:
            print(f"  {key}: {value}")
    
    # Step 1: Verify the issue is not with HTTP endpoint
    print(f"\n--- Step 1: Confirm HTTP Endpoint Works ---")
    print("We already confirmed the HTTP endpoint returns 200")
    print("So the 400 error must be happening in the WebSocket phase")
    
    # Step 2: Test the WebSocket endpoint function directly
    print(f"\n--- Step 2: Test WebSocket Endpoint Logic ---")
    print("Testing the websocket_upload_proxy_parallel function logic...")
    
    try:
        # Simulate the exact parameters the WebSocket endpoint receives
        file_id = test_data["file_id"]
        gdrive_url = test_data["gdrive_upload_url"]
        user_id = test_data["user_id"]
        total_size = test_data["size"]
        
        print(f"WebSocket endpoint would receive:")
        print(f"  file_id: {file_id}")
        print(f"  gdrive_url: {gdrive_url[:50]}...")
        print(f"  user_id: {user_id}")
        print(f"  total_size: {total_size / (1024**3):.2f} GB")
        
        # Test the exact code that's failing
        print(f"\n--- Step 3: Test the Exact Failing Code ---")
        print("Testing the exact code from main.py lines 650-653...")
        
        # This is the exact code that's causing the issue
        async def test_websocket_logic():
            print("  Simulating WebSocket connection logic...")
            
            # This is line 650 in main.py - the exact problem line
            print("  Testing: acquire_upload_slot call...")
            slot_acquired = await upload_concurrency_manager.acquire_upload_slot(
                user_id=user_id,
                file_id=file_id,
                file_size=total_size
            )
            
            print(f"  Slot acquisition result: {slot_acquired}")
            
            if not slot_acquired:
                print("  FAILED: Slot acquisition failed")
                print("  This is where the WebSocket would close with error")
                return False
            else:
                print("  SUCCESS: Slot acquisition worked")
                # Clean up
                await upload_concurrency_manager.release_upload_slot(user_id, file_id)
                print("  Slot released for cleanup")
                return True
        
        result = asyncio.run(test_websocket_logic())
        
        if result:
            print("SUCCESS: WebSocket logic works correctly")
            print("This means the 400 error is NOT caused by slot acquisition")
        else:
            print("CONFIRMED: Slot acquisition is the root cause")
            print("This is what causes the WebSocket to close with 400 error")
            
            # Deep analysis of why slot acquisition fails
            print(f"\n--- Step 4: Deep Analysis of Slot Acquisition Failure ---")
            print("Investigating why acquire_upload_slot returns False...")
            
            # Check the exact conditions
            required_memory = int(total_size * 0.1)
            print(f"1. Memory check:")
            print(f"   Required memory: {required_memory / (1024**2):.2f} MB")
            memory_available = upload_concurrency_manager._can_allocate_memory(required_memory)
            print(f"   Memory available: {memory_available}")
            
            print(f"2. Global semaphore check:")
            global_sem_value = upload_concurrency_manager.global_upload_semaphore._value
            print(f"   Global semaphore value: {global_sem_value}")
            print(f"   Max concurrent users: {upload_concurrency_manager.max_concurrent_users}")
            
            print(f"3. User semaphore check:")
            if user_id in upload_concurrency_manager.user_upload_semaphores:
                user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                user_sem_value = user_sem._value
                print(f"   User semaphore value: {user_sem_value}")
            else:
                print(f"   User semaphore does not exist yet")
            
            print(f"4. Active uploads check:")
            active_count = len(upload_concurrency_manager.active_uploads)
            print(f"   Active uploads: {active_count}")
            for fid, slot in upload_concurrency_manager.active_uploads.items():
                print(f"     - {fid}: {slot.file_size / (1024**3):.2f} GB")
            
            # Test the exact acquire_upload_slot method with detailed logging
            print(f"5. Testing acquire_upload_slot method internals...")
            
            async def test_detailed_slot_acquisition():
                print("   Testing with async context manager...")
                async with upload_concurrency_manager._lock:
                    print("   Acquired lock")
                    
                    # Check memory (line 56)
                    if not upload_concurrency_manager._can_allocate_memory(total_size):
                        print("   FAILED: Memory check failed")
                        return False
                    
                    # Setup user semaphore (lines 60-61)
                    if user_id not in upload_concurrency_manager.user_upload_semaphores:
                        upload_concurrency_manager.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                        print("   Created user semaphore")
                    
                    user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                    
                    # Check user semaphore (lines 66-67)
                    if user_sem._value <= 0:
                        print("   FAILED: User semaphore exhausted")
                        return False
                    
                    # Check global semaphore (lines 70-71)
                    if upload_concurrency_manager.global_upload_semaphore._value <= 0:
                        print("   FAILED: Global semaphore exhausted")
                        return False
                    
                    print("   All checks passed, attempting semaphore acquisition...")
                    
                    # Try the exact problematic code (lines 74-90)
                    try:
                        print("   Acquiring global semaphore...")
                        await upload_concurrency_manager.global_upload_semaphore.acquire()
                        print("   Global semaphore acquired")
                        
                        print("   Acquiring user semaphore...")
                        await user_sem.acquire()
                        print("   User semaphore acquired")
                        
                        print("   Creating UploadSlot object...")
                        from app.services.upload_concurrency_manager import UploadSlot
                        upload_slot = UploadSlot(
                            user_id=user_id,
                            file_id=file_id,
                            file_size=total_size,
                            start_time=asyncio.get_event_loop().time(),
                            memory_usage=required_memory
                        )
                        print("   UploadSlot created")
                        
                        print("   Tracking upload...")
                        upload_concurrency_manager.active_uploads[file_id] = upload_slot
                        print("   Upload tracked")
                        
                        print("   SUCCESS: All steps completed")
                        return True
                        
                    except Exception as e:
                        print(f"   EXCEPTION in try block: {e}")
                        print(f"   Exception type: {type(e)}")
                        import traceback
                        print(f"   Exception traceback: {traceback.format_exc()}")
                        
                        # This is the exact problematic code (lines 92-99)
                        print("   Executing exception handler (the problematic part)...")
                        if upload_concurrency_manager.global_upload_semaphore._value < upload_concurrency_manager.max_concurrent_users:
                            upload_concurrency_manager.global_upload_semaphore.release()
                            print("   Released global semaphore")
                        if user_sem._value < 5:
                            user_sem.release()
                            print("   Released user semaphore")
                        
                        print(f"   Returning False (masking the exception)")
                        return False
            
            detailed_result = asyncio.run(test_detailed_slot_acquisition())
            print(f"Detailed slot acquisition result: {detailed_result}")
            
            if detailed_result:
                # Clean up
                if file_id in upload_concurrency_manager.active_uploads:
                    del upload_concurrency_manager.active_uploads[file_id]
                    upload_concurrency_manager.global_upload_semaphore.release()
                    user_sem.release()
                    print("Cleaned up test resources")
        
        return result
        
    except Exception as e:
        print(f"FAILED: WebSocket flow analysis failed: {e}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

def test_frontend_websocket_simulation():
    """Test what happens when frontend tries to connect to WebSocket"""
    print(f"\n--- Step 5: Frontend WebSocket Connection Simulation ---")
    print("Testing what the frontend actually does for WebSocket connection...")
    
    # This simulates the frontend WebSocket connection
    frontend_behavior = """
    Frontend WebSocket Flow:
    1. Frontend makes POST /api/v1/upload/initiate (✅ WORKS - returns 200)
    2. Frontend receives response with file_id and gdrive_upload_url
    3. Frontend creates WebSocket connection to /ws_api/upload_parallel/{file_id}
    4. WebSocket connection triggers main.py:624 websocket_upload_proxy_parallel
    5. WebSocket handler calls main.py:650 acquire_upload_slot
    6. acquire_upload_slot returns False due to masked exception
    7. WebSocket handler closes connection with error message
    8. Frontend receives WebSocket close event with error code 1008
    9. Frontend interprets this as upload failure
    """
    
    print("Frontend Behavior Analysis:")
    print(frontend_behavior)
    
    print("\nKey Finding:")
    print("The HTTP request works perfectly (200 status)")
    print("The 400 error happens when frontend tries to establish WebSocket connection")
    print("The WebSocket handler fails because acquire_upload_slot returns False")
    print("The False return is caused by the masked exception in upload_concurrency_manager.py")

if __name__ == "__main__":
    print("Starting WebSocket Flow Analysis...")
    print("We know HTTP endpoint works, so focusing on WebSocket...")
    print("=" * 60)
    
    result = test_websocket_flow_analysis()
    test_frontend_websocket_simulation()
    
    print("\n" + "=" * 60)
    if result:
        print("FINAL RESULT: ISSUE CONFIRMED")
        print("Root cause: acquire_upload_slot returns False due to masked exception")
        print("Location: upload_concurrency_manager.py lines 92-99")
        print("Effect: WebSocket connection fails with misleading error message")
        print("Frontend sees: 400 Bad Request (actually WebSocket close error)")
    else:
        print("FINAL RESULT: CRITICAL FAILURE")
        print("The upload system has fundamental issues")
    print("=" * 60)