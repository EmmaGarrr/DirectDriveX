/**
 * Geographic Distribution Component
 * Country-based user distribution display with progress bars
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { GeographicDistributionProps } from '@/types/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Globe } from 'lucide-react';

export const GeographicDistribution: React.FC<GeographicDistributionProps> = ({
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
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Geographic Distribution
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            User distribution by country
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.countries.reduce((sum, country) => sum + country.count, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Total Users
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.total_countries}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Countries
              </div>
            </div>
          </div>

          {/* Country Distribution */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Top Countries
            </div>
            <div className="space-y-3">
              {data.countries.map((country, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {country.country}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {country.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({country.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};