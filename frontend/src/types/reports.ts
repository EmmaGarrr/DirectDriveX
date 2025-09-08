import { LucideIcon } from 'lucide-react';

// Base types
export type ReportType = 'system_overview' | 'user_activity' | 'storage_usage' | 'custom';
export type ExportFormat = 'json' | 'csv';
export type StorageGroupBy = 'user' | 'file_type' | 'storage_location' | 'date';
export type DataSource = 'users' | 'files' | 'admin_activity_logs' | 'notifications' | 'notification_deliveries' | 'backup_logs';

// Form states
export interface ReportFormState {
  report_type: ReportType;
  export_format: ExportFormat;
  date_from: string;
  date_to: string;
  include_inactive?: boolean;
  group_by?: StorageGroupBy;
}

export interface CustomReportFormState {
  title: string;
  description: string;
  export_format: ExportFormat;
  date_from: string;
  date_to: string;
  data_sources: DataSource[];
  fields: string[];
}

// Report Template
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  default_period_days: number;
  includes: string[];
}

// Generated Report Structures
export interface ReportInfo {
  type: ReportType;
  title: string;
  generated_at: string;
  generated_by: string;
  period: {
    from: string;
    to: string;
    days: number;
  };
  group_by?: string;
}

export interface SystemOverviewReport {
  report_info: ReportInfo;
  user_statistics: {
    total_users: number;
    active_users: number;
    new_users_in_period: number;
    growth_rate: number;
  };
  file_statistics: {
    total_files: number;
    files_uploaded_in_period: number;
    total_storage_gb: number;
    average_file_size_mb: number;
    type_distribution: Array<{ type: string; count: number; size_gb: number }>;
  };
  system_performance: {
    uptime_percentage: number;
    average_response_time_ms: number;
    total_api_requests: number;
    error_rate_percentage: number;
  };
  growth_metrics: {
    user_growth_percentage: number;
    file_growth_percentage: number;
  };
  admin_activity: {
    top_actions: Array<{ action: string; count: number }>;
  };
}

export interface UserActivityReport {
  report_info: ReportInfo;
  summary: {
    total_users_analyzed: number;
    active_users_in_period: number;
    total_files_in_period: number;
    average_files_per_active_user: number;
  };
  top_users_by_activity: Array<{
    email: string;
    files_in_period: number;
    storage_mb: number;
  }>;
}

export interface StorageUsageReport {
  report_info: ReportInfo;
  summary: {
    total_files: number;
    total_storage_gb: number;
    files_in_period: number;
    average_file_size_mb: number;
  };
  detailed_breakdown: Array<Record<string, any>>;
}

export interface CustomReport {
  report_info: ReportInfo;
  results: Record<DataSource, { count: number; data: Array<Record<string, any>> }>;
}

export type GeneratedReport = SystemOverviewReport | UserActivityReport | StorageUsageReport | CustomReport;

// Hook return type
export interface UseReportsReturn {
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportForm: ReportFormState;
  setReportForm: (form: Partial<ReportFormState>) => void;
  customReportForm: CustomReportFormState;
  setCustomReportForm: (form: Partial<CustomReportFormState>) => void;
  templates: ReportTemplate[];
  currentReport: GeneratedReport | null;
  generateReport: () => Promise<void>;
  generateCustomReport: () => Promise<void>;
  clearCurrentReport: () => void;
  useTemplate: (template: ReportTemplate) => void;
  resetCustomReport: () => void;
}

// Component prop types
export interface StatCardProps {
  title: string;
  value: string;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}