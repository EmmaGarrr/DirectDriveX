import { Notification, NotificationStats, NotificationTemplate, UserGroupPreview } from '@/types/notifications';

class NotificationService {
  private getAuthHeaders() {
    // In a real app, this would get the token from an auth service
    return { 'Content-Type': 'application/json' };
  }

  async getDashboardStats(): Promise<NotificationStats> {
    console.log("Fetching dashboard stats...");
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    return mockNotificationStats;
  }

  async getNotifications(filters: any, page: number, limit: number): Promise<{ notifications: Notification[], total: number }> {
    console.log("Fetching notifications with filters:", filters, "page:", page);
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    return { notifications: mockNotifications, total: mockNotifications.length };
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    console.log("Fetching templates...");
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    return mockTemplates;
  }

  async createNotification(data: any): Promise<void> {
    console.log("Creating notification:", data);
    // Mock API call
    await new Promise(res => setTimeout(res, 1000));
  }

  async createTemplate(data: any): Promise<void> {
    console.log("Creating template:", data);
    // Mock API call
    await new Promise(res => setTimeout(res, 1000));
  }

  async deleteNotification(id: string): Promise<void> {
    console.log("Deleting notification:", id);
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
  }

  async sendNotificationNow(id: string): Promise<void> {
    console.log("Sending notification now:", id);
    // Mock API call
    await new Promise(res => setTimeout(res, 1000));
  }

  async previewUserGroup(targetType: string): Promise<UserGroupPreview> {
    console.log("Previewing user group:", targetType);
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    return mockUserGroupPreview;
  }
}

// Mock Data
const mockNotificationStats: NotificationStats = {
  summary: { total_notifications: 1247, recent_notifications: 182, active_templates: 24, scheduled_notifications: 8 },
  delivery_summary: { total_recipients: 45382, successful_deliveries: 43921, failed_deliveries: 1461, success_rate: 96.8 },
  status_breakdown: { sent: 1089, draft: 84, scheduled: 58, failed: 16 },
  type_breakdown: { in_app: 623, email: 445, system: 134 },
  recent_activity: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString(), count: Math.floor(Math.random() * 50) + 10 })),
};

const mockNotifications: Notification[] = [
  { _id: '1', title: 'System Maintenance Alert', message: 'Server maintenance scheduled for...', notification_type: 'system', priority: 'high', status: 'sent', created_by: 'admin@site', created_at: new Date().toISOString(), target_type: 'all_users', delivery_stats: { total_recipients: 1247, successful_deliveries: 1189, failed_deliveries: 58 } },
  { _id: '2', title: 'Welcome Email Campaign', message: 'Welcome new users to the...', notification_type: 'email', priority: 'medium', status: 'draft', created_by: 'admin@site', created_at: new Date().toISOString(), target_type: 'active_users', delivery_stats: { total_recipients: 0, successful_deliveries: 0, failed_deliveries: 0 } },
];

const mockTemplates: NotificationTemplate[] = [
  { _id: 't1', template_id: 'welcome-email-v1', name: 'Welcome Email Template', notification_type: 'email', priority: 'medium', subject: 'Welcome to DirectDriveX', content: 'Welcome to our platform...', is_active: true, created_by: 'admin', created_at: new Date().toISOString(), usage_count: 24 },
];

const mockUserGroupPreview: UserGroupPreview = {
  total_matching_users: 1247,
  sample_users: [
    { email: 'user1@example.com', is_active: true },
    { email: 'user2@example.com', is_active: true },
    { email: 'user3@example.com', is_active: false },
  ],
};

export const notificationService = new NotificationService();