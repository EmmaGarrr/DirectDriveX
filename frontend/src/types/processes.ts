export interface ProcessQueueStatus {
  admin_queue_size: number;
  user_queue_size: number;
  processing_count: number;
}

export interface PrioritySystemInfo {
  admin_workers: number;
  user_workers: number;
  total_requests_processed: number;
}

export interface BackgroundProcess {
  process_id: string;
  process_type: string;
  priority: 'HIGH' | 'NORMAL';
  description: string;
  admin_initiated: boolean;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  error_message?: string;
  result?: any;
  metadata?: any;
}

export interface UseProcessManagementReturn {
  queueStatus: ProcessQueueStatus | null;
  activeProcesses: BackgroundProcess[];
  priorityInfo: PrioritySystemInfo | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastRefreshTime: Date | null;
  manualRefresh: () => void;
  cancelProcess: (processId: string) => Promise<void>;
  triggerQuotaRefresh: () => Promise<void>;
}