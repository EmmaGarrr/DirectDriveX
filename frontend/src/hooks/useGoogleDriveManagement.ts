import { useState, useCallback, useEffect } from 'react';
import { googleDriveService } from '@/services/admin/googleDriveService';
import { 
  GoogleDriveAccount, 
  GoogleDriveStats, 
  CacheInfo,
  UseGoogleDriveManagementReturn 
} from '@/types/google-drive';
import { useAdminSocket } from './useAdminSocket';

export const useGoogleDriveManagement = (): UseGoogleDriveManagementReturn => {
  // Data state
  const [accounts, setAccounts] = useState<GoogleDriveAccount[]>([]);
  const [stats, setStats] = useState<GoogleDriveStats | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backgroundRefreshInProgress, setBackgroundRefreshInProgress] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<GoogleDriveAccount | null>(null);
  
  // WebSocket integration
  const { isConnected } = useAdminSocket();

  // Load accounts with smart caching
  const loadAccounts = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      console.log('useGoogleDriveManagement: Loading accounts...', { forceRefresh });
      const response = await googleDriveService.getAccounts(forceRefresh);
      
      setAccounts(response.accounts);
      setStats(response.statistics);
      setCacheInfo(response.cache_info || null);
      
      console.log('useGoogleDriveManagement: Accounts loaded:', {
        accountsCount: response.accounts.length,
        stats: response.statistics,
        cacheInfo: response.cache_info
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Google Drive accounts';
      console.error('useGoogleDriveManagement: Error loading accounts:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Smart loading: cached first, then background refresh if needed
  const loadAccountsSmart = useCallback(async (): Promise<void> => {
    try {
      // Step 1: Load cached data immediately (fast)
      await loadAccounts(false);
      
      // Step 2: Check if we need background refresh
      if (cacheInfo?.status === 'stale' && !backgroundRefreshInProgress) {
        setBackgroundRefreshInProgress(true);
        
        // Refresh in background without blocking UI
        setTimeout(async () => {
          try {
            await loadAccounts(true);
            setBackgroundRefreshInProgress(false);
          } catch (error) {
            console.error('Background refresh failed:', error);
            setBackgroundRefreshInProgress(false);
          }
        }, 1000); // Small delay to ensure UI is responsive
      }
    } catch (error) {
      console.error('Smart loading failed:', error);
    }
  }, [loadAccounts, cacheInfo?.status, backgroundRefreshInProgress]);

  // Refresh all accounts from Google Drive API
  const refreshAllAccounts = useCallback(async (): Promise<void> => {
    try {
      setIsRefreshing(true);
      setError('');
      
      console.log('useGoogleDriveManagement: Refreshing all accounts...');
      await googleDriveService.refreshAllAccounts();
      await loadAccounts(true);
      
      console.log('useGoogleDriveManagement: All accounts refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh all accounts';
      console.error('useGoogleDriveManagement: Error refreshing all accounts:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAccounts]);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Load initial data
  useEffect(() => {
    console.log('useGoogleDriveManagement: Loading initial data...');
    loadAccountsSmart();
  }, [loadAccountsSmart]);

  // WebSocket real-time updates
  useEffect(() => {
    if (isConnected) {
      console.log('useGoogleDriveManagement: WebSocket connected, setting up real-time updates');
      
      // Set up WebSocket event listeners for Google Drive updates
      const handleAccountUpdate = (data: GoogleDriveAccount) => {
        console.log('useGoogleDriveManagement: Account updated via WebSocket:', data);
        setAccounts(prev => prev.map(account => 
          account.account_id === data.account_id ? data : account
        ));
      };

      const handleStatsUpdate = (data: GoogleDriveStats) => {
        console.log('useGoogleDriveManagement: Stats updated via WebSocket:', data);
        setStats(data);
      };

      const handleCacheUpdate = (data: CacheInfo) => {
        console.log('useGoogleDriveManagement: Cache updated via WebSocket:', data);
        setCacheInfo(data);
      };

      // Note: WebSocket event listeners would be set up here
      // This would integrate with the existing adminSocketService
      
      return () => {
        console.log('useGoogleDriveManagement: Cleaning up WebSocket listeners');
        // Cleanup WebSocket listeners
      };
    }
  }, [isConnected]);

  return {
    // Data state
    accounts,
    stats,
    cacheInfo,
    
    // UI state
    loading,
    isRefreshing,
    backgroundRefreshInProgress,
    error,
    
    // Modal states
    showAddAccountModal,
    showAccountDetailsModal,
    selectedAccount,
    
    // Actions
    loadAccounts,
    refreshAllAccounts,
    setShowAddAccountModal,
    setShowAccountDetailsModal,
    setSelectedAccount,
    clearError
  };
};
