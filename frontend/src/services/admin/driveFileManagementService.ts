import { DriveFileItem, DriveStats, FileTypeAnalytics, DriveFileListResponse } from '@/types/drive';
import { toastService } from '@/services/toastService';

interface DriveFileFilters {
  search?: string;
  file_type?: string;
  owner_email?: string;
  backup_status?: string;
  size_min?: number;
  size_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface FileOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

interface BulkActionRequest {
  file_ids: string[];
  action: 'delete' | 'force_backup' | 'move';
  reason?: string;
  target_location?: string;
}

class DriveFileManagementService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  private readonly apiUrl = `${this.baseUrl}/api/v1/admin/drive`;

  // Get authentication headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get paginated file list with filters
  async getFileList(filters: DriveFileFilters = {}): Promise<DriveFileListResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', (filters.page || 1).toString());
      params.append('limit', (filters.limit || 50).toString());
      
      // Add sorting
      params.append('sort_by', filters.sort_by || 'upload_date');
      params.append('sort_order', filters.sort_order || 'desc');
      
      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.file_type) params.append('file_type', filters.file_type);
      if (filters.owner_email) params.append('owner_email', filters.owner_email);
      if (filters.backup_status) params.append('backup_status', filters.backup_status);
      if (filters.size_min) params.append('size_min', (filters.size_min * 1024 * 1024).toString());
      if (filters.size_max) params.append('size_max', (filters.size_max * 1024 * 1024).toString());

      const response = await fetch(`${this.apiUrl}/files?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure files have required properties with defaults
      if (data.files) {
        data.files = data.files.map((file: any) => ({
          _id: file._id || '',
          filename: file.filename || 'Unknown',
          size_bytes: file.size_bytes || 0,
          size_formatted: file.size_formatted || '0 B',
          content_type: file.content_type || 'application/octet-stream',
          file_type: file.file_type || 'other',
          upload_date: file.upload_date || new Date().toISOString(),
          owner_email: file.owner_email || 'Unknown',
          status: file.status || 'unknown',
          storage_location: file.storage_location || 'unknown',
          backup_status: file.backup_status || 'none',
          gdrive_account_id: file.gdrive_account_id || 'Unknown',
          download_url: file.download_url || '',
          preview_available: file.preview_available || false,
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching drive files:', error);
      toastService.error('Failed to load drive files');
      throw error;
    }
  }

  // Get file type analytics
  async getFileTypeAnalytics(): Promise<FileTypeAnalytics> {
    try {
      const response = await fetch(`${this.apiUrl}/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file analytics:', error);
      toastService.error('Failed to load file analytics');
      throw error;
    }
  }

  // Download file
  async downloadFile(fileId: string, filename: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toastService.success('File download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toastService.error('Failed to download file');
      throw error;
    }
  }

  // Check file integrity
  async checkFileIntegrity(fileId: string): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/operation`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          operation: 'integrity_check',
          reason: 'Manual integrity check from drive management'
        }),
      });

      if (!response.ok) {
        throw new Error(`Integrity check failed: ${response.statusText}`);
      }

      const result = await response.json();
      const integrityResult = result.integrity_check;
      
      let message = '';
      let success = true;

      if (integrityResult.status === 'verified') {
        message = `File integrity verified!\nChecksum match: ${integrityResult.checksum_match}\nLast check: ${new Date(integrityResult.last_check).toLocaleString()}`;
        toastService.success('File integrity verified');
      } else if (integrityResult.status === 'corrupted') {
        message = `WARNING: File integrity check failed!\nCorruption detected: ${integrityResult.corruption_detected}\nCorruption type: ${integrityResult.corruption_type || 'Unknown'}`;
        toastService.error('File integrity check failed');
        success = false;
      } else if (integrityResult.status === 'inaccessible') {
        message = `ERROR: File is inaccessible!\nError: ${integrityResult.error}`;
        toastService.error('File is inaccessible');
        success = false;
      }

      return { success, message, data: integrityResult };
    } catch (error) {
      console.error('Error checking file integrity:', error);
      toastService.error('Failed to check file integrity');
      return { success: false, message: 'Failed to check file integrity' };
    }
  }

  // Move file to different account
  async moveFile(fileId: string, targetLocation: string, reason?: string): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/operation`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          operation: 'move',
          target_location: targetLocation,
          reason: reason || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Move failed: ${response.statusText}`);
      }

      const result = await response.json();
      toastService.success(`File moved to ${result.target_location}`);
      return { success: true, message: `File moved successfully to ${result.target_location}`, data: result };
    } catch (error) {
      console.error('Error moving file:', error);
      toastService.error('Failed to move file');
      return { success: false, message: 'Failed to move file' };
    }
  }

  // Force backup to Hetzner
  async forceBackup(fileId: string, reason?: string): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/operation`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          operation: 'force_backup',
          reason: reason || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const result = await response.json();
      toastService.success(`File backup completed! Backup path: ${result.backup_path}`);
      return { success: true, message: `File backup completed! Backup path: ${result.backup_path}`, data: result };
    } catch (error) {
      console.error('Error backing up file:', error);
      toastService.error('Failed to backup file');
      return { success: false, message: 'Failed to backup file' };
    }
  }

  // Recover file from backup
  async recoverFile(fileId: string, reason?: string): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/operation`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          operation: 'recover',
          reason: reason || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail?.includes('no completed backup')) {
          toastService.error('Cannot recover file: No completed backup available');
          return { success: false, message: 'Cannot recover file: No completed backup available' };
        }
        throw new Error(`Recovery failed: ${response.statusText}`);
      }

      toastService.success('File recovered successfully from backup');
      return { success: true, message: 'File recovered successfully from backup' };
    } catch (error) {
      console.error('Error recovering file:', error);
      toastService.error('Failed to recover file');
      return { success: false, message: 'Failed to recover file' };
    }
  }

  // Delete file
  async deleteFile(fileId: string, reason?: string): Promise<FileOperationResult> {
    try {
      const params = new URLSearchParams();
      if (reason) params.append('reason', reason);

      const response = await fetch(`${this.apiUrl}/files/${fileId}?${params}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      toastService.success('File deleted successfully');
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file:', error);
      toastService.error('Failed to delete file');
      return { success: false, message: 'Failed to delete file' };
    }
  }

  // Preview file
  async previewFile(fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/files/${fileId}/preview`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Preview failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.preview_url;
    } catch (error) {
      console.error('Error loading preview:', error);
      toastService.error('Failed to load file preview');
      return null;
    }
  }

  // Bulk operations
  async executeBulkAction(request: BulkActionRequest): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/files/bulk-action`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Bulk action failed: ${response.statusText}`);
      }

      const result = await response.json();
      toastService.success(result.message || 'Bulk action completed successfully');
      return { success: true, message: result.message || 'Bulk action completed successfully', data: result };
    } catch (error) {
      console.error('Error executing bulk action:', error);
      toastService.error('Bulk action failed');
      return { success: false, message: 'Bulk action failed' };
    }
  }
}

export const driveFileManagementService = new DriveFileManagementService();
