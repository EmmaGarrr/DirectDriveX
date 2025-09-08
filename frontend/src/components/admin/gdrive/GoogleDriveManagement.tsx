"use client";

import { useState, useEffect } from 'react';import { 
  GoogleDriveAccount, 
  GoogleDriveStats, 
  CacheInfo,
  AddAccountRequest,
  DeleteAllFilesResponse
} from '@/types/google-drive';
import { useGoogleDriveManagement } from '@/hooks/useGoogleDriveManagement';
import { useGoogleDriveAccounts } from '@/hooks/useGoogleDriveAccounts';
import { useGoogleDriveStats } from '@/hooks/useGoogleDriveStats';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { AddAccountModal } from './AddAccountModal';
import { AccountDetailsModal } from './AccountDetailsModal';
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Loader2, 
  Database, 
  Activity, 
  PieChart, 
  CheckCircle, 
  Clock, 
  Info, 
  Eye, 
  Pause, 
  Play, 
  Trash2, 
  UserX, 
  File, 
  HardDrive,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function GoogleDriveManagement() {
  // Main state management
  const {
    accounts,
    stats,
    cacheInfo,
    loading,
    isRefreshing,
    backgroundRefreshInProgress,
    error,
    showAddAccountModal,
    showAccountDetailsModal,
    selectedAccount,
    loadAccounts,
    refreshAllAccounts,
    setShowAddAccountModal,
    setShowAccountDetailsModal,
    setSelectedAccount,
    clearError
  } = useGoogleDriveManagement();

  // Account operations
  const {
    addAccount,
    removeAccount,
    toggleAccount,
    refreshAccountStats,
    deleteAllAccountFiles,
    viewAccountDetails,
    operationLoading
  } = useGoogleDriveAccounts();

  // Statistics utilities
  const {
    formatBytes,
    getStoragePercentage,
    getHealthStatusClass,
    getHealthStatusText,
    getPerformanceClass,
    formatDate,
    formatDateTime
  } = useGoogleDriveStats(
    stats?.total_accounts || 0,
    stats?.active_accounts || 0,
    stats?.total_storage_used || 0,
    stats?.total_storage_quota || 0,
    stats?.average_performance || 0
  );

  // WebSocket integration
  const { isConnected } = useAdminSocket();

  // Local state for operations
  const [operationError, setOperationError] = useState('');

  // Handle add account
  const handleAddAccount = async (accountData: AddAccountRequest) => {
    try {
      setOperationError('');
      await addAccount(accountData);
      await loadAccounts(true); // Refresh accounts after adding
      setShowAddAccountModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add account';
      setOperationError(errorMessage);
    }
  };

  // Handle remove account
  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this Google Drive account?')) {
      return;
    }

    try {
      setOperationError('');
      await removeAccount(accountId);
      await loadAccounts(true); // Refresh accounts after removal
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove account';
      setOperationError(errorMessage);
    }
  };

  // Handle toggle account
  const handleToggleAccount = async (accountId: string) => {
    try {
      setOperationError('');
      await toggleAccount(accountId);
      await loadAccounts(true); // Refresh accounts after toggle
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle account';
      setOperationError(errorMessage);
    }
  };

  // Handle refresh account stats
  const handleRefreshAccountStats = async (accountId: string) => {
    if (!confirm(`Refresh stats for account ${accountId}? This will fetch current data from Google Drive.`)) {
      return;
    }

    try {
      setOperationError('');
      await refreshAccountStats(accountId);
      await refreshAllAccounts(); // Refresh all accounts to show updated stats
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh account stats';
      setOperationError(errorMessage);
    }
  };

  // Handle delete all account files
  const handleDeleteAllAccountFiles = async (accountId: string) => {
    const confirmation = prompt(
      `⚠️ DANGER: This will DELETE ALL FILES from Google Drive account ${accountId}!\n\n` +
      `This includes:\n` +
      `- All files uploaded via the app\n` +
      `- All files manually uploaded to the folder\n` +
      `- This action cannot be undone!\n\n` +
      `Type "DELETE ALL FILES" to confirm:`
    );
    
    if (confirmation !== 'DELETE ALL FILES') {
      alert('Operation cancelled. Files were not deleted.');
      return;
    }

    try {
      setOperationError('');
      const result = await deleteAllAccountFiles(accountId);
      await refreshAllAccounts(); // Refresh all accounts to show updated stats
      
      alert(
        `All files deleted successfully!\n\n` +
        `Google Drive: ${result.gdrive_deleted || 0} files deleted\n` +
        `Database: ${result.mongodb_soft_deleted || 0} records marked as deleted\n` +
        `Errors: ${result.gdrive_errors || 0}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete all files';
      setOperationError(errorMessage);
    }
  };

  // Handle view account details
  const handleViewAccountDetails = async (accountId: string) => {
    try {
      setOperationError('');
      const account = await viewAccountDetails(accountId);
      setSelectedAccount(account);
      setShowAccountDetailsModal(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load account details';
      setOperationError(errorMessage);
    }
  };

  // Get cache status icon
  const getCacheIcon = (status: 'fresh' | 'stale' | 'error') => {
    switch (status) {
      case 'fresh': return <CheckCircle className="w-4 h-4" />;
      case 'stale': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Get cache status text
  const getCacheStatusText = (status: 'fresh' | 'stale' | 'error') => {
    switch (status) {
      case 'fresh': return 'Data Fresh';
      case 'stale': return 'Data Stale';
      case 'error': return 'Update Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Google Drive Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitor and manage Google Drive service accounts.
              {isConnected && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Updates
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
              <button onClick={clearError} className="text-amber-600 hover:text-amber-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAddAccountModal(true)}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
          <button
            onClick={refreshAllAccounts}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh All from Google Drive'}
          </button>
        </div>
      </div>

      {/* Cache Status */}
      {cacheInfo && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {getCacheIcon(cacheInfo.status)}
            <span className={cn(
              "text-sm font-medium",
              cacheInfo.status === 'fresh' ? 'text-emerald-600 dark:text-emerald-400' :
              cacheInfo.status === 'stale' ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            )}>
              {getCacheStatusText(cacheInfo.status)}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: {formatDateTime(cacheInfo.last_updated)}
          </span>
        </div>
      )}

      {/* Background Refresh Indicator */}
      {backgroundRefreshInProgress && !loading && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Updating data in background...
          </span>
        </div>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Accounts</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.total_accounts}</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stats.active_accounts} active</p>
          </div>

          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Storage Used</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{formatBytes(stats.total_storage_used)}</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">of {formatBytes(stats.total_storage_quota)}</p>
          </div>

          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Performance</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.average_performance.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <p className={cn(
              "mt-2 text-xs",
              getPerformanceClass(stats.average_performance)
            )}>
              {getPerformanceClass(stats.average_performance).replace('performance-', '')}
            </p>
          </div>

          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Quota Usage</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {((stats.total_storage_used / stats.total_storage_quota) * 100 || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-indigo-600"
                style={{ width: `${Math.min((stats.total_storage_used / stats.total_storage_quota) * 100 || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading Google Drive accounts...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {operationError && (
        <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{operationError}</span>
          <button onClick={() => setOperationError('')} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Accounts Grid */}
      {!loading && accounts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <div 
              key={account.account_id} 
              className={cn(
                "p-6 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl",
                !account.is_active && "opacity-70"
              )}
            >
              {/* Account Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {account.email}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                    ID: {account.account_id}
                  </p>
                  {account.alias && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {account.alias}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    account.is_active 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  )}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    getHealthStatusClass(account.health_status)
                  )}>
                    {getHealthStatusText(account.health_status)}
                  </span>
                </div>
              </div>

              {/* Account Stats */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                      <File className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Files</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {account.files_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Storage</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatBytes(account.storage_used)}
                    </p>
                  </div>
                </div>

                {/* Storage Progress */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Storage Usage</span>
                    <span>{(account.storage_percentage || 0).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        (account.storage_percentage || 0) > 80 ? "bg-red-500" :
                        (account.storage_percentage || 0) > 60 ? "bg-yellow-500" : "bg-blue-500"
                      )}
                      style={{ width: `${Math.min(account.storage_percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Performance Score */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Performance Score</span>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getPerformanceClass(account.performance_score || 0)
                  )}>
                    {(account.performance_score || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Folder Information */}
              {account.folder_info && (
                <div className="p-3 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {account.folder_info.folder_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {account.folder_info.folder_path}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {account.data_freshness === 'fresh' ? (
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {account.data_freshness === 'fresh' ? 'Data Fresh' : 'Data Stale'}
                    </span>
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewAccountDetails(account.account_id)}
                  disabled={operationLoading.viewDetails}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors disabled:opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  Details
                </button>
                <button
                  onClick={() => handleRefreshAccountStats(account.account_id)}
                  disabled={operationLoading.refresh}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
                <button
                  onClick={() => handleToggleAccount(account.account_id)}
                  disabled={operationLoading.toggle}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50",
                    account.is_active 
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  )}
                >
                  {account.is_active ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {account.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteAllAccountFiles(account.account_id)}
                  disabled={operationLoading.deleteFiles}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete All Files
                </button>
                <button
                  onClick={() => handleRemoveAccount(account.account_id)}
                  disabled={operationLoading.remove}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                >
                  <UserX className="w-3 h-3" />
                  Remove Account
                </button>
              </div>

              {/* Last Activity */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last activity: {formatDate(account.last_activity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && accounts.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Google Drive Accounts
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Add your first Google Drive service account to get started.
          </p>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      )}

      {/* Modals */}
      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onSubmit={handleAddAccount}
        loading={operationLoading.add}
        error={operationError}
      />

      <AccountDetailsModal
        isOpen={showAccountDetailsModal}
        onClose={() => setShowAccountDetailsModal(false)}
        account={selectedAccount}
        loading={operationLoading.viewDetails}
        error={operationError}
      />
    </div>
  );
}