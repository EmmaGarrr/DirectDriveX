# In file: Backend/app/models/file.py

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum
import datetime
import html

# --- MODIFIED: Added Hetzner as a possible storage location ---
class StorageLocation(str, Enum):
    GDRIVE = "gdrive"
    HETZNER = "hetzner"

class UploadStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# --- NEW: A status to track the background backup process ---
class BackupStatus(str, Enum):
    NONE = "none"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class FileMetadataBase(BaseModel):
    filename: str
    original_filename: Optional[str] = None  # Store original filename for reference
    size_bytes: int
    content_type: str
    
    @validator('filename')
    def validate_filename(cls, v):
        """
        Validate filename is safe and sanitized
        """
        if not v:
            raise ValueError("Filename cannot be empty")
        
        if len(v) > 255:
            raise ValueError("Filename too long (maximum 255 characters)")
        
        # Check for path traversal patterns
        dangerous_patterns = ['../', '..\\', '../', '..\\']
        for pattern in dangerous_patterns:
            if pattern in v:
                raise ValueError("Filename contains path traversal patterns")
        
        # Check for dangerous characters that should have been sanitized
        dangerous_chars = '<>:"|?*/\\'
        for char in dangerous_chars:
            if char in v:
                raise ValueError(f"Filename contains unsafe character: {char}")
        
        return v
    
    # --- NEW: XSS-SAFE DISPLAY PROPERTIES ---
    @property
    def safe_filename_for_display(self) -> str:
        """Get filename safely escaped for HTML display"""
        return sanitize_filename_for_display(self.filename)
    
    @property 
    def safe_original_filename_for_display(self) -> Optional[str]:
        """Get original filename safely escaped for HTML display"""
        return sanitize_filename_for_display_optional(self.original_filename)

class FileMetadataCreate(FileMetadataBase):
    id: str = Field(..., alias="_id")
    upload_date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    
    # Primary storage info
    storage_location: Optional[StorageLocation] = None
    status: UploadStatus = UploadStatus.PENDING
    gdrive_id: Optional[str] = None
    gdrive_account_id: Optional[str] = None
    
    # --- NEW: Fields for backup storage ---
    backup_status: BackupStatus = BackupStatus.NONE
    backup_location: Optional[StorageLocation] = None
    hetzner_remote_path: Optional[str] = None
    
    # --- NEW: Fields for upload limits tracking ---
    owner_id: Optional[str] = None
    ip_address: Optional[str] = None  # Track upload IP for anonymous users
    is_anonymous: bool = False  # Flag for anonymous uploads
    daily_quota_used: int = 0  # Track quota usage for this upload
    
    batch_id: Optional[str] = None

class FileMetadataInDB(FileMetadataBase):
    id: str = Field(..., alias="_id")
    upload_date: datetime.datetime

    # Primary storage info
    storage_location: Optional[StorageLocation] = None
    status: UploadStatus
    gdrive_id: Optional[str] = None
    gdrive_account_id: Optional[str] = None

    # --- NEW: Fields for backup storage ---
    backup_status: BackupStatus
    backup_location: Optional[StorageLocation] = None
    hetzner_remote_path: Optional[str] = None

    # --- NEW: Fields for upload limits tracking ---
    owner_id: Optional[str] = None
    ip_address: Optional[str] = None  # Track upload IP for anonymous users
    is_anonymous: bool = False  # Flag for anonymous uploads
    daily_quota_used: int = 0  # Track quota usage for this upload

    batch_id: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class InitiateUploadRequest(BaseModel):
    filename: str
    size: int = Field(
        ..., 
        gt=0,  # Must be greater than 0
        le=10*1024*1024*1024,  # Must be less than or equal to 10GB
        description="File size in bytes (1B to 10GB maximum)"
    )
    content_type: str
    
    @validator('size')
    def validate_file_size(cls, v):
        """
        Validate file size for security input validation
        This is separate from business logic limits (2GB/5GB) and provides input safety
        """
        if v <= 0:
            raise ValueError('File size must be greater than 0 bytes')
        if v > 10 * 1024 * 1024 * 1024:  # 10GB
            raise ValueError('File size exceeds maximum allowed limit of 10GB')
        return v

# --- NEW: XSS PREVENTION FUNCTIONS ---
def sanitize_filename_for_display(filename: str) -> str:
    """
    Sanitize filename for safe HTML display by escaping dangerous characters.
    
    This function converts potentially dangerous HTML/JavaScript characters into
    safe HTML entities that browsers will display as text instead of executing.
    
    Args:
        filename: Original filename that may contain HTML/JavaScript
        
    Returns:
        str: Safe filename with HTML characters escaped for display
        
    Examples:
        >>> sanitize_filename_for_display("doc<script>alert('xss')</script>.pdf")
        "doc&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;.pdf"
        
        >>> sanitize_filename_for_display("image<img src=x onerror=alert(1)>.jpg")
        "image&lt;img src=x onerror=alert(1)&gt;.jpg"
    """
    if not filename:
        return ""
    
    # Use Python's built-in html.escape() for comprehensive HTML escaping
    # quote=True ensures both single and double quotes are escaped
    safe_filename = html.escape(filename, quote=True)
    
    return safe_filename

def sanitize_filename_for_display_optional(filename: Optional[str]) -> Optional[str]:
    """
    Sanitize optional filename for safe HTML display.
    
    Args:
        filename: Optional filename that may be None
        
    Returns:
        Optional[str]: Safe filename or None if input was None
    """
    if filename is None:
        return None
    return sanitize_filename_for_display(filename)