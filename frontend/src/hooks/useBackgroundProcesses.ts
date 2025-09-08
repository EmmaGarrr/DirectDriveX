/**
 * Background Processes Hook
 * State management hook for background process monitoring and control
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { backgroundProcessesService } from '@/services/admin/backgroundProcessesService';
import { ProcessQueueStatus, BackgroundProcess, PrioritySystemInfo, UseBackgroundProcessesReturn } from '@/types/background-processes';
import { toastService } from '@/services/toastService';

export function useBackgroundProcesses(): UseBackgroundProcessesReturn {
  const [queueStatus, setQueueStatus] = useState<ProcessQueueStatus | null>(null);
  const [activeProcesses, setActiveProcesses] = useState<BackgroundProcess[]>([]);
  const [priorityInfo, setPriorityInfo] = useState<PrioritySystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const loadAllData = useCallback(async () => {
    setError(null);
    try {
      const [qStatus, aProcesses, pInfo] = await Promise.all([
        backgroundProcessesService.getQueueStatus(),
        backgroundProcessesService.getActiveProcesses(),
        backgroundProcessesService.getPrioritySystemInfo(),
      ]);
      
      setQueueStatus(qStatus);
      setActiveProcesses(aProcesses);
      setPriorityInfo(pInfo);
      setLastRefreshTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load background process data';
      setError(errorMessage);
      toastService.error(errorMessage);
    }
  }, []);

  const manualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  }, [loadAllData]);

  const cancelProcess = useCallback(async (processId: string) => {
    try {
      await backgroundProcessesService.cancelProcess(processId);
      await loadAllData(); // Refresh data after cancellation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel process';
      setError(errorMessage);
    }
  }, [loadAllData]);

  const triggerQuotaRefresh = useCallback(async () => {
    try {
      await backgroundProcessesService.triggerQuotaRefresh();
      await loadAllData(); // Refresh data after triggering quota refresh
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger quota refresh';
      setError(errorMessage);
    }
  }, [loadAllData]);

  // Initial data load
  useEffect(() => {
    setLoading(true);
    loadAllData().finally(() => setLoading(false));
  }, [loadAllData]);

  // Smart auto-refresh: 30s if active processes, 1m if idle
  useEffect(() => {
    const hasActiveProcesses = activeProcesses.length > 0;
    const refreshInterval = hasActiveProcesses ? 30000 : 60000; // 30s or 1m

    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        loadAllData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loadAllData, loading, isRefreshing, activeProcesses.length]);

  return {
    queueStatus,
    activeProcesses,
    priorityInfo,
    loading,
    isRefreshing,
    error,
    lastRefreshTime,
    manualRefresh,
    cancelProcess,
    triggerQuotaRefresh,
  };
}
