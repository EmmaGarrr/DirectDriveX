"use client";

import { useState, useEffect, useCallback } from "react";
import { DatabaseBackup, RefreshCw, AlertCircle } from "lucide-react";
import { BackupStatusOverview } from "@/components/admin/backup/BackupStatusOverview";
import { BackupQueue } from "@/components/admin/backup/BackupQueue";
import { BackupFailures } from "@/components/admin/backup/BackupFailures";
import { BackupProgressModal } from "@/components/admin/backup/BackupProgressModal";
import { useBackupManagement } from "@/hooks/useBackupManagement";
import { useBackupQueue } from "@/hooks/useBackupQueue";
import { useBackupFailures } from "@/hooks/useBackupFailures";
import { useBackupOperations } from "@/hooks/useBackupOperations";
import { useAdminSocket } from "@/hooks/useAdminSocket";
import { adminAuthService } from "@/services/adminAuthService";
import { adminSocketService } from "@/services/adminSocketService";
import { toastService } from "@/services/toastService";
import { BackupProgress } from "@/types/backup";

export default function BackupManagementPage() {
  // Initialize all backup hooks
  const backupManagement = useBackupManagement();
  const backupQueue = useBackupQueue();
  const backupFailures = useBackupFailures();
  const backupOperations = useBackupOperations();
  
  // WebSocket integration
  const { isConnected } = useAdminSocket();
  
  // Progress modal state
  const [progressModal, setProgressModal] = useState<{
    isOpen: boolean;
    progress: BackupProgress | null;
  }>({
    isOpen: false,
    progress: null
  });

  // Load initial data
  useEffect(() => {
    console.log('BackupManagementPage: Loading initial data...');
    const loadInitialData = async () => {
      try {
        await Promise.all([
          backupManagement.loadBackupStatus(),
          backupQueue.loadBackupQueue(),
          backupFailures.loadBackupFailures()
        ]);
        console.log('BackupManagementPage: Initial data loaded successfully');
      } catch (error) {
        console.error('BackupManagementPage: Error loading initial data:', error);
        toastService.error('Failed to load backup data');
      }
    };

    loadInitialData();
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    console.log('BackupManagementPage: Setting up WebSocket subscriptions...');
    
    const unsubscribeStatus = adminSocketService.onBackupStatusUpdate((data) => {
      console.log('BackupManagementPage: Received backup status update:', data);
      backupManagement.loadBackupStatus();
    });

    const unsubscribeQueue = adminSocketService.onBackupQueueUpdate((data) => {
      console.log('BackupManagementPage: Received backup queue update:', data);
      backupQueue.refreshQueue();
    });

    const unsubscribeFailures = adminSocketService.onBackupFailureUpdate((data) => {
      console.log('BackupManagementPage: Received backup failure update:', data);
      backupFailures.refreshFailures();
    });

    const unsubscribeProgress = adminSocketService.onBackupProgressUpdate((data) => {
      console.log('BackupManagementPage: Received backup progress update:', data);
      setProgressModal({
        isOpen: true,
        progress: data
      });
    });

    const unsubscribeMassBackup = adminSocketService.onMassBackupComplete((data) => {
      console.log('BackupManagementPage: Mass backup completed:', data);
      toastService.success('Mass backup operation completed successfully');
      setProgressModal(prev => ({ ...prev, isOpen: false }));
      backupManagement.loadBackupStatus();
    });

    const unsubscribeCleanup = adminSocketService.onBackupCleanupComplete((data) => {
      console.log('BackupManagementPage: Backup cleanup completed:', data);
      toastService.success('Backup cleanup operation completed successfully');
      setProgressModal(prev => ({ ...prev, isOpen: false }));
      backupManagement.loadBackupStatus();
    });

    return () => {
      console.log('BackupManagementPage: Cleaning up WebSocket subscriptions...');
      unsubscribeStatus();
      unsubscribeQueue();
      unsubscribeFailures();
      unsubscribeProgress();
      unsubscribeMassBackup();
      unsubscribeCleanup();
    };
  }, [isConnected, backupManagement, backupQueue, backupFailures]);

  // Handle mass backup operation
  const handleTriggerMassBackup = useCallback(async () => {
    try {
      console.log('BackupManagementPage: Triggering mass backup...');
      await backupOperations.triggerMassBackup();
      
      // Show progress modal
      setProgressModal({
        isOpen: true,
        progress: {
          operation_id: `mass_backup_${Date.now()}`,
          operation_type: 'mass_backup',
          status: 'in_progress',
          progress_percentage: 0,
          files_processed: 0,
          total_files: backupManagement.backupStatus?.backup_summary.total_files || 0,
          start_time: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        }
      });
    } catch (error) {
      console.error('BackupManagementPage: Error triggering mass backup:', error);
      toastService.error('Failed to trigger mass backup');
    }
  }, [backupOperations, backupManagement.backupStatus]);

  // Handle cleanup operation
  const handleRunCleanup = useCallback(async () => {
    try {
      console.log('BackupManagementPage: Running backup cleanup...');
      await backupOperations.runCleanup();
      
      // Show progress modal
      setProgressModal({
        isOpen: true,
        progress: {
          operation_id: `cleanup_${Date.now()}`,
          operation_type: 'cleanup',
          status: 'in_progress',
          progress_percentage: 0,
          files_processed: 0,
          total_files: 100, // Estimated cleanup items
          start_time: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        }
      });
    } catch (error) {
      console.error('BackupManagementPage: Error running cleanup:', error);
      toastService.error('Failed to run backup cleanup');
    }
  }, [backupOperations]);

  // Handle refresh all
  const handleRefreshAll = useCallback(async () => {
    try {
      console.log('BackupManagementPage: Refreshing all data...');
      await backupManagement.refreshAll();
      await backupQueue.refreshQueue();
      await backupFailures.refreshFailures();
      toastService.info('Backup data refreshed successfully');
    } catch (error) {
      console.error('BackupManagementPage: Error refreshing data:', error);
      toastService.error('Failed to refresh backup data');
    }
  }, [backupManagement, backupQueue, backupFailures]);

  // Handle progress modal close
  const handleCloseProgressModal = useCallback(() => {
    setProgressModal({ isOpen: false, progress: null });
  }, []);

  // Handle operation cancellation
  const handleCancelOperation = useCallback(async (operationId: string) => {
    try {
      console.log('BackupManagementPage: Cancelling operation:', operationId);
      await backupOperations.cancelOperation(operationId);
      toastService.info('Operation cancellation requested');
      setProgressModal(prev => ({
        ...prev,
        progress: prev.progress ? { ...prev.progress, status: 'cancelled' } : null
      }));
    } catch (error) {
      console.error('BackupManagementPage: Error cancelling operation:', error);
      toastService.error('Failed to cancel operation');
    }
  }, [backupOperations]);

  // Check for any errors
  const hasErrors = backupManagement.error.status || 
                   backupQueue.error || 
                   backupFailures.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <DatabaseBackup className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Backup Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitor and manage system-wide file backups.
              {isConnected && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Updates
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasErrors && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <AlertCircle className="w-4 h-4" />
              Some data may be outdated
            </div>
          )}
        <button
            onClick={handleRefreshAll}
            disabled={backupManagement.loading.status || backupQueue.loading || backupFailures.loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${(backupManagement.loading.status || backupQueue.loading || backupFailures.loading) ? 'animate-spin' : ''}`} />
            {(backupManagement.loading.status || backupQueue.loading || backupFailures.loading) ? 'Refreshing...' : 'Refresh All'}
        </button>
        </div>
      </div>

      {/* Error Display */}
      {hasErrors && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Data Loading Issues</h4>
              <div className="text-sm text-red-700 dark:text-red-400 mt-1 space-y-1">
                {backupManagement.error.status && <p>• Status: {backupManagement.error.status}</p>}
                {backupQueue.error && <p>• Queue: {backupQueue.error}</p>}
                {backupFailures.error && <p>• Failures: {backupFailures.error}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Status Overview */}
      <BackupStatusOverview 
        status={backupManagement.backupStatus}
        loading={backupManagement.loading.status}
        onTriggerMassBackup={handleTriggerMassBackup}
        onRunCleanup={handleRunCleanup}
        operationLoading={backupOperations.operationLoading}
      />

      {/* Backup Queue */}
      <BackupQueue 
        queue={backupQueue.backupQueue}
        loading={backupQueue.loading}
        currentPage={backupQueue.queuePage}
        onPageChange={backupQueue.changePage}
        onRefresh={backupQueue.refreshQueue}
      />

      {/* Backup Failures */}
      <BackupFailures 
        failures={backupFailures.failures}
        failurePatterns={backupFailures.failurePatterns}
        loading={backupFailures.loading}
        currentPage={backupFailures.failuresPage}
        period={backupFailures.failurePeriod}
        onPageChange={backupFailures.changePage}
        onPeriodChange={backupFailures.changePeriod}
        onRefresh={backupFailures.refreshFailures}
      />

      {/* Progress Modal */}
      <BackupProgressModal
        isOpen={progressModal.isOpen}
        onClose={handleCloseProgressModal}
        progress={progressModal.progress}
        onCancel={handleCancelOperation}
      />
    </div>
  );
}