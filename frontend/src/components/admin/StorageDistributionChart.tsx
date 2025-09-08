"use client";

import { Loader2 } from 'lucide-react';

const ProgressBar = ({ label, value, color, darkColor, formatter }: { 
  label: string, 
  value: number, 
  color: string, 
  darkColor: string, 
  formatter?: (value: number) => string 
}) => (
  <div>
    <div className="flex justify-between mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <span>{formatter ? formatter(value) : `${value}%`}</span>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
      <div className={`bg-gradient-to-r ${color} dark:${darkColor} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

interface StorageDistributionChartProps {
  googleDrive: number; // in bytes
  hetzner: number; // in bytes
  loading?: boolean;
}

export function StorageDistributionChart({ 
  googleDrive = 0, 
  hetzner = 0, 
  loading = false 
}: StorageDistributionChartProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const totalStorage = googleDrive + hetzner;
  
  // Calculate percentages
  const googleDrivePercent = totalStorage > 0 ? Math.round((googleDrive / totalStorage) * 100) : 0;
  const hetznerPercent = totalStorage > 0 ? Math.round((hetzner / totalStorage) * 100) : 0;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin dark:text-blue-400" />
          <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading storage data...</span>
        </div>
      </div>
    );
  }
  
  if (totalStorage === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">No storage data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Storage Distribution</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Total Storage: {formatBytes(totalStorage)}
        </span>
      </div>
      <div className="space-y-4">
        <ProgressBar 
          label="Google Drive" 
          value={googleDrivePercent} 
          color="from-blue-500 to-sky-500" 
          darkColor="from-blue-400 to-sky-400" 
          formatter={(value) => `${formatBytes(googleDrive)} (${value}%)`}
        />
        <ProgressBar 
          label="Hetzner" 
          value={hetznerPercent} 
          color="from-red-500 to-orange-500" 
          darkColor="from-red-400 to-orange-400" 
          formatter={(value) => `${formatBytes(hetzner)} (${value}%)`}
        />
      </div>
    </div>
  );
}