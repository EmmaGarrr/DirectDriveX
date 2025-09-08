from pydantic import BaseModel, Field
from typing import Optional

class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth initiation"""
    pass

class GoogleCallbackRequest(BaseModel):
    """Request model for Google OAuth callback"""
    code: str = Field(..., description="Authorization code from Google")

class GoogleAuthResponse(BaseModel):
    """Response model for Google OAuth"""
    auth_url: str = Field(..., description="Google OAuth URL")

class GoogleCallbackResponse(BaseModel):
    """Response model for Google OAuth callback"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: Optional[dict] = Field(None, description="User information")

class GoogleUserInfo(BaseModel):
    """Model for Google user information"""
    id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    verified_email: Optional[bool] = None
