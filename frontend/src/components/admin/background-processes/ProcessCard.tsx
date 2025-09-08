/**
 * ProcessCard Component
 * Individual process display card with status, progress, and actions
 */

"use client";

import { BackgroundProcess } from "@/types/background-processes";
import { cn } from "@/lib/utils";
import { Play, Check, X, Clock, AlertTriangle } from "lucide-react";

interface ProcessCardProps {
  process: BackgroundProcess;
  onCancel: (processId: string) => Promise<void>;
}

export function ProcessCard({ process, onCancel }: ProcessCardProps) {
  const statusConfig = {
    PENDING: { 
      color: "border-amber-500", 
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-700 dark:text-amber-300"
    },
    RUNNING: { 
      color: "border-blue-500", 
      icon: Play,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    COMPLETED: { 
      color: "border-emerald-500", 
      icon: Check,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-300"
    },
    FAILED: { 
      color: "border-red-500", 
      icon: AlertTriangle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-700 dark:text-red-300"
    },
  };

  const priorityConfig = {
    HIGH: {
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-800 dark:text-red-200"
    },
    NORMAL: {
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-800 dark:text-blue-200"
    }
  };

  const { color, icon: StatusIcon, bgColor, textColor } = statusConfig[process.status];
  const { bgColor: priorityBg, textColor: priorityText } = priorityConfig[process.priority];

  const formatDateTime = (dateTime: string | undefined): string => {
    if (!dateTime) return 'N/A';
    
    const date = new Date(dateTime);
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

  const handleCancel = async () => {
    if (process.status === 'COMPLETED' || process.status === 'FAILED') return;
    await onCancel(process.process_id);
  };

  return (
    <div className={cn(
      "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg",
      color
    )}>
      <div className="p-6">
        {/* Process Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {process.description}
            </h4>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ID: {process.process_id}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full",
              bgColor, textColor
            )}>
              <StatusIcon className="w-3 h-3" />
              {process.status}
            </span>
            <span className={cn(
              "px-2 py-1 text-xs font-semibold rounded-full",
              priorityBg, priorityText
            )}>
              {process.priority}
            </span>
          </div>
        </div>

        {/* Process Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex justify-between">
            <span className="font-medium text-slate-600 dark:text-slate-400">Type:</span>
            <span className="text-slate-900 dark:text-white">{process.process_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600 dark:text-slate-400">Created:</span>
            <span className="text-slate-900 dark:text-white">{formatDateTime(process.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600 dark:text-slate-400">Started:</span>
            <span className="text-slate-900 dark:text-white">{formatDateTime(process.started_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600 dark:text-slate-400">Initiated by:</span>
            <span className="text-slate-900 dark:text-white">
              {process.admin_initiated ? 'Admin' : 'System'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {process.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {process.progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${process.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {process.error_message && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{process.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            disabled={process.status === 'COMPLETED' || process.status === 'FAILED'}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            )}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
