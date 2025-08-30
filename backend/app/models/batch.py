# File: Backend/app/models/batch.py

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum
import datetime

class BatchStatus(str, Enum):
    """Batch upload status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BatchMetadata(BaseModel):
    """
    Represents a batch of files. The _id will be our unique batch_id.
    """
    id: str = Field(..., alias="_id")
    file_ids: List[str] = Field(default_factory=list)
    creation_date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    owner_id: Optional[str] = None
    status: BatchStatus = BatchStatus.PENDING
    cancelled_at: Optional[datetime.datetime] = None
    cancelled_files_count: Optional[int] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class InitiateBatchRequest(BaseModel):
    """
    Defines the structure for a request from the frontend to initiate a batch upload.
    It contains a list of all files to be uploaded.
    """
    class FileInfo(BaseModel):
        filename: str
        original_filename: Optional[str] = None  # Store original filename for reference
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
    
    files: List[FileInfo]

class InitiateBatchResponse(BaseModel):
    """
    Defines the structure of the response the backend sends after initiating a batch.
    """
    class FileUploadInfo(BaseModel):
        file_id: str
        gdrive_upload_url: str
        # We also return the original filename to help the frontend match them up.
        original_filename: str

    batch_id: str
    files: List[FileUploadInfo]