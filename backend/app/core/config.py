# In file: Backend/app/core/config.py

from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import BaseModel, Field
import os
import secrets
import string

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

    # JWT Configuration
    # SECURITY CRITICAL: JWT_SECRET_KEY is used to sign authentication tokens
    # Requirements:
    # - Minimum 32 characters (64+ recommended for production)
    # - Mix of letters, numbers, and symbols
    # - Unique per environment (dev/staging/production should use different secrets)
    # - Never commit real secrets to version control
    # Generate secure secret: python -c "from app.core.config import Settings; Settings.print_secure_secret_example()"
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
    
    # --- NEW: STREAMING UPLOAD FEATURE FLAG ---
    ENABLE_STREAMING_UPLOADS: bool = False  # Disabled by default for safety
    STREAMING_UPLOAD_PERCENTAGE: int = 0  # Percentage of users to use streaming (0-100)
    STREAMING_CHUNK_SIZE_MB: int = 4  # 4MB chunks for streaming uploads
    
    # --- ENVIRONMENT-BASED MEMORY LIMITS ---
    ENVIRONMENT: str = "development"  # Options: development, staging, production
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT: float = 80.0  # Default memory limit (legacy)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV: float = 100.0  # Development: 100% (no limit)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING: float = 85.0  # Staging: 85% (moderate)
    PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD: float = 80.0  # Production: 80% (safe)

    # --- ENVIRONMENT-BASED UPLOAD LIMITS ---
    ENABLE_UPLOAD_LIMITS_DEV: bool = False  # Development: No upload limits
    ENABLE_UPLOAD_LIMITS_STAGING: bool = True  # Staging: Enable upload limits
    ENABLE_UPLOAD_LIMITS_PROD: bool = True  # Production: Enable upload limits
    
    # --- NEW: UPLOAD LIMITS CONFIGURATION ---
    ANONYMOUS_DAILY_LIMIT_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB
    ANONYMOUS_SINGLE_FILE_LIMIT_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB
    AUTHENTICATED_DAILY_LIMIT_BYTES: int = 5 * 1024 * 1024 * 1024  # 5GB
    AUTHENTICATED_SINGLE_FILE_LIMIT_BYTES: int = 5 * 1024 * 1024 * 1024  # 5GB
    ENABLE_UPLOAD_LIMITS: bool = False  # Default (will be overridden by environment)
    UPLOAD_LIMITS_CACHE_TTL_MINUTES: int = 5  # Cache TTL for quota tracking
    
    # --- NEW: SECURITY INPUT VALIDATION CONSTANTS ---
    # These are separate from business logic limits and provide input safety validation
    # Input validation prevents malicious/invalid data before business rules are applied
    MAX_FILE_SIZE_INPUT_VALIDATION: int = 10 * 1024 * 1024 * 1024  # 10GB absolute maximum for input validation
    MIN_FILE_SIZE_INPUT_VALIDATION: int = 1  # 1 byte minimum for input validation
    MAX_FILE_SIZE_INPUT_VALIDATION_GB: int = 10  # 10GB in GB units for error messages
    
    # --- NEW: MONGODB SECURITY CONFIGURATION ---
    # Security validation settings for MongoDB connections
    MONGODB_SECURITY_VALIDATION_ENABLED: bool = Field(
        default=True,
        description="Enable MongoDB connection security validation"
    )
    MONGODB_REQUIRE_AUTH_IN_PRODUCTION: bool = Field(
        default=True,  
        description="Require authentication in production environment"
    )
    MONGODB_REQUIRE_SSL_IN_PRODUCTION: bool = Field(
        default=True,
        description="Require SSL/TLS encryption in production environment"
    )
    MONGODB_LOG_CONNECTION_ATTEMPTS: bool = Field(
        default=True,
        description="Log MongoDB connection attempts with masked credentials"
    )
    
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
    
    # --- NEW: GOOGLE OAUTH CONFIGURATION ---
    GOOGLE_OAUTH_CLIENT_ID: Optional[str] = None
    GOOGLE_OAUTH_CLIENT_SECRET: Optional[str] = None
    GOOGLE_OAUTH_REDIRECT_URI: str = "http://localhost:4200/auth/google/callback"
    
    # --- NEW: CORS CONFIGURATION ---
    # Environment-based CORS origins to prevent security risks in production
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5000,http://localhost:4200",
        description="Comma-separated list of allowed CORS origins"
    )
    
    # Additional CORS settings for granular control
    CORS_ALLOW_CREDENTIALS: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    
    CORS_ALLOW_METHODS: str = Field(
        default="GET,POST,PUT,DELETE,OPTIONS,PATCH",
        description="Comma-separated list of allowed HTTP methods"
    )
    
    CORS_ALLOW_HEADERS: str = Field(
        default="*",
        description="Comma-separated list of allowed headers"
    )
    
    # Debug mode for environment-specific behavior
    DEBUG: bool = Field(
        default=True,
        description="Enable debug mode (allows less strict CORS in development)"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = 'ignore'
    
    def __init__(self, **kwargs):
        """Initialize settings and validate JWT secret security"""
        super().__init__(**kwargs)
        # Validate JWT secret after all settings are loaded
        self._validate_jwt_secret()
    
    def _validate_jwt_secret(self) -> None:
        """
        Validate JWT secret key strength and security
        Raises ValueError if secret is weak or insecure
        """
        if not hasattr(self, 'JWT_SECRET_KEY') or not self.JWT_SECRET_KEY:
            raise ValueError(
                "JWT_SECRET_KEY is required. "
                "Use generate_secure_secret() to create a strong secret."
            )
        
        # Check minimum length requirement
        if len(self.JWT_SECRET_KEY) < 32:
            raise ValueError(
                f"JWT_SECRET_KEY must be at least 32 characters long. "
                f"Current length: {len(self.JWT_SECRET_KEY)}. "
                f"Use generate_secure_secret() to create a strong secret."
            )
        
        # Check against common weak values
        weak_secrets = [
            "secret", "test", "dev", "development", "password", 
            "123456", "jwt_secret", "your_secret_key", "changeme",
            "default", "admin", "root", "demo", "sample", "example",
            "your_jwt_secret_key_here", "your_development_secret_key_here_minimum_32_characters",
            "your_very_long_secret_key_here_minimum_32_characters"
        ]
        
        if self.JWT_SECRET_KEY.lower() in [weak.lower() for weak in weak_secrets]:
            raise ValueError(
                f"JWT_SECRET_KEY '{self.JWT_SECRET_KEY}' is a common weak value. "
                f"Use generate_secure_secret() to create a strong secret."
            )
        
        # Check for patterns that indicate weak secrets
        if self.JWT_SECRET_KEY.isalpha() or self.JWT_SECRET_KEY.isdigit():
            raise ValueError(
                "JWT_SECRET_KEY should contain a mix of letters, numbers, and symbols. "
                "Use generate_secure_secret() to create a strong secret."
            )
        
        # Check for repeating patterns (like "aaaaaa...")
        if len(set(self.JWT_SECRET_KEY)) < len(self.JWT_SECRET_KEY) / 4:
            raise ValueError(
                "JWT_SECRET_KEY appears to have too many repeating characters. "
                "Use generate_secure_secret() to create a strong secret."
            )
    
    @staticmethod
    def generate_secure_secret(length: int = 64) -> str:
        """
        Generate a cryptographically secure JWT secret key
        
        Args:
            length: Length of the secret (minimum 32, default 64)
        
        Returns:
            A secure random string suitable for JWT signing
            
        Example:
            >>> Settings.generate_secure_secret()
            'kJ8$mN2#pL9@qR5%tY7&uI3*oP6^eW1!mX4@nB7%vC9&dF2$gH5#jK8@'
        """
        if length < 32:
            raise ValueError("Secret length must be at least 32 characters")
        
        # Create character set with letters, numbers, and safe symbols
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        
        # Generate cryptographically secure random secret
        return ''.join(secrets.choice(chars) for _ in range(length))

    @staticmethod
    def print_secure_secret_example():
        """
        Print an example of a secure JWT secret for development use
        """
        secure_secret = Settings.generate_secure_secret()
        print("\n" + "="*60)
        print("SECURE JWT SECRET GENERATED:")
        print("="*60)
        print(f"JWT_SECRET_KEY={secure_secret}")
        print("="*60)
        print("Copy this to your .env file")
        print("NEVER use this in production - generate a new one!")
        print("="*60 + "\n")
    
    def validate_and_suggest_fix(self) -> None:
        """
        Validate JWT secret and provide helpful error messages with solutions
        """
        try:
            self._validate_jwt_secret()
            print("✅ JWT Secret validation passed - your secret is secure!")
        except ValueError as e:
            print(f"❌ JWT Secret validation failed: {e}")
            print("\n🔧 To fix this issue:")
            print("1. Generate a new secure secret:")
            print("   python -c \"from app.core.config import Settings; Settings.print_secure_secret_example()\"")
            print("2. Add the generated secret to your .env file")
            print("3. Restart your server")
            raise e
    
    # --- NEW: CORS CONFIGURATION METHODS ---
    
    def get_allowed_origins(self) -> List[str]:
        """
        Parse ALLOWED_ORIGINS string into list and validate origins
        
        Returns:
            List of validated origin URLs
        """
        if not self.ALLOWED_ORIGINS:
            return []
        
        # Split by comma and clean up whitespace
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        
        # Validate origins
        validated_origins = []
        for origin in origins:
            if self.is_valid_origin(origin):
                validated_origins.append(origin)
            else:
                print(f"WARNING: Invalid CORS origin ignored: {origin}")
        
        return validated_origins
    
    def is_valid_origin(self, origin: str) -> bool:
        """
        Validate a CORS origin URL
        
        Args:
            origin: Origin URL to validate
            
        Returns:
            True if origin is valid, False otherwise
        """
        if not origin:
            return False
        
        # Allow wildcard only for development (not recommended for production)
        if origin == "*":
            if not self.DEBUG:
                print("ERROR: Wildcard CORS origin (*) not allowed in production!")
                return False
            else:
                print("WARNING: Wildcard CORS origin (*) should not be used in production!")
                return True
        
        # Basic URL validation
        if not (origin.startswith("http://") or origin.startswith("https://")):
            return False
        
        # Check for incomplete URLs
        if origin in ["http://", "https://", "http:", "https:"]:
            return False
        
        # Additional validation can be added here
        # - Check for valid domain names
        # - Validate port numbers
        # - Check against whitelist patterns
        
        return True
    
    def get_cors_methods(self) -> List[str]:
        """Parse CORS_ALLOW_METHODS into list"""
        if not self.CORS_ALLOW_METHODS:
            return ["GET"]
        return [method.strip() for method in self.CORS_ALLOW_METHODS.split(",") if method.strip()]
    
    def get_cors_headers(self) -> List[str]:
        """Parse CORS_ALLOW_HEADERS into list"""
        if not self.CORS_ALLOW_HEADERS or self.CORS_ALLOW_HEADERS == "*":
            return ["*"]
        return [header.strip() for header in self.CORS_ALLOW_HEADERS.split(",") if header.strip()]

# --- NEW: CORS SECURITY VALIDATION FUNCTIONS ---

def validate_cors_security(settings) -> bool:
    """
    Validate CORS configuration for security issues
    
    Args:
        settings: Settings instance to validate
    
    Returns:
        True if configuration is secure, False if issues found
    """
    origins = settings.get_allowed_origins()
    issues = []
    
    # Check for wildcard in production
    if "*" in origins and not settings.DEBUG:
        issues.append("Wildcard origin (*) used in production")
    
    # Check for localhost in production
    if not settings.DEBUG:
        localhost_origins = [origin for origin in origins if "localhost" in origin or "127.0.0.1" in origin]
        if localhost_origins:
            issues.append(f"Localhost origins in production: {localhost_origins}")
    
    # Check for HTTP origins in production
    if not settings.DEBUG:
        http_origins = [origin for origin in origins if origin.startswith("http://")]
        if http_origins:
            issues.append(f"Insecure HTTP origins in production: {http_origins}")
    
    # Check if no origins are configured
    if not origins:
        issues.append("No CORS origins configured")
    
    # Report issues
    if issues:
        print("CORS Security Issues Detected:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    return True

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