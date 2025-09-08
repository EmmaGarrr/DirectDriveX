import { useState, useCallback } from 'react';
import { backupService } from '@/services/admin/backupService';
import { UseBackupOperationsReturn } from '@/types/backup';

export const useBackupOperations = (): UseBackupOperationsReturn => {
  const [operationLoading, setOperationLoading] = useState({
    massBackup: false,
    cleanup: false
  });

  const triggerMassBackup = useCallback(async (): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, massBackup: true }));
      console.log('useBackupOperations: Triggering mass backup...');
      
      const response = await backupService.triggerMassBackup();
      console.log('useBackupOperations: Mass backup triggered:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger mass backup';
      console.error('useBackupOperations: Error triggering mass backup:', errorMessage);
      throw err; // Re-throw to let the calling component handle the error
    } finally {
      setOperationLoading(prev => ({ ...prev, massBackup: false }));
    }
  }, []);

  const runCleanup = useCallback(async (): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, cleanup: true }));
      console.log('useBackupOperations: Running backup cleanup...');
      
      const response = await backupService.runCleanup();
      console.log('useBackupOperations: Backup cleanup completed:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run backup cleanup';
      console.error('useBackupOperations: Error running backup cleanup:', errorMessage);
      throw err; // Re-throw to let the calling component handle the error
    } finally {
      setOperationLoading(prev => ({ ...prev, cleanup: false }));
    }
  }, []);

  const cancelOperation = useCallback(async (operationId: string): Promise<void> => {
    try {
      console.log(`useBackupOperations: Cancelling operation ${operationId}...`);
      // In a real implementation, this would call an API to cancel the operation
      // For now, we'll just log the cancellation
      console.log('useBackupOperations: Operation cancellation requested (not implemented in demo mode)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel operation';
      console.error('useBackupOperations: Error cancelling operation:', errorMessage);
      throw err;
    }
  }, []);

  return {
    operationLoading,
    triggerMassBackup,
    runCleanup,
    cancelOperation
  };
};

