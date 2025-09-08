# Upload Limits Implementation Documentation

## Overview

This document describes the implementation of file upload limits for DirectDriveX, providing different limits for anonymous and authenticated users with IP-based tracking for anonymous users.

## Features Implemented

### 1. User Type Detection
- **Anonymous Users**: Users without authentication tokens
- **Authenticated Users**: Users with valid JWT tokens

### 2. File Size Limits
- **Anonymous Users**: 2GB per file, 2GB daily limit
- **Authenticated Users**: 5GB per file, 5GB daily limit

### 3. IP-Based Tracking
- Anonymous users are tracked by IP address
- Authenticated users are tracked by user ID
- Daily limits reset at midnight UTC

### 4. Real-time Validation
- Client-side validation before upload initiation
- Server-side validation during upload process
- Real-time quota information display

## Architecture

### Backend Components

#### 1. Upload Limits Service (`backend/app/services/upload_limits_service.py`)
```python
class UploadLimitsService:
    # Core functionality for quota tracking and validation
    - check_upload_limits()
    - get_daily_usage()
    - record_upload()
    - get_quota_info()
```

#### 2. Updated File Models (`backend/app/models/file.py`)
```python
# New fields added:
- ip_address: str  # Track upload IP for anonymous users
- is_anonymous: bool  # Flag for anonymous uploads
- daily_quota_used: int  # Track quota usage for this upload
```

#### 3. Updated Upload Routes
- **Single Upload**: `backend/app/api/v1/routes_upload.py`
- **Batch Upload**: `backend/app/api/v1/routes_batch_upload.py`

#### 4. Configuration (`backend/app/core/config.py`)
```python
# New configuration options:
ANONYMOUS_DAILY_LIMIT_BYTES = 2 * 1024 * 1024 * 1024  # 2GB
AUTHENTICATED_DAILY_LIMIT_BYTES = 5 * 1024 * 1024 * 1024  # 5GB
ENABLE_UPLOAD_LIMITS = True
```

### Frontend Components

#### 1. Upload Service (`frontend/src/app/shared/services/upload.service.ts`)
```typescript
// New methods:
- validateFileSize()
- getQuotaInfo()
- isAuthenticated()
```

#### 2. Home Component (`frontend/src/app/componet/home/home.component.ts`)
```typescript
// New functionality:
- Authentication status detection
- File size validation
- Quota information display
- Real-time quota updates
```

#### 3. Updated UI (`frontend/src/app/componet/home/home.component.html`)
- Quota progress bar
- User type indicators
- Upload limit information
- Authentication prompts

## Database Schema Changes

### File Collection Updates
```javascript
// New fields in files collection:
{
  "_id": "file_id",
  "filename": "example.txt",
  "size_bytes": 1048576,
  "owner_id": "user_id_or_null",
  "ip_address": "192.168.1.1",        // NEW
  "is_anonymous": false,              // NEW
  "daily_quota_used": 1048576,        // NEW
  "upload_date": "2024-01-01T00:00:00Z",
  "status": "completed"
}
```

### Database Indexes
```javascript
// Performance indexes created:
- daily_quota_authenticated: {owner_id: 1, upload_date: 1, status: 1}
- daily_quota_anonymous: {ip_address: 1, owner_id: 1, upload_date: 1, status: 1}
- file_size: {size_bytes: 1}
- anonymous_users: {is_anonymous: 1}
```

## API Endpoints

### 1. Quota Information
```http
GET /api/v1/upload/quota-info
Authorization: Bearer <token> (optional)

Response:
{
  "daily_limit_bytes": 5368709120,
  "daily_limit_gb": 5,
  "current_usage_bytes": 1073741824,
  "current_usage_gb": 1,
  "remaining_bytes": 4294967296,
  "remaining_gb": 4,
  "usage_percentage": 20.0,
  "user_type": "authenticated"
}
```

### 2. Upload Initiation (Updated)
```http
POST /api/v1/upload/initiate
Content-Type: application/json

Request:
{
  "filename": "example.txt",
  "size": 1048576,
  "content_type": "text/plain"
}

Response (Success):
{
  "file_id": "uuid",
  "gdrive_upload_url": "https://..."
}

Response (Limit Exceeded):
{
  "detail": "Daily 5GB limit exceeded for authenticated users. Used: 4GB, Requested: 2GB, Remaining: 1GB"
}
```

## Configuration

### Environment Variables
```bash
# Upload Limits Configuration
ENABLE_UPLOAD_LIMITS=true
ANONYMOUS_DAILY_LIMIT_BYTES=2147483648      # 2GB
ANONYMOUS_SINGLE_FILE_LIMIT_BYTES=2147483648 # 2GB
AUTHENTICATED_DAILY_LIMIT_BYTES=5368709120   # 5GB
AUTHENTICATED_SINGLE_FILE_LIMIT_BYTES=5368709120 # 5GB
UPLOAD_LIMITS_CACHE_TTL_MINUTES=5
```

