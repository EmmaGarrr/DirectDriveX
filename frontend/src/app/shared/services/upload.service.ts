
// CORRECTED and FINAL File: src/app/shared/services/upload.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- INTERFACES FOR UPLOAD INITIATION ---
// These match the Pydantic models in the backend's `models/file.py`
export interface InitiateUploadRequest {
  filename: string;
  size: number;
  content_type: string;
}

export interface InitiateUploadResponse {
  file_id: string;
  gdrive_upload_url: string;
}

// --- INTERFACES FOR UPLOAD EVENTS ---
export interface UploadEvent {
  type: 'progress' | 'success' | 'error';
  value: number | string;
}

// --- INTERFACES FOR QUOTA INFO ---
export interface QuotaInfo {
  daily_limit_bytes: number;
  daily_limit_gb: number;
  current_usage_bytes: number;
  current_usage_gb: number;
  remaining_bytes: number;
  remaining_gb: number;
  usage_percentage: number;
  user_type: 'authenticated' | 'anonymous';
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl
  private wsUrl = environment.wsUrl
  private currentWebSocket?: WebSocket

  constructor(private http: HttpClient) { }

  // --- NEW: Check if user is authenticated ---
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // --- NEW: Get file size limits based on authentication ---
  private getFileSizeLimits(): { singleFile: number; daily: number } {
    const isAuth = this.isAuthenticated();
    return {
      singleFile: isAuth ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024, // 5GB or 2GB
      daily: isAuth ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024 // 5GB or 2GB
    };
  }

  // --- NEW: Validate file size before upload ---
  private validateFileSize(fileSize: number): { valid: boolean; error?: string } {
    const limits = this.getFileSizeLimits();
    const isAuth = this.isAuthenticated();
    const limitText = isAuth ? '5GB' : '2GB';

    if (fileSize > limits.singleFile) {
      return {
        valid: false,
        error: `File size exceeds ${limitText} limit for ${isAuth ? 'authenticated' : 'anonymous'} users`
      };
    }

    return { valid: true };
  }

  // --- NEW: Get quota information ---
  public getQuotaInfo(): Observable<QuotaInfo> {
    return this.http.get<QuotaInfo>(`${this.apiUrl}/api/v1/upload/quota-info`);
  }

  public initiateUpload(fileInfo: { filename: string; size: number; content_type: string; }): Observable<InitiateUploadResponse> {
    // --- NEW: Client-side validation before sending to backend ---
    const validation = this.validateFileSize(fileInfo.size);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    return this.http.post<InitiateUploadResponse>(`${this.apiUrl}/api/v1/upload/initiate`, fileInfo);
  }

  public upload(file: File): Observable<UploadEvent> {
    return new Observable(observer => {
      // --- NEW: Validate file size before initiating upload ---
      const validation = this.validateFileSize(file.size);
      if (!validation.valid) {
        observer.error(new Error(validation.error));
        return;
      }

      const fileInfo: InitiateUploadRequest = {
        filename: file.name,
        size: file.size,
        content_type: file.type || 'application/octet-stream'
      };

      this.initiateUpload(fileInfo).subscribe({
        next: (response) => {
          const wsUrl = `${this.wsUrl}/upload_parallel/${response.file_id}?gdrive_url=${encodeURIComponent(response.gdrive_upload_url)}`;
          
          console.log(`[UPLOAD_SERVICE] Connecting to WebSocket: ${wsUrl}`);
          this.currentWebSocket = new WebSocket(wsUrl);
          
          this.currentWebSocket.onopen = () => {
            console.log(`[UPLOAD_SERVICE] WebSocket opened successfully`);
            this.sliceAndSend(file, this.currentWebSocket!);
          };
          
          this.currentWebSocket.onmessage = (event) => {
            const message = event.data;
            console.log(`[UPLOAD_SERVICE] Received message: ${message}`);
            
            try {
              // Try to parse as JSON first (backend sends JSON format)
              const jsonMessage = JSON.parse(message);
              console.log(`[UPLOAD_SERVICE] Parsed JSON message:`, jsonMessage);
              
              if (jsonMessage.type === 'progress') {
                observer.next({ type: 'progress', value: jsonMessage.value });
              } else if (jsonMessage.type === 'success') {
                observer.next({ type: 'success', value: jsonMessage.value });
                observer.complete();
              } else if (jsonMessage.type === 'error') {
                observer.error(new Error(jsonMessage.value));
              }
            } catch (parseError) {
              // Fallback to string parsing for backward compatibility
              console.log(`[UPLOAD_SERVICE] JSON parse failed, trying string format: ${parseError}`);
              
              if (message.startsWith('PROGRESS:')) {
                const progress = parseInt(message.split(':')[1]);
                observer.next({ type: 'progress', value: progress });
              } else if (message.startsWith('SUCCESS:')) {
                const fileId = message.split(':')[1];
                observer.next({ type: 'success', value: fileId });
                observer.complete();
              } else if (message.startsWith('ERROR:')) {
                const error = message.split(':')[1];
                observer.error(new Error(error));
              }
            }
          };
          
          this.currentWebSocket.onerror = (error) => {
            console.error(`[UPLOAD_SERVICE] WebSocket error:`, error);
            observer.error(new Error('WebSocket connection failed'));
          };
          
          this.currentWebSocket.onclose = () => {
            console.log(`[UPLOAD_SERVICE] WebSocket closed`);
          };
        },
        error: (error) => {
          console.error(`[UPLOAD_SERVICE] Upload initiation failed:`, error);
          observer.error(error);
        }
      });
    });
  }

  public cancelUpload(): boolean {
    if (this.currentWebSocket && this.currentWebSocket.readyState === WebSocket.OPEN) {
      this.currentWebSocket.close();
      this.currentWebSocket = undefined;
      return true;
    }
    return false;
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
      if (e.target && e.target.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        console.log(`[DEBUG] 📤 Sending chunk of size ${arrayBuffer.byteLength} bytes`);
        
        // Convert ArrayBuffer to base64 and send as JSON
        const bytes = new Uint8Array(arrayBuffer);
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
        
        // Send next chunk
        setTimeout(() => {
          this.sliceAndSend(file, ws, end);
        }, 100); // Small delay to prevent overwhelming the WebSocket
      }
    };
    
    reader.onerror = (error) => {
      console.error(`[DEBUG] ❌ FileReader error:`, error);
      ws.send(JSON.stringify({ error: "File reading failed" }));
    };
    
    reader.readAsArrayBuffer(chunk);
  }
}