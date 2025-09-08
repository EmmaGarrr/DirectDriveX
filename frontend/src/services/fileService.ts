import { FileMeta, PreviewMeta, MediaInfo } from '@/types/download';

class FileService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1`;

  async getFileMeta(fileId: string): Promise<FileMeta> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}/meta`);
      if (!response.ok) {
      throw new Error('File not found');
      }
      return await response.json();
    } catch (error) {
      console.warn("Backend not available, using mock data:", error);
      // Return mock data when backend is not available
      return this.getMockFileMeta(fileId);
    }
  }

  private getMockFileMeta(fileId: string): FileMeta {
    const mockData: Record<string, FileMeta> = {
      'video-test': {
        file_id: 'video-test',
        filename: 'Sample_Video.mp4',
        size_bytes: 28345678,
        content_type: 'video/mp4',
        created_at: new Date().toISOString()
      },
      'image-test': {
        file_id: 'image-test',
        filename: 'Sample_Image.png',
        size_bytes: 125890,
        content_type: 'image/png',
        created_at: new Date().toISOString()
      },
      'audio-test': {
        file_id: 'audio-test',
        filename: 'Sample_Audio.mp3',
        size_bytes: 45000000,
        content_type: 'audio/mpeg',
        created_at: new Date().toISOString()
      },
      'pdf-test': {
        file_id: 'pdf-test',
        filename: 'Sample_Document.pdf',
        size_bytes: 2345678,
        content_type: 'application/pdf',
        created_at: new Date().toISOString()
      },
      'text-test': {
        file_id: 'text-test',
        filename: 'Sample_Text.txt',
        size_bytes: 12345,
        content_type: 'text/plain',
        created_at: new Date().toISOString()
      }
    };

    // If we have specific mock data, use it
    if (mockData[fileId]) {
      return mockData[fileId];
    }

    // Otherwise, create a generic mock based on fileId
    const contentType = this.guessContentTypeFromFileId(fileId);
    return {
      file_id: fileId,
      filename: `Sample_File_${fileId}.${this.getExtensionFromContentType(contentType)}`,
      size_bytes: Math.floor(Math.random() * 10000000) + 100000,
      content_type: contentType,
      created_at: new Date().toISOString()
    };
  }

  private guessContentTypeFromFileId(fileId: string): string {
    if (!fileId || typeof fileId !== 'string') {
      return 'application/octet-stream';
    }
    
    const id = fileId.toLowerCase();
    if (id.includes('video') || id.includes('mp4') || id.includes('mov')) {
      return 'video/mp4';
    }
    if (id.includes('image') || id.includes('png') || id.includes('jpg')) {
      return 'image/png';
    }
    if (id.includes('audio') || id.includes('mp3') || id.includes('wav')) {
      return 'audio/mpeg';
    }
    if (id.includes('pdf') || id.includes('document')) {
      return 'application/pdf';
    }
    if (id.includes('text') || id.includes('txt')) {
      return 'text/plain';
    }
    return 'application/octet-stream';
  }

  private getExtensionFromContentType(contentType: string): string {
    switch (contentType) {
      case 'video/mp4': return 'mp4';
      case 'image/png': return 'png';
      case 'audio/mpeg': return 'mp3';
      case 'application/pdf': return 'pdf';
      case 'text/plain': return 'txt';
      default: return 'bin';
    }
  }

  private getPreviewTypeFromContentType(contentType: string): 'video' | 'audio' | 'image' | 'document' | 'text' | 'thumbnail' | 'viewer' | 'unknown' {
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('image/')) return 'image';
    if (contentType === 'application/pdf') return 'document';
    if (contentType.startsWith('text/')) return 'text';
    return 'unknown';
  }

  async getPreviewMeta(fileId: string): Promise<PreviewMeta> {
    try {
      const response = await fetch(`${this.API_URL}/preview/meta/${fileId}`);
      if (!response.ok) {
        throw new Error('Preview metadata not found');
      }
      return await response.json();
    } catch (error) {
      console.warn("Backend not available, using mock preview metadata:", error);
      // Return mock preview metadata when backend is not available
      return this.getMockPreviewMeta(fileId);
    }
  }

  private getMockPreviewMeta(fileId: string): PreviewMeta {
    const mockData: Record<string, PreviewMeta> = {
      'video-test': {
        file_id: 'video-test',
        filename: 'Sample_Video.mp4',
        content_type: 'video/mp4',
        preview_available: true,
        preview_type: 'video',
        can_stream: true,
        suggested_action: 'preview',
        size_bytes: 28345678,
        media_info: {
          duration: 120,
          width: 1920,
          height: 1080,
          has_audio: true,
          format: 'MP4',
          bitrate: 2000,
          fps: 30
        }
      },
      'image-test': {
        file_id: 'image-test',
        filename: 'Sample_Image.png',
        content_type: 'image/png',
        preview_available: true,
        preview_type: 'image',
        can_stream: true,
        suggested_action: 'preview',
        size_bytes: 125890,
        media_info: {
          width: 800,
          height: 600,
          format: 'PNG'
        }
      },
      'audio-test': {
        file_id: 'audio-test',
        filename: 'Sample_Audio.mp3',
        content_type: 'audio/mpeg',
        preview_available: true,
        preview_type: 'audio',
        can_stream: true,
        suggested_action: 'preview',
        size_bytes: 45000000,
        media_info: {
          duration: 1800,
          has_audio: true,
          format: 'MP3',
          bitrate: 128,
          sample_rate: 44100,
          channels: 2
        }
      },
      'pdf-test': {
        file_id: 'pdf-test',
        filename: 'Sample_Document.pdf',
        content_type: 'application/pdf',
        preview_available: true,
        preview_type: 'document',
        can_stream: true,
        suggested_action: 'preview',
        size_bytes: 2345678,
        media_info: {
          format: 'PDF'
        }
      },
      'text-test': {
        file_id: 'text-test',
        filename: 'Sample_Text.txt',
        content_type: 'text/plain',
        preview_available: true,
        preview_type: 'text',
        can_stream: true,
        suggested_action: 'preview',
        size_bytes: 12345
      }
    };

    // If we have specific mock data, use it
    if (mockData[fileId]) {
      return mockData[fileId];
    }

    // Otherwise, create a generic mock based on fileId
    const contentType = this.guessContentTypeFromFileId(fileId);
    const previewType = this.getPreviewTypeFromContentType(contentType);
    const previewAvailable = this.isPreviewableContentType(contentType);

    return {
      file_id: fileId,
      filename: `Sample_File_${fileId}.${this.getExtensionFromContentType(contentType)}`,
      content_type: contentType,
      preview_available: previewAvailable,
      preview_type: previewType,
      can_stream: previewAvailable,
      suggested_action: previewAvailable ? 'preview' : 'download',
      size_bytes: Math.floor(Math.random() * 10000000) + 100000,
      message: previewAvailable ? undefined : 'Preview not available for this file type'
    };
  }

  getDownloadUrl(fileId: string): string {
    if (!fileId || typeof fileId !== 'string') {
      return '#';
    }
    return `${this.API_URL}/download/stream/${fileId}`;
  }

  getPreviewStreamUrl(fileId: string): string {
    if (!fileId || typeof fileId !== 'string') {
      return '';
    }
    return `${this.API_URL}/preview/stream/${fileId}`;
  }

  getVideoThumbnailUrl(fileId: string): string {
    return `${this.API_URL}/preview/thumbnail/${fileId}`;
  }

  async getCacheStats(): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/preview/cache/stats`);
      if (!response.ok) {
        throw new Error('Cache stats not available');
      }
      return await response.json();
    } catch (error) {
      console.warn("Error fetching cache stats:", error);
      return null;
    }
  }

  async clearCache(): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/preview/cache/clear`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      return await response.json();
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  }

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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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

export const fileService = new FileService();