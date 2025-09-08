"use client";

import { useState, useEffect, useCallback } from 'react';
import { processManagementService } from '@/services/admin/processManagementService';
import { ProcessQueueStatus, BackgroundProcess, PrioritySystemInfo, UseProcessManagementReturn } from '@/types/processes';

export function useProcessManagement(): UseProcessManagementReturn {
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
        processManagementService.getQueueStatus(),
        processManagementService.getActiveProcesses(),
        processManagementService.getPrioritySystemInfo(),
      ]);
      setQueueStatus(qStatus);
      setActiveProcesses(aProcesses);
      setPriorityInfo(pInfo);
      setLastRefreshTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load process data.');
    }
  }, []);

  const manualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  }, [loadAllData]);

  useEffect(() => {
    setLoading(true);
    loadAllData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      if (activeProcesses.length > 0) {
        loadAllData();
      }
    }, 30000); // 30s refresh if active

    const longInterval = setInterval(() => {
      if (activeProcesses.length === 0) {
        loadAllData();
      }
    }, 60000); // 1m refresh if idle

    return () => {
      clearInterval(interval);
      clearInterval(longInterval);
    };
  }, [loadAllData, activeProcesses.length]);

  const cancelProcess = async (processId: string) => {
    try {
      await processManagementService.cancelProcess(processId);
      manualRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel process.');
    }
  };

  const triggerQuotaRefresh = async () => {
    try {
      await processManagementService.triggerQuotaRefresh();
      manualRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger quota refresh.');
    }
  };

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