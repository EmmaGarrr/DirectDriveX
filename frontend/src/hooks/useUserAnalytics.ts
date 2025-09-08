/**
 * User Analytics Hook
 * Centralized state management for user analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import { userAnalyticsService } from '@/services/admin/userAnalyticsService';
import { UseUserAnalyticsReturn } from '@/types/analytics';

export const useUserAnalytics = (): UseUserAnalyticsReturn => {
  // Loading states
  const [loading, setLoading] = useState({
    activeUsers: false,
    registrationTrends: false,
    geographic: false,
    storage: false,
    activity: false,
    retention: false
  });

  // Data states
  const [data, setData] = useState({
    activeUsersStats: null as any,
    registrationTrends: null as any,
    geographicData: null as any,
    storageAnalytics: null as any,
    activityPatterns: null as any,
    retentionMetrics: null as any
  });

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Period states
  const [registrationPeriod, setRegistrationPeriod] = useState('30d');
  const [activityPeriod, setActivityPeriod] = useState('7d');

  /**
   * Load active users statistics
   */
  const loadActiveUsersStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, activeUsers: true }));
    setErrors(prev => ({ ...prev, activeUsers: '' }));
    
    try {
      const result = await userAnalyticsService.getActiveUsersStats();
      setData(prev => ({ ...prev, activeUsersStats: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load active users stats error:', error);
      setErrors(prev => ({ 
        ...prev, 
        activeUsers: 'Failed to load active users statistics' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, activeUsers: false }));
    }
  }, []);

  /**
   * Load registration trends
   */
  const loadRegistrationTrends = useCallback(async (period: string = registrationPeriod) => {
    setLoading(prev => ({ ...prev, registrationTrends: true }));
    setErrors(prev => ({ ...prev, registrationTrends: '' }));
    
    try {
      const result = await userAnalyticsService.getRegistrationTrends(period);
      setData(prev => ({ ...prev, registrationTrends: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load registration trends error:', error);
      setErrors(prev => ({ 
        ...prev, 
        registrationTrends: 'Failed to load registration trends' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, registrationTrends: false }));
    }
  }, [registrationPeriod]);

  /**
   * Load geographic distribution
   */
  const loadGeographicDistribution = useCallback(async () => {
    setLoading(prev => ({ ...prev, geographic: true }));
    setErrors(prev => ({ ...prev, geographic: '' }));
    
    try {
      const result = await userAnalyticsService.getGeographicDistribution();
      setData(prev => ({ ...prev, geographicData: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load geographic distribution error:', error);
      setErrors(prev => ({ 
        ...prev, 
        geographic: 'Failed to load geographic distribution' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, geographic: false }));
    }
  }, []);

  /**
   * Load storage usage analytics
   */
  const loadStorageUsageAnalytics = useCallback(async () => {
    setLoading(prev => ({ ...prev, storage: true }));
    setErrors(prev => ({ ...prev, storage: '' }));
    
    try {
      const result = await userAnalyticsService.getStorageUsageAnalytics();
      setData(prev => ({ ...prev, storageAnalytics: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load storage usage analytics error:', error);
      setErrors(prev => ({ 
        ...prev, 
        storage: 'Failed to load storage usage analytics' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, storage: false }));
    }
  }, []);

  /**
   * Load user activity patterns
   */
  const loadUserActivityPatterns = useCallback(async (period: string = activityPeriod) => {
    setLoading(prev => ({ ...prev, activity: true }));
    setErrors(prev => ({ ...prev, activity: '' }));
    
    try {
      const result = await userAnalyticsService.getUserActivityPatterns(period);
      setData(prev => ({ ...prev, activityPatterns: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load user activity patterns error:', error);
      setErrors(prev => ({ 
        ...prev, 
        activity: 'Failed to load user activity patterns' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  }, [activityPeriod]);

  /**
   * Load user retention metrics
   */
  const loadUserRetentionMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, retention: true }));
    setErrors(prev => ({ ...prev, retention: '' }));
    
    try {
      const result = await userAnalyticsService.getUserRetentionMetrics();
      setData(prev => ({ ...prev, retentionMetrics: result }));
    } catch (error) {
      console.error('useUserAnalytics: Load user retention metrics error:', error);
      setErrors(prev => ({ 
        ...prev, 
        retention: 'Failed to load user retention metrics' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, retention: false }));
    }
  }, []);

  /**
   * Refresh all analytics data
   */
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadActiveUsersStats(),
      loadRegistrationTrends(),
      loadGeographicDistribution(),
      loadStorageUsageAnalytics(),
      loadUserActivityPatterns(),
      loadUserRetentionMetrics()
    ]);
  }, [
    loadActiveUsersStats,
    loadRegistrationTrends,
    loadGeographicDistribution,
    loadStorageUsageAnalytics,
    loadUserActivityPatterns,
    loadUserRetentionMetrics
  ]);

  /**
   * Handle period change for different analytics types
   */
  const onPeriodChange = useCallback((period: string, type: 'registration' | 'activity') => {
    if (type === 'registration') {
      setRegistrationPeriod(period);
      loadRegistrationTrends(period);
    } else if (type === 'activity') {
      setActivityPeriod(period);
      loadUserActivityPatterns(period);
    }
  }, [loadRegistrationTrends, loadUserActivityPatterns]);

  // Load initial data on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return {
    loading,
    data,
    errors,
    refreshAllData,
    onPeriodChange
  };
};