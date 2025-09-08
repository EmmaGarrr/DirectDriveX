"use client";

import {
  User,
  UserListResponse,
  GetUsersParams,
  UpdateUserData,
  UserFile,
  UserFilesResponse,
  StorageInsights,
  UserStatus,
  UserRole
} from '@/types/admin';
import { adminAuthService } from '../adminAuthService';

class UserManagementService {
  private readonly API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin`;

  /**
   * Get users with optional filtering, sorting, and pagination
   */
  async getUsers(params: GetUsersParams = {}): Promise<UserListResponse> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.role && params.role !== 'all') queryParams.append('role', params.role);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

      const response = await fetch(`${this.API_BASE}/users?${queryParams.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Return mock data as fallback for development
      return this.getMockUserList(params);
    }
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch user details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user status (suspend, ban, activate)
   */
  async updateUserStatus(userId: string, action: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/status`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action, reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword?: string): Promise<{ password?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Perform bulk action on multiple users
   */
  async bulkAction(userIds: string[], action: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/users/bulk`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ user_ids: userIds, action, reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to perform bulk ${action}`);
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      throw error;
    }
  }

  /**
   * Get files for a specific user
   */
  async getUserFiles(userId: string, page: number = 1, limit: number = 20): Promise<UserFilesResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/files?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch user files');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user files:', error);
      
      // Return mock data as fallback for development
      return this.getMockUserFiles(userId, page, limit);
    }
  }

  /**
   * Get storage insights for a specific file
   */
  async getStorageInsights(fileId: string): Promise<StorageInsights> {
    try {
      const response = await fetch(`${this.API_BASE}/files/${fileId}/storage-insights`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch storage insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching storage insights:', error);
      
      // Return mock data as fallback for development
      return this.getMockStorageInsights(fileId);
    }
  }

  /**
   * Export users data as CSV
   */
  async exportUsers(format: 'csv' | 'json' = 'csv', filters: GetUsersParams = {}): Promise<Blob> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role && filters.role !== 'all') queryParams.append('role', filters.role);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await fetch(`${this.API_BASE}/users/export?${queryParams.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to export users');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${adminAuthService.getAdminToken()}`,
      'Content-Type': 'application/json'
    };
  }

  // Mock data generation methods for development and fallbacks

  /**
   * Generate mock user list for development
   */
  private getMockUserList(params: GetUsersParams = {}): UserListResponse {
    const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => this.generateMockUser(i));
    
