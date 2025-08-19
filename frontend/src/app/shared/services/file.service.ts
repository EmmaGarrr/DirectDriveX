// src/app/shared/services/file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// --- NEW: Preview metadata interface ---
export interface MediaInfo {
  duration?: number;
  width?: number;
  height?: number;
  has_audio?: boolean;
  format?: string;
  bitrate?: number;
  fps?: number;
  sample_rate?: number;
  channels?: number;
}

export interface StreamingUrls {
  full: string;
  preview: string;
}

export interface PreviewMetadata {
  file_id: string;
  filename: string;
  content_type: string;
  preview_available: boolean;
  preview_type: string;
  message?: string;
  can_stream: boolean;
  suggested_action: string;
  preview_url?: string;
  // Legacy fields for backward compatibility
  size_bytes?: number;
  media_info?: MediaInfo;
  streaming_urls?: StreamingUrls;
  preview_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  // Construct the specific API path for files - EXACT same as BatchUploadService
  private fileApiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  getFileMeta(id: string): Observable<any> {
    return this.http.get<any>(`${this.fileApiUrl}/files/${id}/meta`);
  }

  getStreamUrl(id: string): string {
    const url = `${environment.apiUrl}/api/v1/download/stream/${id}`;
    console.log('[FILE_SERVICE] Using apiUrl:', environment.apiUrl);
    console.log('[FILE_SERVICE] Generated download URL:', url);
    return url;
  }

  getUserFiles(): Observable<any> {
    return this.http.get<any[]>(`${this.fileApiUrl}/files/me/history`);
  }

  // --- NEW: Preview metadata method ---
  getPreviewMetadata(id: string): Observable<PreviewMetadata> {
    return this.http.get<PreviewMetadata>(`${this.fileApiUrl}/preview/meta/${id}`);
  }

  // --- NEW: Preview stream URL method ---
  getPreviewStreamUrl(id: string): Observable<string> {
    return this.http.get<any>(`${this.fileApiUrl}/preview/stream/${id}`).pipe(
      map(response => response.stream_url),
      catchError(error => {
        console.error('Error getting stream URL:', error);
        return throwError(() => error);
      })
    );
  }

  // --- NEW: Video thumbnail URL method ---
  getVideoThumbnailUrl(id: string): string {
    const url = `${environment.apiUrl}/api/v1/preview/thumbnail/${id}`;
    console.log('[FILE_SERVICE] Generated thumbnail URL:', url);
    return url;
  }

  // --- NEW: Cache statistics method ---
  getCacheStats(): Observable<any> {
    return this.http.get<any>(`${this.fileApiUrl}/preview/cache/stats`);
  }

  // --- NEW: Clear cache method ---
  clearCache(): Observable<any> {
    return this.http.delete<any>(`${this.fileApiUrl}/preview/cache/clear`);
  }

  // --- NEW: Check if content type is previewable ---
  isPreviewableContentType(contentType: string): boolean {
    const previewableTypes = [
      // Video formats
      'video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime',
      // Audio formats
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac',
      // Image formats
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Document formats
      'application/pdf',
      // Text formats
      'text/plain', 'application/json', 'text/xml', 'text/css',
      'text/javascript', 'text/python', 'text/html'
    ];
    
    return previewableTypes.includes(contentType.toLowerCase());
  }

  // --- NEW: Get preview type from content type ---
  getPreviewType(contentType: string): string {
    const contentTypeLower = contentType.toLowerCase();
    
    if (contentTypeLower.startsWith('video/')) {
      return 'video';
    } else if (contentTypeLower.startsWith('audio/')) {
      return 'audio';
    } else if (contentTypeLower.startsWith('image/')) {
      return 'image';
    } else if (contentTypeLower === 'application/pdf') {
      return 'document';
    } else if (contentTypeLower.startsWith('text/') || contentTypeLower === 'application/json') {
      return 'text';
    } else {
      return 'unknown';
    }
  }

  // --- NEW: Get formatted file size ---
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- NEW: Get formatted duration for media files ---
  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
}