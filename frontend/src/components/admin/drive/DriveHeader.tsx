"use client";

import { HardDrive, File, RefreshCw, List, LayoutGrid, SlidersHorizontal, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { FaGoogleDrive } from 'react-icons/fa';
import { DriveStats } from '@/types/drive';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="p-4 transition-all duration-300 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      </div>
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

interface DriveHeaderProps {
  stats: DriveStats | null;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
}

export function DriveHeader({ stats, viewMode, onViewModeChange, onToggleFilters, onRefresh }: DriveHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <FaGoogleDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Drive File Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage all Google Drive files and backups.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleFilters} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <button onClick={onRefresh} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex items-center p-1 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600">
            <button onClick={() => onViewModeChange('list')} className={cn("p-1.5 rounded-md", viewMode === 'list' && "bg-blue-600 text-white")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => onViewModeChange('grid')} className={cn("p-1.5 rounded-md", viewMode === 'grid' && "bg-blue-600 text-white")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Available Files" value={stats?.total_files.toLocaleString() || 0} icon={File} color="bg-blue-600" />
        <StatCard title="Total Storage" value={stats?.total_storage_formatted || '0 TB'} icon={HardDrive} color="bg-purple-600" />
        <StatCard title="Transferring" value={stats?.transferring_to_hetzner.toLocaleString() || 0} icon={Clock} color="bg-amber-500" />
        <StatCard title="Backed Up" value={stats?.backed_up_to_hetzner.toLocaleString() || 0} icon={CheckCircle} color="bg-emerald-600" />
        <StatCard title="Failed Backups" value={stats?.failed_backups.toLocaleString() || 0} icon={AlertTriangle} color="bg-red-600" />
      </div>
    </div>
  );
}