    // Apply filters if provided
    let filteredUsers = [...mockUsers];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.role && params.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }
    
    if (params.status && params.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === params.status as UserStatus);
    }
    
          // Apply sorting
    if (params.sort_by) {
      const sortKey = params.sort_by as keyof User;
      const sortDir = params.sort_direction === 'asc' ? 1 : -1;
      
      filteredUsers.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        
        if (valA === undefined || valB === undefined) return 0;
        
        if (valA < valB) return -1 * sortDir;
        if (valA > valB) return 1 * sortDir;
        return 0;
      });
    }
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      page: page,
      limit: limit,
      total_pages: Math.ceil(filteredUsers.length / limit)
    };
  }

  /**
   * Generate a single mock user for development
   */
  private generateMockUser(index: number): User {
    const roles = ['regular', 'regular', 'regular', 'admin', 'superadmin'];
    const statuses = ['active', 'active', 'active', 'suspended', 'banned'];
    const domains = ['gmail.com', 'outlook.com', 'company.com', 'example.org', 'mail.co'];
    
    const role = roles[Math.floor(Math.random() * roles.length)] as UserRole;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as UserStatus;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    // Generate unique ID based on index
    const id = `usr_${Math.random().toString(36).substring(2, 8)}${index}`;
    
    // Generate a realistic email
    const names = ['alex', 'jamie', 'taylor', 'jordan', 'casey', 'morgan', 'riley', 'quinn', 'avery', 'dakota'];
    const name1 = names[Math.floor(Math.random() * names.length)];
    const name2 = names[Math.floor(Math.random() * names.length)];
    const email = `${name1}.${name2}${index}@${domain}`;
    
    // Generate file count based on role (admins have more files)
    const filesCount = role === 'regular' 
      ? Math.floor(Math.random() * 100) 
      : Math.floor(Math.random() * 500) + 100;
    
    // Generate storage used based on file count
    const avgFileSizeInMB = 5;
    const storageUsed = filesCount * avgFileSizeInMB * 1024 * 1024;
    
    // Generate dates
    const now = new Date();
    const monthsAgo = Math.floor(Math.random() * 24) + 1;
    const daysAgo = Math.floor(Math.random() * 30);
    
    const createdAt = new Date(now);
    createdAt.setMonth(createdAt.getMonth() - monthsAgo);
    
    const lastLogin = new Date(now);
    lastLogin.setDate(lastLogin.getDate() - daysAgo);
    
    return {
      _id: id,
      email,
      role,
      status,
      files_count: filesCount,
      storage_used: storageUsed,
      created_at: createdAt.toISOString(),
      last_login: lastLogin.toISOString()
    };
  }

  /**
   * Generate mock user files for development
   */
  private getMockUserFiles(userId: string, page: number = 1, limit: number = 20): UserFilesResponse {
    // Generate a consistent number of files based on the userId hash
    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalFiles = (hash % 100) + 10;
    
    const fileTypes = ['image', 'video', 'audio', 'document', 'archive', 'other'];
    const fileStatusOptions = ['completed', 'uploading', 'failed', 'pending'];
    
    // Generate mock files
    const allFiles = Array.from({ length: totalFiles }, (_, i) => {
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)] as UserFile['file_type'];
      const fileStatus = fileStatusOptions[Math.floor(Math.random() * fileStatusOptions.length)] as UserFile['status'];
      
      // Generate file size between 100KB and 500MB
      const sizeBytes = Math.floor(Math.random() * 524288000) + 102400;
      
      // Format file size
      const sizeFormatted = this.formatBytes(sizeBytes);
      
      // Generate dates
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 60);
      const uploadDate = new Date(now);
      uploadDate.setDate(uploadDate.getDate() - daysAgo);
      
      // Generate extensions based on file type
      let extension;
      switch (fileType) {
        case 'image': extension = ['jpg', 'png', 'gif', 'webp'][Math.floor(Math.random() * 4)]; break;
        case 'video': extension = ['mp4', 'mov', 'avi', 'webm'][Math.floor(Math.random() * 4)]; break;
        case 'audio': extension = ['mp3', 'wav', 'ogg', 'flac'][Math.floor(Math.random() * 4)]; break;
        case 'document': extension = ['pdf', 'docx', 'xlsx', 'pptx'][Math.floor(Math.random() * 4)]; break;
        case 'archive': extension = ['zip', 'rar', '7z', 'tar'][Math.floor(Math.random() * 4)]; break;
        default: extension = ['txt', 'bin', 'dat', 'json'][Math.floor(Math.random() * 4)];
      }
      
      const filename = `file_${i+1}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      
      return {
        _id: `file_${Math.random().toString(36).substring(2, 10)}`,
        filename,
        file_type: fileType,
        size_bytes: sizeBytes,
        size_formatted: sizeFormatted,
        upload_date: uploadDate.toISOString(),
        upload_date_formatted: uploadDate.toLocaleDateString(),
        status: fileStatus,
        file_id: `storage_${Math.random().toString(36).substring(2, 10)}`
      };
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);
    
    return {
      files: paginatedFiles,
      total: allFiles.length,
      page,
      limit,
      total_pages: Math.ceil(allFiles.length / limit)
    };
  }

  /**
   * Generate mock storage insights for development
   */
  private getMockStorageInsights(fileId: string): StorageInsights {
    // Generate deterministic insights based on fileId
    const firstChar = fileId.charCodeAt(0);
    
    // Determine if there are issues (using fileId hash to be deterministic)
    const hash = Array.from(fileId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const googleDriveExists = hash % 10 > 1; // 80% chance exists
    const googleDriveAccessible = googleDriveExists && hash % 10 > 2; // 70% chance accessible if exists
    const hetznerExists = hash % 10 > 0; // 90% chance exists
    const hetznerAccessible = hetznerExists && hash % 10 > 1; // 80% chance accessible if exists
    
    // Determine status based on storage availability
    let status;
    let recommendations = [];
    
    if (googleDriveExists && hetznerExists && googleDriveAccessible && hetznerAccessible) {
      status = 'optimal';
      recommendations.push('All storage systems are working correctly');
    } else if ((googleDriveExists && googleDriveAccessible) || (hetznerExists && hetznerAccessible)) {
      status = 'degraded';
      
      if (!googleDriveExists) {
        recommendations.push('File is missing from Google Drive storage');
      } else if (!googleDriveAccessible) {
        recommendations.push('File in Google Drive is not accessible');
        recommendations.push('Check Google Drive account permissions');
      }
      
      if (!hetznerExists) {
        recommendations.push('File is missing from Hetzner storage');
      } else if (!hetznerAccessible) {
        recommendations.push('File in Hetzner is not accessible');
        recommendations.push('Check Hetzner storage path permissions');
      }
    } else {
      status = 'critical';
      recommendations.push('File is inaccessible in all storage systems');
      recommendations.push('Restore from backup immediately');
      recommendations.push('Contact system administrator');
    }
    
    return {
      status,
      storage_location: firstChar % 2 === 0 ? 'primary' : 'backup',
      google_drive: {
        exists: googleDriveExists,
        accessible: googleDriveAccessible,
        details: googleDriveAccessible 
          ? 'File is accessible in Google Drive' 
          : 'File cannot be accessed in Google Drive',
        account_id: googleDriveExists ? `gdrive_${Math.random().toString(36).substring(2, 10)}` : undefined,
        file_size: googleDriveExists ? Math.floor(Math.random() * 524288000) + 102400 : undefined
      },
      hetzner_storage: {
        exists: hetznerExists,
        accessible: hetznerAccessible,
        details: hetznerAccessible 
          ? 'File is accessible in Hetzner storage' 
          : 'File cannot be accessed in Hetzner storage',
        path: hetznerExists ? `/storage/files/${fileId.substring(0, 2)}/${fileId}` : undefined,
        file_size: hetznerExists ? Math.floor(Math.random() * 524288000) + 102400 : undefined
      },
      recommendations
    };
  }
  
  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const userManagementService = new UserManagementService();
