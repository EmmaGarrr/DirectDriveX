"use client";

import { Notification, NotificationFilters } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { Trash2, Send } from 'lucide-react';

const getStatusBadgeClass = (status: string) => ({
  sent: 'bg-emerald-100 text-emerald-800', draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-amber-100 text-amber-800', failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-purple-100 text-purple-800',
}[status] || 'bg-slate-100 text-slate-700');

const getPriorityBadgeClass = (priority: string) => ({
  low: 'bg-emerald-50 text-emerald-600', medium: 'bg-blue-50 text-blue-600',
  high: 'bg-amber-50 text-amber-600', urgent: 'bg-purple-100 text-purple-700',
}[priority] || 'bg-slate-100 text-slate-700');

const getTypeBadgeClass = (type: string) => ({
  system: 'bg-blue-50 text-blue-700', email: 'bg-purple-50 text-purple-700',
  in_app: 'bg-emerald-50 text-emerald-700',
}[type] || 'bg-slate-100 text-slate-700');

export function NotificationsTab({ notifications, filters, setFilters, pagination, setPage, onAction, onCreate }: { notifications: Notification[], filters: NotificationFilters, setFilters: (f: NotificationFilters) => void, pagination: any, setPage: (p: number) => void, onAction: (action: string, id: string) => void, onCreate: () => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
            <option value="">All Types</option>
            <option value="system">System</option>
            <option value="email">Email</option>
            <option value="in_app">In-App</option>
          </select>
          <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">All Notifications</h3>
          <button onClick={onCreate} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ Create</button>
        </div>
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n._id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{n.title}</h4>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full", getStatusBadgeClass(n.status))}>{n.status}</span>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full", getPriorityBadgeClass(n.priority))}>{n.priority}</span>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full", getTypeBadgeClass(n.notification_type))}>{n.notification_type}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-2">Created: {new Date(n.created_at).toLocaleString()} by {n.created_by}</p>
                  {n.status === 'sent' && <p className="text-xs text-slate-500">Recipients: {n.delivery_stats.total_recipients} | Success: {n.delivery_stats.successful_deliveries} ({((n.delivery_stats.successful_deliveries / n.delivery_stats.total_recipients) * 100).toFixed(1)}%)</p>}
                </div>
                <div className="flex gap-2">
                  {(n.status === 'draft' || n.status === 'scheduled') && <button onClick={() => onAction('send', n._id)} className="p-2 hover:bg-slate-200 rounded-full"><Send className="w-4 h-4 text-emerald-600" /></button>}
                  <button onClick={() => onAction('delete', n._id)} className="p-2 hover:bg-slate-200 rounded-full"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1}>Previous</button>
          <span className="px-4">Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
          <button onClick={() => setPage(pagination.page + 1)} disabled={pagination.page * pagination.limit >= pagination.total}>Next</button>
        </div>
      </div>
    </div>
  );
}