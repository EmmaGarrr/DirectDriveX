/**
 * Activity Patterns Component
 * Comprehensive activity analytics with upload/download charts and active users
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityPatternsProps } from '@/types/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Activity, Calendar, Clock } from 'lucide-react';

export const ActivityPatterns: React.FC<ActivityPatternsProps> = ({
  data,
  loading,
  error,
  onPeriodChange
}) => {
  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '14d', label: '14 Days' },
    { value: '30d', label: '30 Days' }
  ];

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMaxValue = (patterns: Array<{ hour: number; uploads?: number; downloads?: number }>) => {
    return Math.max(...patterns.map(item => Math.max(item.uploads || 0, item.downloads || 0)));
  };

  if (error) {
    return (
      <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Activity Patterns
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hourly upload/download patterns and active users
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <select
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Upload/Download Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Patterns */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Upload Patterns
                </span>
              </div>
              <div className="space-y-2">
                {data.upload_patterns.map((pattern, index) => {
                  const maxValue = getMaxValue(data.upload_patterns);
                  const percentage = (pattern.uploads / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 text-xs text-slate-600 dark:text-slate-400">
                        {formatTime(pattern.hour)}
                      </div>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-slate-600 dark:text-slate-400 text-right">
                        {pattern.uploads}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Download Patterns */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Download Patterns
                </span>
              </div>
              <div className="space-y-2">
                {data.download_patterns.map((pattern, index) => {
                  const maxValue = getMaxValue(data.download_patterns);
                  const percentage = (pattern.downloads / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 text-xs text-slate-600 dark:text-slate-400">
                        {formatTime(pattern.hour)}
                      </div>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-slate-600 dark:text-slate-400 text-right">
                        {pattern.downloads}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Most Active Users */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Most Active Users
              </span>
            </div>
            <div className="space-y-2">
              {data.most_active_users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.email}
                  </span>
                  <span className={cn(
                    "text-xs",
                    user.last_login 
                      ? "text-slate-600 dark:text-slate-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {formatDate(user.last_login)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};