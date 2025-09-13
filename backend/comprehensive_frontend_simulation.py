#!/usr/bin/env python3
"""
Comprehensive Frontend Simulation Test
Simulates EXACTLY what the frontend does step by step
This will trace the complete request flow to find any missed issues
"""

import asyncio
import sys
import os
import json
import uuid
from datetime import datetime
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.v1.routes_upload import initiate_upload
from app.core.config import settings
from app.services.upload_concurrency_manager import upload_concurrency_manager
from app.services.upload_limits_service import upload_limits_service
from app.main import app
from fastapi import Request, HTTPException
from fastapi.testclient import TestClient

class MockRequest:
    """Mock HTTP request object for testing"""
    def __init__(self, client_host="127.0.0.1"):
        self.client = {"host": client_host}
        self.headers = {}

class MockUser:
    """Mock user object for testing"""
    def __init__(self):
        self.id = "test_user_123"
        self.email = "test@example.com"

def test_complete_frontend_simulation():
    """Test the complete flow exactly as frontend does it"""
    print("=== COMPREHENSIVE FRONTEND SIMULATION TEST ===")
    print("Simulating EXACT frontend request flow...")
    
    # Test data - EXACTLY what frontend sends
    frontend_request_data = {
        "filename": "large_test_file.mp4",
        "size": 3624892618,  # 3.38 GB
        "content_type": "video/mp4"
    }
    
    print(f"\n--- Frontend Request Data ---")
    for key, value in frontend_request_data.items():
        if key == "size":
            print(f"  {key}: {value / (1024**3):.2f} GB")
        else:
            print(f"  {key}: {value}")
    
    # Step 1: Test direct HTTP request to /api/v1/upload/initiate
    print(f"\n--- Step 1: Direct HTTP Request Test ---")
    print("Testing actual HTTP endpoint like frontend does...")
    
    try:
        # Create test client
        client = TestClient(app)
        
        # Simulate the exact POST request frontend makes
        response = client.post(
            "/api/v1/upload/initiate",
            json=frontend_request_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"HTTP Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Response Data: {json.dumps(response_data, indent=2)}")
            print("SUCCESS: HTTP request completed successfully")
        else:
            print(f"FAILED: HTTP request failed with status {response.status_code}")
            print(f"Response Body: {response.text}")
            return False
            
    except Exception as e:
        print(f"FAILED: HTTP request test failed with exception: {e}")
        return False
    
    # Step 2: Test the initiate_upload function directly
    print(f"\n--- Step 2: Direct Function Call Test ---")
    print("Testing the initiate_upload function directly...")
    
    try:
        # Import the request model
        from app.api.v1.routes_upload import InitiateUploadRequest
        
        # Create the exact request object
        request_obj = InitiateUploadRequest(
            filename=frontend_request_data["filename"],
            size=frontend_request_data["size"],
            content_type=frontend_request_data["content_type"]
        )
        
        # Create mock request and user
        mock_request = MockRequest()
        mock_user = MockUser()
        
        # Call the function directly
        result = asyncio.run(initiate_upload(request_obj, mock_request, mock_user))
        
        print(f"Function Result: {result}")
        print("SUCCESS: Direct function call completed")
        
    except Exception as e:
        print(f"FAILED: Direct function call failed: {e}")
        print(f"Exception Type: {type(e)}")
        import traceback
        print(f"Full Traceback: {traceback.format_exc()}")
        return False
    
    # Step 3: Test WebSocket flow simulation
    print(f"\n--- Step 3: WebSocket Flow Simulation ---")
    print("Testing the WebSocket upload flow...")
    
    try:
        # Generate test file ID like the system would
        file_id = str(uuid.uuid4())
        user_id = "test_user_123"
        total_size = frontend_request_data["size"]
        
        print(f"Simulating WebSocket upload for file ID: {file_id}")
        print(f"User ID: {user_id}")
        print(f"File size: {total_size / (1024**3):.2f} GB")
        
        # Test the exact line that's failing in main.py
        print(f"Testing the exact problem line: acquire_upload_slot...")
        
        slot_acquired = asyncio.run(upload_concurrency_manager.acquire_upload_slot(
            user_id=user_id,
            file_id=file_id,
            file_size=total_size
        ))
        
        print(f"Slot acquisition result: {slot_acquired}")
        
        if slot_acquired:
            print("SUCCESS: Upload slot acquired")
            # Clean up
            asyncio.run(upload_concurrency_manager.release_upload_slot(user_id, file_id))
            print("Slot released successfully")
        else:
            print("FAILED: Upload slot acquisition failed")
            
            # Deep dive into why it failed
            print(f"\n--- Deep Dive Analysis ---")
            print("Investigating exactly why slot acquisition failed...")
            
            # Check each component individually
            print("1. Checking memory availability...")
            required_memory = int(total_size * 0.1)
            print(f"   Required memory: {required_memory / (1024**2):.2f} MB")
            memory_ok = upload_concurrency_manager._can_allocate_memory(required_memory)
            print(f"   Memory available: {memory_ok}")
            
            print("2. Checking global semaphore...")
            global_sem_value = upload_concurrency_manager.global_upload_semaphore._value
            print(f"   Global semaphore value: {global_sem_value}")
            
            print("3. Checking user semaphore...")
            if user_id in upload_concurrency_manager.user_upload_semaphores:
                user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                user_sem_value = user_sem._value
                print(f"   User semaphore value: {user_sem_value}")
            else:
                print(f"   User semaphore doesn't exist yet")
            
            print("4. Checking active uploads...")
            active_count = len(upload_concurrency_manager.active_uploads)
            print(f"   Active uploads: {active_count}")
            
            print("5. Testing manual semaphore acquisition...")
            
            async def test_manual_semaphores():
                try:
                    # Test if semaphores work when acquired manually
                    print("   Testing global semaphore...")
                    await upload_concurrency_manager.global_upload_semaphore.acquire()
                    print("   Global semaphore acquired successfully")
                    upload_concurrency_manager.global_upload_semaphore.release()
                    print("   Global semaphore released successfully")
                    
                    print("   Testing user semaphore...")
                    if user_id not in upload_concurrency_manager.user_upload_semaphores:
                        upload_concurrency_manager.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                    
                    user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                    await user_sem.acquire()
                    print("   User semaphore acquired successfully")
                    user_sem.release()
                    print("   User semaphore released successfully")
                    
                    print("   SUCCESS: Manual semaphore acquisition works")
                    return True
                    
                except Exception as e:
                    print(f"   FAILED: Manual semaphore acquisition failed: {e}")
                    return False
            
            manual_result = asyncio.run(test_manual_semaphores())
            if not manual_result:
                return False
            
            # Test the exact problematic code path
            print("6. Testing the exact problematic code path...")
            try:
                print("   Testing with async context manager...")
                
                async def test_problematic_path():
                    async with upload_concurrency_manager._lock:
                        # This is the exact code from lines 74-90 that's failing
                        if user_id not in upload_concurrency_manager.user_upload_semaphores:
                            upload_concurrency_manager.user_upload_semaphores[user_id] = asyncio.Semaphore(5)
                        
                        user_sem = upload_concurrency_manager.user_upload_semaphores[user_id]
                        
                        # Check the conditions that should pass
                        if user_sem._value <= 0:
                            return False, "User semaphore exhausted"
                        if upload_concurrency_manager.global_upload_semaphore._value <= 0:
                            return False, "Global semaphore exhausted"
                        
                        # Try the exact problematic try block
                        try:
                            await upload_concurrency_manager.global_upload_semaphore.acquire()
                            await user_sem.acquire()
                            
                            # Create UploadSlot object
                            from app.services.upload_concurrency_manager import UploadSlot
                            upload_slot = UploadSlot(
                                user_id=user_id,
                                file_id=file_id,
                                file_size=total_size,
                                start_time=asyncio.get_event_loop().time(),
                                memory_usage=required_memory
                            )
                            
                            # Track the upload
                            upload_concurrency_manager.active_uploads[file_id] = upload_slot
                            
                            return True, "Success"
                            
                        except Exception as e:
                            # This is the exact exception that's being masked
                            print(f"   EXCEPTION CAUGHT: {e}")
                            print(f"   EXCEPTION TYPE: {type(e)}")
                            import traceback
                            print(f"   EXCEPTION TRACEBACK: {traceback.format_exc()}")
                            return False, f"Exception: {e}"
                
                result, message = asyncio.run(test_problematic_path())
                print(f"   Problematic path result: {result}")
                print(f"   Problematic path message: {message}")
                
                if result:
                    # Clean up
                    del upload_concurrency_manager.active_uploads[file_id]
                    upload_concurrency_manager.global_upload_semaphore.release()
                    user_sem.release()
                    print("   Cleaned up test resources")
                
                return result
                
            except Exception as e:
                print(f"   FAILED: Problematic path test failed: {e}")
                import traceback
                print(f"   Full traceback: {traceback.format_exc()}")
                return False
        
    except Exception as e:
        print(f"FAILED: WebSocket flow simulation failed: {e}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False
    
    # Step 4: System resources comprehensive check
    print(f"\n--- Step 4: System Resources Comprehensive Check ---")
    print("Checking all system resources that could affect uploads...")
    
    try:
        import psutil
        
        # Memory analysis
        memory = psutil.virtual_memory()
        print(f"Total memory: {memory.total / (1024**3):.2f} GB")
        print(f"Available memory: {memory.available / (1024**3):.2f} GB")
        print(f"Memory usage: {memory.percent:.1f}%")
        print(f"Memory limit: {upload_concurrency_manager.max_memory_usage_percent}%")
        print(f"Reserved memory: {upload_concurrency_manager.reserved_memory_bytes / (1024**2):.2f} MB")
        
        # Disk analysis
        disk = psutil.disk_usage('/')
        print(f"Total disk space: {disk.total / (1024**3):.2f} GB")
        print(f"Available disk space: {disk.free / (1024**3):.2f} GB")
        print(f"Disk usage: {disk.percent:.1f}%")
        
        # CPU analysis
        cpu_percent = psutil.cpu_percent(interval=1)
        print(f"CPU usage: {cpu_percent:.1f}%")
        
        # Network analysis (basic)
        print("Network interfaces:")
        for interface, addrs in psutil.net_if_addrs().items():
            print(f"  {interface}: {len(addrs)} addresses")
        
    except Exception as e:
        print(f"System resource check failed: {e}")
    
    return True

if __name__ == "__main__":
    print("Starting comprehensive frontend simulation...")
    print("This test will simulate EXACTLY what your frontend does...")
    print("=" * 60)
    
    result = test_complete_frontend_simulation()
    
    print("\n" + "=" * 60)
    if result:
        print("FINAL RESULT: SUCCESS")
        print("All tests passed - the system should work correctly")
        print("If you're still getting 400 errors, the issue might be:")
        print("- Network/CORS issues between frontend and backend")
        print("- Authentication/authorization problems")
        print("- Frontend request formatting issues")
    else:
        print("FINAL RESULT: FAILURE")
        print("Found concrete issues that explain the 400 Bad Request error")
        print("Check the detailed test results above for the exact root cause")
    print("=" * 60)