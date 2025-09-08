"use client";

import { useState, useCallback, useEffect } from 'react';
import { adminStatsService } from '@/services/adminStatsService';
import { 
  SystemStats, 
  GoogleDriveStats, 
  AdminNotification, 
  SystemHealth, 
  UploadActivityData,
  StorageDistributionData
} from '@/types/admin';

interface DashboardState {
  // Stats data
  systemStats: SystemStats;
  gdriveStats: GoogleDriveStats;
  uploadActivity: UploadActivityData[];
  storageDistribution: StorageDistributionData;
  
  // Loading states
  loadingSystemStats: boolean;
  loadingGdriveStats: boolean;
  loadingUploadActivity: boolean;
  loadingStorageDistribution: boolean;
  
  // Error states
  systemStatsError: string;
  gdriveStatsError: string;
  uploadActivityError: string;
  storageDistributionError: string;
  
  // UI state
  notifications: AdminNotification[];
  notificationCount: number;
}

const initialSystemStats: SystemStats = {
  totalUsers: 0,
  totalFiles: 0,
  totalStorage: 0,
  systemHealth: 'unknown'
};

const initialGdriveStats: GoogleDriveStats = {
  totalAccounts: 0,
  activeAccounts: 0,
  totalQuota: 0,
  totalUsed: 0,
  health: 'unknown'
};

export const useAdminDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    systemStats: initialSystemStats,
    gdriveStats: initialGdriveStats,
    uploadActivity: [],
    storageDistribution: { googleDrive: 0, hetzner: 0 },
    loadingSystemStats: false,
    loadingGdriveStats: false,
    loadingUploadActivity: false,
    loadingStorageDistribution: false,
    systemStatsError: '',
    gdriveStatsError: '',
    uploadActivityError: '',
    storageDistributionError: '',
    notifications: [
      { 
        id: '1', 
        type: 'info', 
        title: 'System Status', 
        message: 'All systems operational', 
        timestamp: new Date() 
      },
      { 
        id: '2', 
        type: 'success', 
        title: 'Backup Complete', 
        message: 'Daily backup completed successfully', 
        timestamp: new Date(Date.now() - 3600000) 
      }
    ],
    notificationCount: 2
  });
  
  const loadSystemStats = useCallback(async () => {
    setState(prev => ({ ...prev, loadingSystemStats: true, systemStatsError: '' }));
    
    try {
      const response = await adminStatsService.getSystemHealth();
      
      const systemStats: SystemStats = {
        totalUsers: response.database.total_users,
        totalFiles: response.database.total_files,
        totalStorage: response.database.size_bytes,
        systemHealth: adminStatsService.calculateSystemHealth(response)
      };
      
      setState(prev => ({ ...prev, systemStats, loadingSystemStats: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        systemStatsError: error instanceof Error ? error.message : 'Failed to load system stats',
        loadingSystemStats: false
      }));
    }
  }, []);
  
  const loadGoogleDriveStats = useCallback(async () => {
    setState(prev => ({ ...prev, loadingGdriveStats: true, gdriveStatsError: '' }));
    
    try {
      const response = await adminStatsService.getGoogleDriveStats();
      
      const gdriveStats: GoogleDriveStats = {
        totalAccounts: response.total_accounts,
        activeAccounts: response.active_accounts,
        totalQuota: response.total_storage_quota,
        totalUsed: response.total_storage_used,
        health: response.health_status
      };
      
      setState(prev => ({ ...prev, gdriveStats, loadingGdriveStats: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        gdriveStatsError: error instanceof Error ? error.message : 'Failed to load Google Drive stats',
        loadingGdriveStats: false
      }));
    }
  }, []);
  
  const loadUploadActivity = useCallback(async (days: number = 14) => {
    setState(prev => ({ ...prev, loadingUploadActivity: true, uploadActivityError: '' }));
    
    try {
      const data = await adminStatsService.getUploadActivity(days);
      setState(prev => ({ ...prev, uploadActivity: data, loadingUploadActivity: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploadActivityError: error instanceof Error ? error.message : 'Failed to load upload activity',
        loadingUploadActivity: false
      }));
    }
  }, []);
  
  const loadStorageDistribution = useCallback(async () => {
    setState(prev => ({ ...prev, loadingStorageDistribution: true, storageDistributionError: '' }));
    
    try {
      const data = await adminStatsService.getStorageDistribution();
      setState(prev => ({ ...prev, storageDistribution: data, loadingStorageDistribution: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        storageDistributionError: error instanceof Error ? error.message : 'Failed to load storage distribution',
        loadingStorageDistribution: false
      }));
    }
  }, []);
  
  const refreshAllStats = useCallback(async () => {
    await Promise.all([
      loadSystemStats(), 
      loadGoogleDriveStats(),
      loadUploadActivity(),
      loadStorageDistribution()
    ]);
  }, [loadSystemStats, loadGoogleDriveStats, loadUploadActivity, loadStorageDistribution]);
  
  const addNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    const newNotification: AdminNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      notificationCount: prev.notificationCount + 1
    }));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [], notificationCount: 0 }));
  }, []);
  
  const dismissNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
      notificationCount: Math.max(0, prev.notificationCount - 1)
    }));
  }, []);
  
  // Auto-load stats on mount and set up refresh interval
  useEffect(() => {
    // Initial load
    refreshAllStats();
    
    // Refresh stats every 60 seconds instead of 30 to reduce API load
    const interval = setInterval(refreshAllStats, 60000);
    
    // Cleanup on unmount
    return () => {
      console.log('Clearing admin dashboard refresh interval');
      clearInterval(interval);
    };
  }, [refreshAllStats]);
  
  return {
    ...state,
    loadSystemStats,
    loadGoogleDriveStats,
    loadUploadActivity,
    loadStorageDistribution,
    refreshAllStats,
    addNotification,
    clearNotifications,
    dismissNotification
  };
};
