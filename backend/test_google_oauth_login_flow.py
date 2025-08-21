#!/usr/bin/env python3
"""
Test script for Google OAuth login flow
Tests the new functionality for handling Google OAuth users trying manual login
"""

import requests
import json
import time
from typing import Dict, Any

class GoogleOAuthLoginFlowTester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1/auth"
        
    def test_google_oauth_user_manual_login(self):
        """Test 1: Google OAuth user tries manual login"""
        print("\n=== Test 1: Google OAuth User Manual Login ===")
        
        # This test simulates a Google OAuth user trying to login manually
        # In a real scenario, you would need to create a Google OAuth user first
        
        test_email = "test_google_user@example.com"
        test_password = "testpassword123"
        
        # Attempt manual login
        login_data = {
            "username": test_email,
            "password": test_password
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/token",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 401:
                error_detail = response.json().get("detail", "")
                if "You are logged in with Google" in error_detail:
                    print("✅ SUCCESS: Google OAuth user correctly blocked from manual login")
                    print(f"   Error message: {error_detail}")
                else:
                    print("❌ FAILED: Wrong error message for Google OAuth user")
                    print(f"   Expected: 'You are logged in with Google...'")
                    print(f"   Got: {error_detail}")
            else:
                print("❌ FAILED: Expected 401 error, got", response.status_code)
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    def test_regular_user_manual_login(self):
        """Test 2: Regular user manual login"""
        print("\n=== Test 2: Regular User Manual Login ===")
        
        # This test would require a regular user account
        # For now, we'll test the error handling for non-existent user
        
        test_email = "nonexistent@example.com"
        test_password = "testpassword123"
        
        login_data = {
            "username": test_email,
            "password": test_password
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/token",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 401:
                error_detail = response.json().get("detail", "")
                if "Incorrect username or password" in error_detail:
                    print("✅ SUCCESS: Regular user gets standard error message")
                    print(f"   Error message: {error_detail}")
                else:
                    print("❌ FAILED: Wrong error message for regular user")
                    print(f"   Expected: 'Incorrect username or password'")
                    print(f"   Got: {error_detail}")
            else:
                print("❌ FAILED: Expected 401 error, got", response.status_code)
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    def test_password_reset_flow(self):
        """Test 3: Password reset flow"""
        print("\n=== Test 3: Password Reset Flow ===")
        
        test_email = "test_reset@example.com"
        
        # Test forgot password request
        forgot_data = {
            "email": test_email
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/forgot-password",
                json=forgot_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print("✅ SUCCESS: Forgot password request processed")
                print(f"   Response: {response.json()}")
            else:
                print("❌ FAILED: Forgot password request failed")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    def test_api_endpoints_accessible(self):
        """Test 4: Check if API endpoints are accessible"""
        print("\n=== Test 4: API Endpoints Accessibility ===")
        
        try:
            # Test basic connectivity
            response = requests.get(f"{self.base_url}/docs")
            if response.status_code == 200:
                print("✅ SUCCESS: API documentation accessible")
            else:
                print("⚠️  WARNING: API documentation not accessible")
                
            # Test health check if available
            try:
                response = requests.get(f"{self.base_url}/health")
                if response.status_code == 200:
                    print("✅ SUCCESS: Health check endpoint accessible")
                else:
                    print("⚠️  WARNING: Health check endpoint not accessible")
            except:
                print("⚠️  WARNING: Health check endpoint not available")
                
        except Exception as e:
            print(f"❌ ERROR: Cannot connect to API - {e}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Google OAuth Login Flow Tests")
        print("=" * 50)
        
        self.test_api_endpoints_accessible()
        self.test_google_oauth_user_manual_login()
        self.test_regular_user_manual_login()
        self.test_password_reset_flow()
        
        print("\n" + "=" * 50)
        print("🏁 Test suite completed")
        print("\nNote: Some tests may fail if the backend is not running")
        print("or if test data is not properly set up.")

if __name__ == "__main__":
    tester = GoogleOAuthLoginFlowTester()
    tester.run_all_tests()
