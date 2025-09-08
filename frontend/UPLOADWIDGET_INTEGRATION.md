# UploadWidget Integration Guide

## Overview
This guide shows how to integrate the real services into the existing UploadWidget component to replace the mock functionality.

## Current State
The UploadWidget currently has mock upload handlers that simulate the upload process. We need to replace these with real service calls.

## Required Changes

### 1. Import Services
```tsx
import { UploadService, QuotaInfo } from '@/services/uploadService';
import { BatchUploadService } from '@/services/batchUploadService';
import { AuthService } from '@/services/authService';
import { QuotaDisplay } from '../ui/QuotaDisplay';
import { Subscription } from '@/lib/observable';
```

### 2. Initialize Services
```tsx
// Initialize services
const uploadService = new UploadService();
const batchUploadService = new BatchUploadService();
const authService = new AuthService();
```

### 3. Add New State Variables
```tsx
// Quota and auth state
const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
const [quotaLoading, setQuotaLoading] = useState(false);
const [isAuthenticated, setIsAuthenticated] = useState(false);

// Subscriptions for cleanup
const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
const [batchSubscriptions, setBatchSubscriptions] = useState<Subscription[]>([]);

// Additional state for real uploads
const [downloadLink, setDownloadLink] = useState<string | null>(null);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [batchDownloadLink, setBatchDownloadLink] = useState<string | null>(null);
```

### 4. Add useEffect Hooks
```tsx
// Load quota info on mount
useEffect(() => {
  const loadQuota = async () => {
    setQuotaLoading(true);
    try {
      const quota = await uploadService.getQuotaInfo();
      setQuotaInfo(quota);
    } catch (error) {
      console.error('Failed to load quota:', error);
    } finally {
      setQuotaLoading(false);
    }
  };
  loadQuota();
}, []);

// Check authentication status
useEffect(() => {
  const checkAuth = () => {
    const auth = authService.isAuthenticated();
    setIsAuthenticated(auth);
  };
  checkAuth();
  
  // Listen for storage changes (login/logout)
  const handleStorageChange = () => checkAuth();
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);

// Cleanup subscriptions on unmount
useEffect(() => {
  return () => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }
    batchSubscriptions.forEach(sub => sub.unsubscribe());
  };
}, [currentSubscription, batchSubscriptions]);
```

### 5. Replace Mock Upload Handlers

#### Replace `handleUpload()` with `handleRealUpload()`
```tsx
const handleRealUpload = () => {
  if (!selectedFile || currentState === 'uploading') return;

  setCurrentState('uploading');
  setUploadProgress(0);
  setIsCancelling(false);
  setErrorMessage(null);

  const subscription = uploadService.upload(selectedFile).subscribe({
    next: (event) => {
      if (event.type === 'progress') {
        setUploadProgress(event.value as number);
      } else if (event.type === 'success') {
        setCurrentState('success');
        const fileId = typeof event.value === 'string' ? event.value.split('/').pop() : event.value;
        setDownloadLink(`${window.location.origin}/download/${fileId}`);
        toast.success('File uploaded successfully!');
        
        // Refresh quota info after successful upload
        const refreshQuota = async () => {
          try {
            const quota = await uploadService.getQuotaInfo();
            setQuotaInfo(quota);
          } catch (error) {
            console.error('Failed to refresh quota:', error);
          }
        };
        refreshQuota();
      }
    },
    error: (err) => {
      if (!isCancelling) {
        setCurrentState('error');
        setErrorMessage(err.message || 'Upload failed');
        toast.error('Upload failed: ' + err.message);
      }
    },
    complete: () => {
      // Upload completed
    }
  });
  
  setCurrentSubscription(subscription);
};
```

