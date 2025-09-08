// Core backup data interfaces
export interface BackupSummary {
  total_files: number;
  backed_up_files: number;
  backup_percentage: number;
  in_progress: number;
  failed: number;
  total_backup_size: number; // in bytes
}

export interface BackupStatus {
  backup_summary: BackupSummary;
  hetzner_status: 'connected' | 'disconnected' | 'error' | 'not_configured';
}

export interface BackupQueueItem {
  id: string;
  filename: string;
  size_bytes: number;
  upload_date: string;
  backup_status: 'pending' | 'in_progress';
  user_id: string;
}

export interface BackupQueue {
  queue_files: BackupQueueItem[];
  total_in_queue: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BackupFailure {
  id: string;
  filename: string;
  size_bytes: number;
  failed_at: string;
  backup_error: string;
  user_id: string;
}

export interface FailurePattern {
  error_type: string;
  count: number;
}

// Extended interfaces for comprehensive backup management
export interface BackupFailuresResponse {
  failed_backups: BackupFailure[];
  failure_patterns: FailurePattern[];
  total_failures: number;
  page: number;
  limit: number;
  total_pages: number;
  period_days: number;
}

export interface BackupUpdate {
  type: 'status_update' | 'queue_update' | 'failure_update' | 'progress_update';
  data: any;
  timestamp: string;
}

export interface BackupProgress {
  operation_id: string;
  operation_type: 'mass_backup' | 'cleanup' | 'individual_backup';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress_percentage: number;
  current_file?: string;
  files_processed: number;
  total_files: number;
  start_time: string;
  estimated_completion?: string;
  error_message?: string;
}

export interface MassBackupResponse {
  message: string;
  operation_id: string;
  estimated_duration?: string;
}

export interface CleanupResponse {
  message: string;
  files_cleaned: number;
  space_freed: number;
}

// Hook return types
export interface UseBackupManagementReturn {
  backupStatus: BackupStatus | null;
  loading: {
    status: boolean;
    queue: boolean;
    failures: boolean;
  };
  error: {
    status: string;
    queue: string;
    failures: string;
  };
  loadBackupStatus: () => Promise<void>;
  refreshAll: () => Promise<void>;
  handleError: (type: 'status' | 'queue' | 'failures', error: string) => void;
  clearError: (type: 'status' | 'queue' | 'failures') => void;
}

export interface UseBackupQueueReturn {
  backupQueue: BackupQueue | null;
  queuePage: number;
  loading: boolean;
  error: string;
  loadBackupQueue: (page?: number) => Promise<void>;
  changePage: (page: number) => void;
  refreshQueue: () => Promise<void>;
  clearError: () => void;
}

export interface UseBackupFailuresReturn {
  failures: BackupFailure[];
  failurePatterns: FailurePattern[];
  failurePeriod: number;
  failuresPage: number;
  loading: boolean;
  error: string;
  loadBackupFailures: (page?: number, period?: number) => Promise<void>;
  changePeriod: (period: number) => void;
  changePage: (page: number) => void;
  refreshFailures: () => Promise<void>;
  clearError: () => void;
}

export interface UseBackupOperationsReturn {
  operationLoading: {
    massBackup: boolean;
    cleanup: boolean;
  };
  triggerMassBackup: () => Promise<void>;
  runCleanup: () => Promise<void>;
  cancelOperation: (operationId: string) => Promise<void>;
}

// Component prop types
export interface BackupStatusOverviewProps {
  status: BackupStatus | null;
  loading: boolean;
  onTriggerMassBackup: () => void;
  onRunCleanup: () => void;
  operationLoading: {
    massBackup: boolean;
    cleanup: boolean;
  };
}

export interface BackupQueueProps {
  queue: BackupQueue | null;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export interface BackupFailuresProps {
  failures: BackupFailure[];
  failurePatterns: FailurePattern[];
  loading: boolean;
  currentPage: number;
  period: number;
  onPageChange: (page: number) => void;
  onPeriodChange: (period: number) => void;
  onRefresh: () => void;
}

export interface BackupProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: BackupProgress | null;
  onCancel: (operationId: string) => void;
}

// API request/response types
export interface BackupQueueParams {
  page: number;
  limit: number;
}

export interface BackupFailuresParams {
  page: number;
  limit: number;
  days: number;
}

// Utility types
export type BackupStatusType = 'connected' | 'disconnected' | 'error' | 'not_configured';
export type BackupQueueStatus = 'pending' | 'in_progress';
export type BackupOperationType = 'mass_backup' | 'cleanup' | 'individual_backup';
export type BackupProgressStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';