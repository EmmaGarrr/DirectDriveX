import { useCallback } from 'react';
import { UseGoogleDriveStatsReturn } from '@/types/google-drive';

export const useGoogleDriveStats = (
  totalAccounts: number = 0,
  activeAccounts: number = 0,
  totalStorageUsed: number = 0,
  totalStorageQuota: number = 0,
  averagePerformance: number = 0
): UseGoogleDriveStatsReturn => {
  
  // Format bytes to human readable format
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Calculate storage percentage
  const getStoragePercentage = useCallback((used: number, quota: number): number => {
    if (quota === 0) return 0;
    return Math.round((used / quota) * 100);
  }, []);

  // Get health status CSS class
  const getHealthStatusClass = useCallback((status: string): string => {
    switch (status) {
      case 'healthy': return 'status-healthy';
      case 'warning': return 'status-warning';
      case 'quota_warning': return 'status-quota-warning';
      case 'critical': return 'status-critical';
      default: return 'status-unknown';
    }
  }, []);

  // Get health status text
  const getHealthStatusText = useCallback((status: string): string => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'quota_warning': return 'Quota Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  }, []);

  // Get performance CSS class
  const getPerformanceClass = useCallback((score: number): string => {
    if (score >= 90) return 'performance-excellent';
    if (score >= 70) return 'performance-good';
    if (score >= 50) return 'performance-fair';
    return 'performance-poor';
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  }, []);

  // Format date with relative time
  const formatDateTime = useCallback((dateString: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString();
  }, []);

  return {
    // Statistics
    totalAccounts,
    activeAccounts,
    totalStorageUsed,
    totalStorageQuota,
    averagePerformance,
    
    // Utility functions
    formatBytes,
    getStoragePercentage,
    getHealthStatusClass,
    getHealthStatusText,
    getPerformanceClass,
    formatDate,
    formatDateTime
  };
};
