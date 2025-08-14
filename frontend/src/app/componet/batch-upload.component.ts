// CORRECTED File: src/app/componet/batch-upload.component.ts

import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, forkJoin, Observable, Observer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BatchUploadService, IBatchFileInfo } from '../shared/services/batch-upload.service';
import { UploadEvent } from '../shared/services/upload.service';
import { environment } from '../../environments/environment';

interface IFileState {
  file: File;
  fileId?: string; // Store file ID for HTTP cancel requests
  state: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  websocket?: WebSocket;
}
type BatchUploadState = 'idle' | 'processing' | 'success' | 'error' | 'cancelled';

@Component({
  selector: 'app-batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.css']
})
export class BatchUploadComponent implements OnDestroy {
  public files: IFileState[] = [];
  public batchState: BatchUploadState = 'idle';
  public finalBatchLink: string | null = null;
  private subscriptions: Subscription[] = [];
  public isCancelling: boolean = false;
  private wsUrl = environment.wsUrl;
  private apiUrl = environment.apiUrl;
  public isDragOver = false;

  // Math reference for template
  public Math = Math;

  // --- V V V --- ADD THIS GETTER --- V V V ---
  /**
   * A helper property to check if all files have finished uploading (or failed).
   * This keeps complex logic out of the HTML template.
   */
  public get isUploadFinished(): boolean {
    if (this.files.length === 0) return true;
    return this.files.every(f => f.state !== 'uploading');
  }

  /**
   * Helper property to check if upload can be cancelled
   */
  public get canCancelUpload(): boolean {
    return this.batchState === 'processing' && !this.isCancelling &&
           this.files.some(f => f.state === 'uploading');
  }
  // --- ^ ^ ^ --- END OF ADDITION --- ^ ^ ^ ---

