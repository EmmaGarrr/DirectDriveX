/**
 * DashboardTab Component
 * Statistics overview with delivery performance metrics and activity chart
 */

"use client";

import { NotificationStats } from "@/types/notification-system";
import { 
  Bell, 
  Mail, 
  FileText, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  BarChart3
} from "lucide-react";

interface DashboardTabProps {
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
}

export function DashboardTab({ stats, loading, error }: DashboardTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Failed to load statistics
          </h3>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
        <div className="text-center">
          <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No statistics available
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Statistics will appear here once notifications are created
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      sent: 'text-emerald-600 dark:text-emerald-400',
      draft: 'text-slate-600 dark:text-slate-400',
      scheduled: 'text-amber-600 dark:text-amber-400',
      failed: 'text-red-600 dark:text-red-400',
      cancelled: 'text-purple-600 dark:text-purple-400',
    };
    return colors[status] || 'text-slate-600 dark:text-slate-400';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      system: 'text-blue-600 dark:text-blue-400',
      email: 'text-purple-600 dark:text-purple-400',
      in_app: 'text-emerald-600 dark:text-emerald-400',
      scheduled: 'text-amber-600 dark:text-amber-400',
    };
    return colors[type] || 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Notifications</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.summary.total_notifications)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Notifications</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.summary.recent_notifications)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Templates</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.summary.active_templates)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.summary.scheduled_notifications)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Performance */}
      <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Delivery Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.delivery_summary.total_recipients)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Recipients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {formatNumber(stats.delivery_summary.successful_deliveries)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              {formatNumber(stats.delivery_summary.failed_deliveries)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stats.delivery_summary.success_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.status_breakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'sent' ? 'bg-emerald-500' :
                    status === 'draft' ? 'bg-slate-500' :
                    status === 'scheduled' ? 'bg-amber-500' :
                    status === 'failed' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="capitalize text-slate-700 dark:text-slate-300">{status}</span>
                </div>
                <span className={`font-semibold ${getStatusColor(status)}`}>
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.type_breakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'system' ? 'bg-blue-500' :
                    type === 'email' ? 'bg-purple-500' :
                    type === 'in_app' ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`} />
                  <span className="capitalize text-slate-700 dark:text-slate-300">{type.replace('_', ' ')}</span>
                </div>
                <span className={`font-semibold ${getTypeColor(type)}`}>
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">7-Day Activity</h3>
        <div className="h-64 flex items-end gap-2">
          {stats.recent_activity.map((day, index) => {
            const maxCount = Math.max(...stats.recent_activity.map(d => d.count));
            const height = (day.count / maxCount) * 100;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${dayName}: ${day.count} notifications`}
                />
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {dayName}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {day.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
