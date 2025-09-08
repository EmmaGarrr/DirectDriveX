"use client";

import { BatchUploadState, FileState, UploadState } from '@/types/upload';
import { Check, CheckCircle2, Clipboard, CloudUpload, File as FileIconLucide, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from "sonner";
import { getFileTypeInfo } from '../ui/FileIcon';
import { cn } from '@/lib/utils';
import { UploadService } from '@/services/uploadService';
import { BatchUploadService } from '@/services/batchUploadService';
import { AuthService } from '@/services/authService';
import { Subscription } from '@/lib/observable';

const MAX_FILES = 5;

// Initialize services
const uploadService = new UploadService();
const batchUploadService = new BatchUploadService();
const authService = new AuthService();

export function UploadWidget() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single file state
  const [currentState, setCurrentState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch file state
  const [batchState, setBatchState] = useState<BatchUploadState>('idle');
  const [batchFiles, setBatchFiles] = useState<FileState[]>([]);
  const [batchDownloadLink, setBatchDownloadLink] = useState<string | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Subscriptions for cleanup
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [batchSubscriptions, setBatchSubscriptions] = useState<Subscription[]>([]);

  // No quota loading

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

  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setCurrentState('idle');
    setDownloadLink(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeBatchFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = batchFiles.filter(f => f.id !== id);
    if (newFiles.length === 0) {
      setBatchState('idle');
    } else if (newFiles.length === 1) {
      const remainingFile = newFiles[0].file;
      if (validateFileSize(remainingFile)) {
        setSelectedFile(remainingFile);
      setCurrentState('selected');
      setBatchState('idle');
      setBatchFiles([]);
      }
      return;
    }
    setBatchFiles(newFiles);
  };

  const resetAll = () => {
    setCurrentState('idle');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsCancelling(false);
    setDownloadLink(null);
    setErrorMessage(null);
    setBatchState('idle');
    setBatchFiles([]);
    setBatchDownloadLink(null);
    setCompletionToastShown(false); // Reset the toast shown flag
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real upload implementation
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
  
  // Real batch upload implementation
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
            },
            complete: () => {
              // Batch file upload completed
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

  // Track if batch completion toast has been shown
  const [completionToastShown, setCompletionToastShown] = useState(false);

  const checkBatchCompletion = (batchId: string) => {
    // Use the latest batchFiles state by calling it within a setState callback
    setBatchFiles(currentFiles => {
      const allCompleted = currentFiles.every(f => f.state === 'success' || f.state === 'error');
      
      if (allCompleted && !completionToastShown) {
        // Only when all files are complete, set the batch state to success
        console.log('All files completed, setting batch state to success');
        setBatchState('success');
        setBatchDownloadLink(`${window.location.origin}/batch-download/${batchId}`);
        
        // Only show toast if it hasn't been shown already
        toast.success('All files uploaded successfully!');
        setCompletionToastShown(true);
      } else if (!allCompleted) {
        console.log('Not all files completed yet, current states:', 
          currentFiles.map(f => ({ name: f.file.name, state: f.state })));
      }
      
      // Return the files unchanged, we're just checking state here
      return currentFiles;
    });
  };

  // Cancel upload implementation
  const handleCancel = () => {
    setIsCancelling(true);
    toast.info('Cancelling upload...');
    
    setTimeout(() => {
      const cancelled = uploadService.cancelUpload();
      if (cancelled) {
      setCurrentState('cancelled');
        toast.success('Upload cancelled successfully');
        setTimeout(() => resetAll(), 1000);
      } else {
        toast.info('Upload cancelled');
        resetAll();
      }
    }, 300);
  };

  // Cancel batch upload
  const handleBatchCancel = () => {
    setIsCancelling(true);
    toast.info('Cancelling all uploads...');
    
    setTimeout(() => {
      // Cancel all uploading files
      setBatchFiles(files => files.map(f => {
        if (f.state === 'uploading' || f.state === 'pending') {
          return { ...f, state: 'cancelled' as const, error: 'Upload cancelled by user' };
        }
        return f;
      }));
      
      // Unsubscribe from all batch subscriptions
      batchSubscriptions.forEach(sub => sub.unsubscribe());
      setBatchSubscriptions([]);
      
      setBatchState('cancelled');
      toast.success('All uploads cancelled successfully');
      
      setTimeout(() => {
        resetAll();
      }, 2000);
    }, 300);
  };

  // Cancel single batch file
  const handleCancelSingleBatchFile = (fileId: string) => {
    setBatchFiles(files => {
      const updatedFiles = files.map(f => 
        f.id === fileId 
          ? { ...f, state: 'cancelled' as const, error: 'Upload cancelled by user' }
          : f
      );
      
      // Check if all files are now cancelled/completed using the updated files array
      const allCompleted = updatedFiles.every(f => 
        f.state === 'success' || f.state === 'error' || f.state === 'cancelled'
      );
      
      if (allCompleted && !completionToastShown) {
        console.log('All files are now either complete or cancelled');
        // Need to call this in setTimeout to ensure state update finishes first
        setTimeout(() => {
          setBatchState('success');
          // Only show toast if not shown already
          toast.success('All files processed!');
          setCompletionToastShown(true);
        }, 0);
      }
      
      return updatedFiles;
    });
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied!');
    }
  };

  const openDownloadLink = (link: string | null) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const resetBatchToIdle = () => {
    setTimeout(() => {
      setBatchState('idle');
      setBatchFiles([]);
      setBatchDownloadLink(null);
      setIsCancelling(false);
      
      // Clean up any remaining subscriptions
      batchSubscriptions.forEach(sub => sub.unsubscribe());
      setBatchSubscriptions([]);
    }, 300);
  };

  const IdleState = () => (
    <div
      className={cn(
        "p-4 transition-all duration-300 border-2 border-dashed enhanced-drop-zone bg-slate-50 border-slate-300 rounded-2xl sm:p-6 hover:border-bolt-blue hover:bg-bolt-blue/5 hover:shadow-lg group",
        { 'border-bolt-blue bg-bolt-blue/5 shadow-lg animate-pulse': isDragOver }
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileSelect(e.target.files)} 
        className="hidden" 
        multiple 
        max="5"
      />

      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 transition-transform rounded-full sm:w-16 sm:h-16 sm:mb-4 bg-gradient-to-br from-bolt-blue/10 to-bolt-blue/20 hover:scale-105 animate-float">
          <CloudUpload className="w-6 h-6 sm:w-8 sm:h-8 text-bolt-blue" />
        </div>

        <h3 className="mb-2 text-base font-semibold sm:text-lg text-slate-900">
          {isDragOver ? "✨ Drop files here" : "Drag & Drop up to 5 files here"}
        </h3>

        {/* OR Separator */}
        <div className="flex items-center justify-center my-4 sm:my-6">
          <div className="flex-1 h-px bg-slate-300"></div>
          <span className={cn(
            "px-3 text-xs font-medium transition-colors duration-300 sm:px-4 sm:text-sm text-slate-500",
            isDragOver ? "bg-bolt-blue/5" : "group-hover:bg-bolt-blue/5"
          )}>OR</span>
          <div className="flex-1 h-px bg-slate-300"></div>
        </div>

        {/* Browse Files Button */}
        <div className="mb-3 sm:mb-4">
          <button className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-bolt-blue to-bolt-mid-blue rounded-xl shadow-lg hover:shadow-xl hover:from-bolt-blue hover:to-bolt-mid-blue focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5">
            <Plus className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            Browse Files
          </button>
        </div>

        {/* File Type Icons */}
        <div className="flex items-center justify-center mb-3 space-x-2 file-type-icons sm:space-x-3 sm:mb-4 opacity-60">
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-5 h-5 px-4 bg-red-100 rounded file-type-icon sm:w-6 sm:h-6">
              <span className="text-xs font-bold text-red-600">PDF</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-5 h-5 px-4 bg-purple-100 rounded file-type-icon sm:w-6 sm:h-6">
              <span className="text-xs font-bold text-purple-600">ZIP</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-5 h-5 px-4 bg-green-100 rounded file-type-icon sm:w-6 sm:h-6">
              <span className="text-xs font-bold text-green-600">MP4</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-5 h-5 px-4 bg-blue-100 rounded file-type-icon sm:w-6 sm:h-6">
              <span className="text-xs font-bold text-blue-600">DOC</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 sm:text-sm">+more</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400">
            Try it now - no signup required for 2GB (max 5 files)
          </div>
          <div className="text-xs font-medium text-slate-500">
            Bank-level encryption • Up to 30GB with account
          </div>
        </div>
      </div>
    </div>
  );

  const FileSelectedState = () => (
      <div className="space-y-3 text-center sm:space-y-4">
      <div className="p-4 border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center justify-center w-10 h-10 border shadow-sm sm:w-12 sm:h-12 rounded-xl border-slate-200 bg-blue-50">
            <FileIconLucide className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold truncate text-slate-900 sm:text-base">
              {selectedFile?.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500">
              {selectedFile ? getFileSize(selectedFile.size) : ''} • Ready to upload
            </p>
            </div>
            <div className="flex-shrink-0">
            <button 
              onClick={removeSelectedFile} 
              className="flex items-center justify-center w-6 h-6 transition-all duration-200 bg-red-100 rounded-full sm:w-8 sm:h-8 hover:bg-red-200"
              title="Remove file"
            >
                <X className="w-3 h-3 text-red-600 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      <button
        onClick={handleRealUpload}
        className="w-full px-4 py-2 text-sm font-bold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 sm:py-3 sm:px-6 rounded-xl hover:shadow-xl hover:-translate-y-1 sm:text-base"
      >
          Upload File
        </button>
      </div>
    );

  const BatchFilesSelectedState = () => (
    <div className="space-y-3 text-center sm:space-y-4">
      <div className="p-4 border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:p-6">
        <div className="flex items-center justify-center mb-3 space-x-2 sm:space-x-3 sm:mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 shadow-sm sm:w-12 sm:h-12 rounded-xl">
            <FileIconLucide className="w-5 h-5 text-white sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold sm:text-lg text-slate-900">
              {batchFiles.length} Files Selected
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Ready for batch upload
            </p>
          </div>
        </div>

        {/* File list preview */}
        <div className="space-y-2 overflow-y-auto max-h-32 sm:max-h-48">
          {batchFiles.slice(0, 5).map((f) => (
            <div
              key={f.id}
              className="p-2 transition-shadow bg-white border shadow-sm border-slate-200 rounded-xl sm:p-3 hover:shadow-md"
            >
                <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 border rounded-lg shadow-sm sm:w-8 sm:h-8 border-slate-200 bg-blue-50">
                  <FileIconLucide className="w-3 h-3 text-blue-600 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium truncate text-slate-900 sm:text-sm">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getFileSize(f.file.size)}
                  </p>
                  </div>
                  <div className="flex-shrink-0">
                  <button 
                    onClick={(e) => removeBatchFile(f.id, e)} 
                    className="flex items-center justify-center w-5 h-5 transition-all duration-200 bg-red-100 rounded-full sm:w-6 sm:h-6 hover:bg-red-200"
                    title="Remove file"
                  >
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
          ))}
          {batchFiles.length > 5 && (
            <div className="py-2 text-center">
              <span className="px-2 py-1 text-xs bg-white border rounded-full sm:text-sm text-slate-500 sm:px-3 border-slate-200">
                +{batchFiles.length - 5} more files
              </span>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleRealBatchUpload}
        className="w-full px-4 py-2 text-sm font-bold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 sm:py-3 sm:px-6 rounded-xl hover:shadow-xl hover:-translate-y-1 sm:text-base"
      >
        Upload {batchFiles.length} Files (Max 5)
      </button>
    </div>
  );

  const UploadProgressState = () => (
      <div className="space-y-3 text-center sm:space-y-4">
      <div
        className={cn(
          "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm",
          { 'opacity-60 pointer-events-none': isCancelling }
        )}
      >
          <div className="flex items-center mb-3 space-x-3 sm:space-x-4 sm:mb-4">
          <div
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm",
              {
                'bg-slate-200': !isCancelling,
                'bg-orange-500': isCancelling
              }
            )}
          >
            {!isCancelling && uploadProgress === 0 ? (
              <FileIconLucide className="w-6 h-6 text-blue-600" />
            ) : (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold truncate text-slate-900 sm:text-base">
              {selectedFile?.name}
            </h4>
            <p className={cn(
              "text-xs sm:text-sm text-slate-500",
              { 'text-orange-600': isCancelling }
            )}>
                {isCancelling ? "Cancelling upload..." : `Uploading... ${uploadProgress}%`}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full shadow-inner">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-200 shadow-sm",
              {
                'bg-gradient-to-r from-blue-500 to-blue-600': !isCancelling,
                'bg-gradient-to-r from-orange-500 to-orange-600': isCancelling
              }
            )}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className={cn(
          "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:from-red-500 hover:to-red-600 hover:transform hover:scale-105 text-sm sm:text-base",
          { 'opacity-50 cursor-not-allowed': isCancelling }
        )}
      >
        <div className="flex items-center justify-center space-x-2">
          {isCancelling ? (
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span>{isCancelling ? "Cancelling..." : "Cancel Upload"}</span>
        </div>
      </button>
    </div>
  );

  const UploadSuccessState = () => (
    <div className="space-y-4 text-center">
      <div className="p-6 border border-green-200 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 shadow-sm rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
              Upload Complete!
            </h4>
            <p className="text-sm text-slate-500">
              Your file has been uploaded successfully
            </p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <Check className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Download Link Display */}
      {downloadLink && (
        <div className="p-4 space-y-3 border border-blue-200 bg-blue-50 rounded-2xl">
        <div className="text-left">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Download Link:
            </p>
          <div className="flex items-center p-3 space-x-2 bg-white border rounded-lg border-slate-200">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-slate-600">
                  {downloadLink}
                </p>
              </div>
              <button
                onClick={() => copyLink(downloadLink)}
                className="flex-shrink-0 p-2 transition-colors rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Copy link"
              >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => openDownloadLink(downloadLink)}
          className="w-full px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:-translate-y-1"
        >
          Open Download Page
        </button>
        <button
          onClick={resetAll}
          className="w-full px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Upload Another File
        </button>
      </div>
    </div>
  );

  const UploadCancelledState = () => (
    <div className="space-y-4 text-center">
      <div className="p-6 border border-orange-200 shadow-sm bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 shadow-sm rounded-xl">
            <X className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
              Upload Cancelled
            </h4>
            <p className="text-sm truncate text-slate-500">
              {selectedFile?.name} upload was cancelled
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <button
          onClick={resetAll}
          className="w-full px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:-translate-y-1"
        >
          Start New Upload
        </button>
      </div>
    </div>
  );

  const UploadErrorState = () => (
    <div className="space-y-4 text-center">
      <div className="p-6 border border-red-200 shadow-sm bg-gradient-to-r from-red-50 to-red-100 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-500 shadow-sm rounded-xl">
            <X className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
              Upload Failed
            </h4>
            <p className="text-sm text-slate-500">
              {errorMessage || 'An error occurred during upload'}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <button
          onClick={resetAll}
          className="w-full px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:-translate-y-1"
        >
        Try Again
        </button>
      </div>
    </div>
  );

  const BatchUploadProgressState = () => (
    <div className="space-y-3 text-center sm:space-y-4">
      <div
        className={cn(
          "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm",
          { 'opacity-60 pointer-events-none': isCancelling }
        )}
      >
        <h3
          className={cn(
            "text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4",
            { 'text-orange-700': isCancelling }
          )}
        >
          {isCancelling ? "Cancelling uploads..." : "Uploading Files..."}
        </h3>
        <div className="space-y-3 overflow-y-auto max-h-48 sm:max-h-64">
          {batchFiles.map((f) => (
            <div
              key={f.id}
              className={cn(
                "bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow",
                { 'opacity-70': f.state === 'cancelling' }
              )}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200",
                    {
                      'bg-slate-100': f.state === 'pending',
                      'bg-slate-200': f.state === 'uploading',
                      'bg-orange-500': f.state === 'cancelling',
                      'bg-orange-400': f.state === 'cancelled',
                      'bg-green-500': f.state === 'success',
                      'bg-red-500': f.state === 'error'
                    }
                  )}
                >
                  {f.state === 'pending' && (
                    <FileIconLucide className="w-5 h-5 text-blue-600" />
                  )}
                  {f.state === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  {f.state === 'cancelling' && (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  {f.state === 'cancelled' && (
                    <X className="w-5 h-5 text-white" />
                  )}
                  {f.state === 'success' && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                  {f.state === 'error' && (
                    <X className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate text-slate-900">
                    {f.file.name}
                  </p>
                  <p className={cn(
                    "text-sm text-slate-500",
                    {
                      'text-orange-600': f.state === 'cancelling',
                      'text-orange-500': f.state === 'cancelled'
                    }
                  )}>
                    {getFileSize(f.file.size)}
                    {f.state === 'uploading' && ` • ${f.progress}%`}
                    {f.state === 'cancelling' && ' • Cancelling...'}
                    {f.state === 'cancelled' && ' • Cancelled'}
                    {f.state === 'success' && ' • Complete'}
                    {f.state === 'error' && ' • Error'}
                  </p>
                </div>
                {/* Individual Cancel Button for Each File */}
                {f.state === 'uploading' && (
                  <button
                    onClick={() => handleCancelSingleBatchFile(f.id)}
                    className="p-2 transition-all duration-200 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress bar for uploading and cancelling files */}
              {(f.state === 'uploading' || f.state === 'cancelling') && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        {
                          'bg-blue-500': f.state === 'uploading',
                          'bg-orange-500': f.state === 'cancelling'
                        }
                      )}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleBatchCancel}
        disabled={isCancelling}
        className={cn(
          "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:from-red-500 hover:to-red-600 hover:transform hover:scale-105 text-sm sm:text-base",
          { 'opacity-50 cursor-not-allowed': isCancelling }
        )}
      >
        <div className="flex items-center justify-center space-x-2">
          {isCancelling ? (
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span>{isCancelling ? "Cancelling All..." : "Cancel All Uploads"}</span>
        </div>
      </button>
    </div>
  );

  const BatchUploadSuccessState = () => (
    <div className="space-y-4 text-center">
      <div className="p-6 border border-green-200 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-slate-900">
              Batch Upload Complete!
            </h4>
            <p className="text-sm text-slate-500">
              {batchFiles.length} files uploaded successfully
            </p>
          </div>
        </div>
      </div>

      {/* Download Link Display */}
      {batchDownloadLink && (
        <div className="p-4 space-y-3 border border-blue-200 bg-blue-50 rounded-2xl">
          <div className="text-left">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Batch Download Link:
            </p>
            <div className="flex items-center p-3 space-x-2 bg-white border rounded-lg border-slate-200">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-slate-600">
                  {batchDownloadLink}
                </p>
              </div>
              <button
                onClick={() => copyLink(batchDownloadLink)}
                className="flex-shrink-0 p-2 transition-colors rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Copy link"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => openDownloadLink(batchDownloadLink)}
          className="w-full px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:-translate-y-1"
        >
          Open Download Page
        </button>
        <button
          onClick={resetAll}
          className="w-full px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Upload Another Batch
        </button>
      </div>
    </div>
  );

  const BatchUploadCancelledState = () => (
    <div className="space-y-4 text-center">
      <div className="p-6 border border-orange-200 bg-orange-50 rounded-2xl animate-fade-in">
        <div className="flex items-center mb-4 space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg">
            <X className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-slate-900">
              Batch Upload Cancelled
            </h4>
            <p className="text-sm text-slate-500">
              All file uploads have been cancelled successfully
            </p>
          </div>
        </div>

        {/* Show cancelled files summary */}
        <div className="p-4 mb-4 bg-white border border-orange-100 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Cancelled Files</span>
            <span className="text-sm text-orange-600">{batchFiles.length} files</span>
          </div>
          <div className="mt-2 overflow-y-auto max-h-32">
            {batchFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-1">
                <span className="text-xs truncate text-slate-500">{f.file.name}</span>
                <span className="text-xs text-orange-500">Cancelled</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={resetBatchToIdle}
          className="w-full px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:-translate-y-1"
        >
        Start New Batch Upload
      </button>
      </div>
    </div>
  );

  const renderContent = () => {
    // Single file states
    if (currentState === 'selected') return <FileSelectedState />;
    if (currentState === 'uploading') return <UploadProgressState />;
    if (currentState === 'success') return <UploadSuccessState />;
    if (currentState === 'cancelled') return <UploadCancelledState />;
    if (currentState === 'error') return <UploadErrorState />;

    // Batch file states
    if (batchState === 'selected') return <BatchFilesSelectedState />;
    if (batchState === 'processing') return <BatchUploadProgressState />;
    if (batchState === 'success') return <BatchUploadSuccessState />;
    if (batchState === 'cancelled') return <BatchUploadCancelledState />;

    // Default idle state
    return <IdleState />;
  };

  return (
    <div className="w-full h-full">
      {/* Quick Upload Header */}
      <div className="mb-4 text-center sm:mb-6">
        <div className="inline-flex items-center px-2 py-1 mb-3 space-x-2 text-xs font-medium text-bolt-blue rounded-full bg-blue-50 sm:px-3 sm:text-sm sm:mb-4">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            />
          </svg>
          <span>Quick Upload</span>
        </div>
        <h3 className="mb-1 text-lg font-bold sm:text-xl text-slate-900 sm:mb-2">
          Try it now
        </h3>
        <p className="text-sm sm:text-base text-slate-500">
          2GB limit for guests
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
}