## Installation & Setup

### 1. Database Migration
```bash
cd backend
python migrate_upload_limits.py
```

### 2. Environment Configuration
```bash
# Copy template and update values
cp env.upload_limits.template .env
# Edit .env with your configuration
```

### 3. Restart Services
```bash
# Restart backend
docker-compose restart backend

# Restart frontend (if needed)
docker-compose restart frontend
```

## Usage Examples

### Anonymous User Upload
1. User visits site without logging in
2. UI shows "Anonymous User - 2GB limit"
3. User selects file > 2GB
4. System shows error: "File size exceeds 2GB limit for anonymous users"
5. User selects file < 2GB
6. Upload proceeds normally
7. Daily quota tracked by IP address

### Authenticated User Upload
1. User logs in with valid token
2. UI shows "Authenticated User - 5GB limit"
3. User can upload files up to 5GB
4. Daily quota tracked by user ID
5. Quota resets at midnight UTC

### Batch Upload Limits
1. User selects multiple files
2. System validates total size against daily limit
3. If total exceeds limit, shows error with breakdown
4. If within limit, batch upload proceeds

## Monitoring & Analytics

### Admin Panel Integration
- Quota usage tracking in admin dashboard
- IP-based anonymous user monitoring
- Daily upload statistics
- Limit violation alerts

### Logging
```python
# Log entries for quota tracking:
logger.info(f"Recorded upload: user_id={user_id}, ip={ip_address}, size={sum(file_sizes)} bytes")
logger.error(f"Upload limit exceeded: {error_message}")
```

## Performance Considerations

### Caching Strategy
- In-memory cache for quota calculations
- 5-minute TTL for cache entries
- Reduces database queries for frequent uploads

### Database Optimization
- Composite indexes for quota queries
- Efficient aggregation pipelines
- Batch processing for large datasets

### Scalability
- Horizontal scaling support
- Redis cache integration ready
- Load balancer compatible

## Security Features

### IP Address Handling
- Secure IP extraction from request headers
- Support for proxy/load balancer scenarios
- IPv4 and IPv6 support

### Rate Limiting
- Built-in protection against abuse
- Configurable limits per user type
- Automatic daily reset

### Data Privacy
- IP addresses stored for quota tracking only
- No personal data collection for anonymous users
- GDPR compliant implementation

## Testing

### Unit Tests
```python
# Test upload limits service
def test_anonymous_user_limits():
    # Test 2GB limit for anonymous users

def test_authenticated_user_limits():
    # Test 5GB limit for authenticated users

def test_daily_quota_tracking():
    # Test daily quota calculation and reset
```

### Integration Tests
```python
# Test complete upload flow
def test_upload_with_limits():
    # Test end-to-end upload with limit validation

def test_batch_upload_limits():
    # Test batch upload with size validation
```

### Frontend Tests
```typescript
// Test client-side validation
describe('Upload Limits', () => {
  it('should validate file size for anonymous users');
  it('should validate file size for authenticated users');
  it('should display quota information');
});
```

## Troubleshooting

### Common Issues

#### 1. Migration Errors
```bash
# Check database connection
python -c "from app.db.mongodb import db; print(db.list_collection_names())"

# Verify indexes
python -c "from app.db.mongodb import db; print(db.files.index_information())"
```

#### 2. Configuration Issues
```bash
# Check environment variables
python -c "from app.core.config import settings; print(settings.ENABLE_UPLOAD_LIMITS)"

# Verify limits
python -c "from app.core.config import settings; print(f'Anonymous: {settings.ANONYMOUS_DAILY_LIMIT_BYTES}')"
```

#### 3. Performance Issues
```bash
# Monitor cache performance
# Check database query performance
# Verify index usage
```

### Debug Mode
```python
# Enable debug logging
import logging
logging.getLogger('app.services.upload_limits_service').setLevel(logging.DEBUG)
```

## Future Enhancements

### Planned Features
1. **Time-based Limits**: Hourly/weekly limits
2. **Geographic Limits**: Country-based restrictions
3. **Premium Tiers**: Higher limits for premium users
4. **Bandwidth Limits**: Upload speed restrictions
5. **File Type Limits**: Restrictions by file type

### Scalability Improvements
1. **Redis Integration**: Distributed caching
2. **Microservice Architecture**: Separate quota service
3. **Real-time Analytics**: Live quota monitoring
4. **Machine Learning**: Predictive quota management

## Support

For issues or questions regarding the upload limits implementation:

1. Check the troubleshooting section
2. Review the configuration guide
3. Examine the logs for error messages
4. Contact the development team

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of upload limits
- Anonymous user IP tracking
- Authenticated user quota management
- Real-time validation and UI updates
- Database migration and indexing
- Comprehensive documentation
