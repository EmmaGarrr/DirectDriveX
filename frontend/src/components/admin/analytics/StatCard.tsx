/**
 * StatCard Component
 * Reusable analytics stat card with glass morphism design
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { StatCardProps } from '@/types/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon: Icon,
  mainMetric,
  label,
  breakdown = [],
  loading,
  error
}) => {
  if (error) {
    return (
      <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        <div className="flex items-center justify-center h-32">
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
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </h3>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {mainMetric}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {label}
            </p>
          </div>
        )}
      </div>

      {/* Breakdown Stats */}
      {!loading && breakdown.length > 0 && (
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.label}
              </span>
              <span 
                className={cn(
                  "text-sm font-medium",
                  item.color || "text-slate-900 dark:text-white"
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};