"use client";

import { Cpu, MemoryStick, HardDrive, Clock, Loader2 } from "lucide-react";
import { SystemHealth } from "@/types/monitoring";
import { cn } from "@/lib/utils";

interface SystemHealthCardProps {
  health: SystemHealth | null;
  loading: boolean;
}

const MetricCard = ({ icon: Icon, title, value, unit, color, bgColor, statusColor }: { icon: React.ElementType, title: string, value: string, unit: string, color: string, bgColor: string, statusColor: string }) => (
  <div className={`p-4 rounded-lg ${bgColor}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className={`text-sm font-medium ${color}`}>{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className={`text-2xl font-bold ${statusColor}`}>{value}<span className="text-lg ml-1">{unit}</span></p>
  </div>
);

export function SystemHealthCard({ health, loading }: SystemHealthCardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!health) return null;

  const getStatusColor = (value: number, thresholds: { warn: number, crit: number }) => {
    if (value > thresholds.crit) return "text-red-600 dark:text-red-500";
    if (value > thresholds.warn) return "text-amber-600 dark:text-amber-500";
    return "text-emerald-600 dark:text-emerald-500";
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">System Health Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Cpu}
          title="CPU Usage"
          value={health.cpu.usage_percent.toFixed(1)}
          unit="%"
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-900/10"
          statusColor={getStatusColor(health.cpu.usage_percent, { warn: 70, crit: 90 })}
        />
        <MetricCard
          icon={MemoryStick}
          title="Memory Usage"
          value={health.memory.percent.toFixed(1)}
          unit="%"
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-900/10"
          statusColor={getStatusColor(health.memory.percent, { warn: 80, crit: 90 })}
        />
        <MetricCard
          icon={HardDrive}
          title="Disk Usage"
          value={health.disk.percent.toFixed(1)}
          unit="%"
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-900/10"
          statusColor={getStatusColor(health.disk.percent, { warn: 85, crit: 95 })}
        />
        <MetricCard
          icon={Clock}
          title="System Uptime"
          value={formatUptime(health.uptime)}
          unit=""
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-50 dark:bg-purple-900/10"
          statusColor="text-purple-800 dark:text-purple-300"
        />
      </div>
    </div>
  );
}