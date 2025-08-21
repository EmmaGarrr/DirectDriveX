# In file: Backend/app/core/config.py

from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import BaseModel
import os

# A model to hold the configuration for a single Google Drive account
class GoogleAccountConfig(BaseModel):
    id: str
    client_id: str
    client_secret: str
    refresh_token: str
    folder_id: Optional[str] = None

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str
    DATABASE_NAME: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Google Drive account credentials
    GDRIVE_ACCOUNT_1_CLIENT_ID: Optional[str] = None
    GDRIVE_ACCOUNT_1_CLIENT_SECRET: Optional[str] = None
    GDRIVE_ACCOUNT_1_REFRESH_TOKEN: Optional[str] = None
    GDRIVE_ACCOUNT_1_FOLDER_ID: Optional[str] = None

    GDRIVE_ACCOUNT_2_CLIENT_ID: Optional[str] = None
    GDRIVE_ACCOUNT_2_CLIENT_SECRET: Optional[str] = None
    GDRIVE_ACCOUNT_2_REFRESH_TOKEN: Optional[str] = None
    GDRIVE_ACCOUNT_2_FOLDER_ID: Optional[str] = None

    GDRIVE_ACCOUNT_3_CLIENT_ID: Optional[str] = None
    GDRIVE_ACCOUNT_3_CLIENT_SECRET: Optional[str] = None
    GDRIVE_ACCOUNT_3_REFRESH_TOKEN: Optional[str] = None
    GDRIVE_ACCOUNT_3_FOLDER_ID: Optional[str] = None
    
    GDRIVE_ACCOUNTS: List[GoogleAccountConfig] = []

    # --- NEW: Hetzner Storage Box Credentials ---
    HETZNER_WEBDAV_URL: Optional[str] = None
    HETZNER_USERNAME: Optional[str] = None
    HETZNER_PASSWORD: Optional[str] = None

    ADMIN_WEBSOCKET_TOKEN: Optional[str] = None

    # --- NEW: FEATURE FLAGS FOR PARALLEL UPLOAD SYSTEM ---
    ENABLE_PARALLEL_UPLOADS: bool = False  # Disabled by default for safety
    PARALLEL_UPLOAD_CHUNK_SIZE_MB: int = 4  # 4MB chunks - reduced from 16MB to avoid WebSocket message size limits
    PARALLEL_UPLOAD_MAX_CONCURRENT_CHUNKS: int = 8  # Max 8 chunks simultaneously
    PARALLEL_UPLOAD_MAX_CONCURRENT_USERS: int = 20  # Max 20 concurrent users
    
    # --- ENVIRONMENT-BASED MEMORY LIMITS ---
    ENVIRONMENT: str = "development"  # Options: development, staging, production
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT: float = 80.0  # Default memory limit (legacy)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV: float = 95.0  # Development: 95% (more lenient)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING: float = 85.0  # Staging: 85% (moderate)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD: float = 80.0  # Production: 80% (more strict)

    # --- NEW: UPLOAD LIMITS CONFIGURATION ---
    ANONYMOUS_DAILY_LIMIT_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB
    ANONYMOUS_SINGLE_FILE_LIMIT_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB
    AUTHENTICATED_DAILY_LIMIT_BYTES: int = 5 * 1024 * 1024 * 1024  # 5GB
    AUTHENTICATED_SINGLE_FILE_LIMIT_BYTES: int = 5 * 1024 * 1024 * 1024  # 5GB
    ENABLE_UPLOAD_LIMITS: bool = True  # Enable/disable upload limits
    UPLOAD_LIMITS_CACHE_TTL_MINUTES: int = 5  # Cache TTL for quota tracking
    
    # --- NEW: EMAIL CONFIGURATION ---
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    FROM_EMAIL: Optional[str] = None
    FROM_NAME: str = "DirectDrive System"
    
    # --- NEW: PASSWORD RESET CONFIGURATION ---
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:4200"  # For production, use your domain

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = 'ignore'

# Initialize settings from .env
settings = Settings()

# Manually parse and populate the GDRIVE_ACCOUNTS list
for i in range(1, 11):
    client_id = getattr(settings, f'GDRIVE_ACCOUNT_{i}_CLIENT_ID', None)
    client_secret = getattr(settings, f'GDRIVE_ACCOUNT_{i}_CLIENT_SECRET', None)
    refresh_token = getattr(settings, f'GDRIVE_ACCOUNT_{i}_REFRESH_TOKEN', None)
    folder_id = getattr(settings, f'GDRIVE_ACCOUNT_{i}_FOLDER_ID', None)

    if all([client_id, client_secret, refresh_token, folder_id]):
        settings.GDRIVE_ACCOUNTS.append(
            GoogleAccountConfig(
                id=f'account_{i}',
                client_id=client_id,
                client_secret=client_secret,
                refresh_token=refresh_token,
                folder_id=folder_id
            )
        )

if not settings.GDRIVE_ACCOUNTS:
    print("WARNING: No Google Drive accounts configured in .env file. Primary uploads will fail.")