from app.core.config import settings
from app.db.mongodb import db
from app.services.auth_service import create_access_token
from app.models.google_oauth import GoogleUserInfo
from datetime import timedelta, datetime
import httpx
from typing import Optional, Dict, Any

class GoogleOAuthService:
    """Service for handling Google OAuth authentication"""
    
    SCOPES = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ]
    
    @staticmethod
    def get_oauth_url() -> str:
        """Generate Google OAuth URL"""
        scope_string = ' '.join(GoogleOAuthService.SCOPES)
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_OAUTH_CLIENT_ID}&"
            f"redirect_uri={settings.GOOGLE_OAUTH_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope={scope_string}&"
            f"access_type=offline&"
            f"prompt=consent"
        )
    
    @staticmethod
    async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
        """Exchange authorization code for access and refresh tokens"""
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=token_data)
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    async def get_user_info(access_token: str) -> GoogleUserInfo:
        """Get user information from Google"""
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=headers)
            response.raise_for_status()
            user_data = response.json()
            return GoogleUserInfo(**user_data)
    
    @staticmethod
    async def authenticate_or_create_user(google_user_info: GoogleUserInfo) -> Dict[str, Any]:
        """Authenticate existing user or create new user"""
        email = google_user_info.email
        
        # Check if user exists
        user = db.users.find_one({"email": email})
        
        current_time = datetime.utcnow()
        current_time_str = current_time.isoformat()
        
        if user:
            # Update existing user with Google info
            update_data = {
                "google_id": google_user_info.id,
                "name": google_user_info.name or user.get("name", ""),
                "picture": google_user_info.picture or user.get("picture"),
                "is_google_user": True,
                "last_login": current_time_str,
                "verified_email": google_user_info.verified_email or user.get("verified_email", False)
            }
            
            db.users.update_one(
                {"email": email},
                {"$set": update_data}
            )
            
            # Return updated user with all required fields
            user.update(update_data)
            # Ensure required fields are present
            user.setdefault("hashed_password", None)  # Google users don't have passwords
            user.setdefault("role", "regular")
            user.setdefault("is_admin", False)
            user.setdefault("storage_limit_bytes", None)
            return user
        else:
            # Create new user with all required fields
            new_user = {
                "_id": email,
                "email": email,
                "name": google_user_info.name or "",
                "google_id": google_user_info.id,
                "picture": google_user_info.picture,
                "is_google_user": True,
                "verified_email": google_user_info.verified_email or False,
                "created_at": current_time_str,
                "last_login": current_time_str,
                "is_active": True,
                "hashed_password": None,  # Google users don't have passwords
                "role": "regular",
                "is_admin": False,
                "storage_limit_bytes": None
            }
            
            db.users.insert_one(new_user)
            return new_user
    
    @staticmethod
    async def create_auth_token(user: Dict[str, Any]) -> str:
        """Create JWT token for authenticated user"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(
            data={"sub": user["email"]},
            expires_delta=access_token_expires
        )
    
    @staticmethod
    def validate_oauth_config() -> bool:
        """Validate if Google OAuth is properly configured"""
        return bool(
            settings.GOOGLE_OAUTH_CLIENT_ID and 
            settings.GOOGLE_OAUTH_CLIENT_SECRET and
            settings.GOOGLE_OAUTH_REDIRECT_URI
        )
