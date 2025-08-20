#!/usr/bin/env python3
"""
Test script for email functionality
Run this to test if email configuration is working
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import EmailService
from app.core.config import settings

async def test_email():
    """Test email sending functionality"""
    print("🧪 Testing Email Configuration...")
    
    # Check if SMTP is configured
    if not all([settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
        print("❌ SMTP not configured. Please set the following environment variables:")
        print("   - SMTP_HOST")
        print("   - SMTP_USERNAME") 
        print("   - SMTP_PASSWORD")
        return False
    
    print(f"✅ SMTP Configuration found:")
    print(f"   Host: {settings.SMTP_HOST}")
    print(f"   Port: {settings.SMTP_PORT}")
    print(f"   Username: {settings.SMTP_USERNAME}")
    print(f"   TLS: {settings.SMTP_USE_TLS}")
    
    # Test email sending
    test_email = input("Enter test email address: ")
    if not test_email:
        print("❌ No email address provided")
        return False
    
    print(f"📧 Sending test email to {test_email}...")
    
    try:
        success = await EmailService.send_password_reset_email(
            email=test_email,
            reset_token="test_token_12345678901234567890123456789012",
            username="TestUser"
        )
        
        if success:
            print("✅ Test email sent successfully!")
            print("📬 Check your email inbox for the password reset email")
            return True
        else:
            print("❌ Failed to send test email")
            return False
            
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_email())
    sys.exit(0 if result else 1)
