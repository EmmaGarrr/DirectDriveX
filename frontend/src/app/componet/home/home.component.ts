import { Component, OnDestroy } from '@angular/core';
import { UploadService, UploadEvent, QuotaInfo } from '../../shared/services/upload.service';
import { Router } from '@angular/router';
import { Subscription, forkJoin, Observable, Observer, Subject } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { BatchUploadService, IBatchFileInfo } from '../../shared/services/batch-upload.service';
import { environment } from '../../../environments/environment';
import { AppComponent } from '../../app.component';

// Interfaces and Types
interface IFileState {
  file: File;
  state: 'pending' | 'uploading' | 'cancelling' | 'success' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  websocket?: WebSocket;
}

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error' | 'cancelled';
type BatchUploadState = 'idle' | 'selected' | 'processing' | 'success' | 'error' | 'cancelled';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  // Single file upload state
  public currentState: UploadState = 'idle';
  public selectedFile: File | null = null;
  public uploadProgress = 0;
  public finalDownloadLink: string | null = null;
  public errorMessage: string | null = null;
  public isCancelling = false;
  private uploadSubscription?: Subscription;
  private currentWebSocket?: WebSocket;

  // Batch upload state
  public batchFiles: IFileState[] = [];
  public batchState: BatchUploadState = 'idle';
  public finalBatchLink: string | null = null;
  private batchSubscriptions: Subscription[] = [];
  private wsUrl = environment.wsUrl;

  // Authentication state
  public isAuthenticated = false;
  public currentUser: any = null;
  private destroy$ = new Subject<void>();

  // UI state for modern interface
  public isDragOver = false;
  
  // Tab management for mobile comparison
  public activeTab: 'dropbox' | 'google-drive' | 'mfcnextgen' = 'dropbox';
  
  // Math reference for template
  public Math = Math;

  // --- NEW: Quota tracking ---
  public quotaInfo: QuotaInfo | null = null;
  public quotaLoading = false;

  constructor(
    private router: Router,
    private uploadService: UploadService,
    private toastService: ToastService,
    private batchUploadService: BatchUploadService,
    private appComponent: AppComponent
  ) {
    // Track homepage view
    this.appComponent.trackHotjarEvent('homepage_viewed');
    
    // Note: AuthService integration removed due to missing implementation
    // this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(...)
    
    // --- NEW: Check authentication status ---
    this.checkAuthenticationStatus();
    
    // --- NEW: Load quota information ---
    this.loadQuotaInfo();
  }

  // --- NEW: Check if user is authenticated ---
  private checkAuthenticationStatus(): void {
    const token = localStorage.getItem('access_token');
    this.isAuthenticated = !!token;
  }

  // --- NEW: Load quota information ---
  private loadQuotaInfo(): void {
    this.quotaLoading = true;
    this.uploadService.getQuotaInfo().subscribe({
      next: (quota) => {
        this.quotaInfo = quota;
        this.quotaLoading = false;
      },
      error: (error) => {
        console.error('Failed to load quota info:', error);
        this.quotaLoading = false;
      }
    });
  }

  // --- NEW: Get file size limits based on authentication ---
  private getFileSizeLimits(): { singleFile: number; daily: number } {
    return {
      singleFile: this.isAuthenticated ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024, // 5GB or 2GB
      daily: this.isAuthenticated ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024 // 5GB or 2GB
    };
  }

  // --- NEW: Validate single file size ---
  private validateFileSize(file: File): boolean {
    const limits = this.getFileSizeLimits();
    const limitText = this.isAuthenticated ? '5GB' : '2GB';
    
    if (file.size > limits.singleFile) {
      this.toastService.error(`File size exceeds ${limitText} limit for ${this.isAuthenticated ? 'authenticated' : 'anonymous'} users`, 5000);
      return false;
    }
    return true;
  }

  // --- NEW: Validate batch file sizes ---
  private validateBatchFiles(files: File[]): boolean {
    const limits = this.getFileSizeLimits();
    const limitText = this.isAuthenticated ? '5GB' : '2GB';
    
    // Check individual file sizes
    for (const file of files) {
      if (file.size > limits.singleFile) {
        this.toastService.error(`File "${file.name}" exceeds ${limitText} single file limit`, 5000);
        return false;
      }
    }
    
    // Check total batch size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > limits.daily) {
      const totalSizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
      this.toastService.error(`Total file size (${totalSizeGB}GB) exceeds ${limitText} daily limit`, 5000);
      return false;
    }
    
    return true;
  }

  // File selection handlers
  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._processFileList(target.files);
  }

  // --- NEW: Add missing drag and drop methods ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this._processFileList(files);
    }
  }

  private _processFileList(files: FileList | null): void {
    if (!files || files.length === 0) return;
    
    this.resetState();
    
    if (files.length === 1) {
      // Single file upload mode
      const file = files[0];
      
      // --- NEW: Validate file size before proceeding ---
      if (!this.validateFileSize(file)) {
        return;
      }
      
      this.selectedFile = file;
      this.currentState = 'selected';
      this.batchFiles = []; // Clear batch files
      this.batchState = 'idle';
      
      // Track single file selection
      this.appComponent.trackHotjarEvent('single_file_selected', {
        file_name: this.selectedFile.name,
        file_size: this.selectedFile.size,
        file_type: this.selectedFile.type,
        upload_type: 'single'
      });
    } else {
      // Multiple files - batch upload mode
      const fileArray = Array.from(files);
      
      // --- NEW: Validate batch files before proceeding ---
      if (!this.validateBatchFiles(fileArray)) {
        return;
      }
      
      this.selectedFile = null; // Clear single file
      this.currentState = 'idle';
      this.batchFiles = fileArray.map(file => ({
        file,
        state: 'pending' as const,
        progress: 0
      }));
      this.batchState = 'selected';
      
      // Track batch file selection
      this.appComponent.trackHotjarEvent('batch_files_selected', {
        file_count: this.batchFiles.length,
        total_size: this.getTotalFileSize(),
        file_types: this.getFileTypes(),
        upload_type: 'batch'
      });
    }
  }

  // CTA Button handlers
  onClaimStorage(): void {
    // Track CTA button click
    this.appComponent.trackHotjarEvent('cta_button_clicked', {
      button_type: 'claim_storage',
      location: 'homepage'
    });
    
    this.router.navigate(['/register']);
  }

  // Single file upload methods
  onUploadSingle(): void {
    if (!this.selectedFile || this.currentState === 'uploading') return;

    // Track single file upload initiation
    this.appComponent.trackHotjarEvent('single_upload_initiated', {
      file_name: this.selectedFile.name,
      file_size: this.selectedFile.size,
      file_type: this.selectedFile.type,
      upload_type: 'single'
    });

    this.currentState = 'uploading';
    this.uploadProgress = 0;
    this.errorMessage = null;
    this.isCancelling = false;

    // Create WebSocket connection for upload
    this.uploadService.upload(this.selectedFile).subscribe({
      next: (event: UploadEvent) => {
        if (event.type === 'progress') {
          // Use requestAnimationFrame for smoother animation
          requestAnimationFrame(() => {
            console.log(`[HOME] Updating progress: ${event.value}%`);
            this.uploadProgress = event.value as number;
            // Force layout recalculation
            document.body.offsetHeight;
          });
        } else if (event.type === 'success') {
          // Check if this is a cancellation success message
          if (this.isCancelling || (typeof event.value === 'string' && event.value.includes('cancelled'))) {
            // Handle cancellation success
            this.currentState = 'cancelled';
            
            // Track upload cancellation
            this.appComponent.trackHotjarEvent('single_upload_cancelled', {
              file_name: this.selectedFile?.name,
              progress_at_cancellation: this.uploadProgress
            });
            
            this.toastService.success('Upload cancelled successfully', 3000);
            this.resetToIdle();
          } else {
            // Handle regular upload success
            console.log(`[HOME] Received success event, updating state to success`);
            this.currentState = 'success';
            // Extract file ID from the API path
            const fileId = typeof event.value === 'string' ? event.value.split('/').pop() : event.value;
            // Generate frontend route URL like batch downloads (not direct API URL)
            this.finalDownloadLink = `${window.location.origin}/download/${fileId}`;
            
            // Track successful upload
            this.appComponent.trackHotjarEvent('single_upload_success', {
              file_name: this.selectedFile?.name,
              file_size: this.selectedFile?.size,
              file_type: this.selectedFile?.type,
              file_id: fileId
            });
            
            this.toastService.success('File uploaded successfully!', 3000);
          }
        }
      },
      error: (err) => {
        if (!this.isCancelling) {
          this.currentState = 'error';
          this.errorMessage = err.message || 'Upload failed';
          
          // Track upload failure
          this.appComponent.trackHotjarEvent('single_upload_failed', {
            file_name: this.selectedFile?.name,
            file_size: this.selectedFile?.size,
            error_message: this.errorMessage,
            progress_at_failure: this.uploadProgress
          });
          
          this.toastService.error('Upload failed: ' + this.errorMessage, 5000);
        }
      },
      complete: () => {
        // Upload completed
      }
    });
  }

  // Reset component to idle state with smooth transition
  private resetToIdle(): void {
    // Smooth transition delay
    const delay = this.currentState === 'cancelled' ? 200 : 500;
    
    setTimeout(() => {
      this.currentState = 'idle';
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.finalDownloadLink = null;
      this.errorMessage = null;
      this.isCancelling = false;
      
      // Clean up subscription
      if (this.uploadSubscription) {
        this.uploadSubscription.unsubscribe();
        this.uploadSubscription = undefined;
      }
      
      // Clear file input if it exists
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, delay);
  }

  // Cancel single file upload with premium UX
  onCancelUpload(): void {
    if (this.currentState !== 'uploading') return;

    // Immediate visual feedback
    this.isCancelling = true;
    
    // Show user-friendly message immediately
    this.toastService.info('Cancelling upload...', 2000);
    
    // Simulate realistic cancellation time for better UX
    setTimeout(() => {
      // Use upload service to cancel WebSocket connection
      const cancelled = this.uploadService.cancelUpload();
      if (cancelled) {
        console.log('[HomeComponent] Upload cancelled via service');
        // Set state to cancelled for smooth transition
        this.currentState = 'cancelled';
        
        // Show success message after slight delay
        setTimeout(() => {
          this.toastService.success('Upload cancelled successfully', 3000);
          // Reset to idle after showing cancelled state briefly
          setTimeout(() => {
            this.resetToIdle();
          }, 1000);
        }, 500);
      } else {
        console.log('[HomeComponent] No active upload to cancel');
        this.toastService.info('Upload cancelled', 2000);
        this.resetToIdle();
      }
    }, 300); // Small delay for better perceived performance
  }

  // Batch upload methods - Restored original batch upload functionality
  onUploadBatch(): void {
    if (this.batchFiles.length === 0 || this.batchState === 'processing') return;

    this.batchState = 'processing';
    this.finalBatchLink = null;

    const fileInfos: IBatchFileInfo[] = this.batchFiles.map(f => ({
      filename: f.file.name,
      size: f.file.size,
      content_type: f.file.type || 'application/octet-stream'
    }));

    console.log(`[HOME_BATCH] Initiating batch upload for ${fileInfos.length} files`);

    const observer: Observer<any> = {
      next: (response) => {
        console.log(`[HOME_BATCH] Batch initiated successfully for ${response.files.length} files, batch_id: ${response.batch_id}`);
        
        // Process ALL files from batch response
        response.files.forEach((fileInfo: any) => {
          const matchingFile = this.batchFiles.find(bf => bf.file.name === fileInfo.original_filename);
          if (matchingFile) {
            console.log(`[HOME_BATCH] Starting upload for: ${matchingFile.file.name} (${fileInfo.file_id})`);
            
            const sub = this.createIndividualUploadObservable(
              matchingFile, 
              fileInfo.file_id, 
              fileInfo.gdrive_upload_url
            ).subscribe({
              complete: () => {
                console.log(`[HOME_BATCH] Upload completed for: ${matchingFile.file.name}`);
                this.checkBatchCompletion(response.batch_id);
              },
              error: (error) => {
                console.error(`[HOME_BATCH] Upload failed for: ${matchingFile.file.name}`, error);
                matchingFile.state = 'error';
                matchingFile.error = error.message || 'Upload failed';
                this.checkBatchCompletion(response.batch_id);
              }
            });
            this.batchSubscriptions.push(sub);
          } else {
            console.error(`[HOME_BATCH] No matching file found for: ${fileInfo.original_filename}`);
          }
        });
      },
      error: (err) => {
        console.error(`[HOME_BATCH] Batch upload initiation failed:`, err);
        this.batchState = 'error';
        this.toastService.error(`Batch upload initiation failed: ${err.error?.detail || err.message || 'Unknown error'}`, 5000);
      },
      complete: () => {}
    };

    this.batchUploadService.initiateBatch(fileInfos).subscribe(observer);
  }

  private createIndividualUploadObservable(fileState: IFileState, fileId: string, gdriveUploadUrl: string): Observable<UploadEvent | null> {
    return new Observable(observer => {
      const wsUrl = `${this.wsUrl}/upload_parallel/${fileId}?gdrive_url=${encodeURIComponent(gdriveUploadUrl)}`;
      
      // Enhanced logging for connection attempts (matching single upload)
      console.log(`[HOME_BATCH] Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      let connectionStartTime = Date.now();
      
      // Assign WebSocket reference for cancel functionality
      fileState.websocket = ws;
      
      // Add connection timeout to prevent infinite waiting
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error(`[HOME_BATCH] Connection timeout for file: ${fileState.file.name} (${fileId})`);
          ws.close();
          fileState.state = 'error';
          fileState.error = 'Connection timeout - server may be unavailable';
          observer.error(new Error('Connection timeout'));
        }
      }, 30000); // 30 second timeout
      
      // Comprehensive WebSocket debugging
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        const connectionTime = Date.now() - connectionStartTime;
        console.log(`[DEBUG] 🔌 [HOME] WebSocket opened successfully`);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket readyState:`, ws.readyState);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket URL:`, ws.url);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket protocol:`, ws.protocol);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket extensions:`, ws.extensions);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket extensions:`, ws.extensions);
        
        // Update file state to uploading
        fileState.state = 'uploading';
        fileState.progress = 0;
        console.log(`[HOME_BATCH] Started upload for ${fileState.file.name}`);
        
        this.sliceAndSend(fileState.file, ws);
      };
      
      ws.onmessage = (event) => {
        console.log(`[DEBUG] 📨 [HOME] WebSocket message received:`, {
          data: event.data,
          type: event.type,
          origin: event.origin,
          lastEventId: event.lastEventId
        });
        
        try {
          const message: any = JSON.parse(event.data);
          
          if (message.type === 'progress') {
            // Update individual file progress
            fileState.progress = message.value;
            fileState.state = 'uploading';
            console.log(`[HOME_BATCH] Progress update for ${fileState.file.name}: ${message.value}%`);
            observer.next(message as UploadEvent);
          } else if (message.type === 'success') {
            // Update individual file state to success
            fileState.state = 'success';
            fileState.progress = 100;
            console.log(`[HOME_BATCH] Success for ${fileState.file.name}`);
            observer.next(message as UploadEvent);
            observer.complete();
          } else if (message.type === 'error') {
            // Update individual file state to error
            fileState.state = 'error';
            fileState.error = message.value;
            console.error(`[HOME_BATCH] Error for ${fileState.file.name}: ${message.value}`);
            observer.next(message as UploadEvent);
            observer.complete();
          }
          // Note: cancel_ack removed - now using superior HTTP cancel protocol
        } catch (e) {
          console.error('[HOME_BATCH] Failed to parse message from server:', event.data);
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('[HOME_BATCH] Error:', error);
        console.log(`[DEBUG] ❌ [HOME] WebSocket error occurred:`, error);
        console.log(`[DEBUG] ❌ [HOME] WebSocket readyState during error:`, ws.readyState);
        observer.error({ type: 'error', value: 'Connection to server failed.' });
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`[DEBUG] 🔌 [HOME] WebSocket closed:`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          readyState: ws.readyState
        });
        console.log(`[DEBUG] 🔌 [HOME] Close codes: NORMAL=1000, GOING_AWAY=1001, ABNORMAL_CLOSURE=1006`);
        
        if (event.code === 1006) {
          console.log(`[DEBUG] ❌ [HOME] ABNORMAL_CLOSURE detected - connection was closed unexpectedly`);
        }
        
        if (this.isCancelling) {
          // User initiated cancellation - show success message
          observer.next({ type: 'success', value: 'Upload cancelled successfully' });
        } else if (!event.wasClean) {
          observer.error({ type: 'error', value: 'Lost connection to server during upload.' });
        } else {
          observer.complete();
        }
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    });
  }

  private sliceAndSend(file: File, ws: WebSocket, start: number = 0): void {
    const chunkSize = 4 * 1024 * 1024; // 4MB - reduced from 16MB to avoid WebSocket message size limits
    console.log(`[DEBUG] 🔪 sliceAndSend called - start: ${start}, file size: ${file.size}`);
    console.log(`[DEBUG] 📏 CHUNK_SIZE: ${chunkSize} bytes (4 MB)`);
    
    if (start >= file.size) {
      console.log(`[DEBUG] ✅ File upload complete, sending DONE message`);
      ws.send("DONE");
      return;
    }

    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    console.log(`[DEBUG] 📦 Chunk created - start: ${start}, end: ${end}, size: ${chunk.size} bytes`);
    console.log(`[DEBUG] 📋 Chunk type: ${chunk.type}`);

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(`[DEBUG] 📖 FileReader onload triggered`);
      console.log(`[DEBUG] 📊 Event target:`, e.target);
      console.log(`[DEBUG] 📊 Event result:`, e.target?.result);
      console.log(`[DEBUG] 📊 Result type:`, typeof e.target?.result);
      console.log(`[DEBUG] 📊 Result constructor:`, e.target?.result?.constructor?.name);
      
      if (e.target?.result instanceof ArrayBuffer) {
        console.log(`[DEBUG] 📏 Result byteLength:`, e.target.result.byteLength);
      }

      if (ws.readyState === WebSocket.OPEN) {
        console.log(`[DEBUG] 🔌 WebSocket is OPEN, sending chunk data`);
        
        // Convert ArrayBuffer to base64 and send as JSON
        if (e.target?.result instanceof ArrayBuffer) {
          const bytes = new Uint8Array(e.target.result);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);
          
          const chunkMessage = {
            bytes: base64Data
          };
          
          console.log(`[DEBUG] 📤 Sending JSON chunk message with base64 data, length: ${base64Data.length}`);
          ws.send(JSON.stringify(chunkMessage));
        } else {
          console.error(`[DEBUG] ❌ Unexpected result type: ${typeof e.target?.result}`);
          ws.send(JSON.stringify({ error: "Invalid data format" }));
        }
        
        // Send next chunk
        setTimeout(() => {
          this.sliceAndSend(file, ws, end);
        }, 100); // Small delay to prevent overwhelming the WebSocket
      } else {
        console.log(`[DEBUG] ❌ WebSocket not ready, state:`, ws.readyState);
        console.log(`[DEBUG] ❌ WebSocket states: CONNECTING=${WebSocket.CONNECTING}, OPEN=${WebSocket.OPEN}, CLOSING=${WebSocket.CLOSING}, CLOSED=${WebSocket.CLOSED}`);
      }
    };
    
    reader.onerror = (e) => {
      console.error(`[DEBUG] ❌ FileReader error:`, e);
      console.error(`[DEBUG] ❌ FileReader error details:`, e.target?.error);
    };
    
    reader.onabort = (e) => {
      console.log(`[DEBUG] ⚠️ FileReader aborted:`, e);
    };
    
    console.log(`[DEBUG] 📖 Starting FileReader.readAsArrayBuffer for chunk`);
    reader.readAsArrayBuffer(chunk);
  }

  // --- NEW: Get quota display text ---
  getQuotaDisplayText(): string {
    if (!this.quotaInfo) return '';
    
    const limit = this.quotaInfo.daily_limit_gb;
    const used = this.quotaInfo.current_usage_gb;
    const remaining = this.quotaInfo.remaining_gb;
    const userType = this.quotaInfo.user_type;
    
    return `${used}GB / ${limit}GB used (${remaining}GB remaining)`;
  }

  // --- NEW: Get quota progress percentage ---
  getQuotaProgressPercentage(): number {
    if (!this.quotaInfo) return 0;
    return this.quotaInfo.usage_percentage;
  }

  // --- NEW: Get quota status color ---
  getQuotaStatusColor(): string {
    if (!this.quotaInfo) return 'gray';
    
    const percentage = this.quotaInfo.usage_percentage;
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    if (percentage >= 50) return 'yellow';
    return 'green';
  }

  // --- NEW: Add missing methods referenced in template ---
  uploadFile(): void {
    if (this.selectedFile && this.currentState === 'selected') {
      this.onUploadSingle();
    }
  }

  cancelUpload(): void {
    this.onCancelUpload();
  }

  resetUpload(): void {
    this.resetState();
  }

  // --- NEW: Add missing resetState method ---
  resetState(): void {
    this.currentState = 'idle';
    this.batchState = 'idle';
    this.selectedFile = null;
    this.batchFiles = [];
    this.uploadProgress = 0;
    this.finalDownloadLink = null;
    this.finalBatchLink = null;
    this.errorMessage = null;
    this.isCancelling = false;
  }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link).then(() => {
      this.toastService.success('Link copied to clipboard!', 2000);
    });
  }

  openDownloadLink(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  onCancelAllBatch(): void {
    if (this.batchState !== 'processing') return;

    // Immediate visual feedback
    this.isCancelling = true;
    
    // Show user-friendly message immediately
    this.toastService.info('Cancelling all uploads...', 2000);
    
    // Simulate realistic cancellation time for better UX
    setTimeout(() => {
      // Cancel all uploading files
      this.batchFiles.forEach(fileState => {
        if (fileState.state === 'uploading' && fileState.websocket) {
          fileState.websocket.close();
          fileState.state = 'cancelled';
          fileState.error = 'Upload cancelled by user';
        } else if (fileState.state === 'pending') {
          fileState.state = 'cancelled';
          fileState.error = 'Upload cancelled by user';
        }
      });
      
      // Unsubscribe from all batch subscriptions
      this.batchSubscriptions.forEach(sub => sub.unsubscribe());
      this.batchSubscriptions = [];
      
      // Set state to cancelled for smooth transition
      this.batchState = 'cancelled';
      
      // Show success message after slight delay
      setTimeout(() => {
        this.toastService.success('All uploads cancelled successfully', 3000);
        
        // Reset after showing cancelled state briefly
        setTimeout(() => {
          this.resetBatchToIdle();
        }, 2000);
      }, 500);
    }, 300);
  }

  resetBatchToIdle(): void {
    setTimeout(() => {
      this.batchState = 'idle';
      this.batchFiles = [];
      this.finalBatchLink = null;
      this.isCancelling = false;
      
      // Clean up any remaining subscriptions
      this.batchSubscriptions.forEach(sub => sub.unsubscribe());
      this.batchSubscriptions = [];
    }, 300);
  }

  // --- NEW: Add missing checkBatchCompletion method ---
  checkBatchCompletion(batchId: string): void {
    const allCompleted = this.batchFiles.every(f => f.state === 'success' || f.state === 'error');
    if (allCompleted) {
      this.batchState = 'success';
      this.finalBatchLink = `${window.location.origin}/batch-download/${batchId}`;
      this.toastService.success('All files uploaded successfully!', 3000);
      
      // --- NEW: Refresh quota info after successful batch upload ---
      this.loadQuotaInfo();
    }
  }

  // --- NEW: Add missing getFileSize method ---
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- NEW: Add missing onCancelSingleBatchFile method ---
  onCancelSingleBatchFile(fileState: IFileState): void {
    if (fileState.state !== 'uploading') return;

    // Immediate visual feedback
    fileState.state = 'cancelling';
    
    // Close WebSocket connection
    if (fileState.websocket) {
      fileState.websocket.close();
      fileState.websocket = undefined;
    }
    
    // Show user-friendly message
    this.toastService.info(`Cancelling upload: ${fileState.file.name}`, 2000);
    
    // Simulate realistic cancellation time for better UX
    setTimeout(() => {
      fileState.state = 'cancelled';
      fileState.error = 'Upload cancelled by user';
      
      // Check if all files are now cancelled/completed
      // Note: We need to get the batch ID from somewhere - for now, we'll check completion without it
      const allCompleted = this.batchFiles.every(f => f.state === 'success' || f.state === 'error' || f.state === 'cancelled');
      if (allCompleted) {
        this.batchState = 'success';
        this.toastService.success('All files processed!', 3000);
      }
    }, 500);
  }

  // --- NEW: Add missing getFileTypeInfo method ---
  getFileTypeInfo(filename: string): { iconType: string; color: string; bgColor: string } {
    if (!filename) return { iconType: 'file', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
      return { iconType: 'image', color: 'text-blue-500', bgColor: 'bg-blue-50' };
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension || '')) {
      return { iconType: 'video', color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension || '')) {
      return { iconType: 'audio', color: 'text-green-500', bgColor: 'bg-green-50' };
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return { iconType: 'document', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return { iconType: 'archive', color: 'text-purple-500', bgColor: 'bg-purple-50' };
    }
    
    // Code files
    if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension || '')) {
      return { iconType: 'code', color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
    }
    
    // Default
    return { iconType: 'file', color: 'text-gray-500', bgColor: 'bg-gray-50' };
  }

  // --- NEW: Add missing switchTab method ---
  switchTab(tab: 'dropbox' | 'google-drive' | 'mfcnextgen'): void {
    this.activeTab = tab;
  }

  // --- NEW: Add missing onGetStartedClick method ---
  onGetStartedClick(): void {
    // Scroll to the upload section or navigate to a specific route
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up subscriptions
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    
    this.batchSubscriptions.forEach(sub => sub.unsubscribe());
    
    // Close WebSocket connections
    if (this.currentWebSocket) {
      this.currentWebSocket.close();
    }
    
    this.batchFiles.forEach(f => {
      if (f.websocket) {
        f.websocket.close();
      }
    });
  }

  // Helper method to get total file size
  private getTotalFileSize(): number {
    return this.batchFiles.reduce((total, fileState) => total + fileState.file.size, 0);
  }

  // Helper method to get file types
  private getFileTypes(): string[] {
    const types = this.batchFiles.map(fileState => fileState.file.type || 'unknown');
    return [...new Set(types)]; // Remove duplicates
  }

  // --- NEW: Single file remove functionality ---
  removeSelectedFile(event: Event): void {
    // Prevent event bubbling to avoid triggering file selection
    event.stopPropagation();
    
    // Reset file selection
    this.selectedFile = null;
    this.currentState = 'idle';
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // --- NEW: Batch file remove functionality ---
  removeBatchFile(fileState: IFileState, event: Event): void {
    // Prevent event bubbling
    event.stopPropagation();
    
    // Remove file from batch
    this.batchFiles = this.batchFiles.filter(f => f !== fileState);
    
    // Check if we need to change modes
    if (this.batchFiles.length === 0) {
      // No files left, reset to idle state
      this.batchState = 'idle';
    } else if (this.batchFiles.length === 1) {
      // Only one file left, switch to single file mode
      const remainingFile = this.batchFiles[0].file;
      this.batchFiles = [];
      this.batchState = 'idle';
      this.selectedFile = remainingFile;
      this.currentState = 'selected';
    }
  }
}
