#!/usr/bin/env python3
"""
Script to create database indexes for password reset functionality
Run this script once after implementing the password reset feature
"""

from app.db.mongodb import db
from datetime import datetime

def create_password_reset_indexes():
    """Create indexes for password reset tokens collection"""
    try:
        # Create indexes for password_reset_tokens collection
        db.password_reset_tokens.create_index("token", unique=True)
        db.password_reset_tokens.create_index("email")
        db.password_reset_tokens.create_index("expires_at")
        
        print("✅ Password reset indexes created successfully")
        
        # Clean up any expired tokens
        from app.services.password_reset_service import PasswordResetService
        import asyncio
        
        async def cleanup():
            await PasswordResetService.cleanup_expired_tokens()
            print("✅ Expired tokens cleaned up")
        
        asyncio.run(cleanup())
        
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")

if __name__ == "__main__":
    create_password_reset_indexes()
