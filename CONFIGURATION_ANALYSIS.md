# Configuration Analysis: Production vs Development

## Critical Configuration Differences

### 1. Upload Limits Configuration

**Development (.env):**
```
ENABLE_UPLOAD_LIMITS=false
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV=100.0
```

**Production (.env.production.live):**
```
ENABLE_UPLOAD_LIMITS=true
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD=80.0
ENABLE_STREAMING_UPLOADS=true
STREAMING_UPLOAD_PERCENTAGE=10
```

### 2. Memory Allocation Strategy


**Development:**
- 100% memory usage allowed (no limit)
- No upload limits enforced
- 16GB local memory available

**Production:**
- 80% memory usage limit (9.6GB of 12GB)
- Upload limits enforced
- Streaming uploads enabled for 10% of users

### 3. CORS Configuration

**Development:**
```
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4200/auth/google/callback
```

**Production:**
```
GOOGLE_OAUTH_REDIRECT_URI=https://www.mfcnextgen.com/auth/google/callback
ALLOWED_ORIGINS=https://mfcnextgen.com,https://www.mfcnextgen.com,https://mfcnextgen.vercel.app
```

## Analysis of Failure Points

### Production Upload Initiation Failure (400 Bad Request)

**Root Cause Analysis:**

1. **Upload Limits Service Activation**: Production has `ENABLE_UPLOAD_LIMITS=true`
2. **Memory Constraints**: 80% memory limit = 9.6GB available
3. **File Size Validation**: 3.38GB file requires ~340MB memory allocation (10% rule)

### Development WebSocket Slot Acquisition Failure

**Root Cause Analysis:**

1. **Slot Acquisition Logic**: Fails at `upload_concurrency_manager.acquire_upload_slot()`
2. **Memory Check**: Even with 100% limit, system may not have sufficient contiguous memory
3. **Concurrency Limits**: Global or user semaphore exhaustion

## Key Hypotheses

### Hypothesis 1: Production Memory Constraints
- Production server has 12GB RAM vs 16GB local
- 80% limit = 9.6GB available vs 16GB local
- System processes consuming memory reduce available allocation

### Hypothesis 2: Upload Limits Service Logic
- Production upload limits service is rejecting files based on daily quotas
- Authentication state differences between environments

### Hypothesis 3: Concurrency Manager Memory Calculation
- Fixed 10% memory allocation for large files
- 3.38GB × 10% = 340MB required per upload
- Multiple concurrent uploads exhausting available memory

## Next Steps for Testing

1. Test upload limits service independently
2. Monitor memory allocation during upload attempts
3. Verify authentication state consistency
4. Test concurrency manager slot acquisition logic