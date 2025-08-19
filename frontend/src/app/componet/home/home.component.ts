import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UploadService, UploadEvent } from '../../shared/services/upload.service';
import { Subscription, forkJoin, Observable, Observer, Subject } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { BatchUploadService, IBatchFileInfo } from '../../shared/services/batch-upload.service';
import { environment } from '../../../environments/environment';

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

  constructor(
    private router: Router,
    private uploadService: UploadService,
    private toastService: ToastService,
    private batchUploadService: BatchUploadService
  ) {
    // Note: AuthService integration removed due to missing implementation
    // this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(...)
  }

  // File selection handlers
  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._processFileList(target.files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    this._processFileList(event.dataTransfer?.files || null);
  }

  private _processFileList(files: FileList | null): void {
    if (!files || files.length === 0) return;
    
    this.resetState();
    
    if (files.length === 1) {
      // Single file upload mode
      this.selectedFile = files[0];
      this.currentState = 'selected';
      this.batchFiles = []; // Clear batch files
      this.batchState = 'idle';
    } else {
      // Multiple files - batch upload mode
      this.selectedFile = null; // Clear single file
      this.currentState = 'idle';
      this.batchFiles = Array.from(files).map(file => ({
        file,
        state: 'pending' as const,
        progress: 0
      }));
      this.batchState = 'selected';
    }
  }

  // Single file upload methods
  onUploadSingle(): void {
    if (!this.selectedFile || this.currentState === 'uploading') return;

    this.currentState = 'uploading';
    this.uploadProgress = 0;
    this.errorMessage = null;
    this.isCancelling = false;

    // Create WebSocket connection for upload
    this.uploadService.upload(this.selectedFile).subscribe({
      next: (event: UploadEvent) => {
        if (event.type === 'progress') {
          this.uploadProgress = event.value;
        } else if (event.type === 'success') {
          // Check if this is a cancellation success message
          if (this.isCancelling || (typeof event.value === 'string' && event.value.includes('cancelled'))) {
            // Handle cancellation success
            this.currentState = 'cancelled';
            this.toastService.success('Upload cancelled successfully', 3000);
            this.resetToIdle();
          } else {
            // Handle regular upload success
            this.currentState = 'success';
            // Extract file ID from the API path
            const fileId = event.value.split('/').pop();
            // Generate frontend route URL like batch downloads (not direct API URL)
            this.finalDownloadLink = `${window.location.origin}/download/${fileId}`;
            this.toastService.success('File uploaded successfully!', 3000);
          }
        }
      },
      error: (err) => {
        if (!this.isCancelling) {
          this.currentState = 'error';
          this.errorMessage = err.message || 'Upload failed';
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
            observer.next(message);
          }
        } catch (e) {
          console.error('[HOME] Failed to parse message:', event.data);
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(connectionTimeout); // Clear timeout on error
        console.log(`[DEBUG] ❌ [HOME] WebSocket error occurred:`, error);
        console.log(`[DEBUG] ❌ [HOME] WebSocket readyState during error:`, ws.readyState);
        observer.error({ type: 'error', value: 'Connection failed' });
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeout); // Clear timeout on close
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
        
        if (!event.wasClean) {
          observer.error({ type: 'error', value: 'Connection lost' });
        } else {
          observer.complete();
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
        // Convert ArrayBuffer to base64 string for JSON serialization
        let chunkData;
        if (e.target?.result instanceof ArrayBuffer) {
          const bytes = new Uint8Array(e.target.result);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          chunkData = btoa(binary); // Convert to base64
          console.log(`[DEBUG] 🔄 Converted ArrayBuffer to base64, length:`, chunkData.length);
        } else {
          chunkData = e.target?.result;
        }

        const chunkMessage = {
          bytes: chunkData
        };
        console.log(`[DEBUG] 📤 Chunk message to send:`, {
          hasBytes: !!chunkMessage.bytes,
          bytesType: typeof chunkMessage.bytes,
          bytesConstructor: chunkMessage.bytes?.constructor?.name,
          bytesSize: typeof chunkMessage.bytes === 'string' ? chunkMessage.bytes.length : 'not string'
        });
        const jsonMessage = JSON.stringify(chunkMessage);
        console.log(`[DEBUG] 📤 JSON message length:`, jsonMessage.length);
        console.log(`[DEBUG] 📤 JSON message preview:`, jsonMessage.substring(0, 100));
        ws.send(jsonMessage);
        console.log(`[DEBUG] ✅ Chunk sent successfully, calling next slice`);
        this.sliceAndSend(file, ws, end);
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

  private checkBatchCompletion(batchId: string): void {
    const allFinished = this.batchFiles.every(f => f.state !== 'uploading');
    if (allFinished) {
      const hasErrors = this.batchFiles.some(f => f.state === 'error');
      const successCount = this.batchFiles.filter(f => f.state === 'success').length;
      const totalCount = this.batchFiles.length;
      
      if (hasErrors) {
        this.batchState = 'error';
        this.toastService.warning(`Upload completed with errors: ${successCount}/${totalCount} files succeeded`, 5000);
      } else {
        this.batchState = 'success';
        // Generate proper batch download page link (not direct download)
        this.finalBatchLink = `${window.location.origin}/batch-download/${batchId}`;
        this.toastService.success(`All ${totalCount} files uploaded successfully!`, 3000);
      }
      
      console.log(`[HOME_BATCH] Upload batch completed: ${successCount}/${totalCount} files succeeded, batch_id: ${batchId}`);
    }
  }

  // Utility methods
  resetState(): void {
    this.currentState = 'idle';
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.finalDownloadLink = null;
    this.errorMessage = null;
    this.isCancelling = false;
    this.batchFiles = [];
    this.batchState = 'idle';
    this.finalBatchLink = null;
    
    // Clean up subscriptions
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
      this.uploadSubscription = undefined;
    }
    
    this.batchSubscriptions.forEach(sub => sub.unsubscribe());
    this.batchSubscriptions = [];
    
    if (this.currentWebSocket) {
      this.currentWebSocket.close();
      this.currentWebSocket = undefined;
    }
  }

  startNewUpload(): void {
    this.resetState();
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

  // Premium batch upload cancel methods with smooth UX
  onCancelSingleBatchFile(fileState: IFileState): void {
    if (fileState.state === 'uploading' && fileState.websocket) {
      // Immediate visual feedback
      fileState.state = 'cancelling';
      
      // Show user-friendly message immediately
      this.toastService.info(`Cancelling ${fileState.file.name}...`, 2000);
      
      setTimeout(() => {
        // Close WebSocket connection
        if (fileState.websocket) {
          fileState.websocket.close();
        }
        fileState.state = 'cancelled';
        fileState.error = 'Upload cancelled by user';
        
        // Remove the subscription for this file
        const index = this.batchSubscriptions.findIndex(sub => {
          return !sub.closed;
        });
        if (index !== -1) {
          this.batchSubscriptions[index].unsubscribe();
          this.batchSubscriptions.splice(index, 1);
        }
        
        // Success notification after delay
        setTimeout(() => {
          this.toastService.success(`${fileState.file.name} upload cancelled successfully`, 3000);
        }, 500);
      }, 300);
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

  // Reset batch upload to idle state with smooth transition
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

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  // CTA Button Handler
  onGetStartedClick(): void {
    try {
      // Navigate directly to register page
      this.router.navigate(['/register']);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  // Tab switching for mobile comparison
  switchTab(tab: 'dropbox' | 'google-drive' | 'mfcnextgen'): void {
    this.activeTab = tab;
  }

  // Authentication placeholders (to be implemented when AuthService is available)
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    // this.authService.logout();
    // this.router.navigate(['/']);
  }

  // Upload restriction checks
  canUploadBatch(): boolean {
    return this.isAuthenticated;
  }

  canDownloadZip(): boolean {
    return this.isAuthenticated;
  }

  getUploadLimitMessage(): string {
    if (this.isAuthenticated) {
      return 'Authenticated users can upload files up to 10GB';
    }
    return 'Anonymous users can upload files up to 2GB';
  }

  // Utility methods for template
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetState();
  }
}
