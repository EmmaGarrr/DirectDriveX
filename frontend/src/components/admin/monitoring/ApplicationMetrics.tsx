"use client";

import { BarChart, Loader2 } from "lucide-react";
import { ApplicationMetrics as AppMetrics } from "@/types/monitoring";

interface ApplicationMetricsProps {
  metrics: AppMetrics | null;
  loading: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
};

const StatItem = ({ label, value }: { label: string, value: string | number }) => (
  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg">
    <p className="text-sm text-cyan-600 dark:text-cyan-400">{label}</p>
    <p className="text-xl font-bold text-cyan-800 dark:text-cyan-300">{value}</p>
  </div>
);

export function ApplicationMetrics({ metrics, loading }: ApplicationMetricsProps) {
  if (loading) {
    return <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />;
  }

  if (!metrics) return null;

  return (
    <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 rounded-lg">
          <BarChart className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Application Metrics</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatItem label="Total Files" value={formatNumber(metrics.stats.total_files)} />
        <StatItem label="Total Users" value={formatNumber(metrics.stats.total_users)} />
        <StatItem label="API Requests (24h)" value={formatNumber(metrics.stats.api_requests_24h)} />
        <StatItem label="API Errors (24h)" value={formatNumber(metrics.stats.api_errors_24h)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Top API Endpoints (24h)</h3>
          <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
            {metrics.top_endpoints.map((ep, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 truncate pr-4">{ep.endpoint}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(ep.count)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Top Admin Activity (24h)</h3>
          <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
            {metrics.admin_activity.map((admin, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 truncate pr-4">{admin.admin}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{admin.actions} actions</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}