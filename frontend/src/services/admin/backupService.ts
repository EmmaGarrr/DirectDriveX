import { 
  BackupStatus, 
  BackupQueue, 
  BackupFailuresResponse, 
  BackupUpdate, 
  BackupProgress,
  MassBackupResponse,
  CleanupResponse,
  BackupQueueParams,
  BackupFailuresParams
} from '@/types/backup';
import { adminAuthService } from '../adminAuthService';
import { toastService } from '../toastService';
import { activityLogsService } from './activityLogsService';

class BackupService {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws_api';
    console.log('BackupService initialized with:', {
      baseUrl: this.baseUrl,
      wsUrl: this.wsUrl
    });
  }

  private getAuthHeaders(): HeadersInit {
    try {
      const token = adminAuthService.getAdminToken();
      if (!token) {
        console.warn('No admin token found for backup service, using fallback mode');
        return { 'Content-Type': 'application/json' };
      }
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.warn('Error getting auth headers for backup service:', error);
      return { 'Content-Type': 'application/json' };
    }
  }

  // Status and monitoring methods
  async getBackupStatus(): Promise<BackupStatus> {
    try {
      console.log('BackupService: Fetching backup status...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Using mock backup status');
        return this.getMockBackupStatus();
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Backup status API endpoint not available, using mock data');
          return this.getMockBackupStatus();
        }
        throw new Error(`Backup status API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BackupService: Backup status received:', data);
      return data;
    } catch (error) {
      console.warn('Failed to fetch backup status:', error);
      return this.getMockBackupStatus();
    }
  }

  async getBackupQueue(page: number = 1, limit: number = 10): Promise<BackupQueue> {
    try {
      console.log(`BackupService: Fetching backup queue (page: ${page}, limit: ${limit})...`);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Using mock backup queue');
        return this.getMockBackupQueue(page, limit);
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/queue?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Backup queue API endpoint not available, using mock data');
          return this.getMockBackupQueue(page, limit);
        }
        throw new Error(`Backup queue API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BackupService: Backup queue received:', data);
      return data;
    } catch (error) {
      console.warn('Failed to fetch backup queue:', error);
      return this.getMockBackupQueue(page, limit);
    }
  }

  async getBackupFailures(page: number = 1, limit: number = 10, days: number = 30): Promise<BackupFailuresResponse> {
    try {
      console.log(`BackupService: Fetching backup failures (page: ${page}, limit: ${limit}, days: ${days})...`);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Using mock backup failures');
        return this.getMockBackupFailures(page, limit, days);
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/failures?page=${page}&limit=${limit}&days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Backup failures API endpoint not available, using mock data');
          return this.getMockBackupFailures(page, limit, days);
        }
        throw new Error(`Backup failures API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BackupService: Backup failures received:', data);
      return data;
    } catch (error) {
      console.warn('Failed to fetch backup failures:', error);
      return this.getMockBackupFailures(page, limit, days);
    }
  }

  // Operations methods
  async triggerMassBackup(): Promise<MassBackupResponse> {
    try {
      console.log('BackupService: Triggering mass backup...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating mass backup trigger');
        const mockResponse = this.getMockMassBackupResponse();
        toastService.success('Mass backup triggered successfully (Demo Mode)');
        await this.logBackupOperation('mass_backup_triggered', { demo_mode: true });
        return mockResponse;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/trigger-mass`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Mass backup API endpoint not available, using demo mode');
          const mockResponse = this.getMockMassBackupResponse();
          toastService.success('Mass backup triggered successfully (Demo Mode)');
          await this.logBackupOperation('mass_backup_triggered', { demo_mode: true });
          return mockResponse;
        }
        throw new Error(`Mass backup API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BackupService: Mass backup triggered:', data);
      toastService.success('Mass backup triggered successfully');
      await this.logBackupOperation('mass_backup_triggered', { operation_id: data.operation_id });
      return data;
    } catch (error) {
      console.error('Failed to trigger mass backup:', error);
      toastService.error('Failed to trigger mass backup');
      throw error;
    }
  }

  async runCleanup(): Promise<CleanupResponse> {
    try {
      console.log('BackupService: Running backup cleanup...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating backup cleanup');
        const mockResponse = this.getMockCleanupResponse();
        toastService.success('Backup cleanup completed successfully (Demo Mode)');
        await this.logBackupOperation('backup_cleanup', { demo_mode: true });
        return mockResponse;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/cleanup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Backup cleanup API endpoint not available, using demo mode');
          const mockResponse = this.getMockCleanupResponse();
          toastService.success('Backup cleanup completed successfully (Demo Mode)');
          await this.logBackupOperation('backup_cleanup', { demo_mode: true });
          return mockResponse;
        }
        throw new Error(`Backup cleanup API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BackupService: Backup cleanup completed:', data);
      toastService.success('Backup cleanup completed successfully');
      await this.logBackupOperation('backup_cleanup', { files_cleaned: data.files_cleaned, space_freed: data.space_freed });
      return data;
    } catch (error) {
      console.error('Failed to run backup cleanup:', error);
      toastService.error('Failed to run backup cleanup');
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    try {
      console.log('BackupService: Refreshing all backup data...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating refresh all');
        toastService.info('Backup data refreshed (Demo Mode)');
        await this.logBackupOperation('backup_refresh_all', { demo_mode: true });
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/backup/refresh-all`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Refresh all API endpoint not available, using demo mode');
          toastService.info('Backup data refreshed (Demo Mode)');
          await this.logBackupOperation('backup_refresh_all', { demo_mode: true });
          return;
        }
        throw new Error(`Refresh all API error: ${response.status}`);
      }

      console.log('BackupService: All backup data refreshed');
      toastService.info('Backup data refreshed successfully');
      await this.logBackupOperation('backup_refresh_all', {});
    } catch (error) {
      console.error('Failed to refresh all backup data:', error);
      toastService.error('Failed to refresh backup data');
      throw error;
    }
  }

  // Real-time monitoring
  subscribeToBackupUpdates(callback: (update: BackupUpdate) => void): () => void {
    console.log('BackupService: Subscribing to backup updates...');
    
    // In a real implementation, this would connect to WebSocket
    // For now, we'll simulate real-time updates
    const interval = setInterval(() => {
      // Simulate random backup updates
      if (Math.random() > 0.7) {
        const mockUpdate: BackupUpdate = {
          type: 'status_update',
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        };
        callback(mockUpdate);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      console.log('BackupService: Unsubscribing from backup updates');
      clearInterval(interval);
    };
  }

  // Activity logging helper
  private async logBackupOperation(action: string, details: any): Promise<void> {
    try {
      await activityLogsService.logActivity({
        action: `backup_${action}`,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          service: 'backup_management'
        }
      });
    } catch (error) {
      console.warn('Failed to log backup operation:', error);
    }
  }

  // Mock data methods for demo mode
  private getMockBackupStatus(): BackupStatus {
    return {
      backup_summary: {
        total_files: 1096,
        backed_up_files: 584,
        backup_percentage: 53.28,
        in_progress: 4,
        failed: 3,
        total_backup_size: 83000242995 // 77.3 GB (matching Angular display)
      },
      hetzner_status: 'error'
    };
  }

  private getMockBackupQueue(page: number, limit: number): BackupQueue {
    const mockFiles = [
      { id: '1', filename: 'document1.pdf', size_bytes: 1024000, upload_date: '2025-01-01T10:00:00Z', backup_status: 'pending' as const, user_id: 'user123' },
      { id: '2', filename: 'image1.jpg', size_bytes: 2048000, upload_date: '2025-01-01T11:00:00Z', backup_status: 'in_progress' as const, user_id: 'user456' },
      { id: '3', filename: 'video1.mp4', size_bytes: 15728640, upload_date: '2025-01-01T12:00:00Z', backup_status: 'pending' as const, user_id: 'user789' },
      { id: '4', filename: 'archive1.zip', size_bytes: 5242880, upload_date: '2025-01-01T13:00:00Z', backup_status: 'pending' as const, user_id: 'user123' },
      { id: '5', filename: 'spreadsheet1.xlsx', size_bytes: 512000, upload_date: '2025-01-01T14:00:00Z', backup_status: 'in_progress' as const, user_id: 'user456' }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const queueFiles = mockFiles.slice(startIndex, endIndex);

    return {
      queue_files: queueFiles,
      total_in_queue: mockFiles.length,
      page,
      limit,
      total_pages: Math.ceil(mockFiles.length / limit)
    };
  }

  private getMockBackupFailures(page: number, limit: number, days: number): BackupFailuresResponse {
    const mockFailures = [
      { id: '1', filename: 'large_file.zip', size_bytes: 1073741824, failed_at: '2025-01-01T10:00:00Z', backup_error: 'Storage quota exceeded', user_id: 'user123' },
      { id: '2', filename: 'corrupted_file.pdf', size_bytes: 2048000, failed_at: '2025-01-01T11:00:00Z', backup_error: 'File corruption detected', user_id: 'user456' },
      { id: '3', filename: 'network_timeout.mp4', size_bytes: 52428800, failed_at: '2025-01-01T12:00:00Z', backup_error: 'Network timeout during upload', user_id: 'user789' }
    ];

    const mockPatterns = [
      { error_type: 'Storage quota exceeded', count: 15 },
      { error_type: 'Network timeout', count: 8 },
      { error_type: 'File corruption', count: 3 }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const failedBackups = mockFailures.slice(startIndex, endIndex);

    return {
      failed_backups: failedBackups,
      failure_patterns: mockPatterns,
      total_failures: mockFailures.length,
      page,
      limit,
      total_pages: Math.ceil(mockFailures.length / limit),
      period_days: days
    };
  }

  private getMockMassBackupResponse(): MassBackupResponse {
    return {
      message: 'Mass backup operation initiated successfully',
      operation_id: `backup_${Date.now()}`,
      estimated_duration: '2-3 hours'
    };
  }

  private getMockCleanupResponse(): CleanupResponse {
    return {
      message: 'Backup cleanup completed successfully',
      files_cleaned: 45,
      space_freed: 1024000000 // ~1 GB
    };
  }
}

export const backupService = new BackupService();

