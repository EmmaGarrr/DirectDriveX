"use client";

import { NotificationStats } from '@/types/notifications';
import { BarChart3, CheckCircle, AlertTriangle, Clock, Users, FileText, Send } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
  <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

export function DashboardTab({ stats }: { stats: NotificationStats | null }) {
  if (!stats) return <div>Loading...</div>;

  const maxActivity = Math.max(...stats.recent_activity.map(d => d.count), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Notifications" value={stats.summary.total_notifications} icon={FileText} />
        <StatCard title="Recent (30d)" value={stats.summary.recent_notifications} icon={Clock} />
        <StatCard title="Active Templates" value={stats.summary.active_templates} icon={FileText} />
        <StatCard title="Scheduled" value={stats.summary.scheduled_notifications} icon={Clock} />
      </div>

      <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
        <h3 className="mb-4 font-semibold">Delivery Performance</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="text-center"><p className="text-xl font-bold">{stats.delivery_summary.total_recipients.toLocaleString()}</p><p className="text-xs text-slate-500">Total Recipients</p></div>
          <div className="text-center"><p className="text-xl font-bold text-emerald-600">{stats.delivery_summary.successful_deliveries.toLocaleString()}</p><p className="text-xs text-slate-500">Successful</p></div>
          <div className="text-center"><p className="text-xl font-bold text-red-600">{stats.delivery_summary.failed_deliveries.toLocaleString()}</p><p className="text-xs text-slate-500">Failed</p></div>
          <div className="text-center"><p className="text-xl font-bold text-blue-600">{stats.delivery_summary.success_rate.toFixed(1)}%</p><p className="text-xs text-slate-500">Success Rate</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
          <h3 className="mb-4 font-semibold">Status Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(stats.status_breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm"><span>{key.charAt(0).toUpperCase() + key.slice(1)}</span><span>{value}</span></div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
          <h3 className="mb-4 font-semibold">Type Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(stats.type_breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm"><span>{key.charAt(0).toUpperCase() + key.slice(1)}</span><span>{value}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
        <h3 className="mb-4 font-semibold">Recent Activity (7 Days)</h3>
        <div className="flex items-end h-40 gap-2">
          {stats.recent_activity.map((day, index) => (
            <div key={index} className="relative flex-1 h-full group">
              <div className="absolute p-1 text-xs text-white transition-opacity duration-200 opacity-0 -top-6 bg-slate-800 rounded-md group-hover:opacity-100">{day.count}</div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-t-sm" style={{ height: `${maxActivity > 0 ? (day.count / maxActivity) * 100 : 0}%` }}></div>
              <div className="absolute -bottom-5 text-[10px] text-center w-full text-slate-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}