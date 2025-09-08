/**
 * Analytics Dashboard Page
 * Comprehensive analytics dashboard with complete Angular feature parity
 */

'use client';

import React from 'react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { StatCard } from '@/components/admin/analytics/StatCard';
import { RegistrationTrendsChart } from '@/components/admin/analytics/RegistrationTrendsChart';
import { GeographicDistribution } from '@/components/admin/analytics/GeographicDistribution';
import { StorageDistribution } from '@/components/admin/analytics/StorageDistribution';
import { ActivityPatterns } from '@/components/admin/analytics/ActivityPatterns';
import { 
  Users, 
  TrendingUp, 
  HardDrive, 
  UserCheck, 
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function AnalyticsPage() {
  const {
    loading,
    data,
    errors,
    refreshAllData,
    onPeriodChange
  } = useUserAnalytics();

  const isAnyLoading = Object.values(loading).some(loading => loading);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Analytics
          </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive user behavior and engagement analytics
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshAllData}
          disabled={isAnyLoading}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <StatCard
          title="Active Users"
          icon={Users}
          mainMetric={data.activeUsersStats?.total_active?.toLocaleString() || '0'}
          label="Total active users"
          breakdown={[
            { 
              label: 'Daily', 
              value: data.activeUsersStats?.daily_active?.toLocaleString() || '0',
              color: 'text-blue-600 dark:text-blue-400'
            },
            { 
              label: 'Weekly', 
              value: data.activeUsersStats?.weekly_active?.toLocaleString() || '0',
              color: 'text-green-600 dark:text-green-400'
            },
            { 
              label: 'Monthly', 
              value: data.activeUsersStats?.monthly_active?.toLocaleString() || '0',
              color: 'text-purple-600 dark:text-purple-400'
            }
          ]}
          loading={loading.activeUsers}
          error={errors.activeUsers}
        />

        {/* Registration Trends */}
        <StatCard
          title="Registration Trends"
          icon={TrendingUp}
          mainMetric={data.registrationTrends?.total_registrations?.toLocaleString() || '0'}
          label="Total registrations"
          breakdown={[
            { 
              label: 'Growth Rate', 
              value: `${data.registrationTrends?.growth_rate?.toFixed(1) || '0'}%`,
              color: (data.registrationTrends?.growth_rate ?? 0) >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }
          ]}
          loading={loading.registrationTrends}
          error={errors.registrationTrends}
        />

        {/* Storage Usage */}
        <StatCard
          title="Storage Usage"
          icon={HardDrive}
          mainMetric={data.storageAnalytics?.total_storage ? 
            `${(data.storageAnalytics.total_storage / (1024 * 1024 * 1024)).toFixed(1)} GB` : '0 GB'}
          label="Total storage used"
          breakdown={[
            { 
              label: 'Avg per User', 
              value: data.storageAnalytics?.average_per_user ? 
                `${(data.storageAnalytics.average_per_user / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
              color: 'text-slate-600 dark:text-slate-400'
            },
            { 
              label: 'Top Users', 
              value: `${data.storageAnalytics?.top_users?.length || 0} users`,
              color: 'text-orange-600 dark:text-orange-400'
            }
          ]}
          loading={loading.storage}
          error={errors.storage}
        />

        {/* User Retention */}
        <StatCard
          title="User Retention"
          icon={UserCheck}
          mainMetric={`${data.retentionMetrics?.retention_rate_30d?.toFixed(1) || '0'}%`}
          label="30-day retention rate"
          breakdown={[
            { 
              label: '7-day Retention', 
              value: `${data.retentionMetrics?.retention_rate_7d?.toFixed(1) || '0'}%`,
              color: (data.retentionMetrics?.retention_rate_7d ?? 0) >= 80 
                ? 'text-emerald-600 dark:text-emerald-400'
                : (data.retentionMetrics?.retention_rate_7d ?? 0) >= 60
                ? 'text-green-600 dark:text-green-400'
                : (data.retentionMetrics?.retention_rate_7d ?? 0) >= 40
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
            },
            { 
              label: 'Churn Rate', 
              value: `${data.retentionMetrics?.churn_rate?.toFixed(1) || '0'}%`,
              color: (data.retentionMetrics?.churn_rate ?? 0) <= 10 
                ? 'text-emerald-600 dark:text-emerald-400'
                : (data.retentionMetrics?.churn_rate ?? 0) <= 20
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
            },
            { 
              label: 'New Users (30d)', 
              value: data.retentionMetrics?.new_users_last_30d?.toLocaleString() || '0',
              color: 'text-blue-600 dark:text-blue-400'
            }
          ]}
          loading={loading.retention}
          error={errors.retention}
        />
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Registration Trends Chart */}
        <RegistrationTrendsChart
          data={data.registrationTrends}
          loading={loading.registrationTrends}
          error={errors.registrationTrends}
          onPeriodChange={(period) => onPeriodChange(period, 'registration')}
        />

        {/* Geographic Distribution */}
        <GeographicDistribution
          data={data.geographicData}
          loading={loading.geographic}
          error={errors.geographic}
        />

        {/* Storage Distribution */}
        <StorageDistribution
          data={data.storageAnalytics}
          loading={loading.storage}
          error={errors.storage}
        />

        {/* Activity Patterns */}
        <ActivityPatterns
          data={data.activityPatterns}
          loading={loading.activity}
          error={errors.activity}
          onPeriodChange={(period) => onPeriodChange(period, 'activity')}
        />
      </div>
    </div>
  );
}