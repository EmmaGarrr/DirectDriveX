"use client";

import { X, Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { BackupProgressModalProps } from "@/types/backup";
import { cn } from "@/lib/utils";

export function BackupProgressModal({ 
  isOpen, 
  onClose, 
  progress, 
  onCancel 
}: BackupProgressModalProps) {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    if (!progress) return <Clock className="w-6 h-6 text-slate-400" />;
    
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'in_progress':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    if (!progress) return 'text-slate-500';
    
    switch (progress.status) {
      case 'completed':
        return 'text-emerald-500';
      case 'failed':
        return 'text-red-500';
      case 'cancelled':
        return 'text-amber-500';
      case 'in_progress':
        return 'text-blue-500';
      default:
        return 'text-slate-500';
    }
  };

  const getOperationTitle = () => {
    if (!progress) return 'Backup Operation';
    
    switch (progress.operation_type) {
      case 'mass_backup':
        return 'Mass Backup Operation';
      case 'cleanup':
        return 'Backup Cleanup';
      case 'individual_backup':
        return 'Individual Backup';
      default:
        return 'Backup Operation';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {getOperationTitle()}
              </h2>
              <p className={cn("text-sm font-medium", getStatusColor())}>
                {progress?.status ? progress.status.replace('_', ' ').toUpperCase() : 'PENDING'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {progress && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {progress.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={cn(
                      "h-3 rounded-full transition-all duration-500",
                      progress.status === 'completed' ? 'bg-emerald-500' :
                      progress.status === 'failed' ? 'bg-red-500' :
                      progress.status === 'cancelled' ? 'bg-amber-500' :
                      'bg-blue-500'
                    )}
                    style={{ width: `${progress.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Operation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Operation ID</label>
                    <p className="text-sm font-mono text-slate-800 dark:text-slate-200">{progress.operation_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Files Processed</label>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {progress.files_processed} of {progress.total_files}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Started</label>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {formatTime(progress.start_time)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration</label>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {formatDuration(progress.start_time, progress.estimated_completion)}
                    </p>
                  </div>
                  {progress.estimated_completion && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Estimated Completion</label>
                      <p className="text-sm text-slate-800 dark:text-slate-200">
                        {formatTime(progress.estimated_completion)}
                      </p>
                    </div>
                  )}
                  {progress.current_file && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current File</label>
                      <p className="text-sm text-slate-800 dark:text-slate-200 truncate" title={progress.current_file}>
                        {progress.current_file}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {progress.error_message && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error Details</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{progress.error_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {progress.status === 'in_progress' && (
                  <button
                    onClick={() => onCancel(progress.operation_id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Operation
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    progress.status === 'completed' 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  )}
                >
                  {progress.status === 'completed' ? 'Close' : 'Dismiss'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

