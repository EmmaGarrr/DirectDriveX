/**
 * Activity logs service for tracking admin actions and file operations
 * Provides comprehensive audit trail for all administrative activities
 */

import { adminAuthService } from '../adminAuthService';

interface ActivityLogEntry {
  action: string;
  details: Record<string, any>;
  timestamp?: string;
  admin_id?: string;
  ip_address?: string;
  user_agent?: string;
}

class ActivityLogsService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin`;

  /**
   * FIXED: Get authentication headers for API requests with fallback
   */
  private getAuthHeaders(): HeadersInit {
    try {
      // Use the established admin auth service
      const token = adminAuthService.getAdminToken();
      if (!token) {
        console.warn('No admin token found for activity logging, using fallback mode');
        return {
          'Content-Type': 'application/json'
        };
      }

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.warn('Error getting auth headers for activity logging:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  /**
   * FIXED: Log an activity entry with fallback for demo mode
   */
  async logActivity(entry: ActivityLogEntry): Promise<void> {
    const logData = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      admin_id: entry.admin_id || this.getCurrentAdminId(),
      ip_address: entry.ip_address || this.getClientIP(),
      user_agent: entry.user_agent || navigator.userAgent,
    };

    try {
      // Check if admin is authenticated
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Activity logged locally:', logData);
        return; // Skip API call in demo mode
      }

      const response = await fetch(`${this.API_URL}/activity-logs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Activity logging API endpoint not available, logging locally:', logData);
          return; // Treat 404 as API not available, log locally
        }
        throw new Error(`Activity logging API error: ${response.status}`);
      }
    } catch (error) {
      // Don't throw errors for logging failures to avoid disrupting user operations
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Activity logging API not available (network error), logging locally:', logData);
      } else {
        console.warn('Failed to log activity:', error);
      }
    }
  }

  /**
   * Log file operation activities
   */
  async logFileOperation(operation: string, fileId: string, fileName: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_operation',
      details: {
        operation,
        file_id: fileId,
        file_name: fileName,
        ...details
      }
    });
  }

  /**
   * Log bulk file operations
   */
  async logBulkFileOperation(operation: string, fileIds: string[], fileCount: number, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'bulk_file_operation',
      details: {
        operation,
        file_count: fileCount,
        file_ids: fileIds,
        ...details
      }
    });
  }

  /**
   * Log system operations
   */
  async logSystemOperation(operation: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'system_operation',
      details: {
        operation,
        ...details
      }
    });
  }

  /**
   * Log file integrity check
   */
  async logIntegrityCheck(fileId: string, fileName: string, result: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_integrity_check',
      details: {
        file_id: fileId,
        file_name: fileName,
        result,
        ...details
      }
    });
  }

  /**
   * Log file backup operation
   */
  async logFileBackup(fileId: string, fileName: string, backupPath: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_backup',
      details: {
        file_id: fileId,
        file_name: fileName,
        backup_path: backupPath,
        ...details
      }
    });
  }

  /**
   * Log file recovery operation
   */
  async logFileRecovery(fileId: string, fileName: string, backupUsed: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_recovery',
      details: {
        file_id: fileId,
        file_name: fileName,
        backup_used: backupUsed,
        ...details
      }
    });
  }

  /**
   * Log file quarantine operation
   */
  async logFileQuarantine(fileId: string, fileName: string, reason: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_quarantine',
      details: {
        file_id: fileId,
        file_name: fileName,
        reason,
        ...details
      }
    });
  }

  /**
   * Log file move operation
   */
  async logFileMove(fileId: string, fileName: string, fromLocation: string, toLocation: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_move',
      details: {
        file_id: fileId,
        file_name: fileName,
        from_location: fromLocation,
        to_location: toLocation,
        ...details
      }
    });
  }

  /**
   * Log file deletion
   */
  async logFileDeletion(fileId: string, fileName: string, reason?: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_deletion',
      details: {
        file_id: fileId,
        file_name: fileName,
        reason,
        ...details
      }
    });
  }

  /**
   * Log orphaned files cleanup
   */
  async logOrphanedFilesCleanup(cleanupType: 'soft' | 'hard', daysOld: number, filesAffected: number, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'orphaned_files_cleanup',
      details: {
        cleanup_type: cleanupType,
        days_old: daysOld,
        files_affected: filesAffected,
        ...details
      }
    });
  }

  /**
   * Log storage statistics access
   */
  async logStorageStatsAccess(details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'storage_stats_access',
      details: {
        ...details
      }
    });
  }

  /**
   * Log file type analytics access
   */
  async logFileTypeAnalyticsAccess(details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action: 'file_type_analytics_access',
      details: {
        ...details
      }
    });
  }

  /**
   * FIXED: Get current admin ID from token using adminAuthService
   */
  private getCurrentAdminId(): string | undefined {
    try {
      if (!adminAuthService.isAdminAuthenticated()) {
        return 'demo_admin'; // Return demo admin ID for demo mode
      }
      
      const token = adminAuthService.getAdminToken();
      if (!token) return undefined;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.admin_id;
    } catch {
      return undefined;
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private getClientIP(): string {
    // In a real implementation, this would be handled by the backend
    // For now, return a placeholder
    return '127.0.0.1';
  }
}

// Export singleton instance
export const activityLogsService = new ActivityLogsService();
