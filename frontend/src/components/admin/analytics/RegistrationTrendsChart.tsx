/**
 * Registration Trends Chart Component
 * Interactive registration trends visualization with period selector
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { RegistrationTrendsChartProps } from '@/types/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarChart3, Calendar } from 'lucide-react';

export const RegistrationTrendsChart: React.FC<RegistrationTrendsChartProps> = ({
  data,
  loading,
  error,
  onPeriodChange
}) => {
  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const getMaxValue = () => {
    if (!data?.data) return 100;
    return Math.max(...data.data.map(item => item.count));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Registration Trends
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              User registration patterns over time
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <select
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.total_registrations.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Total Registrations
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className={cn(
                "text-2xl font-bold",
                data.growth_rate >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {data.growth_rate >= 0 ? '+' : ''}{data.growth_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Growth Rate
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Daily Registrations
            </div>
            <div className="space-y-2">
              {data.data.map((item, index) => {
                const maxValue = getMaxValue();
                const percentage = (item.count / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{formatDate(item.date)}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};