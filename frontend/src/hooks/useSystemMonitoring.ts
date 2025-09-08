import { useState, useCallback, useEffect } from 'react';
import { systemMonitoringService } from '@/services/admin/systemMonitoringService';
import type {
  SystemHealthResponse,
  ApiMetricsResponse,
  DatabasePerformanceResponse,
  SystemAlertsResponse
} from '@/services/admin/systemMonitoringService';

interface UseSystemMonitoringReturn {
  systemHealth: SystemHealthResponse | null;
  apiMetrics: ApiMetricsResponse | null;
  databasePerformance: DatabasePerformanceResponse | null;
  systemAlerts: SystemAlertsResponse | null;
  
  loading: {
    health: boolean;
    api: boolean;
    database: boolean;
    alerts: boolean;
  };
  
  error: {
    health: string | null;
    api: string | null;
    database: string | null;
    alerts: string | null;
  };
  
  autoRefresh: boolean;
  refreshInterval: number;
  lastRefresh: Date | null;
  
  loadSystemHealth: () => Promise<void>;
  loadApiMetrics: (hours?: number) => Promise<void>;
  loadDatabasePerformance: () => Promise<void>;
  loadSystemAlerts: () => Promise<void>;
  loadAllMetrics: () => Promise<void>;
  toggleAutoRefresh: () => void;
  refreshAll: () => void;
}

export function useSystemMonitoring(): UseSystemMonitoringReturn {
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiMetricsResponse | null>(null);
  const [databasePerformance, setDatabasePerformance] = useState<DatabasePerformanceResponse | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlertsResponse | null>(null);
  
  const [loading, setLoading] = useState({
    health: false,
    api: false,
    database: false,
    alerts: false
  });
  
  const [error, setError] = useState({
    health: null as string | null,
    api: null as string | null,
    database: null as string | null,
    alerts: null as string | null
  });
  
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshInterval = 30; // seconds

  const setLoadingState = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setErrorState = useCallback((key: keyof typeof error, value: string | null) => {
    setError(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadSystemHealth = useCallback(async () => {
    setLoadingState('health', true);
    setErrorState('health', null);
    
    try {
      const data = await systemMonitoringService.getSystemHealth();
      setSystemHealth(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load system health';
      setErrorState('health', errorMessage);
      console.error('Failed to load system health:', err);
    } finally {
      setLoadingState('health', false);
    }
  }, [setLoadingState, setErrorState]);

  const loadApiMetrics = useCallback(async (hours: number = 24) => {
    setLoadingState('api', true);
    setErrorState('api', null);
    
    try {
      const data = await systemMonitoringService.getApiMetrics(hours);
      setApiMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load API metrics';
      setErrorState('api', errorMessage);
      console.error('Failed to load API metrics:', err);
    } finally {
      setLoadingState('api', false);
    }
  }, [setLoadingState, setErrorState]);

  const loadDatabasePerformance = useCallback(async () => {
    setLoadingState('database', true);
    setErrorState('database', null);
    
    try {
      const data = await systemMonitoringService.getDatabasePerformance();
      setDatabasePerformance(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load database performance';
      setErrorState('database', errorMessage);
      console.error('Failed to load database performance:', err);
    } finally {
      setLoadingState('database', false);
    }
  }, [setLoadingState, setErrorState]);

  const loadSystemAlerts = useCallback(async () => {
    setLoadingState('alerts', true);
    setErrorState('alerts', null);
    
    try {
      const data = await systemMonitoringService.getSystemAlerts();
      setSystemAlerts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load system alerts';
      setErrorState('alerts', errorMessage);
      console.error('Failed to load system alerts:', err);
    } finally {
      setLoadingState('alerts', false);
    }
  }, [setLoadingState, setErrorState]);

  const loadAllMetrics = useCallback(async () => {
    await Promise.all([
      loadSystemHealth(),
      loadApiMetrics(),
      loadDatabasePerformance(),
      loadSystemAlerts()
    ]);
    setLastRefresh(new Date());
  }, [loadSystemHealth, loadApiMetrics, loadDatabasePerformance, loadSystemAlerts]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const refreshAll = useCallback(() => {
    const isCurrentlyLoading = Object.values(loading).some(Boolean);
    if (!isCurrentlyLoading) {
      loadAllMetrics();
    }
  }, [loadAllMetrics, loading]);

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        const isCurrentlyLoading = Object.values(loading).some(Boolean);
        if (!isCurrentlyLoading) {
          loadAllMetrics();
        }
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, loadAllMetrics, loading, refreshInterval]);

  // Initial load
  useEffect(() => {
    loadAllMetrics();
  }, [loadAllMetrics]);

  return {
    systemHealth,
    apiMetrics,
    databasePerformance,
    systemAlerts,
    loading,
    error,
    autoRefresh,
    refreshInterval,
    lastRefresh,
    loadSystemHealth,
    loadApiMetrics,
    loadDatabasePerformance,
    loadSystemAlerts,
    loadAllMetrics,
    toggleAutoRefresh,
    refreshAll
  };
}
