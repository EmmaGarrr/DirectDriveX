import { FileText, Image, Video, Music, Archive, File } from 'lucide-react';
import type { HetznerFileTypeAnalytics } from '@/types/hetzner';

interface HetznerFileTypeAnalyticsProps {
  analytics: HetznerFileTypeAnalytics | null;
}

const fileTypeIcons = {
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
  archive: Archive,
  other: File,
};

// Chart colors matching Angular implementation
const chartColors = [
  'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
  'linear-gradient(135deg, #10b981, #059669)', // Emerald
  'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
  'linear-gradient(135deg, #ef4444, #dc2626)', // Red
  'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
  'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
  'linear-gradient(135deg, #84cc16, #65a30d)', // Lime
  'linear-gradient(135deg, #f97316, #ea580c)', // Orange
];

const fileTypeColors = {
  document: 'from-blue-500 to-blue-600',
  image: 'from-emerald-500 to-emerald-600',
  video: 'from-purple-500 to-purple-600',
  audio: 'from-amber-500 to-amber-600',
  archive: 'from-red-500 to-red-600',
  other: 'from-slate-500 to-slate-600',
};

const fileTypeBgColors = {
  document: 'bg-blue-50 dark:bg-blue-900/20',
  image: 'bg-emerald-50 dark:bg-emerald-900/20',
  video: 'bg-purple-50 dark:bg-purple-900/20',
  audio: 'bg-amber-50 dark:bg-amber-900/20',
  archive: 'bg-red-50 dark:bg-red-900/20',
  other: 'bg-slate-50 dark:bg-slate-900/20',
};

const fileTypeTextColors = {
  document: 'text-blue-600 dark:text-blue-400',
  image: 'text-emerald-600 dark:text-emerald-400',
  video: 'text-purple-600 dark:text-purple-400',
  audio: 'text-amber-600 dark:text-amber-400',
  archive: 'text-red-600 dark:text-red-400',
  other: 'text-slate-600 dark:text-slate-400',
};

// Get chart color by index (matching Angular getChartColor function)
const getChartColor = (index: number): string => {
  return chartColors[index % chartColors.length];
};

export function HetznerFileTypeAnalytics({ analytics }: HetznerFileTypeAnalyticsProps) {
  if (!analytics || !analytics.file_types || analytics.file_types.length === 0) {
    return (
      <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          File Type Distribution
        </h3>
        <div className="py-8 text-center text-slate-500 dark:text-slate-400">
          No analytics data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          File Type Distribution
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {analytics.total_files} total files
        </div>
      </div>

      <div className="space-y-6">
        {analytics.file_types.map((item, index) => {
          const Icon = fileTypeIcons[item._id as keyof typeof fileTypeIcons] || File;
          const bgColor = fileTypeBgColors[item._id as keyof typeof fileTypeBgColors] || fileTypeBgColors.other;
          const textColor = fileTypeTextColors[item._id as keyof typeof fileTypeTextColors] || fileTypeTextColors.other;
          const chartColor = getChartColor(index);

          return (
            <div key={index} className="group">
              {/* File Type Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${textColor}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                      {item._id}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.count} files • {item.size_formatted}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    of total files
                  </div>
                </div>
              </div>
              
              {/* Horizontal Bar Chart */}
              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full transition-all duration-700 ease-out group-hover:shadow-lg relative"
                    style={{ 
                      width: `${item.percentage}%`,
                      background: chartColor
                    }}
                  >
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute -top-12 left-0 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="text-center">
                    <div className="font-bold">{item.percentage.toFixed(1)}%</div>
                    <div className="text-xs opacity-75">{item.count} files</div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}