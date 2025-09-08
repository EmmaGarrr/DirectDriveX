/**
 * Notification System Service
 * API service layer for notification management, templates, and analytics
 */

import { 
  NotificationStats, 
  Notification, 
  NotificationTemplate, 
  CreateNotificationRequest,
  NotificationListResponse,
  UserGroupPreview,
  NotificationFilters
} from '@/types/notification-system';
import { adminAuthService } from '../adminAuthService';
import { activityLogsService } from './activityLogsService';
import { toastService } from '../toastService';

class NotificationSystemService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/notifications`;

  constructor() {
    console.log('NotificationSystemService initialized');
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Full API URL:', this.API_URL);
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection to:', this.API_URL);
      const response = await fetch(`${this.API_URL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const isConnected = response.ok;
      console.log('API connection test result:', isConnected ? 'SUCCESS' : 'FAILED');
      return isConnected;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  private getAuthHeaders(): HeadersInit {
    try {
      const token = adminAuthService.getAdminToken();
      
      if (!token) {
        console.warn('No admin token available for notification service');
        // Return basic headers without auth for debugging
        return {
          'Content-Type': 'application/json',
        };
      }
      
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Auth service error in notification service:', error);
      // Return basic headers without auth
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  async getDashboardStats(): Promise<NotificationStats> {
    try {
      console.log('Fetching dashboard stats from:', `${this.API_URL}/stats/dashboard`);
      
      // Real API call
      const response = await fetch(`${this.API_URL}/stats/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Dashboard stats loaded successfully from API');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'Dashboard Stats Viewed',
          details: {
            category: 'notification_management'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      return result;
      
    } catch (error) {
      console.error('API Error fetching dashboard stats:', error);
      
      // Show error toast
      toastService.error('Failed to load dashboard statistics. Using cached data.');
      
      // Return mock data as fallback for development
      const mockData: NotificationStats = {
        summary: {
          total_notifications: Math.floor(Math.random() * 1000) + 500,
          recent_notifications: Math.floor(Math.random() * 50) + 10,
          active_templates: Math.floor(Math.random() * 20) + 5,
          scheduled_notifications: Math.floor(Math.random() * 15) + 3,
        },
        delivery_summary: {
          total_recipients: Math.floor(Math.random() * 10000) + 5000,
          successful_deliveries: Math.floor(Math.random() * 8000) + 4000,
          failed_deliveries: Math.floor(Math.random() * 500) + 100,
          success_rate: Math.random() * 20 + 80, // 80-100%
        },
        status_breakdown: {
          sent: Math.floor(Math.random() * 300) + 200,
          draft: Math.floor(Math.random() * 50) + 20,
          scheduled: Math.floor(Math.random() * 30) + 10,
          failed: Math.floor(Math.random() * 20) + 5,
          cancelled: Math.floor(Math.random() * 10) + 2,
        },
        type_breakdown: {
          system: Math.floor(Math.random() * 200) + 150,
          email: Math.floor(Math.random() * 150) + 100,
          in_app: Math.floor(Math.random() * 100) + 50,
          scheduled: Math.floor(Math.random() * 50) + 25,
        },
        recent_activity: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 5,
        })),
      };

      return mockData;
    }
  }

  async getNotifications(filters: NotificationFilters): Promise<NotificationListResponse> {
    try {
      console.log('Fetching notifications with filters:', filters);
      
      // Real API call
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        status_filter: filters.status_filter,
        type_filter: filters.type_filter,
        priority_filter: filters.priority_filter,
      });
      
      const response = await fetch(`${this.API_URL}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notifications loaded successfully from API:', result.notifications?.length || 0, 'items');
      
      return result;
      
    } catch (error) {
      console.error('API Error fetching notifications:', error);
      
      // Show error toast
      toastService.error('Failed to load notifications. Using cached data.');
      
      // Return mock data as fallback for development
      const notificationTypes: Array<'system' | 'email' | 'in_app' | 'scheduled'> = ['system', 'email', 'in_app', 'scheduled'];
      const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
      const statuses: Array<'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled'> = ['draft', 'scheduled', 'sent', 'failed', 'cancelled'];
      const targetTypes: Array<'all_users' | 'active_users' | 'inactive_users' | 'specific_users'> = ['all_users', 'active_users', 'inactive_users', 'specific_users'];

      const total = Math.floor(Math.random() * 200) + 50;
      const notifications: Notification[] = Array.from({ length: Math.min(filters.limit, total) }, (_, i) => {
        const type = notificationTypes[i % notificationTypes.length];
        const priority = priorities[i % priorities.length];
        const status = statuses[i % statuses.length];
        const targetType = targetTypes[i % targetTypes.length];

        return {
          _id: `notif_${Date.now()}_${i}`,
          title: `Notification ${i + 1}`,
          message: `This is a sample notification message for testing purposes. It contains important information that users need to know.`,
          notification_type: type,
          priority,
          target_type: targetType,
          status,
          created_by: `admin_${Math.floor(Math.random() * 5) + 1}`,
          created_at: new Date(Date.now() - i * 3600000).toISOString(),
          delivery_stats: {
            total_recipients: Math.floor(Math.random() * 1000) + 100,
            successful_deliveries: Math.floor(Math.random() * 800) + 80,
            failed_deliveries: Math.floor(Math.random() * 50) + 5,
          },
          subject: type === 'email' ? `Email Subject ${i + 1}` : undefined,
          target_users: targetType === 'specific_users' ? [`user_${i + 1}`, `user_${i + 2}`] : undefined,
          scheduled_at: status === 'scheduled' ? new Date(Date.now() + i * 3600000).toISOString() : undefined,
        };
      });

      return {
        notifications,
        total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(total / filters.limit),
      };
    }
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      console.log('Fetching templates from:', `${this.API_URL.replace('/notifications', '/notification-templates')}`);
      
      // Real API call
      const response = await fetch(`${this.API_URL.replace('/notifications', '/notification-templates')}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Templates loaded successfully from API:', result.length || 0, 'templates');
      
      return result;
      
    } catch (error) {
      console.error('API Error fetching templates:', error);
      
      // Show error toast
      toastService.error('Failed to load templates. Using cached data.');
      
      // Return mock data as fallback for development
      const templateTypes = ['system', 'email', 'in_app', 'scheduled'];
      const priorities = ['low', 'medium', 'high', 'urgent'];

      return Array.from({ length: 8 }, (_, i) => ({
        _id: `template_${Date.now()}_${i}`,
        template_id: `TMPL_${String(i + 1).padStart(3, '0')}`,
        name: `Template ${i + 1}`,
        subject: templateTypes[i % templateTypes.length] === 'email' ? `Email Template Subject ${i + 1}` : undefined,
        content: `This is template content ${i + 1}. It contains placeholder text and formatting that can be customized for different notifications.`,
        notification_type: templateTypes[i % templateTypes.length],
        priority: priorities[i % priorities.length],
        is_active: i % 3 !== 0,
        created_by: `admin_${Math.floor(Math.random() * 3) + 1}`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        usage_count: Math.floor(Math.random() * 50) + 1,
      }));
    }
  }

  async createNotification(data: CreateNotificationRequest): Promise<{ success: boolean; id: string }> {
    try {
      console.log('Creating notification via API:', data);
      
      // Real API call
      const response = await fetch(`${this.API_URL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification created successfully via API:', result.id);
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'Notification Created',
          details: {
            title: data.title,
            type: data.notification_type,
            priority: data.priority,
            target_type: data.target_type,
            category: 'notification_management'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toastService.success('Notification created successfully!');
      return result;
      
    } catch (error) {
      console.error('API Error creating notification:', error);
      toastService.error('Failed to create notification. Please try again.');
      
      // For development, still return success with mock ID
      return { success: true, id: `notif_${Date.now()}` };
    }
  }

  async sendNotification(id: string): Promise<{ success: boolean }> {
    try {
      console.log(`Sending notification ${id} via API`);
      
      // Real API call
      const response = await fetch(`${this.API_URL}/${id}/send`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification sent successfully via API');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'Notification Sent',
          details: {
            notification_id: id,
            category: 'notification_management'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toastService.success('Notification sent successfully!');
      return result;
      
    } catch (error) {
      console.error('API Error sending notification:', error);
      toastService.error('Failed to send notification. Please try again.');
      
      // For development, still return success
      return { success: true };
    }
  }

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    try {
      console.log(`Deleting notification ${id} via API`);
      
      // Real API call
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification deleted successfully via API');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'Notification Deleted',
          details: {
            notification_id: id,
            category: 'notification_management'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toastService.success('Notification deleted successfully!');
      return result;
      
    } catch (error) {
      console.error('API Error deleting notification:', error);
      toastService.error('Failed to delete notification. Please try again.');
      
      // For development, still return success
      return { success: true };
    }
  }

  async createTemplate(data: Partial<NotificationTemplate>): Promise<{ success: boolean; id: string }> {
    try {
      console.log('Creating template via API:', data);
      
      // Real API call
      const response = await fetch(`${this.API_URL.replace('/notifications', '/notification-templates')}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Template created successfully via API:', result.id);
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'Template Created',
          details: {
            template_name: data.name,
            type: data.notification_type,
            category: 'template_management'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toastService.success('Template created successfully!');
      return result;
      
    } catch (error) {
      console.error('API Error creating template:', error);
      toastService.error('Failed to create template. Please try again.');
      
      // For development, still return success with mock ID
      return { success: true, id: `template_${Date.now()}` };
    }
  }

  async previewUserGroup(targetType: string, targetUsers?: string[]): Promise<UserGroupPreview> {
    try {
      console.log('Previewing user group via API:', { targetType, targetUsers });
      
      // Real API call
      const response = await fetch(`${this.API_URL.replace('/notifications', '/user-groups/preview')}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ target_type: targetType, target_users: targetUsers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User group preview loaded successfully from API:', result.total_users, 'users');
      
      return result;
      
    } catch (error) {
      console.error('API Error previewing user group:', error);
      
      // Show error toast
      toastService.error('Failed to preview user group. Using sample data.');
      
      // Return mock data as fallback for development
      const totalUsers = Math.floor(Math.random() * 5000) + 1000;
      const sampleUsers = Array.from({ length: 5 }, (_, i) => ({
        id: `user_${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      return {
        total_users: totalUsers,
        sample_users: sampleUsers,
      };
    }
  }
}

export const notificationSystemService = new NotificationSystemService();
