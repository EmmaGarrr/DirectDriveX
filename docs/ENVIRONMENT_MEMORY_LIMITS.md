# Environment-Based Memory Limits

## Overview

The DirectDriveX application now supports environment-based memory limits that automatically adjust based on the deployment environment. This provides better control over resource usage while maintaining flexibility for different deployment scenarios.

## Memory Limits by Environment

### Development Environment
- **Memory Limit**: 100% of available RAM (no limit)
- **Reserved Memory**: 0GB (use full memory)
- **Use Case**: Local development, testing, debugging
- **Configuration**: `ENVIRONMENT=development`

### Staging Environment
- **Memory Limit**: 85% of available RAM
- **Reserved Memory**: 1.5GB
- **Use Case**: Pre-production testing, QA
- **Configuration**: `ENVIRONMENT=staging`

### Production Environment
- **Memory Limit**: 80% of available RAM
- **Reserved Memory**: 2GB
- **Use Case**: Live production servers
- **Configuration**: `ENVIRONMENT=production`

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Environment Configuration
ENVIRONMENT=development  # Options: development, staging, production

# Memory Limits by Environment (optional - uses defaults if not set)
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV=100.0     # Development: 100% (no limit)
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING=85.0  # Staging: 85%
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD=80.0     # Production: 80%
```

### Default Values

If environment-specific variables are not set, the system uses these defaults:

```python
# Development (default) - No limits
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV = 100.0
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_STAGING = 85.0
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_PROD = 80.0
```

## Usage Examples

### For Local Development
```bash
# .env file
ENVIRONMENT=development
# Result: 100% memory limit, 0GB reserved (use full memory)
```

### For Production Deployment
```bash
# .env file
ENVIRONMENT=production
# Result: 80% memory limit, 2GB reserved
```

### For Staging/Testing
```bash
# .env file
ENVIRONMENT=staging
# Result: 85% memory limit, 1.5GB reserved
```

## Benefits

### ✅ Production Safety
- **80% limit** prevents server crashes
- **2GB reserved** ensures system stability
- **Conservative approach** for live environments

### ✅ Development Flexibility
- **100% limit** allows unlimited testing
- **0GB reserved** uses full available memory
- **No restrictions** for development work

### ✅ Environment-Specific
- **Different limits** for different stages
- **Easy configuration** via environment variable
- **Team-friendly** - each developer can set their own limits

## Monitoring

### Memory Status Endpoint
The system provides detailed memory status information:

```json
{
  "current_usage": {
    "total_gb": 8.0,
    "available_gb": 3.2,
    "used_gb": 4.8,
    "percent": 60.0
  },
  "limits": {
    "environment": "development",
    "max_percent": 95.0,
    "reserved_gb": 0.5,
    "warning_threshold": 85.0
  },
  "allocated": {
    "total_allocated_gb": 1.2,
    "file_count": 3,
    "files": {
      "file_1": 512.0,
      "file_2": 256.0,
      "file_3": 512.0
    }
  }
}
```

### Log Messages
The system logs memory-related events:

```
INFO: MemoryMonitor initialized for development environment with 95.0% max usage, 85.0% warning threshold
WARNING: Memory usage too high: 96.5% (limit: 95.0%)
INFO: Allocated 104857600 bytes for file abc123
INFO: Released 104857600 bytes for file abc123
```

## Migration from Legacy System

### Before (Legacy)
```python
PARALLEL_UPLOAD_MAX_MEMORY_PERCENT = 80.0  # Fixed 80% for all environments
```

### After (Environment-Based)
```python
ENVIRONMENT = "development"  # Automatically sets appropriate limits
# Development: 95%
# Staging: 75%
# Production: 60%
```

## Troubleshooting

### Memory Limit Errors
If you encounter "Memory usage too high" errors:

1. **Check current environment**:
   ```bash
   echo $ENVIRONMENT
   ```

2. **Check memory usage**:
   ```bash
   free -h
   ```

3. **Adjust limits if needed**:
   ```bash
   # For development, you can increase the limit
   PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV=98.0
   ```

### Environment Not Recognized
If the system doesn't recognize your environment:

1. **Check environment variable**:
   ```bash
   echo $ENVIRONMENT
   ```

2. **Default behavior**:
   - If `ENVIRONMENT` is not set, defaults to `development`
   - If `ENVIRONMENT` is invalid, defaults to `development`

## Best Practices

### For Development Teams
- Use `ENVIRONMENT=development` for local work
- Set individual limits if needed: `PARALLEL_UPLOAD_MAX_MEMORY_PERCENT_DEV=98.0`
- Monitor memory usage during testing

### For Production Deployments
- Always use `ENVIRONMENT=production`
- Monitor memory usage regularly
- Set up alerts for high memory usage
- Consider adjusting limits based on server specifications

### For Staging/QA
- Use `ENVIRONMENT=staging` for pre-production testing
- Test with production-like limits
- Validate memory behavior before production deployment
