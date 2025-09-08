// Google Drive Management Types - Complete Angular Parity

export interface GoogleDriveAccount {
  account_id: string;
  email: string;
  alias?: string;
  is_active: boolean;
  storage_used: number;
  storage_quota: number;
  storage_used_formatted?: string;
  storage_quota_formatted?: string;
  storage_percentage?: number;
  files_count: number;
  last_activity: string;
  health_status: string;
  performance_score: number;
  created_at?: string;
  updated_at?: string;
  folder_id?: string | null;
  folder_name?: string | null;
  folder_path?: string | null;
  folder_info?: {
    folder_id: string;
    folder_name: string;
    folder_path: string;
  };
  last_quota_check?: string;
  data_freshness?: 'fresh' | 'stale';
}

export interface GoogleDriveAccountsResponse {
  accounts: GoogleDriveAccount[];
  statistics: {
    total_accounts: number;
    active_accounts: number;
    total_storage_used: number;
    total_storage_quota: number;
    average_performance: number;
  };
  cache_info?: {
    status: 'fresh' | 'stale' | 'error';
    last_updated: string;
    cache_expiry_seconds: number;
    is_forced_refresh: boolean;
  };
}

export interface AddAccountRequest {
  service_account_key: string;
  account_email: string;
  account_alias: string;
}

export interface CacheInfo {
  status: 'fresh' | 'stale' | 'error';
  last_updated: string;
  cache_expiry_seconds: number;
  is_forced_refresh: boolean;
}

export interface GoogleDriveStats {
  total_accounts: number;
  active_accounts: number;
  total_storage_used: number;
  total_storage_quota: number;
  average_performance: number;
}

export interface OperationProgress {
  operation: string;
  account_id: string;
  progress: number;
  status: 'in_progress' | 'completed' | 'failed';
  message: string;
  details?: any;
}

export interface DeleteAllFilesResponse {
  gdrive_deleted: number;
  mongodb_soft_deleted: number;
  gdrive_errors: number;
  message: string;
}

// Hook Return Types
export interface UseGoogleDriveManagementReturn {
  // Data state
  accounts: GoogleDriveAccount[];
  stats: GoogleDriveStats | null;
  cacheInfo: CacheInfo | null;
  
  // UI state
  loading: boolean;
  isRefreshing: boolean;
  backgroundRefreshInProgress: boolean;
  error: string;
  
  // Modal states
  showAddAccountModal: boolean;
  showAccountDetailsModal: boolean;
  selectedAccount: GoogleDriveAccount | null;
  
  // Actions
  loadAccounts: (forceRefresh?: boolean) => Promise<void>;
  refreshAllAccounts: () => Promise<void>;
  setShowAddAccountModal: (show: boolean) => void;
  setShowAccountDetailsModal: (show: boolean) => void;
  setSelectedAccount: (account: GoogleDriveAccount | null) => void;
  clearError: () => void;
}

export interface UseGoogleDriveAccountsReturn {
  // Account operations
  addAccount: (accountData: AddAccountRequest) => Promise<void>;
  removeAccount: (accountId: string, force?: boolean) => Promise<void>;
  toggleAccount: (accountId: string) => Promise<void>;
  refreshAccountStats: (accountId: string) => Promise<void>;
  deleteAllAccountFiles: (accountId: string) => Promise<DeleteAllFilesResponse>;
  viewAccountDetails: (accountId: string) => Promise<GoogleDriveAccount>;
  
  // Loading states
  operationLoading: {
    add: boolean;
    remove: boolean;
    toggle: boolean;
    refresh: boolean;
    deleteFiles: boolean;
    viewDetails: boolean;
  };
}

export interface UseGoogleDriveOperationsReturn {
  // Form state
  addAccountForm: AddAccountRequest;
  setAddAccountForm: (form: AddAccountRequest) => void;
  resetAddAccountForm: () => void;
  
  // Form validation
  validateForm: () => { isValid: boolean; errors: Record<string, string> };
  validateServiceAccountKey: (key: string) => { isValid: boolean; error?: string };
  
  // Form submission
  submitAddAccount: () => Promise<void>;
}

export interface UseGoogleDriveStatsReturn {
  // Statistics
  totalAccounts: number;
  activeAccounts: number;
  totalStorageUsed: number;
  totalStorageQuota: number;
  averagePerformance: number;
  
  // Utility functions
  formatBytes: (bytes: number) => string;
  getStoragePercentage: (used: number, quota: number) => number;
  getHealthStatusClass: (status: string) => string;
  getHealthStatusText: (status: string) => string;
  getPerformanceClass: (score: number) => string;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
}

// Component Props Types
export interface GoogleDriveManagementProps {
  // Props will be defined by the component that uses this
}

export interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: AddAccountRequest) => Promise<void>;
  loading: boolean;
  error: string;
}

export interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: GoogleDriveAccount | null;
  loading: boolean;
  error: string;
}

// WebSocket Event Types
export interface GoogleDriveWebSocketEvents {
  'google-drive-account-updated': (data: GoogleDriveAccount) => void;
  'google-drive-stats-updated': (data: GoogleDriveStats) => void;
  'google-drive-operation-progress': (data: OperationProgress) => void;
  'google-drive-cache-updated': (data: CacheInfo) => void;
}

// Form Validation Types
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ServiceAccountKeyValidation {
  isValid: boolean;
  error?: string;
  parsedKey?: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GoogleDriveApiError {
  detail: string;
  status_code: number;
  timestamp: string;
}

// Cache Management Types
export interface CacheStatus {
  status: 'fresh' | 'stale' | 'error';
  last_updated: string;
  cache_expiry_seconds: number;
  is_forced_refresh: boolean;
}

// Performance and Health Types
export type HealthStatus = 'healthy' | 'warning' | 'quota_warning' | 'critical' | 'unknown';
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor';
export type DataFreshness = 'fresh' | 'stale';

// Operation Types
export type GoogleDriveOperation = 
  | 'add_account'
  | 'remove_account'
  | 'toggle_account'
  | 'refresh_stats'
  | 'delete_all_files'
  | 'view_details'
  | 'refresh_all';

// Modal Types
export type ModalType = 'add_account' | 'account_details' | 'delete_confirmation' | 'operation_progress';

// Loading State Types
export interface LoadingStates {
  accounts: boolean;
  stats: boolean;
  operations: {
    add: boolean;
    remove: boolean;
    toggle: boolean;
    refresh: boolean;
    deleteFiles: boolean;
    viewDetails: boolean;
  };
  refresh: boolean;
  backgroundRefresh: boolean;
}

// Error State Types
export interface ErrorStates {
  general: string;
  operations: {
    add: string;
    remove: string;
    toggle: string;
    refresh: string;
    deleteFiles: string;
    viewDetails: string;
  };
  validation: Record<string, string>;
}
