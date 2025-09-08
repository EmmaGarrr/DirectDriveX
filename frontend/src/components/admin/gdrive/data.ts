import { GoogleDriveAccount, GoogleDriveStats, CacheInfo } from '@/types/google-drive';

export const mockStats: GoogleDriveStats = {
  total_accounts: 5,
  active_accounts: 4,
  total_storage_used: 12.5 * 1024 * 1024 * 1024 * 1024, // 12.5 TB
  total_storage_quota: 25 * 1024 * 1024 * 1024 * 1024, // 25 TB
  average_performance: 92.5,
};

export const mockCacheInfo: CacheInfo = {
  status: 'fresh',
  last_updated: new Date().toISOString(),
  cache_expiry_seconds: 300, // 5 minutes
  is_forced_refresh: false,
};

export const mockAccounts: GoogleDriveAccount[] = [
  {
    account_id: 'acc_1',
    email: 'storage-primary@directdrivex.iam.gserviceaccount.com',
    alias: 'Primary Storage Account',
    is_active: true,
    storage_used: 5.2 * 1024 * 1024 * 1024 * 1024,
    storage_quota: 10 * 1024 * 1024 * 1024 * 1024,
    storage_percentage: 52,
    files_count: 12580,
    last_activity: new Date(Date.now() - 3600000).toISOString(),
    health_status: 'healthy',
    performance_score: 98.2,
    folder_info: {
      folder_id: 'folder123',
      folder_name: 'DirectDriveX-Primary',
      folder_path: '/DirectDriveX/Primary',
    },
    last_quota_check: new Date().toISOString(),
    data_freshness: 'fresh',
  },
  {
    account_id: 'acc_2',
    email: 'storage-secondary-01@directdrivex.iam.gserviceaccount.com',
    alias: 'Secondary Storage 01',
    is_active: true,
    storage_used: 6.8 * 1024 * 1024 * 1024 * 1024,
    storage_quota: 10 * 1024 * 1024 * 1024 * 1024,
    storage_percentage: 68,
    files_count: 21050,
    last_activity: new Date(Date.now() - 7200000).toISOString(),
    health_status: 'healthy',
    performance_score: 95.1,
    folder_info: {
      folder_id: 'folder456',
      folder_name: 'DirectDriveX-Secondary-01',
      folder_path: '/DirectDriveX/Secondary-01',
    },
    last_quota_check: new Date().toISOString(),
    data_freshness: 'fresh',
  },
  {
    account_id: 'acc_3',
    email: 'storage-archive-low@directdrivex.iam.gserviceaccount.com',
    alias: 'Archive Storage (Low Priority)',
    is_active: true,
    storage_used: 0.5 * 1024 * 1024 * 1024 * 1024,
    storage_quota: 2 * 1024 * 1024 * 1024 * 1024,
    storage_percentage: 25,
    files_count: 850,
    last_activity: new Date(Date.now() - 86400000).toISOString(),
    health_status: 'warning',
    performance_score: 75.5,
    folder_info: {
      folder_id: 'folder789',
      folder_name: 'DirectDriveX-Archive-Low',
      folder_path: '/DirectDriveX/Archive-Low',
    },
    last_quota_check: new Date(Date.now() - 2 * 3600000).toISOString(),
    data_freshness: 'stale',
  },
  {
    account_id: 'acc_4',
    email: 'storage-backup-eu@directdrivex.iam.gserviceaccount.com',
    alias: 'EU Backup Storage',
    is_active: false,
    storage_used: 0,
    storage_quota: 1 * 1024 * 1024 * 1024 * 1024,
    storage_percentage: 0,
    files_count: 0,
    last_activity: new Date(Date.now() - 5 * 86400000).toISOString(),
    health_status: 'unknown',
    performance_score: 0,
    folder_info: {
      folder_id: 'folder101',
      folder_name: 'DirectDriveX-Backup-EU',
      folder_path: '/DirectDriveX/Backup-EU',
    },
    last_quota_check: new Date(Date.now() - 24 * 3600000).toISOString(),
    data_freshness: 'stale',
  },
  {
    account_id: 'acc_5',
    email: 'storage-critical-alert@directdrivex.iam.gserviceaccount.com',
    alias: 'Critical Alert Storage',
    is_active: true,
    storage_used: 1.8 * 1024 * 1024 * 1024 * 1024,
    storage_quota: 2 * 1024 * 1024 * 1024 * 1024,
    storage_percentage: 90,
    files_count: 3200,
    last_activity: new Date(Date.now() - 600000).toISOString(),
    health_status: 'quota_warning',
    performance_score: 88.0,
    folder_info: {
      folder_id: 'folder202',
      folder_name: 'DirectDriveX-Critical',
      folder_path: '/DirectDriveX/Critical',
    },
    last_quota_check: new Date().toISOString(),
    data_freshness: 'fresh',
  },
];