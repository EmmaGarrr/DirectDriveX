/**
 * User Analytics Type Definitions
 * Comprehensive analytics data structures for DirectDriveX admin panel
 */

export interface ActiveUsersStats {
  total_active: number;
  daily_active: number;
  weekly_active: number;
  monthly_active: number;
}

export interface RegistrationTrends {
  period: string;
  data: Array<{ date: string; count: number }>;
  total_registrations: number;
  growth_rate: number;
}

export interface GeographicDistribution {
  countries: Array<{ country: string; count: number; percentage: number }>;
  total_countries: number;
}

export interface StorageUsageAnalytics {
  total_storage: number;
  average_per_user: number;
  top_users: Array<{ email: string; files_count: number; storage_used: number }>;
  storage_distribution: Array<{ range: string; count: number }>;
}

export interface ActivityPatterns {
  upload_patterns: Array<{ hour: number; uploads: number }>;
  download_patterns: Array<{ hour: number; downloads: number }>;
  most_active_users: Array<{ email: string; last_login: string | null }>;
}

export interface UserRetentionMetrics {
  retention_rate_7d: number;
  retention_rate_30d: number;
  churn_rate: number;
  new_users_last_30d: number;
}

export interface StatCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  mainMetric: string;
  label: string;
  breakdown?: Array<{ label: string; value: string; color?: string }>;
  loading: boolean;
  error?: string;
}

export interface RegistrationTrendsChartProps {
  data: RegistrationTrends | null;
  loading: boolean;
  error?: string;
  onPeriodChange: (period: string) => void;
}

export interface GeographicDistributionProps {
  data: GeographicDistribution | null;
  loading: boolean;
  error?: string;
}

export interface StorageDistributionProps {
  data: StorageUsageAnalytics | null;
  loading: boolean;
  error?: string;
}

export interface ActivityPatternsProps {
  data: ActivityPatterns | null;
  loading: boolean;
  error?: string;
  onPeriodChange: (period: string) => void;
}

export interface UseUserAnalyticsReturn {
  loading: {
    activeUsers: boolean;
    registrationTrends: boolean;
    geographic: boolean;
    storage: boolean;
    activity: boolean;
    retention: boolean;
  };
  data: {
    activeUsersStats: ActiveUsersStats | null;
    registrationTrends: RegistrationTrends | null;
    geographicData: GeographicDistribution | null;
    storageAnalytics: StorageUsageAnalytics | null;
    activityPatterns: ActivityPatterns | null;
    retentionMetrics: UserRetentionMetrics | null;
  };
  errors: Record<string, string>;
  refreshAllData: () => void;
  onPeriodChange: (period: string, type: 'registration' | 'activity') => void;
}