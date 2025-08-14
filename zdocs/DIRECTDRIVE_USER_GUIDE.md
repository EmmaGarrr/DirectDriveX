# DirectDrive System Documentation

This document provides detailed information about DirectDrive's user limits, authentication benefits, rate limiting mechanisms, and error handling strategies.

## User Limits & Benefits

### Anonymous Users

#### Storage Limits
- **Maximum Single File Size**: 2GB per file
- **Maximum Total Storage**: 2GB per 24 hours (IP-based tracking)
- **Storage Period**: Files stored for 7 days by default
- **Batch Upload Size**: Cannot exceed 2GB total

#### Usage Limitations
- **Concurrent Uploads**: Maximum 3 concurrent uploads per IP address
- **Download Options**: Only individual file downloads (no batch ZIP downloads)
- **Rate Limiting**: Strict IP-based limits with no differentiation between users
- **Backup Storage**: No redundant storage on backup systems

#### Rate Limits
- **Daily Upload Quota**: 2GB per IP address per 24 hours
- **IP Tracking**: All uploads from the same IP are counted together
- **Reset Period**: Limits reset after 24 hours from first upload
- **Throttling**: After reaching 90% of quota, uploads are rejected

### Authenticated Users

#### Storage Benefits
- **Maximum Storage**: 10GB total storage allocation
- **Maximum File Size**: 5GB per file (increased from 2GB for anonymous users)
- **Storage Period**: Files stored for 30 days
- **Batch Upload Size**: Up to 10GB per batch (limited by total storage quota)

#### Account Features
- **Concurrent Uploads**: Maximum 5 concurrent uploads (vs. 3 for anonymous)
- **Batch Downloads**: ZIP download capability for multiple files
- **User Dashboard**: Storage usage tracking and file management
- **Password Management**: Change password functionality
- **Persistent History**: Complete upload/download history

#### Rate Limits
- **Daily Upload Quota**: 10GB per user per 24 hours (user-based, not IP-based)
- **User Tracking**: Based on user account rather than IP address
- **Reset Period**: Limits reset after 24 hours from first upload
- **Quota Display**: Visual storage usage indicators in user dashboard

## Rate Limiting Architecture

### Implementation Details

#### IP-Based Rate Limiting (Anonymous)
- **Daily Limit**: 2GB per IP per 24 hours
- **Implementation**: `UploadRateLimiter.check_rate_limit()` in `rate_limiter.py`
- **Data Structure**: In-memory dictionary tracking upload counts and timestamps
- **Key Metrics**:
  - Total bytes uploaded per IP
  - First upload timestamp (for 24-hour reset)
  - Current active upload count per IP
- **Reset Logic**: After 24 hours from first upload, counters are reset

#### User-Based Rate Limiting (Authenticated)
- **Daily Limit**: 10GB per user per 24 hours
- **Implementation**: `UploadRateLimiter.check_authenticated_rate_limit()` in `rate_limiter.py`
- **Data Structure**: Same in-memory tracking but keyed by email instead of IP
- **Additional Checks**:
  - User's permanent storage quota (`check_user_storage_quota()`)
  - Current storage usage from database
  - Total requested upload size against remaining quota

### Concurrent Usage Limits

#### Upload Concurrency
- **Anonymous Users**: Maximum 3 concurrent uploads
- **Authenticated Users**: Maximum 5 concurrent uploads
- **Global Limit**: Maximum 20 concurrent uploads across all users
- **Implementation**: Semaphore in `main.py` with `upload_semaphore = asyncio.Semaphore(20)`

#### Download Concurrency
- **Global Limit**: Maximum 30 concurrent downloads
- **Implementation**: Semaphore in `main.py` with `download_semaphore = asyncio.Semaphore(30)`

#### ZIP Processing Concurrency
- **Global Limit**: Maximum 2 concurrent ZIP operations (memory intensive)
- **Implementation**: Semaphore for ZIP creation to prevent memory exhaustion on 4GB RAM server

### Rate Limit Enforcement
- **Pre-Upload Check**: Size and quota verified before accepting upload
- **WebSocket Connection**: Established only after rate limit passes
- **Database Tracking**: User storage usage updated after successful uploads
- **Resource Release**: Failed or cancelled uploads release their quota allocation

## Error Handling

### Backend Error Handling

#### HTTP Request Errors
- **Authentication Errors**: 401 Unauthorized with WWW-Authenticate header
- **Rate Limiting**: 429 Too Many Requests with detailed message
- **Storage Quota**: 400 Bad Request with remaining storage information
- **File Size**: 400 Bad Request for oversized files
- **Invalid Requests**: Request filtering middleware blocks malicious requests

#### Upload Error Handling
- **Connection Issues**: WebSocket disconnections detected and marked as errors
- **Cancellation**: Dedicated `/api/v1/upload/cancel/{file_id}` endpoint
- **Cleanup Process**: 
  - Database status updated to "cancelled", "error", or "success"
  - Resource cleanup for failed uploads
  - Semaphore release for all upload completion states

#### Database Errors
- **MongoDB Connection**: Automatic reconnection with exponential backoff
- **Document Validation**: Pydantic validation for all database models
- **Error Logging**: Structured logging with context for debugging

### Frontend Error Handling

#### Upload Errors
- **Pre-Upload Validation**:
  - File size checks before initiating upload
  - MIME type validation
  - Available storage checks
- **Progress Tracking**: Real-time WebSocket progress monitoring
- **Error States**: Visual indicators for upload states (pending, uploading, success, error, cancelled)
- **User Feedback**: Snackbar notifications for all error conditions

#### Authentication Errors
- **Token Expiration**: Automatic logout on 401 responses
- **Form Validation**: Client-side validation for registration and login
- **Password Change**: Secure password change with current password verification

#### UI Error Handling
- **Loading States**: Loading indicators for async operations
- **Error Messages**: User-friendly error displays with technical details hidden
- **Retry Logic**: Automatic retry for transient errors
- **Graceful Degradation**: Fallback UI when features are unavailable

### Error Logging System

#### Backend Logging
- **Log Categories**:
  - Upload/download activity logs
  - Authentication logs
  - Rate limiting logs
  - Error and exception logs
- **Context Data**: User ID, file ID, IP address, and operation details
- **Severity Levels**: DEBUG, INFO, WARNING, ERROR based on impact

#### Frontend Logging
- **Console Logging**: Development-time diagnostic information
- **Error Reporting**: Critical errors reported to backend
- **Performance Metrics**: Upload/download timing statistics
- **User Actions**: Key user operations logged for troubleshooting

## Integration Points

### Authentication Flow
- JWT tokens with 24-hour expiration
- Token storage in localStorage
- Automatic profile loading on successful authentication
- User storage quota enforcement based on authentication status

### Upload Process
- Rate limiting applied before accepting uploads
- WebSocket communication for binary data transfer
- HTTP used for control operations (cancel, status)
- Progress tracking and completion notification

### Download Process
- Authentication check for ZIP downloads
- Memory-efficient streaming ZIP generation
- Concurrent download limiting

This documentation provides a comprehensive overview of DirectDrive's user limits, authentication benefits, rate limiting mechanisms, and error handling strategies. For implementation details, refer to the source code in the respective components.
