import { useState, useCallback } from 'react';
import { backupService } from '@/services/admin/backupService';
import { 
  BackupStatus, 
  UseBackupManagementReturn 
} from '@/types/backup';

export const useBackupManagement = (): UseBackupManagementReturn => {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState({
    status: false,
    queue: false,
    failures: false
  });
  const [error, setError] = useState({
    status: '',
    queue: '',
    failures: ''
  });

  const loadBackupStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, status: true }));
      setError(prev => ({ ...prev, status: '' }));
      
      console.log('useBackupManagement: Loading backup status...');
      const status = await backupService.getBackupStatus();
      setBackupStatus(status);
      console.log('useBackupManagement: Backup status loaded:', status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load backup status';
      console.error('useBackupManagement: Error loading backup status:', errorMessage);
      setError(prev => ({ ...prev, status: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  }, []);

  const refreshAll = useCallback(async (): Promise<void> => {
    try {
      console.log('useBackupManagement: Refreshing all backup data...');
      await backupService.refreshAll();
      // Reload status after refresh
      await loadBackupStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh backup data';
      console.error('useBackupManagement: Error refreshing backup data:', errorMessage);
      setError(prev => ({ ...prev, status: errorMessage }));
    }
  }, [loadBackupStatus]);

  const handleError = useCallback((type: 'status' | 'queue' | 'failures', error: string): void => {
    console.error(`useBackupManagement: Error in ${type}:`, error);
    setError(prev => ({ ...prev, [type]: error }));
  }, []);

  const clearError = useCallback((type: 'status' | 'queue' | 'failures'): void => {
    console.log(`useBackupManagement: Clearing ${type} error`);
    setError(prev => ({ ...prev, [type]: '' }));
  }, []);

  return {
    backupStatus,
    loading,
    error,
    loadBackupStatus,
    refreshAll,
    handleError,
    clearError
  };
};