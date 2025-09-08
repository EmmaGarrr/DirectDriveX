from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    REGULAR = "regular"
    ADMIN = "admin" 
    SUPERADMIN = "superadmin"

class UserBase(BaseModel):
    email: EmailStr
    role: Optional[UserRole] = None  # Let database value take precedence
    is_admin: Optional[bool] = None  # Let database value take precedence  
    storage_limit_bytes: Optional[int] = None  # Will be set dynamically

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    hashed_password: Optional[str] = None  # Optional for Google OAuth users
    google_id: Optional[str] = None  # Google user ID for OAuth users
    name: Optional[str] = None  # User's full name
    picture: Optional[str] = None  # Profile picture URL
    is_google_user: Optional[bool] = False  # Flag indicating Google OAuth user
    verified_email: Optional[bool] = False  # Email verification status
    created_at: Optional[str] = None  # Account creation timestamp
    last_login: Optional[str] = None  # Last login timestamp
    is_active: Optional[bool] = True  # Account status

    class Config:
        populate_by_name = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class FileTypeBreakdown(BaseModel):
    documents: int = 0  # bytes
    images: int = 0     # bytes  
    videos: int = 0     # bytes
    other: int = 0      # bytes

class UserProfileResponse(UserBase):
    id: str = Field(..., alias="_id")
    storage_used_bytes: int = 0
    storage_used_gb: float = 0.0
    storage_limit_gb: Optional[float] = None  # Optional for unlimited
    storage_percentage: Optional[float] = None  # Optional for unlimited
    remaining_storage_bytes: Optional[int] = None  # Optional for unlimited
    remaining_storage_gb: Optional[float] = None  # Optional for unlimited
    file_type_breakdown: FileTypeBreakdown = Field(default_factory=FileTypeBreakdown)
    total_files: int = 0
    is_google_user: Optional[bool] = False  # Flag indicating Google OAuth user
    has_password: Optional[bool] = False    # Flag indicating if user has a password
    
    class Config:
        populate_by_name = True
        from_attributes = True

# --- NEW: PASSWORD RESET MODELS ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    reset_token: str = Field(..., min_length=32, max_length=32)
    new_password: str = Field(..., min_length=8)

class PasswordResetResponse(BaseModel):
    message: str
    email: str