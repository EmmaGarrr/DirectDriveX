"use client";

import { PieChart } from 'lucide-react';
import { FileTypeAnalytics } from '@/types/drive';
import { cn } from '@/lib/utils';

const fileTypeColors = {
  image: 'bg-blue-500',
  video: 'bg-red-500',
  audio: 'bg-green-500',
  document: 'bg-yellow-500',
  archive: 'bg-purple-500',
  other: 'bg-slate-500',
};

export function DriveAnalytics({ analytics }: { analytics: FileTypeAnalytics | null }) {
  if (!analytics) return null;

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          <PieChart className="w-5 h-5" /> Drive File Type Distribution
        </h3>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Total: {analytics.total_files.toLocaleString()} files
        </span>
      </div>
      <div className="space-y-3">
        {analytics.file_types.map(type => (
          <div key={type._id}>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{type._id}</span>
              <span className="text-slate-500 dark:text-slate-400">{type.count.toLocaleString()} files ({type.percentage.toFixed(1)}%) - {type.size_formatted}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={cn("h-2 rounded-full", fileTypeColors[type._id as keyof typeof fileTypeColors])}
                style={{ width: `${type.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}