#!/usr/bin/env python3
"""
Test script for complete forgot password flow
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import EmailService
from app.services.password_reset_service import PasswordResetService
from app.core.config import settings

async def test_complete_flow():
    """Test the complete forgot password flow"""
    print("🧪 Testing Complete Forgot Password Flow...")
    
    # Test email
    test_email = "test@example.com"
    
    # Step 1: Generate reset token
    print("\n1️⃣ Generating reset token...")
    token = await PasswordResetService.create_reset_token(test_email)
    if token:
        print(f"✅ Token generated: {token[:10]}...")
    else:
        print("❌ Token generation failed")
        return False
    
    # Step 2: Send email
    print("\n2️⃣ Sending password reset email...")
    email_sent = await EmailService.send_password_reset_email(
        email=test_email,
        reset_token=token,
        username="TestUser"
    )
    
    if email_sent:
        print("✅ Email sent successfully!")
    else:
        print("❌ Email sending failed")
        return False
    
    # Step 3: Validate token
    print("\n3️⃣ Validating reset token...")
    reset_data = await PasswordResetService.validate_reset_token(token)
    if reset_data:
        print("✅ Token validation successful!")
        print(f"   Email: {reset_data['email']}")
        print(f"   Expires: {reset_data['expires_at']}")
    else:
        print("❌ Token validation failed")
        return False
    
    # Step 4: Mark token as used
    print("\n4️⃣ Marking token as used...")
    await PasswordResetService.mark_token_used(token)
    print("✅ Token marked as used")
    
    # Step 5: Verify token is no longer valid
    print("\n5️⃣ Verifying token is no longer valid...")
    reset_data_after = await PasswordResetService.validate_reset_token(token)
    if not reset_data_after:
        print("✅ Token correctly invalidated after use")
    else:
        print("❌ Token still valid after use")
        return False
    
    print("\n🎉 Complete forgot password flow test PASSED!")
    return True

if __name__ == "__main__":
    result = asyncio.run(test_complete_flow())
    sys.exit(0 if result else 1)
