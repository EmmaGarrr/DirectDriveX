"use client";

import { useState } from "react";
import { 
  Users, 
  File, 
  HardDrive, 
  HeartPulse,
  Cloud, 
  RefreshCw,
  Trash2,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { UploadActivityChart } from "@/components/admin/UploadActivityChart";
import { StorageDistributionChart } from "@/components/admin/StorageDistributionChart";
import { LiveEventStream } from "@/components/admin/LiveEventStream";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAdminSocket } from "@/hooks/useAdminSocket";
import { adminStatsService } from "@/services/adminStatsService";
import { SystemHealth } from "@/types/admin";
import { RecentMediaCard } from "@/components/admin/RecentMediaCard";

export default function AdminDashboardPage() {
  const {
    systemStats,
    gdriveStats,
    uploadActivity,
    storageDistribution,
    notifications,
    loadingSystemStats,
    loadingGdriveStats,
    loadingUploadActivity,
    loadingStorageDistribution,
    systemStatsError,
    gdriveStatsError,
    refreshAllStats,
    clearNotifications,
    dismissNotification
  } = useAdminDashboard();
  
  const { events, isConnected, clearEvents } = useAdminSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Format values for display
  const formatUserCount = adminStatsService.formatNumber(systemStats.totalUsers);
  const formatFileCount = adminStatsService.formatNumber(systemStats.totalFiles);
  const formatStorage = adminStatsService.formatBytes(systemStats.totalStorage);
  
  // Format health status for display
  const formatHealthStatus = (health: SystemHealth): string => {
    switch (health) {
      case 'good': return 'Excellent';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };
  
  // Calculate Google Drive usage percentage
  const gdriveUsagePercent = gdriveStats.totalQuota > 0 
    ? Math.round((gdriveStats.totalUsed / gdriveStats.totalQuota) * 100)
    : 0;
  
  // Handle refresh button click
  const handleRefresh = () => {
    refreshAllStats();
  };
  
  // Loading state for any stats
  const isLoading = loadingSystemStats || loadingGdriveStats || 
                   loadingUploadActivity || loadingStorageDistribution;
  
  return (
    <div className="space-y-8">
      {/* Page header with refresh button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg top-full w-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium">Notifications</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotifications();
                        setShowNotifications(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="overflow-auto max-h-80">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0
                          ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 
                            notification.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' : 
                            notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                            'bg-blue-50 dark:bg-blue-900/20'}`}
                      >
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <button 
                            onClick={() => dismissNotification(notification.id)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            Dismiss
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {notification.message}
                        </p>
                        <span className="block mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors
              ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard 
          title="Total Users" 
          value={loadingSystemStats ? "..." : formatUserCount} 
          icon={Users} 
          status={systemStats.systemHealth === 'unknown' ? 'good' : systemStats.systemHealth} 
        />
        <StatCard 
          title="Total Files" 
          value={loadingSystemStats ? "..." : formatFileCount} 
          icon={File} 
          status={systemStats.systemHealth === 'unknown' ? 'good' : systemStats.systemHealth} 
        />
        <StatCard 
          title="Total Storage" 
          value={loadingSystemStats ? "..." : formatStorage} 
          icon={HardDrive} 
          status={systemStats.systemHealth === 'unknown' ? 'good' : systemStats.systemHealth} 
        />
        <StatCard 
          title="System Health" 
          value={loadingSystemStats ? "..." : formatHealthStatus(systemStats.systemHealth)} 
          icon={HeartPulse} 
          status={systemStats.systemHealth === 'unknown' ? 'good' : systemStats.systemHealth} 
        />
        <StatCard 
          title="Google Drive" 
          value={loadingGdriveStats ? "..." : `${gdriveUsagePercent}%`} 
          icon={Cloud} 
          status={gdriveStats.health === 'unknown' ? 'warning' : gdriveStats.health} 
          additionalInfo={loadingGdriveStats ? undefined : `${gdriveStats.activeAccounts}/${gdriveStats.totalAccounts} active`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Upload Activity</h2>
            <UploadActivityChart 
              data={uploadActivity}
              loading={loadingUploadActivity} 
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Storage Distribution</h2>
            <StorageDistributionChart 
              googleDrive={storageDistribution.googleDrive} 
              hetzner={storageDistribution.hetzner}
              loading={loadingStorageDistribution}
            />
          </div>
        </div>
      </div>

      {/* Live Data Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LiveEventStream 
          events={events}
          isConnected={isConnected}
          onClear={clearEvents}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <RecentMediaCard />
      </div>
    </div>
  );
}