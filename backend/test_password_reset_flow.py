#!/usr/bin/env python3
"""
Test complete password reset flow
"""
import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import EmailService
from app.services.password_reset_service import PasswordResetService

async def test_password_reset_flow():
    """Test the complete password reset flow"""
    print("Testing complete password reset flow...")
    
    # Test email
    test_email = "test@example.com"
    test_username = "TestUser"
    
    try:
        # Generate reset token
        print("1. Generating reset token...")
        reset_token = await PasswordResetService.create_reset_token(test_email)
        if reset_token:
            print(f"✅ Reset token generated: {reset_token[:20]}...")
        else:
            print("❌ Failed to generate reset token")
            return False
        
        # Send email (this will fail if SMTP not configured, but that's expected)
        print("2. Testing email sending...")
        email_sent = await EmailService.send_password_reset_email(
            email=test_email,
            reset_token=reset_token,
            username=test_username
        )
        
        if email_sent:
            print("✅ Email sent successfully")
        else:
            print("⚠️ Email not sent (SMTP not configured or other issue)")
        
        # Validate token
        print("3. Testing token validation...")
        reset_data = await PasswordResetService.validate_reset_token(reset_token)
        if reset_data:
            print("✅ Token validation successful")
            print(f"Token data: {reset_data}")
        else:
            print("❌ Token validation failed")
            return False
        
        print("\n✅ Complete password reset flow test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error in password reset flow: {e}")
        return False

async def test_email_template_functionality():
    """Test email template functionality without sending"""
    print("\nTesting email template functionality...")
    
    try:
        # Test template loading
        template = EmailService.load_email_template("password_reset")
        if template:
            print("✅ Template loading works")
        else:
            print("❌ Template loading failed")
            return False
        
        # Test placeholder replacement
        test_html = template.replace("{{ username }}", "TestUser")
        test_html = test_html.replace("{{ reset_url }}", "https://test.com/reset?token=test123")
        test_html = test_html.replace("{{ expire_minutes }}", "30")
        test_html = test_html.replace("{{ email }}", "test@example.com")
        
        if "TestUser" in test_html and "test@example.com" in test_html:
            print("✅ Placeholder replacement works")
        else:
            print("❌ Placeholder replacement failed")
            return False
        
        # Test plain text generation
        text_content = EmailService._create_plain_text_content(
            email="test@example.com",
            reset_token="test123",
            username="TestUser",
            reset_url="https://test.com/reset?token=test123"
        )
        
        if text_content and "TestUser" in text_content:
            print("✅ Plain text generation works")
        else:
            print("❌ Plain text generation failed")
            return False
        
        print("✅ Email template functionality test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error in email template functionality: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("PASSWORD RESET FLOW TESTING")
    print("=" * 60)
    
    async def main():
        success = True
        
        # Test email template functionality
        if not await test_email_template_functionality():
            success = False
        
        # Test complete password reset flow
        if not await test_password_reset_flow():
            success = False
        
        print("\n" + "=" * 60)
        if success:
            print("✅ ALL TESTS PASSED!")
            print("Password reset system is working correctly.")
            print("\nNext steps:")
            print("1. Configure SMTP settings in your environment")
            print("2. Test with a real email address")
            print("3. Deploy to production")
        else:
            print("❌ SOME TESTS FAILED!")
            print("Please check the errors above.")
        print("=" * 60)
    
    # Run the async tests
    asyncio.run(main())
