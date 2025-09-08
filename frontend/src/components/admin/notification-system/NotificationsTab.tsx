/**
 * NotificationsTab Component
 * Notification list with advanced filtering, badges, and actions
 */

"use client";

import { useState } from "react";
import { Notification } from "@/types/notification-system";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Send, 
  Trash2, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause
} from "lucide-react";

interface NotificationsTabProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  filters: any;
  totalPages: number;
  currentPage: number;
  onUpdateFilters: (filters: any) => void;
  onSendNotification: (id: string) => Promise<boolean>;
  onDeleteNotification: (id: string) => Promise<boolean>;
}

export function NotificationsTab({
  notifications,
  loading,
  error,
  filters,
  totalPages,
  currentPage,
  onUpdateFilters,
  onSendNotification,
  onDeleteNotification,
}: NotificationsTabProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getStatusConfig = (status: string) => {
    const configs = {
      sent: { 
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
        icon: CheckCircle,
        label: "Sent"
      },
      draft: { 
        color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
        icon: Pause,
        label: "Draft"
      },
      scheduled: { 
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        icon: Clock,
        label: "Scheduled"
      },
      failed: { 
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        icon: XCircle,
        label: "Failed"
      },
      cancelled: { 
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
        icon: AlertCircle,
        label: "Cancelled"
      },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      medium: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      high: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      urgent: "bg-purple-900 text-white dark:bg-purple-800",
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      system: { icon: Bell, color: "text-blue-600 dark:text-blue-400" },
      email: { icon: Mail, color: "text-purple-600 dark:text-purple-400" },
      in_app: { icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400" },
      scheduled: { icon: Clock, color: "text-amber-600 dark:text-amber-400" },
    };
    return configs[type as keyof typeof configs] || { icon: Bell, color: "text-slate-600 dark:text-slate-400" };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleSendNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to send this notification now?')) {
      await onSendNotification(id);
    }
  };

  const handleDeleteNotification = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete notification '${title}'? This action cannot be undone.`)) {
      await onDeleteNotification(id);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Failed to load notifications
          </h3>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.status_filter}
                onChange={(e) => onUpdateFilters({ status_filter: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                value={filters.type_filter}
                onChange={(e) => onUpdateFilters({ type_filter: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="system">System</option>
                <option value="email">Email</option>
                <option value="in_app">In-App</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={filters.priority_filter}
                onChange={(e) => onUpdateFilters({ priority_filter: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
          <div className="text-center">
            <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first notification to get started'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const statusConfig = getStatusConfig(notification.status);
            const typeConfig = getTypeConfig(notification.notification_type);
            const StatusIcon = statusConfig.icon;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={notification._id}
                className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityConfig(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                        <span className="capitalize">{notification.notification_type.replace('_', ' ')}</span>
                      </div>
                      <div>Created {formatDate(notification.created_at)}</div>
                      {notification.delivery_stats && (
                        <div>
                          {notification.delivery_stats.successful_deliveries}/{notification.delivery_stats.total_recipients} delivered
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {(notification.status === 'draft' || notification.status === 'scheduled') && (
                      <button
                        onClick={() => handleSendNotification(notification._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteNotification(notification._id, notification.title)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <button
              onClick={() => onUpdateFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
