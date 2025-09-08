/**
 * TypeScript interfaces for Notification System management
 * Complete type definitions for notification CRUD, templates, and analytics
 */

export interface NotificationStats {
  summary: {
    total_notifications: number;
    recent_notifications: number;
    active_templates: number;
    scheduled_notifications: number;
  };
  delivery_summary: {
    total_recipients: number;
    successful_deliveries: number;
    failed_deliveries: number;
    success_rate: number;
  };
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  recent_activity: Array<{ date: string; count: number }>;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  notification_type: 'system' | 'email' | 'in_app' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_type: 'all_users' | 'active_users' | 'inactive_users' | 'specific_users';
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  created_by: string;
  created_at: string;
  delivery_stats: {
    total_recipients: number;
    successful_deliveries: number;
    failed_deliveries: number;
  };
  subject?: string;
  target_users?: string[];
  scheduled_at?: string;
}

export interface NotificationTemplate {
  _id: string;
  template_id: string;
  name: string;
  subject?: string;
  content: string;
  notification_type: 'system' | 'email' | 'in_app' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  created_at: string;
  usage_count: number;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  notification_type: 'system' | 'email' | 'in_app' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_type: 'all_users' | 'active_users' | 'inactive_users' | 'specific_users';
  subject?: string;
  target_users?: string[];
  scheduled_at?: string;
}

export interface NotificationFilters {
  status_filter: string;
  type_filter: string;
  priority_filter: 'low' | 'medium' | 'high' | 'urgent' | '';
  page: number;
  limit: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserGroupPreview {
  total_users: number;
  sample_users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface UseNotificationSystemReturn {
  // Data states
  stats: NotificationStats | null;
  notifications: Notification[];
  templates: NotificationTemplate[];
  userGroupPreview: UserGroupPreview | null;
  
  // Loading states
  loading: {
    stats: boolean;
    notifications: boolean;
    templates: boolean;
    userGroupPreview: boolean;
    creating: boolean;
    sending: boolean;
    deleting: boolean;
  };
  
  // Error states
  errors: {
    stats: string | null;
    notifications: string | null;
    templates: string | null;
    userGroupPreview: string | null;
    creating: string | null;
    sending: string | null;
    deleting: string | null;
  };
  
  // Filter and pagination
  filters: NotificationFilters;
  totalPages: number;
  currentPage: number;
  
  // Actions
  loadStats: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  createNotification: (data: CreateNotificationRequest) => Promise<boolean>;
  sendNotification: (id: string) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  createTemplate: (data: Partial<NotificationTemplate>) => Promise<boolean>;
  applyTemplate: (templateId: string) => void;
  updateFilters: (filters: Partial<NotificationFilters>) => void;
  previewUserGroup: (targetType: string, targetUsers?: string[]) => Promise<void>;
  resetCreateForm: () => void;
  
  // Form state
  createForm: CreateNotificationRequest;
  setCreateForm: (form: Partial<CreateNotificationRequest>) => void;
}
