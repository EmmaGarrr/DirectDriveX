import { 
  GoogleDriveAccount, 
  GoogleDriveAccountsResponse, 
  AddAccountRequest, 
  CacheInfo,
  GoogleDriveStats,
  OperationProgress,
  DeleteAllFilesResponse,
  ApiResponse,
  GoogleDriveApiError
} from '@/types/google-drive';
import { adminAuthService } from '../adminAuthService';
import { activityLogsService } from './activityLogsService';
import { toastService } from '../toastService';

class GoogleDriveService {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws_api';
    console.log('GoogleDriveService initialized with:', {
      baseUrl: this.baseUrl,
      wsUrl: this.wsUrl
    });
  }

  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAdminToken();
    if (token) {
      console.log('Using token for Google Drive API (first 10 chars):', token.substring(0, 10));
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } else {
      console.log('No authentication token found for Google Drive API');
      return { 'Content-Type': 'application/json' };
    }
  }

  // Account Management Methods
  async getAccounts(forceRefresh: boolean = false): Promise<GoogleDriveAccountsResponse> {
    try {
      console.log('GoogleDriveService: Fetching accounts...', { forceRefresh });
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Using mock Google Drive accounts');
        return this.getMockAccountsResponse();
      }

      const timestamp = new Date().getTime();
      const url = `${this.baseUrl}/api/v1/admin/storage/google-drive/accounts` + 
                  (forceRefresh ? `?refresh=true&_t=${timestamp}` : `?_t=${timestamp}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Google Drive accounts API endpoint not available, using mock data');
          return this.getMockAccountsResponse();
        }
        throw new Error(`Google Drive accounts API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('GoogleDriveService: Accounts received:', data);
      return data;
    } catch (error) {
      console.warn('Failed to fetch Google Drive accounts:', error);
      return this.getMockAccountsResponse();
    }
  }

  async getAccountDetails(accountId: string): Promise<GoogleDriveAccount> {
    try {
      console.log('GoogleDriveService: Fetching account details for:', accountId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Using mock account details');
        return this.getMockAccountDetails(accountId);
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts/${accountId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Account details API endpoint not available, using mock data');
          return this.getMockAccountDetails(accountId);
        }
        throw new Error(`Account details API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('GoogleDriveService: Account details received:', data);
      return data;
    } catch (error) {
      console.warn('Failed to fetch account details:', error);
      return this.getMockAccountDetails(accountId);
    }
  }

  async addAccount(accountData: AddAccountRequest): Promise<void> {
    try {
      console.log('GoogleDriveService: Adding account:', accountData.account_email);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating account addition');
        toastService.success('Account added successfully (demo mode)');
        await this.logGoogleDriveOperation('add_account', 'success', accountData);
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to add account: ${response.status}`);
      }

      console.log('GoogleDriveService: Account added successfully');
      toastService.success('Google Drive account added successfully');
      await this.logGoogleDriveOperation('add_account', 'success', accountData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add account';
      console.error('Error adding Google Drive account:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('add_account', 'error', { error: errorMessage, accountData });
      throw error;
    }
  }

  async removeAccount(accountId: string, force: boolean = false): Promise<void> {
    try {
      console.log('GoogleDriveService: Removing account:', accountId, { force });
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating account removal');
        toastService.success('Account removed successfully (demo mode)');
        await this.logGoogleDriveOperation('remove_account', 'success', { accountId, force });
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts/${accountId}?force=${force}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to remove account: ${response.status}`);
      }

      console.log('GoogleDriveService: Account removed successfully');
      toastService.success('Google Drive account removed successfully');
      await this.logGoogleDriveOperation('remove_account', 'success', { accountId, force });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove account';
      console.error('Error removing Google Drive account:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('remove_account', 'error', { error: errorMessage, accountId, force });
      throw error;
    }
  }

  // Account Operations
  async toggleAccount(accountId: string): Promise<void> {
    try {
      console.log('GoogleDriveService: Toggling account:', accountId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating account toggle');
        toastService.success('Account status toggled successfully (demo mode)');
        await this.logGoogleDriveOperation('toggle_account', 'success', { accountId });
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts/${accountId}/toggle`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to toggle account: ${response.status}`);
      }

      console.log('GoogleDriveService: Account toggled successfully');
      toastService.success('Account status updated successfully');
      await this.logGoogleDriveOperation('toggle_account', 'success', { accountId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle account';
      console.error('Error toggling Google Drive account:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('toggle_account', 'error', { error: errorMessage, accountId });
      throw error;
    }
  }

  async refreshAccountStats(accountId: string): Promise<void> {
    try {
      console.log('GoogleDriveService: Refreshing account stats for:', accountId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating stats refresh');
        toastService.success('Account stats refreshed successfully (demo mode)');
        await this.logGoogleDriveOperation('refresh_stats', 'success', { accountId });
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts/${accountId}/refresh-stats`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to refresh account stats: ${response.status}`);
      }

      const result = await response.json();
      console.log('GoogleDriveService: Account stats refreshed:', result);
      toastService.success('Account stats refreshed successfully');
      await this.logGoogleDriveOperation('refresh_stats', 'success', { accountId, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh account stats';
      console.error('Error refreshing Google Drive account stats:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('refresh_stats', 'error', { error: errorMessage, accountId });
      throw error;
    }
  }

  async deleteAllAccountFiles(accountId: string): Promise<DeleteAllFilesResponse> {
    try {
      console.log('GoogleDriveService: Deleting all files for account:', accountId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating file deletion');
        const mockResult = {
          gdrive_deleted: 15,
          mongodb_soft_deleted: 15,
          gdrive_errors: 0,
          message: 'All files deleted successfully (demo mode)'
        };
        toastService.success('All files deleted successfully (demo mode)');
        await this.logGoogleDriveOperation('delete_all_files', 'success', { accountId, result: mockResult });
        return mockResult;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/admin/storage/google-drive/accounts/${accountId}/delete-all-files`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete all files: ${response.status}`);
      }

      const result = await response.json();
      console.log('GoogleDriveService: All files deleted:', result);
      
      const successMessage = `All files deleted successfully!\n\nGoogle Drive: ${result.gdrive_deleted || 0} files deleted\nDatabase: ${result.mongodb_soft_deleted || 0} records marked as deleted\nErrors: ${result.gdrive_errors || 0}`;
      toastService.success(successMessage);
      await this.logGoogleDriveOperation('delete_all_files', 'success', { accountId, result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete all files';
      console.error('Error deleting all Google Drive files:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('delete_all_files', 'error', { error: errorMessage, accountId });
      throw error;
    }
  }

  async refreshAllAccounts(): Promise<void> {
    try {
      console.log('GoogleDriveService: Refreshing all accounts from Google Drive API');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Simulating refresh all accounts');
        toastService.success('All accounts refreshed successfully (demo mode)');
        await this.logGoogleDriveOperation('refresh_all', 'success', {});
        return;
      }

      // Force refresh all accounts
      await this.getAccounts(true);
      console.log('GoogleDriveService: All accounts refreshed successfully');
      toastService.success('All accounts refreshed successfully');
      await this.logGoogleDriveOperation('refresh_all', 'success', {});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh all accounts';
      console.error('Error refreshing all Google Drive accounts:', errorMessage);
      toastService.error(errorMessage);
      await this.logGoogleDriveOperation('refresh_all', 'error', { error: errorMessage });
      throw error;
    }
  }

  // Cache Management
  async getCacheStatus(): Promise<CacheInfo> {
    try {
      const response = await this.getAccounts();
      return response.cache_info || {
        status: 'fresh',
        last_updated: new Date().toISOString(),
        cache_expiry_seconds: 300,
        is_forced_refresh: false
      };
    } catch (error) {
      console.warn('Failed to get cache status:', error);
      return {
        status: 'error',
        last_updated: new Date().toISOString(),
        cache_expiry_seconds: 0,
        is_forced_refresh: false
      };
    }
  }

  async invalidateCache(): Promise<void> {
    try {
      await this.getAccounts(true);
      console.log('GoogleDriveService: Cache invalidated successfully');
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    }
  }

  // Activity Logging
  private async logGoogleDriveOperation(operation: string, status: 'success' | 'error', details: any): Promise<void> {
    try {
      await activityLogsService.logActivity({
        action: `google_drive_${operation}`,
        details: {
          operation,
          status,
          ...details
        }
      });
    } catch (error) {
      console.warn('Failed to log Google Drive operation:', error);
    }
  }

  // Mock Data Methods for Demo Mode
  private getMockAccountsResponse(): GoogleDriveAccountsResponse {
    return {
      accounts: [
        {
          account_id: 'gdrive_001',
          email: 'service-account@directdrive-project.iam.gserviceaccount.com',
          alias: 'Primary Storage Account',
          is_active: true,
          storage_used: 2147483648, // 2 GB
          storage_quota: 16106127360, // 15 GB
          storage_percentage: 13.33,
          files_count: 1250,
          last_activity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          health_status: 'healthy',
          performance_score: 92.5,
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          folder_name: 'DirectDriveX Files',
          folder_path: '/DirectDriveX Files',
          folder_info: {
            folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            folder_name: 'DirectDriveX Files',
            folder_path: '/DirectDriveX Files'
          },
          last_quota_check: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          data_freshness: 'fresh'
        },
        {
          account_id: 'gdrive_002',
          email: 'backup-account@directdrive-project.iam.gserviceaccount.com',
          alias: 'Backup Storage Account',
          is_active: true,
          storage_used: 5368709120, // 5 GB
          storage_quota: 16106127360, // 15 GB
          storage_percentage: 33.33,
          files_count: 2100,
          last_activity: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          health_status: 'warning',
          performance_score: 78.2,
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
          updated_at: new Date(Date.now() - 7200000).toISOString(),
          folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          folder_name: 'DirectDriveX Backup',
          folder_path: '/DirectDriveX Backup',
          folder_info: {
            folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            folder_name: 'DirectDriveX Backup',
            folder_path: '/DirectDriveX Backup'
          },
          last_quota_check: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          data_freshness: 'stale'
        },
        {
          account_id: 'gdrive_003',
          email: 'archive-account@directdrive-project.iam.gserviceaccount.com',
          alias: 'Archive Storage Account',
          is_active: false,
          storage_used: 1073741824, // 1 GB
          storage_quota: 16106127360, // 15 GB
          storage_percentage: 6.67,
          files_count: 450,
          last_activity: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          health_status: 'critical',
          performance_score: 45.8,
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(), // 60 days ago
          updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          folder_id: null,
          folder_name: null,
          folder_path: null,
          last_quota_check: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          data_freshness: 'stale'
        }
      ],
      statistics: {
        total_accounts: 3,
        active_accounts: 2,
        total_storage_used: 8589934592, // 8 GB
        total_storage_quota: 48318382080, // 45 GB
        average_performance: 72.17
      },
      cache_info: {
        status: 'fresh',
        last_updated: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        cache_expiry_seconds: 300,
        is_forced_refresh: false
      }
    };
  }

  private getMockAccountDetails(accountId: string): GoogleDriveAccount {
    const mockAccounts = this.getMockAccountsResponse().accounts;
    const account = mockAccounts.find(acc => acc.account_id === accountId);
    
    if (account) {
      return account;
    }

    // Return a default account if not found
    return {
      account_id: accountId,
      email: 'unknown@example.com',
      alias: 'Unknown Account',
      is_active: false,
      storage_used: 0,
      storage_quota: 0,
      storage_percentage: 0,
      files_count: 0,
      last_activity: new Date().toISOString(),
      health_status: 'unknown',
      performance_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data_freshness: 'stale'
    };
  }
}

export const googleDriveService = new GoogleDriveService();
