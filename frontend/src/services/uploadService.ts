import { Observable } from '@/lib/observable';

export interface UploadEvent {
  type: 'progress' | 'success' | 'error';
  value: number | string;
}

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

export interface InitiateUploadRequest {
  filename: string;
  size: number;
  content_type: string;
}

export interface InitiateUploadResponse {
  file_id: string;
  gdrive_upload_url: string;
}

export class UploadService {
  private apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  private wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws_api';
  private currentWebSocket?: WebSocket;

  private isAuthenticated(): boolean {
    try {
      return !!localStorage.getItem('access_token');
    } catch {
      return false;
    }
  }

  private getFileSizeLimits() {
    const isAuth = this.isAuthenticated();
    return {
      singleFile: isAuth ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024, // 5GB or 2GB
      daily: isAuth ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024
    };
  }

  validateFileSize(fileSize: number): { valid: boolean; error?: string } {
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

  async getQuotaInfo(): Promise<QuotaInfo | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/upload/quota-info`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data && typeof data === 'object') {
        // Check if it's an error message
        if (data.message) {
          console.warn('Quota API returned message:', data.message);
          return null;
        }
        // Check if it's valid quota data
        else if (typeof data.current_usage_gb === 'number' && 
                 typeof data.daily_limit_gb === 'number' && 
                 typeof data.remaining_gb === 'number' && 
                 typeof data.usage_percentage === 'number') {
          return data as QuotaInfo;
        }
      }
      
      console.warn('Invalid quota data format:', data);
      return null;
      
    } catch (error) {
      console.error("API call to getQuotaInfo failed:", error);
      if (process.env.NODE_ENV === 'development') {
        console.warn("Serving mock quota data because API is unavailable.");
        return {
          daily_limit_bytes: 2147483648,
          daily_limit_gb: 2,
          current_usage_bytes: 536870912,
          current_usage_gb: 0.5,
          remaining_bytes: 1610612736,
          remaining_gb: 1.5,
          usage_percentage: 25,
          user_type: 'anonymous',
        };
      }
      return null;
    }
  }

  async initiateUpload(fileInfo: InitiateUploadRequest): Promise<InitiateUploadResponse> {
    const validation = this.validateFileSize(fileInfo.size);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const response = await fetch(`${this.apiUrl}/api/v1/upload/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileInfo)
    });

    if (!response.ok) throw new Error(`Upload initiation failed: ${response.status}`);
    return response.json();
  }

  upload(file: File): Observable<UploadEvent> {
    return new Observable(observer => {
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

      this.initiateUpload(fileInfo).then(response => {
        const wsUrl = `${this.wsUrl}/upload_parallel/${response.file_id}?gdrive_url=${encodeURIComponent(response.gdrive_upload_url)}`;
        
        this.currentWebSocket = new WebSocket(wsUrl);
        
        this.currentWebSocket.onopen = () => {
          this.sliceAndSend(file, this.currentWebSocket!);
        };
        
        this.currentWebSocket.onmessage = (event) => {
          try {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.type === 'progress') {
              observer.next({ type: 'progress', value: jsonMessage.value });
            } else if (jsonMessage.type === 'success') {
              observer.next({ type: 'success', value: jsonMessage.value });
              observer.complete();
            } else if (jsonMessage.type === 'error') {
              observer.error(new Error(jsonMessage.value));
            }
          } catch (parseError) {
            // Fallback string parsing
            const message = event.data;
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
        
        this.currentWebSocket.onerror = () => {
          observer.error(new Error('WebSocket connection failed'));
        };
        
      }).catch(error => observer.error(error));
    });
  }

  cancelUpload(): boolean {
    if (this.currentWebSocket && this.currentWebSocket.readyState === WebSocket.OPEN) {
      this.currentWebSocket.close();
      this.currentWebSocket = undefined;
      return true;
    }
    return false;
  }

  private sliceAndSend(file: File, ws: WebSocket, start: number = 0): void {
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
    
    if (start >= file.size) {
      ws.send("DONE");
      return;
    }

    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(e.target.result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        
        ws.send(JSON.stringify({ bytes: base64Data }));
        
        setTimeout(() => {
          this.sliceAndSend(file, ws, end);
        }, 100);
      }
    };
    
    reader.readAsArrayBuffer(chunk);
  }
}