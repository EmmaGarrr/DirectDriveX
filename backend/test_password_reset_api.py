#!/usr/bin/env python3
"""
Test script for password reset API endpoints
Run this to test if the password reset functionality works
"""

import asyncio
import sys
import os
import httpx
import json

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_password_reset_api():
    """Test password reset API endpoints"""
    print("🧪 Testing Password Reset API...")
    
    # Configuration
    base_url = "http://localhost:8000"
    api_url = f"{base_url}/api/v1/auth"
    
    async with httpx.AsyncClient() as client:
        # Test 1: Forgot Password
        print("\n1️⃣ Testing Forgot Password Endpoint...")
        test_email = input("Enter email to test password reset: ")
        
        if not test_email:
            print("❌ No email provided")
            return False
        
        try:
            response = await client.post(
                f"{api_url}/forgot-password",
                json={"email": test_email},
                timeout=30.0
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ Forgot password request successful")
                data = response.json()
                print(f"Message: {data.get('message')}")
                print(f"Email: {data.get('email')}")
            else:
                print(f"❌ Forgot password request failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing forgot password: {e}")
            return False
        
        # Test 2: Reset Password (with invalid token)
        print("\n2️⃣ Testing Reset Password Endpoint (with invalid token)...")
        
        try:
            response = await client.post(
                f"{api_url}/reset-password",
                json={
                    "reset_token": "invalid_token_12345678901234567890123456789012",
                    "new_password": "newpassword123"
                },
                timeout=30.0
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 400:
                print("✅ Invalid token correctly rejected")
            else:
                print(f"⚠️ Unexpected response for invalid token: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing reset password: {e}")
            return False
        
        # Test 3: Rate Limiting
        print("\n3️⃣ Testing Rate Limiting...")
        
        try:
            for i in range(6):  # Try 6 requests (should be limited at 5)
                response = await client.post(
                    f"{api_url}/forgot-password",
                    json={"email": f"test{i}@example.com"},
                    timeout=30.0
                )
                
                print(f"Request {i+1}: Status {response.status_code}")
                
                if response.status_code == 429:
                    print("✅ Rate limiting working correctly")
                    break
                    
        except Exception as e:
            print(f"❌ Error testing rate limiting: {e}")
            return False
        
        print("\n✅ All API tests completed!")
        return True

if __name__ == "__main__":
    result = asyncio.run(test_password_reset_api())
    sys.exit(0 if result else 1)
