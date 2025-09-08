import { useState, useCallback } from 'react';
import { backupService } from '@/services/admin/backupService';
import { 
  BackupQueue, 
  UseBackupQueueReturn 
} from '@/types/backup';

export const useBackupQueue = (): UseBackupQueueReturn => {
  const [backupQueue, setBackupQueue] = useState<BackupQueue | null>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBackupQueue = useCallback(async (page: number = queuePage): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`useBackupQueue: Loading backup queue (page: ${page})...`);
      const queue = await backupService.getBackupQueue(page, 10); // Default limit of 10
      setBackupQueue(queue);
      setQueuePage(page);
      console.log('useBackupQueue: Backup queue loaded:', queue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load backup queue';
      console.error('useBackupQueue: Error loading backup queue:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [queuePage]);

  const changePage = useCallback((page: number): void => {
    console.log(`useBackupQueue: Changing to page ${page}`);
    setQueuePage(page);
    loadBackupQueue(page);
  }, [loadBackupQueue]);

  const refreshQueue = useCallback(async (): Promise<void> => {
    try {
      console.log('useBackupQueue: Refreshing backup queue...');
      await loadBackupQueue(queuePage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh backup queue';
      console.error('useBackupQueue: Error refreshing backup queue:', errorMessage);
      setError(errorMessage);
    }
  }, [loadBackupQueue, queuePage]);

  const clearError = useCallback((): void => {
    console.log('useBackupQueue: Clearing error');
    setError('');
  }, []);

  return {
    backupQueue,
    queuePage,
    loading,
    error,
    loadBackupQueue,
    changePage,
    refreshQueue,
    clearError
  };
};