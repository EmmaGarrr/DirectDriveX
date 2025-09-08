/**
 * Storage Distribution Component
 * Two-column storage analytics layout with ranges and top users
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { StorageDistributionProps } from '@/types/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HardDrive, Users } from 'lucide-react';

// Utility function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const StorageDistribution: React.FC<StorageDistributionProps> = ({
  data,
  loading,
  error
}) => {
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Storage Distribution
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Storage usage patterns and top users
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Storage Ranges */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <HardDrive className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Storage Ranges
              </h4>
            </div>
            
            <div className="space-y-3">
              {data.storage_distribution.map((range, index) => {
                const totalUsers = data.storage_distribution.reduce((sum, r) => sum + r.count, 0);
                const percentage = (range.count / totalUsers) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {range.range}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {range.count} users
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Top Users */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Top Users
              </h4>
            </div>
            
            <div className="space-y-3">
              {data.top_users.map((user, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user.email}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{user.files_count} files</span>
                    <span className="font-medium">{formatBytes(user.storage_used)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <HardDrive className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};