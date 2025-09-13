#!/usr/bin/env python3
"""
Test Script 3: Configuration Validation
Validates environment-specific configuration loading
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def test_configuration():
    """Test configuration loading and environment-specific settings"""
    print("=== Configuration Validation Test ===")
    
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug mode: {settings.DEBUG}")
    
    # Test upload limits configuration
    print("\n--- Upload Limits Configuration ---")
    print(f"ENABLE_UPLOAD_LIMITS: {getattr(settings, 'ENABLE_UPLOAD_LIMITS', 'NOT_SET')}")
    print(f"ENABLE_UPLOAD_LIMITS_PROD: {getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', 'NOT_SET')}")
    print(f"ENABLE_UPLOAD_LIMITS_DEV: {getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', 'NOT_SET')}")
    print(f"ENABLE_UPLOAD_LIMITS_STAGING: {getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', 'NOT_SET')}")
    
    # Test parallel upload configuration
    print("\n--- Parallel Upload Configuration ---")
    print(f"ENABLE_PARALLEL_UPLOADS: {getattr(settings, 'ENABLE_PARALLEL_UPLOADS', 'NOT_SET')}")
    print(f"PARALLEL_UPLOAD_MAX_CONCURRENT_USERS: {getattr(settings, 'PARALLEL_UPLOAD_MAX_CONCURRENT_USERS', 'NOT_SET')}")
    print(f"PARALLEL_UPLOAD_MAX_CONCURRENT_CHUNKS: {getattr(settings, 'PARALLEL_UPLOAD_MAX_CONCURRENT_CHUNKS', 'NOT_SET')}")
    print(f"PARALLEL_UPLOAD_CHUNK_SIZE_MB: {getattr(settings, 'PARALLEL_UPLOAD_CHUNK_SIZE_MB', 'NOT_SET')}")
    
    # Test memory limits
    print("\n--- Memory Limits Configuration ---")
    print(f"PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD: {getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD', 'NOT_SET')}")
    print(f"PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV: {getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV', 'NOT_SET')}")
    print(f"PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING: {getattr(settings, 'PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING', 'NOT_SET')}")
    
    # Test streaming upload configuration
    print("\n--- Streaming Upload Configuration ---")
    print(f"ENABLE_STREAMING_UPLOADS: {getattr(settings, 'ENABLE_STREAMING_UPLOADS', 'NOT_SET')}")
    print(f"STREAMING_UPLOAD_PERCENTAGE: {getattr(settings, 'STREAMING_UPLOAD_PERCENTAGE', 'NOT_SET')}")
    print(f"STREAMING_CHUNK_SIZE_MB: {getattr(settings, 'STREAMING_CHUNK_SIZE_MB', 'NOT_SET')}")
    
    # Test file size limits
    print("\n--- File Size Limits ---")
    print(f"MAX_FILE_SIZE_INPUT_VALIDATION: {getattr(settings, 'MAX_FILE_SIZE_INPUT_VALIDATION', 'NOT_SET')}")
    print(f"MAX_FILE_SIZE_INPUT_VALIDATION_GB: {getattr(settings, 'MAX_FILE_SIZE_INPUT_VALIDATION_GB', 'NOT_SET')}")
    print(f"ANONYMOUS_DAILY_LIMIT_BYTES: {getattr(settings, 'ANONYMOUS_DAILY_LIMIT_BYTES', 'NOT_SET')}")
    print(f"ANONYMOUS_SINGLE_FILE_LIMIT_BYTES: {getattr(settings, 'ANONYMOUS_SINGLE_FILE_LIMIT_BYTES', 'NOT_SET')}")
    print(f"AUTHENTICATED_DAILY_LIMIT_BYTES: {getattr(settings, 'AUTHENTICATED_DAILY_LIMIT_BYTES', 'NOT_SET')}")
    print(f"AUTHENTICATED_SINGLE_FILE_LIMIT_BYTES: {getattr(settings, 'AUTHENTICATED_SINGLE_FILE_LIMIT_BYTES', 'NOT_SET')}")
    
    # Test CORS configuration
    print("\n--- CORS Configuration ---")
    print(f"ALLOWED_ORIGINS: {getattr(settings, 'ALLOWED_ORIGINS', 'NOT_SET')}")
    print(f"CORS_ALLOW_CREDENTIALS: {getattr(settings, 'CORS_ALLOW_CREDENTIALS', 'NOT_SET')}")
    
    # Calculate what enable_limits should be based on environment
    print("\n--- Environment-Based Logic Test ---")
    environment = getattr(settings, 'ENVIRONMENT', 'development').lower()
    print(f"Current environment: {environment}")
    
    if environment == 'production':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_PROD', False)
    elif environment == 'staging':
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_STAGING', True)
    else:  # development
        enable_limits = getattr(settings, 'ENABLE_UPLOAD_LIMITS_DEV', False)
    
    print(f"Upload limits should be: {enable_limits}")
    
    # Test Google Drive accounts
    print("\n--- Google Drive Accounts ---")
    print(f"Number of GDrive accounts: {len(settings.GDRIVE_ACCOUNTS)}")
    for i, account in enumerate(settings.GDRIVE_ACCOUNTS):
        print(f"  Account {i+1}: {account.id}")
    
    return {
        'environment': environment,
        'upload_limits_enabled': enable_limits,
        'parallel_uploads_enabled': getattr(settings, 'ENABLE_PARALLEL_UPLOADS', False),
        'streaming_uploads_enabled': getattr(settings, 'ENABLE_STREAMING_UPLOADS', False)
    }

if __name__ == "__main__":
    config_result = test_configuration()
    print(f"\nConfiguration Summary: {config_result}")