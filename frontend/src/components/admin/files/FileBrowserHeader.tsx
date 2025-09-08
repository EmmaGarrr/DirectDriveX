"use client";

import { File, HardDrive, Server, Trash2, RefreshCw } from "lucide-react";
import { StorageStats } from "@/types/file-browser";
import { FaGoogleDrive } from "react-icons/fa";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, loading }) => (
  <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
        {loading ? (
          <div className="w-20 h-8 mt-1 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ) : (
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
        )}
      </div>
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

interface FileBrowserHeaderProps {
  stats: StorageStats | null;
  loading?: boolean;
  onCleanup: () => void;
  onRefresh?: () => void;
  onViewOrphaned?: () => void;
}

export function FileBrowserHeader({ stats, loading = false, onCleanup, onRefresh, onViewOrphaned }: FileBrowserHeaderProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">File Browser</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage all cloud storage files.</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          {onViewOrphaned && (
            <button 
              onClick={onViewOrphaned}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <File className="w-4 h-4" />
              View Orphaned Files
            </button>
          )}
          <button 
            onClick={onCleanup}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white border rounded-lg bg-amber-600 hover:bg-amber-700"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup Orphaned Files
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Files" 
          value={stats?.total_files?.toLocaleString() || "0"} 
          icon={File} 
          color="bg-blue-600" 
          loading={loading}
        />
        <StatCard 
          title="Total Storage" 
          value={stats ? formatBytes(stats.total_storage) : "0 GB"} 
          icon={HardDrive} 
          color="bg-emerald-600" 
          loading={loading}
        />
        <StatCard 
          title="Google Drive Files" 
          value={stats?.gdrive_files?.toLocaleString() || "0"} 
          icon={FaGoogleDrive} 
          color="bg-green-600" 
          loading={loading}
        />
        <StatCard 
          title="Hetzner Files" 
          value={stats?.hetzner_files?.toLocaleString() || "0"} 
          icon={Server} 
          color="bg-red-600" 
          loading={loading}
        />
      </div>
    </div>
  );
}