#### Replace `handleBatchUpload()` with `handleRealBatchUpload()`
```tsx
const handleRealBatchUpload = async () => {
  if (batchFiles.length === 0 || batchState === 'processing') return;

  setBatchState('processing');
  setBatchDownloadLink(null);

  try {
    const response = await batchUploadService.initiateBatch(
      batchFiles.map(f => ({
        filename: f.file.name,
        size: f.file.size,
        content_type: f.file.type || 'application/octet-stream'
      }))
    );

    // Start uploading each file
    response.files.forEach(fileInfo => {
      const matchingFile = batchFiles.find(bf => bf.file.name === fileInfo.original_filename);
      if (matchingFile) {
        const subscription = batchUploadService.uploadBatchFile(
          fileInfo.file_id,
          fileInfo.gdrive_upload_url,
          matchingFile.file
        ).subscribe({
          next: (event) => {
            if (event.type === 'progress') {
              setBatchFiles(files => files.map(f => 
                f.id === matchingFile.id 
                  ? { ...f, progress: event.value as number, state: 'uploading' } 
                  : f
              ));
            } else if (event.type === 'success') {
              setBatchFiles(files => files.map(f => 
                f.id === matchingFile.id 
                  ? { ...f, state: 'success', progress: 100 } 
                  : f
              ));
              checkBatchCompletion(response.batch_id);
            }
          },
          error: (err) => {
            setBatchFiles(files => files.map(f => 
              f.id === matchingFile.id 
                ? { ...f, state: 'error', error: err.message } 
                : f
            ));
            checkBatchCompletion(response.batch_id);
          }
        });
        
        setBatchSubscriptions(subs => [...subs, subscription]);
      }
    });
    
  } catch (error: any) {
    setBatchState('error');
    toast.error('Batch upload failed to start: ' + (error.message || 'Unknown error'));
  }
};
```

### 6. Add File Validation
```tsx
const validateFileSize = (file: File): boolean => {
  const validation = uploadService.validateFileSize(file.size);
  if (!validation.valid) {
    toast.error(validation.error);
    return false;
  }
  return true;
};

const validateBatchFiles = (files: File[]): boolean => {
  // Check individual file sizes
  for (const file of files) {
    if (!validateFileSize(file)) {
      return false;
    }
  }
  
  // Check total batch size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const limits = isAuthenticated ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
  if (totalSize > limits) {
    const totalSizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    const limitText = isAuthenticated ? '5GB' : '2GB';
    toast.error(`Total file size (${totalSizeGB}GB) exceeds ${limitText} daily limit`);
    return false;
  }
  
  return true;
};
```

### 7. Update File Selection Handler
```tsx
const handleFileSelect = (files: FileList | null) => {
  if (!files || files.length === 0) return;
  
  if (files.length === 1) {
    const file = files[0];
    if (!validateFileSize(file)) return;
    
    setSelectedFile(file);
    setCurrentState('selected');
    setBatchState('idle');
    setBatchFiles([]);
    setDownloadLink(null);
    setErrorMessage(null);
  } else {
    if (files.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files at a time.`);
      return;
    }
    
    const fileArray = Array.from(files);
    if (!validateBatchFiles(fileArray)) return;
    
    setBatchFiles(fileArray.map(file => ({
      id: crypto.randomUUID(),
      file,
      state: 'pending',
      progress: 0,
    })));
    setBatchState('selected');
    setCurrentState('idle');
    setSelectedFile(null);
    setBatchDownloadLink(null);
  }
};
```

### 8. Add Quota Display
```tsx
const renderContent = () => {
  // Show quota display if available
  if (quotaInfo && currentState === 'idle' && batchState === 'idle') {
    return (
      <>
        <QuotaDisplay quotaInfo={quotaInfo} />
        <IdleState />
      </>
    );
  }

  // ... rest of the render logic
};
```

### 9. Update Button Handlers
```tsx
// Replace onClick handlers in buttons
<button onClick={handleRealUpload} className="...">Upload File</button>
<button onClick={handleRealBatchUpload} className="...">Upload {batchFiles.length} Files</button>
```

## Testing the Integration

### 1. Test Services First
Visit `/test-services` to verify all services are working correctly.

### 2. Test File Selection
- Select single files and verify validation
- Select multiple files and verify batch mode
- Test file size limits

### 3. Test Upload Process
- Start single file upload
- Monitor WebSocket connection
- Check progress updates
- Verify completion

### 4. Test Error Handling
- Try uploading oversized files
- Disconnect network during upload
- Test cancellation

## Common Issues

### 1. WebSocket Connection Failed
- Check backend is running
- Verify WebSocket URL in environment
- Check CORS configuration

### 2. API Calls Failing
- Verify API base URL
- Check backend endpoints
- Verify CORS headers

### 3. File Validation Errors
- Check file size limits
- Verify authentication status
- Check quota information

## Next Steps After Integration

1. **Error Handling**: Add comprehensive error handling for network failures
2. **Authentication**: Integrate login/register forms
3. **User Experience**: Add loading states and better feedback
4. **Testing**: Add unit and integration tests
5. **Performance**: Optimize WebSocket handling and file chunking

## Summary

The integration involves:
- Replacing mock handlers with real service calls
- Adding quota display and validation
- Implementing real WebSocket uploads
- Adding proper error handling
- Managing subscriptions and cleanup

All services are ready and follow the exact Angular patterns. The integration should be straightforward and maintain the same user experience while adding real functionality.
