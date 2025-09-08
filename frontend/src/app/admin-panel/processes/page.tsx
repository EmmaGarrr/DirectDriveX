"use client";

import { useProcessManagement } from "@/hooks/useProcessManagement";
import { ProcessCard } from "@/components/admin/processes/ProcessCard";
import { Cogs, LayerGroup, ListOl, PlayCircle, Users, Crown, Tasks, Database, CheckCircle, Sync, AlertTriangle } from "lucide-react";

export default function BackgroundProcessesPage() {
  const {
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
  } = useProcessManagement();

  const getRefreshStatusText = () => {
    if (!lastRefreshTime) return 'Never refreshed';
    const diffSecs = Math.floor((new Date().getTime() - lastRefreshTime.getTime()) / 1000);
    if (diffSecs < 60) return `Refreshed ${diffSecs}s ago`;
    return `Refreshed ${Math.floor(diffSecs / 60)}m ago`;
  };

  return (
    <div className="space-y-8">
      <div className="p-8 text-white rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Cogs className="w-8 h-8" />
            <div>
              <h2 className="text-3xl font-bold">Background Process Management</h2>
              <p className="opacity-90">Monitor and manage background processes with priority queuing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 text-center bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="text-sm font-medium opacity-90">{getRefreshStatusText()}</div>
              <div className="text-xs opacity-70">Auto-refresh: {activeProcesses.length > 0 ? '30s' : '1m'}</div>
            </div>
            <button onClick={manualRefresh} disabled={isRefreshing} className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg flex items-center gap-2 hover:bg-white/30 disabled:opacity-60">
              <Sync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
            </button>
          </div>
        </div>
      </div>

      {priorityInfo && (
        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-2xl shadow-lg">
          <h3 className="flex items-center gap-3 mb-5 text-lg font-semibold"><LayerGroup /> Priority System Status</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"><span className="font-medium">Admin Workers:</span><span className="font-bold text-red-600">{priorityInfo.admin_workers}</span></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"><span className="font-medium">User Workers:</span><span className="font-bold text-emerald-600">{priorityInfo.user_workers}</span></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"><span className="font-medium">Total Requests:</span><span className="font-bold">{priorityInfo.total_requests_processed}</span></div>
          </div>
        </div>
      )}

      {queueStatus && (
        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="flex items-center gap-3 text-2xl font-semibold"><ListOl /> Queue Status</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 transition-all border-l-4 border-red-500 rounded-lg shadow-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4"><Crown /> <h4 className="font-semibold">Admin Queue (High Priority)</h4></div>
              <div className="text-4xl font-bold">{queueStatus.admin_queue_size}</div>
              <div className="text-slate-500 dark:text-slate-400">Pending</div>
            </div>
            <div className="p-6 transition-all border-l-4 border-emerald-500 rounded-lg shadow-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4"><Users /> <h4 className="font-semibold">User Queue (Normal Priority)</h4></div>
              <div className="text-4xl font-bold">{queueStatus.user_queue_size}</div>
              <div className="text-slate-500 dark:text-slate-400">Pending</div>
            </div>
            <div className="p-6 transition-all border-l-4 border-amber-500 rounded-lg shadow-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4"><PlayCircle /> <h4 className="font-semibold">Currently Processing</h4></div>
              <div className="text-4xl font-bold">{queueStatus.processing_count}</div>
              <div className="text-slate-500 dark:text-slate-400">Active</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-slate-200 dark:border-slate-700">
          <h3 className="flex items-center gap-3 text-2xl font-semibold"><Tasks /> Active Processes</h3>
          <button onClick={triggerQuotaRefresh} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            <Database className="w-4 h-4" /> Trigger Quota Refresh
          </button>
        </div>
        {error && <div className="flex items-center gap-2 p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-lg"><AlertTriangle /> {error}</div>}
        {loading && activeProcesses.length === 0 ? (
          <div className="text-center p-12 bg-white/95 dark:bg-slate-800/95 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p>Loading process information...</p>
          </div>
        ) : activeProcesses.length > 0 ? (
          <div className="space-y-4">
            {activeProcesses.map(proc => <ProcessCard key={proc.process_id} process={proc} onCancel={cancelProcess} />)}
          </div>
        ) : (
          <div className="p-12 text-center rounded-lg bg-white/95 dark:bg-slate-800/95">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <p className="text-lg font-medium text-slate-900 dark:text-white">No active processes at the moment</p>
            <small className="text-slate-500 dark:text-slate-400">All queues are empty and ready for new requests</small>
          </div>
        )}
      </div>
    </div>
  );
}