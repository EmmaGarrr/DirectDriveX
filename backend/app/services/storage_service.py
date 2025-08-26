from typing import Dict, Optional
from app.db.mongodb import db
from app.models.user import FileTypeBreakdown, UserProfileResponse
import re

class StorageService:
    
    @staticmethod
    def get_file_type_from_filename(filename: str) -> str:
        """Categorize file type based on filename extension"""
        # Get file extension (convert to lowercase)
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        # Document types
        document_extensions = {
            'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages',
            'xls', 'xlsx', 'csv', 'ods', 'numbers',
            'ppt', 'pptx', 'odp', 'key'
        }
        
        # Image types  
        image_extensions = {
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
            'tiff', 'tif', 'ico', 'heic', 'raw', 'cr2', 'nef'
        }
        
        # Video types
        video_extensions = {
            'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm',
            'm4v', '3gp', 'ogv', 'f4v', 'asf', 'rm', 'rmvb'
        }
        
        if extension in document_extensions:
            return 'documents'
        elif extension in image_extensions:
            return 'images'
        elif extension in video_extensions:
            return 'videos'
        else:
            return 'other'
    
    @staticmethod
    def calculate_user_storage(user_id: str) -> Dict:
        """Calculate comprehensive storage usage for a user"""
        
        # Check if files collection exists
        if "files" not in db.list_collection_names():
            return {
                "total_storage_used": 0,
                "total_files": 0,
                "file_type_breakdown": FileTypeBreakdown()
            }
        
        # Aggregate to get file count and total storage
        basic_pipeline = [
            {"$match": {"owner_id": user_id}},
            {"$group": {
                "_id": None,
                "total_size": {"$sum": "$size_bytes"},
                "total_files": {"$sum": 1}
            }}
        ]
        
        basic_result = list(db.files.aggregate(basic_pipeline))
        total_storage_used = basic_result[0]["total_size"] if basic_result else 0
        total_files = basic_result[0]["total_files"] if basic_result else 0
        
        # Get file type breakdown
        files_for_breakdown = db.files.find(
            {"owner_id": user_id}, 
            {"filename": 1, "size_bytes": 1}
        )
        
        breakdown = FileTypeBreakdown()
        for file_doc in files_for_breakdown:
            file_type = StorageService.get_file_type_from_filename(file_doc["filename"])
            current_value = getattr(breakdown, file_type)
            setattr(breakdown, file_type, current_value + file_doc["size_bytes"])
        
        return {
            "total_storage_used": total_storage_used,
            "total_files": total_files,
            "file_type_breakdown": breakdown
        }
    
    @staticmethod
    def build_user_profile_response(user_doc: Dict, storage_data: Optional[Dict] = None) -> UserProfileResponse:
        """Build a complete user profile response with storage data"""
        
        if storage_data is None:
            storage_data = StorageService.calculate_user_storage(user_doc["_id"])
        
        # Remove storage limits - set to None for unlimited
        storage_limit_bytes = None  # Unlimited storage for all users
                
        storage_used_bytes = storage_data["total_storage_used"]
        
        # Calculate only used storage (no limits)
        storage_used_gb = round(storage_used_bytes / (1024**3), 2)
        storage_limit_gb = None  # No limit
        remaining_storage_bytes = None  # No remaining calculation
        remaining_storage_gb = None  # No remaining calculation
        
        # Calculate percentage (avoid division by zero)
        storage_percentage = None  # No percentage calculation
        
        # Add authentication info
        is_google_user = user_doc.get("is_google_user", False)
        has_password = user_doc.get("hashed_password") is not None
        
        return UserProfileResponse(
            _id=user_doc["_id"],
            email=user_doc["email"],
            role=user_doc.get("role", "regular"),
            is_admin=user_doc.get("is_admin", False),
            storage_limit_bytes=storage_limit_bytes,
            storage_used_bytes=storage_used_bytes,
            storage_used_gb=storage_used_gb,
            storage_limit_gb=storage_limit_gb,
            storage_percentage=storage_percentage,
            remaining_storage_bytes=remaining_storage_bytes,
            remaining_storage_gb=remaining_storage_gb,
            file_type_breakdown=storage_data["file_type_breakdown"],
            total_files=storage_data["total_files"],
            is_google_user=is_google_user,
            has_password=has_password
        )