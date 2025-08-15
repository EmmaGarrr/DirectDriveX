
// In file: Frontend/src/app/services/upload.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadEvent {
  type: 'progress' | 'success' | 'error';
  value: any;
}

interface InitiateUploadResponse {
  file_id: string;
  gdrive_upload_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl;
  private wsUrl = environment.wsUrl;
  private currentWebSocket?: WebSocket;
  private currentFileId?: string;
  private isCancelling: boolean = false;

  constructor(private http: HttpClient) { }

  public upload(file: File): Observable<UploadEvent> {
    const fileInfo = {
      filename: file.name,
      size: file.size,
      content_type: file.type || 'application/octet-stream'
    };

    return this.initiateUpload(fileInfo).pipe(
      switchMap(response => {
        return new Observable((observer: Observer<UploadEvent>) => {
          const fileId = response.file_id;
          const gdriveUploadUrl = response.gdrive_upload_url;

          // CRITICAL: Store fileId for HTTP cancel requests
          this.currentFileId = fileId;

          // --- THIS IS THE DEFINITIVE FIX (FRONTEND) ---
          // We construct a URL with a query parameter.
          // We use encodeURIComponent ONCE to make the URL safe as a value.
          const finalWsUrl = `${this.wsUrl}/upload_parallel/${fileId}?gdrive_url=${encodeURIComponent(gdriveUploadUrl)}`;
          
          console.log(`[Uploader] Connecting to WebSocket: ${finalWsUrl}`);
          const ws = new WebSocket(finalWsUrl);
          this.currentWebSocket = ws; // Store reference for cancellation
          
          ws.onopen = () => {
            console.log(`[Uploader WS] Connection opened for ${fileId}. Starting file stream.`);
            console.log(`[DEBUG] 🔌 WebSocket opened successfully`);
            console.log(`[DEBUG] 🔌 WebSocket readyState:`, ws.readyState);
            console.log(`[DEBUG] 🔌 WebSocket URL:`, ws.url);
            console.log(`[DEBUG] 🔌 WebSocket protocol:`, ws.protocol);
            console.log(`[DEBUG] 🔌 WebSocket extensions:`, ws.extensions);
            this.sliceAndSend(file, ws);
          };

          ws.onmessage = (event) => {
            console.log(`[DEBUG] 📨 WebSocket message received:`, {
              data: event.data,
              type: event.type,
              origin: event.origin,
              lastEventId: event.lastEventId
            });
            
            try {
              const message: any = JSON.parse(event.data);
              
              if (message.type === 'progress' || message.type === 'success' || message.type === 'error') {
                 observer.next(message as UploadEvent);
              }
              // Note: cancel_ack removed - now using superior HTTP cancel protocol
            } catch (e) {
              console.error('[Uploader WS] Failed to parse message from server:', event.data);
            }
          };

          ws.onerror = (error) => {
            console.error('[Uploader WS] Error:', error);
            console.log(`[DEBUG] ❌ WebSocket error occurred:`, error);
            console.log(`[DEBUG] ❌ WebSocket readyState during error:`, ws.readyState);
            this.currentWebSocket = undefined;
            this.currentFileId = undefined; // Clear file ID on error
            observer.error({ type: 'error', value: 'Connection to server failed.' });
          };

          ws.onclose = (event) => {
            console.log(`[DEBUG] 🔌 WebSocket closed:`, {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
              readyState: ws.readyState
            });
            console.log(`[DEBUG] 🔌 Close codes: NORMAL=1000, GOING_AWAY=1001, ABNORMAL_CLOSURE=1006`);
            
            if (event.code === 1006) {
              console.log(`[DEBUG] ❌ ABNORMAL_CLOSURE detected - connection was closed unexpectedly`);
            }
            
            this.currentWebSocket = undefined;
            this.currentFileId = undefined; // Clear file ID on close
            
            if (this.isCancelling) {
              // User initiated cancellation - show success message
              this.isCancelling = false;
              observer.next({ type: 'success', value: 'Upload cancelled successfully' });
              observer.complete();
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
            this.currentWebSocket = undefined;
            this.currentFileId = undefined; // Clear file ID on cleanup
          };
        });
      }),
      catchError(error => {
        console.error('[Uploader] Upload failed:', error);
        this.currentWebSocket = undefined;
        this.currentFileId = undefined; // Clear file ID on error
        return throwError(() => ({ type: 'error', value: 'Upload failed. Please try again.' }));
      })
    );
  }

  /**
   * Cancel current upload using superior HTTP-based out-of-band protocol
   */
  cancelUpload(): boolean {
    if (!this.currentFileId) {
      console.warn('[Uploader] No active upload to cancel');
      return false;
    }

    console.log(`[Uploader] Sending HTTP cancel request for file: ${this.currentFileId}`);
    this.isCancelling = true; // Mark as cancelling for proper UI feedback
    
    // Send HTTP POST to cancel endpoint
    this.http.post(`${this.apiUrl}/api/v1/upload/cancel/${this.currentFileId}`, {})
      .subscribe({
        next: (response: any) => {
          console.log(`[Uploader] Upload cancelled successfully:`, response);
          // Close WebSocket after successful HTTP cancel
          if (this.currentWebSocket) {
            this.currentWebSocket.close();
            this.currentWebSocket = undefined;
          }
          this.currentFileId = undefined;
        },
        error: (error) => {
          console.error(`[Uploader] HTTP cancel request failed:`, error);
          // Fallback: force close WebSocket if HTTP cancel fails
          if (this.currentWebSocket) {
            this.currentWebSocket.close();
            this.currentWebSocket = undefined;
          }
          this.currentFileId = undefined;
        }
      });
    
    return true;
  }

  public initiateUpload(fileInfo: { filename: string; size: number; content_type: string; }): Observable<InitiateUploadResponse> {
    return this.http.post<InitiateUploadResponse>(`${this.apiUrl}/api/v1/upload/initiate`, fileInfo);
  }

  private sliceAndSend(file: File, ws: WebSocket, start: number = 0): void {
    const CHUNK_SIZE = 16 * 1024 * 1024; // 16MB chunks for optimal performance
    console.log(`[DEBUG] 🔪 sliceAndSend called - start: ${start}, file size: ${file.size}`);
    console.log(`[DEBUG] 📏 CHUNK_SIZE: ${CHUNK_SIZE} bytes (16 MB)`);
    
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
}