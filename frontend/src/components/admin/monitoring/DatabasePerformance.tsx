"use client";

import { Database, Clock, Loader2 } from "lucide-react";
import { DatabasePerformance as DBPerf } from "@/types/monitoring";

interface DatabasePerformanceProps {
  performance: DBPerf | null;
  loading: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const StatItem = ({ label, value }: { label: string, value: string | number }) => (
  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
    <p className="text-sm text-indigo-600 dark:text-indigo-400">{label}</p>
    <p className="text-xl font-bold text-indigo-800 dark:text-indigo-300">{value}</p>
  </div>
);

export function DatabasePerformance({ performance, loading }: DatabasePerformanceProps) {
  if (loading) {
    return <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />;
  }

  if (!performance) return null;

  const queryTimeColor = (time: number) => time > 1000 ? "text-red-600 dark:text-red-500" : "text-emerald-600 dark:text-emerald-500";

  return (
    <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg">
          <Database className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Database Performance</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatItem label="Collections" value={performance.stats.collections} />
        <StatItem label="Objects" value={performance.stats.objects.toLocaleString()} />
        <StatItem label="DB Size" value={formatBytes(performance.stats.db_size)} />
        <StatItem label="Index Size" value={formatBytes(performance.stats.index_size)} />
        <StatItem label="Avg Obj Size" value={formatBytes(performance.stats.avg_obj_size)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Query Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Files Query Time:</span>
              <span className={`font-semibold ${queryTimeColor(performance.query_performance.files_query_time_ms)}`}>
                {performance.query_performance.files_query_time_ms.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Users Query Time:</span>
              <span className={`font-semibold ${queryTimeColor(performance.query_performance.users_query_time_ms)}`}>
                {performance.query_performance.users_query_time_ms.toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Current Operations</h3>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Active Operations:</span>
            <span className={`font-semibold ${performance.current_operations.count > 5 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-800 dark:text-slate-200'}`}>
              {performance.current_operations.count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}