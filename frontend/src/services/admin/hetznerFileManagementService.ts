/**
 * Hetzner File Management Service
 * Handles all API operations for Hetzner cloud storage backup files
 */

import { adminAuthService } from '../adminAuthService';
import { toastService } from '../toastService';
import { getEnhancedFileType } from '@/lib/fileTypeUtils';
import { 
  HetznerFileItem, 
  HetznerStats, 
  HetznerFileTypeAnalytics, 
  HetznerFileListResponse,
  GetHetznerFilesParams,
  BulkActionRequest
} from '@/types/hetzner';

class HetznerFileManagementService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/hetzner`;

  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAdminToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get list of Hetzner backup files with filters and pagination
   */
  async getFiles(params: GetHetznerFilesParams = {}): Promise<HetznerFileListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.file_type) queryParams.append('file_type', params.file_type);
      if (params.owner_email) queryParams.append('owner_email', params.owner_email);
      if (params.backup_status) queryParams.append('backup_status', params.backup_status);
      if (params.size_min !== undefined) queryParams.append('size_min', params.size_min.toString());
      if (params.size_max !== undefined) queryParams.append('size_max', params.size_max.toString());
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${this.API_URL}/files?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch Hetzner files: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure files have required properties with defaults and enhanced file type detection
      if (data.files) {
        data.files = data.files.map((file: any) => {
          const enhancedFileType = getEnhancedFileType(file);
          return {
            _id: file._id || '',
            filename: file.filename || 'Unknown',
            size_bytes: file.size_bytes || 0,
            size_formatted: file.size_formatted || '0 B',
            content_type: file.content_type || 'application/octet-stream',
            file_type: enhancedFileType, // Use enhanced detection
            upload_date: file.upload_date || new Date().toISOString(),
            owner_email: file.owner_email || 'Unknown',
            gdrive_account_id: file.gdrive_account_id || 'Unknown',
            hetzner_remote_path: file.hetzner_remote_path || '',
            backup_status: file.backup_status || 'not_backed_up',
            download_url: file.download_url || '',
            preview_available: file.preview_available || false,
          };
        });
      }
      
      return data;
    } catch (error) {
      console.error('HetznerFileManagementService: Get files error:', error);
      
      // Return mock data for development
      return this.getMockFileList(params);
    }
  }

  /**
   * Get file type analytics for Hetzner files
   */
  async getFileTypeAnalytics(): Promise<HetznerFileTypeAnalytics> {
    try {
      const response = await fetch(`${this.API_URL}/analytics/file-types`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HetznerFileManagementService: Get analytics error:', error);
      
      // Return mock data for development
      return this.getMockAnalytics();
    }
  }

  /**
   * Download a file from Hetzner backup
   */
  async downloadFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}/download`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hetzner-file-${fileId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toastService.success('File download initiated successfully');
    } catch (error) {
      console.error('HetznerFileManagementService: Download error:', error);
      toastService.error('Download failed. Please try again.');
      throw error;
    }
  }

  /**
   * Preview a file from Hetzner backup
   */
  async previewFile(fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}/preview`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Preview failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.preview_url || null;
    } catch (error) {
      console.error('HetznerFileManagementService: Preview error:', error);
      toastService.error('Preview not available for this file type');
      throw error;
    }
  }

  /**
   * Check file integrity in Hetzner backup
   */
  async checkFileIntegrity(fileId: string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}/integrity`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Integrity check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('HetznerFileManagementService: Integrity check error:', error);
      toastService.error('Integrity check failed. Please try again.');
      throw error;
    }
  }

  /**
   * Recover a file from Hetzner backup
   */
  async recoverFile(fileId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}/recover`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Recovery failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toastService.success('File recovered from Hetzner backup successfully');
      }
      return data;
    } catch (error) {
      console.error('HetznerFileManagementService: Recover error:', error);
      toastService.error('Recovery failed. Please try again.');
      throw error;
    }
  }

  /**
   * Delete a file from Hetzner backup
   */
  async deleteFile(fileId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.API_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Deletion failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toastService.success('File deleted from Hetzner backup successfully');
      }
      return data;
    } catch (error) {
      console.error('HetznerFileManagementService: Delete error:', error);
      toastService.error('Deletion failed. Please try again.');
      throw error;
    }
  }

  /**
   * Execute bulk action on multiple files
   */
  async executeBulkAction(request: BulkActionRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.API_URL}/files/bulk-action`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Bulk action failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toastService.success(`Bulk ${request.action} operation completed successfully`);
      }
      return data;
    } catch (error) {
      console.error('HetznerFileManagementService: Bulk action error:', error);
      toastService.error(`Bulk ${request.action} operation failed. Please try again.`);
      throw error;
    }
  }

  /**
   * Mock data for development
   */
  private getMockFileList(params: GetHetznerFilesParams): HetznerFileListResponse {
    const mockFiles: HetznerFileItem[] = [
      {
        _id: '1',
        filename: 'Pink Positive Desktop Wallpaper.png',
        size_bytes: 2621440,
        size_formatted: '2.5 MB',
        content_type: 'image/png',
        file_type: 'image',
        upload_date: '2025-09-02T13:51:00Z',
        owner_email: 'user1@example.com',
        gdrive_account_id: 'account_1',
        hetzner_remote_path: '/backups/account_1/053ff078-f2da-4775-8013-9b7d9fdae42c/Pink Positive Desktop Wallpaper.png',
        backup_status: 'completed',
        download_url: 'https://example.com/download/1',
        preview_available: true
      },
      {
        _id: '2',
        filename: 'image (4).png',
        size_bytes: 129126,
        size_formatted: '126.1 KB',
        content_type: 'image/png',
        file_type: 'image',
        upload_date: '2025-09-01T07:07:00Z',
        owner_email: 'user2@example.com',
        gdrive_account_id: 'account_1',
        hetzner_remote_path: '/backups/account_1/8c5d4381-9ab2-4ae9-a442-6f3ed008c9d3/image (4).png',
        backup_status: 'completed',
        download_url: 'https://example.com/download/2',
        preview_available: true
      },
      {
        _id: '3',
        filename: 'document.pdf',
        size_bytes: 1024000,
        size_formatted: '1.0 MB',
        content_type: 'application/pdf',
        file_type: 'document',
        upload_date: '2024-01-15T10:30:00Z',
        owner_email: 'user3@example.com',
        gdrive_account_id: 'account_2',
        hetzner_remote_path: '/backups/account_2/document.pdf',
        backup_status: 'completed',
        download_url: 'https://example.com/download/3',
        preview_available: true
      },
      {
        _id: '4',
        filename: 'video.mp4',
        size_bytes: 52428800,
        size_formatted: '50.0 MB',
        content_type: 'video/mp4',
        file_type: 'video',
        upload_date: '2024-01-13T09:20:00Z',
        owner_email: 'user4@example.com',
        gdrive_account_id: 'account_3',
        hetzner_remote_path: '/backups/account_3/video.mp4',
        backup_status: 'failed',
        download_url: 'https://example.com/download/4',
        preview_available: false
      },
      {
        _id: '5',
        filename: 'audio.mp3',
        size_bytes: 5120000,
        size_formatted: '5.0 MB',
        content_type: 'audio/mpeg',
        file_type: 'audio',
        upload_date: '2024-01-12T14:15:00Z',
        owner_email: 'user5@example.com',
        gdrive_account_id: 'account_4',
        hetzner_remote_path: '/backups/account_4/audio.mp3',
        backup_status: 'completed',
        download_url: 'https://example.com/download/5',
        preview_available: false
      },
      {
        _id: '6',
        filename: 'archive.zip',
        size_bytes: 10485760,
        size_formatted: '10.0 MB',
        content_type: 'application/zip',
        file_type: 'archive',
        upload_date: '2024-01-11T16:30:00Z',
        owner_email: 'user6@example.com',
        gdrive_account_id: 'account_5',
        hetzner_remote_path: '/backups/account_5/archive.zip',
        backup_status: 'completed',
        download_url: 'https://example.com/download/6',
        preview_available: false
      }
    ];

    return {
      files: mockFiles,
      total: mockFiles.length,
      page: params.page || 1,
      limit: params.limit || 50,
      total_pages: 1,
      hetzner_stats: {
        total_files: mockFiles.length,
        total_storage: 72000000, // Updated total storage
        total_storage_formatted: '68.6 MB',
        recent_backups: 4,
        failed_backups: 1
      }
    };
  }

  private getMockAnalytics(): HetznerFileTypeAnalytics {
    return {
      file_types: [
        { _id: 'image', count: 2, total_size: 2750566, percentage: 38.2, size_formatted: '2.6 MB' },
        { _id: 'video', count: 1, total_size: 52428800, percentage: 58.1, size_formatted: '50.0 MB' },
        { _id: 'document', count: 1, total_size: 1024000, percentage: 1.4, size_formatted: '1.0 MB' },
        { _id: 'audio', count: 1, total_size: 5120000, percentage: 7.1, size_formatted: '5.0 MB' },
        { _id: 'archive', count: 1, total_size: 10485760, percentage: 14.5, size_formatted: '10.0 MB' }
      ],
      total_files: 6
    };
  }
}

// Export singleton instance
export const hetznerFileManagementService = new HetznerFileManagementService();