export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
export type NotificationType = 'system' | 'email' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TargetType = 'all_users' | 'active_users' | 'inactive_users' | 'specific_users';

export interface NotificationSummary {
  total_notifications: number;
  recent_notifications: number;
  active_templates: number;
  scheduled_notifications: number;
}

export interface DeliverySummary {
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  success_rate: number;
}

export interface NotificationStats {
  summary: NotificationSummary;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  delivery_summary: DeliverySummary;
  recent_activity: Array<{ date: string; count: number }>;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  target_type: TargetType;
  target_users?: string[];
  status: NotificationStatus;
  created_by: string;
  created_at: string;
  sent_at?: string;
  schedule_time?: string;
  delivery_stats: {
    total_recipients: number;
    successful_deliveries: number;
    failed_deliveries: number;
  };
}

export interface NotificationTemplate {
  _id: string;
  template_id: string;
  name: string;
  subject?: string;
  content: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  is_active: boolean;
  created_by: string;
  created_at: string;
  usage_count: number;
}

export interface UserGroupPreview {
  total_matching_users: number;
  sample_users: Array<{ email: string; is_active: boolean }>;
}

export interface NotificationFilters {
  status: string;
  type: string;
  priority: string;
}

export interface UseNotificationSystemReturn {
  loading: boolean;
  stats: NotificationStats | null;
  notifications: Notification[];
  templates: NotificationTemplate[];
  filters: NotificationFilters;
  pagination: { page: number; limit: number; total: number };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: NotificationFilters) => void;
  setPage: (page: number) => void;
  refreshData: () => void;
  createNotification: (data: any) => Promise<void>;
  createTemplate: (data: any) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotificationNow: (id: string) => Promise<void>;
  useTemplate: (template: NotificationTemplate) => void;
  previewUserGroup: (targetType: TargetType) => Promise<UserGroupPreview | null>;
}