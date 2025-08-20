import secrets
import string
from datetime import datetime, timedelta
from app.core.config import settings
from app.db.mongodb import db
import logging

logger = logging.getLogger(__name__)

class PasswordResetService:
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(32))
    
    @staticmethod
    async def create_reset_token(email: str) -> str:
        """Create and store a password reset token"""
        # Check if user exists
        user = db.users.find_one({"email": email})
        if not user:
            logger.warning(f"Password reset requested for non-existent email: {email}")
            return None
            
        # Generate token
        token = PasswordResetService.generate_reset_token()
        expires_at = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
        
        # Store token in database
        reset_data = {
            "email": email,
            "token": token,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.utcnow()
        }
        
        # Remove any existing tokens for this email
        db.password_reset_tokens.delete_many({"email": email})
        
        # Insert new token
        db.password_reset_tokens.insert_one(reset_data)
        
        logger.info(f"Password reset token created for {email}")
        return token
    
    @staticmethod
    async def validate_reset_token(token: str) -> dict:
        """Validate a password reset token"""
        reset_data = db.password_reset_tokens.find_one({
            "token": token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not reset_data:
            return None
            
        return reset_data
    
    @staticmethod
    async def mark_token_used(token: str):
        """Mark a token as used"""
        db.password_reset_tokens.update_one(
            {"token": token},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
    
    @staticmethod
    async def cleanup_expired_tokens():
        """Remove expired tokens from database"""
        db.password_reset_tokens.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
