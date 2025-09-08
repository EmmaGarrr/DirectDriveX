"use client";

import { Cpu, HardDrive, MemoryStick, Clock } from "lucide-react";

interface SystemHealthOverviewProps {
  health: {
    cpu: { usage_percent: number; count: number };
    memory: { percent: number; total: number; used: number; available: number };
    disk: { percent: number; total: number; used: number; free: number };
    uptime: number;
  } | null;
  loading: boolean;
}

const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const getUsageColor = (percent: number): string => {
  if (percent < 50) return "text-green-600";
  if (percent < 80) return "text-yellow-600";
  return "text-red-600";
};

const getUsageBgColor = (percent: number): string => {
  if (percent < 50) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  if (percent < 80) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
};

export function SystemHealthOverview({ health, loading }: SystemHealthOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg bg-white dark:bg-slate-800 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-6 border rounded-lg bg-white dark:bg-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No system health data available</p>
      </div>
    );
  }

  const cpuPercent = Math.round(health.cpu.usage_percent);
  const memoryPercent = Math.round(health.memory.percent);
  const diskPercent = Math.round(health.disk.percent);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CPU Usage Card */}
      <div className={`p-6 border rounded-lg bg-white dark:bg-slate-800 ${getUsageBgColor(cpuPercent)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">CPU Usage</h3>
          <Cpu className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <div className={`text-3xl font-bold ${getUsageColor(cpuPercent)}`}>
            {cpuPercent}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {health.cpu.count} cores
          </div>
        </div>
      </div>

      {/* Memory Usage Card */}
      <div className={`p-6 border rounded-lg bg-white dark:bg-slate-800 ${getUsageBgColor(memoryPercent)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Memory Usage</h3>
          <MemoryStick className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-1">
          <div className={`text-3xl font-bold ${getUsageColor(memoryPercent)}`}>
            {memoryPercent}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
          </div>
        </div>
      </div>

      {/* Disk Usage Card */}
      <div className={`p-6 border rounded-lg bg-white dark:bg-slate-800 ${getUsageBgColor(diskPercent)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Disk Usage</h3>
          <HardDrive className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-1">
          <div className={`text-3xl font-bold ${getUsageColor(diskPercent)}`}>
            {diskPercent}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {formatBytes(health.disk.used)} / {formatBytes(health.disk.total)}
          </div>
        </div>
      </div>

      {/* System Uptime Card */}
      <div className="p-6 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">System Uptime</h3>
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-purple-600">
            {formatUptime(health.uptime)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Since boot
          </div>
        </div>
      </div>
    </div>
  );
}
