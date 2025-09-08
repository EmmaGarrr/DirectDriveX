import { useState, useCallback } from 'react';
import { backupService } from '@/services/admin/backupService';
import { 
  BackupFailure, 
  FailurePattern, 
  UseBackupFailuresReturn 
} from '@/types/backup';

export const useBackupFailures = (): UseBackupFailuresReturn => {
  const [failures, setFailures] = useState<BackupFailure[]>([]);
  const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([]);
  const [failurePeriod, setFailurePeriod] = useState(30);
  const [failuresPage, setFailuresPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBackupFailures = useCallback(async (page: number = failuresPage, period: number = failurePeriod): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`useBackupFailures: Loading backup failures (page: ${page}, period: ${period} days)...`);
      const response = await backupService.getBackupFailures(page, 10, period); // Default limit of 10
      setFailures(response.failed_backups);
      setFailurePatterns(response.failure_patterns);
      setFailuresPage(page);
      setFailurePeriod(period);
      console.log('useBackupFailures: Backup failures loaded:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load backup failures';
      console.error('useBackupFailures: Error loading backup failures:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [failuresPage, failurePeriod]);

  const changePeriod = useCallback((period: number): void => {
    console.log(`useBackupFailures: Changing period to ${period} days`);
    setFailurePeriod(period);
    setFailuresPage(1); // Reset to first page when changing period
    loadBackupFailures(1, period);
  }, [loadBackupFailures]);

  const changePage = useCallback((page: number): void => {
    console.log(`useBackupFailures: Changing to page ${page}`);
    setFailuresPage(page);
    loadBackupFailures(page, failurePeriod);
  }, [loadBackupFailures, failurePeriod]);

  const refreshFailures = useCallback(async (): Promise<void> => {
    try {
      console.log('useBackupFailures: Refreshing backup failures...');
      await loadBackupFailures(failuresPage, failurePeriod);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh backup failures';
      console.error('useBackupFailures: Error refreshing backup failures:', errorMessage);
      setError(errorMessage);
    }
  }, [loadBackupFailures, failuresPage, failurePeriod]);

  const clearError = useCallback((): void => {
    console.log('useBackupFailures: Clearing error');
    setError('');
  }, []);

  return {
    failures,
    failurePatterns,
    failurePeriod,
    failuresPage,
    loading,
    error,
    loadBackupFailures,
    changePeriod,
    changePage,
    refreshFailures,
    clearError
  };
};