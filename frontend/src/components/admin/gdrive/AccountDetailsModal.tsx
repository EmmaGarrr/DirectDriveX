"use client";

import { X, Info, HardDrive, File, Activity, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { AccountDetailsModalProps } from '@/types/google-drive';
import { useGoogleDriveStats } from '@/hooks/useGoogleDriveStats';
import { cn } from '@/lib/utils';

export function AccountDetailsModal({ 
  isOpen, 
  onClose, 
  account, 
  loading, 
  error 
}: AccountDetailsModalProps) {
  const {
    formatBytes,
    getStoragePercentage,
    getHealthStatusClass,
    getHealthStatusText,
    getPerformanceClass,
    formatDate,
    formatDateTime
  } = useGoogleDriveStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Account Details
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Comprehensive account information and statistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                <span>Loading account details...</span>
              </div>
            </div>
          )}

          {/* Account Details */}
          {account && !loading && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-all">
                      {account.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Account ID
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                      {account.account_id}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Alias
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {account.alias || 'No alias set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Status
                    </label>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      account.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Health Status
                    </label>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getHealthStatusClass(account.health_status)
                    )}>
                      {getHealthStatusText(account.health_status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Performance Score
                    </label>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getPerformanceClass(account.performance_score || 0)
                    )}>
                      {(account.performance_score || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Storage Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Files Count
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {account.files_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Storage Used
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatBytes(account.storage_used || 0)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Storage Quota
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatBytes(account.storage_quota || 0)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Usage Percentage
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {(account.storage_percentage || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                {/* Storage Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>Storage Usage</span>
                    <span>{(account.storage_percentage || 0).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        (account.storage_percentage || 0) > 80 
                          ? "bg-red-500" 
                          : (account.storage_percentage || 0) > 60 
                            ? "bg-yellow-500" 
                            : "bg-blue-500"
                      )}
                      style={{ width: `${Math.min(account.storage_percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Folder Information */}
              {account.folder_info && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <File className="w-5 h-5" />
                    Folder Information
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Folder Name
                        </label>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {account.folder_info.folder_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Folder Path
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white">
                          {account.folder_info.folder_path}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Folder ID
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                          {account.folder_info.folder_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Freshness */}
              {account.data_freshness && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Data Freshness
                  </h3>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    {account.data_freshness === 'fresh' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {account.data_freshness === 'fresh' ? 'Data Fresh' : 'Data Stale'}
                      </p>
                      {account.last_quota_check && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Last updated: {formatDateTime(account.last_quota_check)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Created At
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(account.created_at || '')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Updated At
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(account.updated_at || '')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Last Activity
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(account.last_activity || '')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Last Quota Check
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(account.last_quota_check || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