  constructor(
    private batchUploadService: BatchUploadService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  onFilesSelected(event: any): void {
    const selectedFiles = (event.target as HTMLInputElement).files;
    if (selectedFiles && selectedFiles.length > 0) {
      this.reset();
      this.files = Array.from(selectedFiles).map(file => ({
        file, state: 'pending', progress: 0
      }));
    }
  }

  onUploadBatch(): void {
    if (this.files.length === 0) return;
    this.batchState = 'processing';
    const batchFileInfos: IBatchFileInfo[] = this.files.map(fs => ({
      filename: fs.file.name,
      size: fs.file.size,
      content_type: fs.file.type || 'application/octet-stream'
    }));

    const sub = this.batchUploadService.initiateBatch(batchFileInfos).subscribe({
      next: (response) => {
        const uploadObservables = response.files.map(fileInfo => {
          const fileState = this.files.find(fs => fs.file.name === fileInfo.original_filename);
          if (!fileState) return new Observable<null>(sub => sub.complete());

          fileState.state = 'uploading';
          // Replicate the WebSocket logic from UploadService here, using pre-fetched details
          return this.createIndividualUploadObservable(fileState, fileInfo.file_id, fileInfo.gdrive_upload_url);
        });

        const uploadSub = forkJoin(uploadObservables).subscribe(() => {
          this.checkBatchCompletion(response.batch_id);
        });
        this.subscriptions.push(uploadSub);
      },
      error: (err) => {
        this.batchState = 'error';
        this.snackBar.open(err.error?.detail || 'Failed to initiate batch upload.', 'Close', { duration: 5000 });
      }
    });
    this.subscriptions.push(sub);
  }

  onCancelUpload(): void {
    if (this.batchState !== 'processing' || this.isCancelling) return;
    
    console.log('[FRONTEND_UPLOAD] User initiated batch upload cancellation');
    this.isCancelling = true;
    
    let httpCancelRequestsSent = 0;
    let totalActiveUploads = 0;
    
    // Send HTTP cancel requests to all active uploads
    this.files.forEach(fileState => {
      if (fileState.fileId && fileState.state === 'uploading') {
        totalActiveUploads++;
        console.log(`[FRONTEND_UPLOAD] Sending HTTP cancel request for file: ${fileState.file.name} (${fileState.fileId})`);
        
        // Send HTTP POST to cancel endpoint (superior protocol)
        this.http.post(`${this.apiUrl}/api/v1/upload/cancel/${fileState.fileId}`, {})
          .subscribe({
            next: (response: any) => {
              console.log(`[FRONTEND_UPLOAD] HTTP cancel successful for file: ${fileState.file.name}`, response);
              // Close WebSocket after successful HTTP cancel
              if (fileState.websocket) {
                fileState.websocket.close();
                fileState.websocket = undefined;
              }
              fileState.state = 'cancelled';
              fileState.error = 'Upload cancelled by user';
              this.checkCancelCompletion();
            },
            error: (error) => {
              console.error(`[FRONTEND_UPLOAD] HTTP cancel failed for file: ${fileState.file.name}`, error);
              // Fallback: force close WebSocket if HTTP cancel fails
              if (fileState.websocket) {
                fileState.websocket.close();
                fileState.websocket = undefined;
              }
              fileState.state = 'cancelled';
              fileState.error = 'Upload cancelled (HTTP error)';
              this.checkCancelCompletion();
            }
          });
        
        httpCancelRequestsSent++;
      }
    });
    
    console.log(`[FRONTEND_UPLOAD] HTTP cancel requests sent | Active uploads: ${totalActiveUploads} | HTTP requests sent: ${httpCancelRequestsSent}`);
    
    // Set timeout in case HTTP cancel requests don't complete
    setTimeout(() => {
      if (this.isCancelling) {
        console.log('[FRONTEND_UPLOAD] Cancel timeout - forcing batch cancellation');
        this.forceCancel();
      }
    }, 10000); // 10 second timeout
    
    // Show immediate feedback to user
    this.snackBar.open(`Cancelling uploads... (${httpCancelRequestsSent} HTTP requests sent)`, 'Close', { duration: 3000 });
  }
  
  private forceCancel(): void {
    console.log('[FRONTEND_UPLOAD] Force cancelling all uploads');
    this.batchState = 'cancelled';
    
    let forceCancelledCount = 0;
    
    // Force close all active WebSocket connections
    this.files.forEach(fileState => {
      if (fileState.websocket && fileState.state === 'uploading') {
        try {
          fileState.websocket.close();
          fileState.state = 'cancelled';
          fileState.error = 'Upload cancelled (timeout)';
          forceCancelledCount++;
        } catch (error) {
          console.error(`[FRONTEND_UPLOAD] Error force closing WebSocket for file: ${fileState.file.name}`, error);
          fileState.state = 'cancelled';
          fileState.error = 'Upload cancelled (force close error)';
        }
      }
    });
    
    // Unsubscribe from all observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    this.snackBar.open(`Upload cancelled (timeout) - ${forceCancelledCount} files`, 'Close', { duration: 3000 });
    this.isCancelling = false;
  }

  private createIndividualUploadObservable(fileState: IFileState, fileId: string, gdriveUploadUrl: string): Observable<UploadEvent | null> {
    return new Observable((observer: Observer<UploadEvent | null>) => {
      const finalWsUrl = `${this.wsUrl}/upload_parallel/${fileId}?gdrive_url=${encodeURIComponent(gdriveUploadUrl)}`;
      
      // Store fileId for HTTP cancel requests
      fileState.fileId = fileId;
      
      // Enhanced logging for connection attempts
      console.log(`[FRONTEND_UPLOAD] File: ${fileState.file.name} (${fileId}) | Attempting WebSocket connection to: ${finalWsUrl}`);
      
      const ws = new WebSocket(finalWsUrl);
      
      // Comprehensive WebSocket debugging
      ws.onopen = () => {
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket opened successfully`);
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket readyState:`, ws.readyState);
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket URL:`, ws.url);
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket protocol:`, ws.protocol);
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket extensions:`, ws.extensions);
        this.sliceAndSend(fileState.file, ws);
      };
      
      ws.onmessage = (event) => {
        console.log(`[DEBUG] 📨 [BATCH] WebSocket message received:`, {
          data: event.data,
          type: event.type,
          origin: event.origin,
          lastEventId: event.lastEventId
        });
        
        try {
          const message: any = JSON.parse(event.data);
          if (message.type === 'progress') {
            fileState.progress = message.value;
            // Log major progress milestones
            if (message.value % 25 === 0) {
              console.log(`[FRONTEND_UPLOAD] File: ${fileState.file.name} (${fileId}) | Progress: ${message.value}%`);
            }
            observer.next(message);
          } else if (message.type === 'success') {
            console.log(`[FRONTEND_UPLOAD] File: ${fileState.file.name} (${fileId}) | Upload completed successfully`);
            fileState.state = 'success';
            fileState.progress = 100;
            observer.next(message as UploadEvent);
            observer.complete();
          } else if (message.type === 'cancel_ack') {
            // Backend acknowledged cancellation
            console.log(`[FRONTEND_UPLOAD] File: ${fileState.file.name} (${fileId}) | Cancel acknowledged by backend: ${message.message || 'Cancelled'}`);
            fileState.state = 'cancelled';
            fileState.error = 'Upload cancelled by user';
            
            // Check if all uploads are now cancelled to update batch state
            this.checkCancelCompletion();
            
            observer.next(null);
            observer.complete();
          } else if (message.type === 'error') {
            console.error(`[FRONTEND_UPLOAD] File: ${fileState.file.name} (${fileId}) | Server error: ${message.value}`);
            fileState.state = 'error';
            fileState.error = `Server error: ${message.value}`;
            observer.next(null);
            observer.complete();
          }
        } catch (e) {
          console.error('[BATCH] Failed to parse message:', event.data);
        }
      };
      
      ws.onerror = (error) => {
        console.log(`[DEBUG] ❌ [BATCH] WebSocket error occurred:`, error);
        console.log(`[DEBUG] ❌ [BATCH] WebSocket readyState during error:`, ws.readyState);
        observer.error({ type: 'error', value: 'Connection failed' });
      };
      
      ws.onclose = (event) => {
        console.log(`[DEBUG] 🔌 [BATCH] WebSocket closed:`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          readyState: ws.readyState
        });
        console.log(`[DEBUG] 🔌 [BATCH] Close codes: NORMAL=1000, GOING_AWAY=1001, ABNORMAL_CLOSURE=1006`);
        
        if (event.code === 1006) {
          console.log(`[DEBUG] ❌ [BATCH] ABNORMAL_CLOSURE detected - connection was closed unexpectedly`);
        }
        
        if (!event.wasClean) {
          observer.error({ type: 'error', value: 'Connection lost' });
        } else {
          observer.complete();
        }
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        // Clean up WebSocket reference
        if (fileState.websocket === ws) {
          fileState.websocket = undefined;
        }
      };
    });
  }

  private sliceAndSend(file: File, ws: WebSocket, start: number = 0): void {
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB - reduced from 16MB to avoid WebSocket message size limits
    console.log(`[DEBUG] 🔪 sliceAndSend called - start: ${start}, file size: ${file.size}`);
    console.log(`[DEBUG] 📏 CHUNK_SIZE: ${CHUNK_SIZE} bytes (4 MB)`);
    
    if (start >= file.size) {
      console.log(`[DEBUG] ✅ File upload complete, sending DONE message`);
      ws.send("DONE");
      return;
    }

    const end = Math.min(start + CHUNK_SIZE, file.size);
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
    const allFinished = this.files.every(fs => fs.state === 'success' || fs.state === 'error');
    if (!allFinished) return;

    const anyFailed = this.files.some(fs => fs.state === 'error');
    if (anyFailed) {
        this.batchState = 'error';
        this.snackBar.open('Some files failed to upload.', 'Close', { duration: 5000 });
    } else {
        this.batchState = 'success';
        this.finalBatchLink = `${window.location.origin}/batch-download/${batchId}`;
        this.snackBar.open('Batch upload complete!', 'Close', { duration: 3000 });
    }
  }
  
  private checkCancelCompletion(): void {
    // Check if all uploads that were being cancelled are now cancelled
    const allUploadingOrCancelled = this.files.every(fs => 
      fs.state === 'success' || fs.state === 'error' || fs.state === 'cancelled' || fs.state === 'pending'
    );
    
    const anyCancelled = this.files.some(fs => fs.state === 'cancelled');
    
    if (allUploadingOrCancelled && anyCancelled && this.isCancelling) {
      console.log('[FRONTEND_UPLOAD] All cancel acknowledgments received - batch cancellation complete');
      this.batchState = 'cancelled';
      this.isCancelling = false;
      
      const cancelledCount = this.files.filter(fs => fs.state === 'cancelled').length;
      
      // Unsubscribe from all observables
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      
      this.snackBar.open(`Upload cancelled successfully (${cancelledCount} files)`, 'Close', { duration: 3000 });
    }
  }

  reset(): void {
    this.files = [];
    this.batchState = 'idle';
    this.finalBatchLink = null;
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open('Batch link copied to clipboard!', 'Close', { duration: 2000 });
    });
  }

  openDownloadLink(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent) {
      event.preventDefault();
      this.isDragOver = false;
      if (this.batchState === 'idle' && event.dataTransfer?.files.length) {
          this.reset();
          this.files = Array.from(event.dataTransfer.files).map(file => ({
            file, state: 'pending', progress: 0
          }));
      }
  }

  ngOnDestroy(): void {
    this.reset();
  }
}