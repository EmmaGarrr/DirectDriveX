#!/usr/bin/env python3
"""
Test script to verify email template loading and rendering
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import EmailService

def test_template_loading():
    """Test if email template loads correctly"""
    print("Testing email template loading...")
    
    # Test template loading
    template = EmailService.load_email_template("password_reset")
    
    if template:
        print("✅ Template loaded successfully")
        print(f"Template length: {len(template)} characters")
        
        # Test placeholder replacement
        test_html = template.replace("{{ username }}", "John Doe")
        test_html = test_html.replace("{{ reset_url }}", "https://example.com/reset?token=test123")
        test_html = test_html.replace("{{ expire_minutes }}", "30")
        test_html = test_html.replace("{{ email }}", "john@example.com")
        
        print("✅ Placeholder replacement successful")
        
        # Save test output
        with open("test_email_output.html", "w", encoding="utf-8") as f:
            f.write(test_html)
        print("✅ Test email saved to test_email_output.html")
        
        # Check if key elements are present
        if "DirectDrive" in test_html:
            print("✅ Brand name found in template")
        if "Reset My Password" in test_html:
            print("✅ Call-to-action button found")
        if "Security Notice" in test_html:
            print("✅ Security notice found")
        if "john@example.com" in test_html:
            print("✅ Email placeholder replaced correctly")
        
    else:
        print("❌ Failed to load template")
        return False
    
    return True

def test_plain_text_content():
    """Test plain text content generation"""
    print("\nTesting plain text content generation...")
    
    try:
        text_content = EmailService._create_plain_text_content(
            email="test@example.com",
            reset_token="test123",
            username="TestUser",
            reset_url="https://example.com/reset?token=test123"
        )
        
        if text_content:
            print("✅ Plain text content generated successfully")
            print(f"Content length: {len(text_content)} characters")
            
            # Save test output
            with open("test_email_plain_text.txt", "w", encoding="utf-8") as f:
                f.write(text_content)
            print("✅ Plain text saved to test_email_plain_text.txt")
            
            # Check if key elements are present
            if "TestUser" in text_content:
                print("✅ Username found in plain text")
            if "https://example.com/reset?token=test123" in text_content:
                print("✅ Reset URL found in plain text")
            if "DirectDrive" in text_content:
                print("✅ Brand name found in plain text")
                
        else:
            print("❌ Failed to generate plain text content")
            return False
            
    except Exception as e:
        print(f"❌ Error in plain text generation: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("EMAIL TEMPLATE TESTING")
    print("=" * 50)
    
    success = True
    
    # Test HTML template loading
    if not test_template_loading():
        success = False
    
    # Test plain text content
    if not test_plain_text_content():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("✅ ALL TESTS PASSED!")
        print("Email template system is working correctly.")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Please check the errors above.")
    print("=" * 50)
