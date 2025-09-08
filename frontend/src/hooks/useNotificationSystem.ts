/**
 * Notification System Hook
 * State management hook for notification system with complete CRUD operations
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { notificationSystemService } from '@/services/admin/notificationSystemService';
import { 
  NotificationStats, 
  Notification, 
  NotificationTemplate, 
  CreateNotificationRequest,
  UserGroupPreview,
  NotificationFilters,
  UseNotificationSystemReturn
} from '@/types/notification-system';
import { toastService } from '@/services/toastService';

const initialFilters: NotificationFilters = {
  status_filter: '',
  type_filter: '',
  priority_filter: '',
  page: 1,
  limit: 20,
};

const initialCreateForm: CreateNotificationRequest = {
  title: '',
  message: '',
  notification_type: 'system',
  priority: 'medium',
  target_type: 'all_users',
  subject: '',
  target_users: [],
  scheduled_at: '',
};

export function useNotificationSystem(): UseNotificationSystemReturn {
  // Data states
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [userGroupPreview, setUserGroupPreview] = useState<UserGroupPreview | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    stats: false,
    notifications: false,
    templates: false,
    userGroupPreview: false,
    creating: false,
    sending: false,
    deleting: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    stats: null as string | null,
    notifications: null as string | null,
    templates: null as string | null,
    userGroupPreview: null as string | null,
    creating: null as string | null,
    sending: null as string | null,
    deleting: null as string | null,
  });

  // Filter and pagination
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [createForm, setCreateFormState] = useState<CreateNotificationRequest>(initialCreateForm);
  
  // Wrapper function to handle partial updates
  const setCreateForm = useCallback((form: Partial<CreateNotificationRequest>) => {
    setCreateFormState(prev => ({ ...prev, ...form }));
  }, []);

  // Load dashboard statistics
  const loadStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setErrors(prev => ({ ...prev, stats: null }));
    
    try {
      const data = await notificationSystemService.getDashboardStats();
      setStats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
      setErrors(prev => ({ ...prev, stats: errorMessage }));
      toastService.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Load notifications with filters
  const loadNotifications = useCallback(async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    setErrors(prev => ({ ...prev, notifications: null }));
    
    try {
      const response = await notificationSystemService.getNotifications(filters);
      setNotifications(response.notifications);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
      setErrors(prev => ({ ...prev, notifications: errorMessage }));
      toastService.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [filters]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(prev => ({ ...prev, templates: true }));
    setErrors(prev => ({ ...prev, templates: null }));
    
    try {
      const data = await notificationSystemService.getTemplates();
      setTemplates(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
      setErrors(prev => ({ ...prev, templates: errorMessage }));
      toastService.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  }, []);

  // Create notification
  const createNotification = useCallback(async (data: CreateNotificationRequest): Promise<boolean> => {
    setLoading(prev => ({ ...prev, creating: true }));
    setErrors(prev => ({ ...prev, creating: null }));
    
    try {
      const result = await notificationSystemService.createNotification(data);
      if (result.success) {
        await loadNotifications(); // Refresh notifications list
        setCreateFormState(initialCreateForm); // Reset form
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create notification';
      setErrors(prev => ({ ...prev, creating: errorMessage }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadNotifications]);

  // Send notification
  const sendNotification = useCallback(async (id: string): Promise<boolean> => {
    setLoading(prev => ({ ...prev, sending: true }));
    setErrors(prev => ({ ...prev, sending: null }));
    
    try {
      const result = await notificationSystemService.sendNotification(id);
      if (result.success) {
        await loadNotifications(); // Refresh notifications list
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
      setErrors(prev => ({ ...prev, sending: errorMessage }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  }, [loadNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    setLoading(prev => ({ ...prev, deleting: true }));
    setErrors(prev => ({ ...prev, deleting: null }));
    
    try {
      const result = await notificationSystemService.deleteNotification(id);
      if (result.success) {
        await loadNotifications(); // Refresh notifications list
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
      setErrors(prev => ({ ...prev, deleting: errorMessage }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadNotifications]);

  // Create template
  const createTemplate = useCallback(async (data: Partial<NotificationTemplate>): Promise<boolean> => {
    setLoading(prev => ({ ...prev, creating: true }));
    setErrors(prev => ({ ...prev, creating: null }));
    
    try {
      const result = await notificationSystemService.createTemplate(data);
      if (result.success) {
        await loadTemplates(); // Refresh templates list
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template';
      setErrors(prev => ({ ...prev, creating: errorMessage }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [loadTemplates]);

  // Apply template to create form
  const applyTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setCreateForm({
      title: template.name,
      message: template.content,
        notification_type: template.notification_type as any,
        priority: template.priority as any,
      target_type: 'all_users',
        subject: template.subject || '',
        target_users: [],
        scheduled_at: '',
      });
    }
  }, [templates]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Preview user group
  const previewUserGroup = useCallback(async (targetType: string, targetUsers?: string[]) => {
    setLoading(prev => ({ ...prev, userGroupPreview: true }));
    setErrors(prev => ({ ...prev, userGroupPreview: null }));
    
    try {
      const data = await notificationSystemService.previewUserGroup(targetType, targetUsers);
      setUserGroupPreview(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to preview user group';
      setErrors(prev => ({ ...prev, userGroupPreview: errorMessage }));
      toastService.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, userGroupPreview: false }));
    }
  }, []);

  // Reset create form
  const resetCreateForm = useCallback(() => {
    setCreateFormState(initialCreateForm);
  }, []);

  // Initial data load
  useEffect(() => {
    // Test API connection first
    notificationSystemService.testConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ API connection successful - loading real data');
      } else {
        console.log('⚠️ API connection failed - using mock data');
      }
    });

    loadStats();
    loadNotifications();
    loadTemplates();
  }, [loadStats, loadNotifications, loadTemplates]);

  // Reload notifications when filters change
  useEffect(() => {
    loadNotifications();
  }, [filters, loadNotifications]);

  return {
    // Data states
    stats,
    notifications,
    templates,
    userGroupPreview,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Filter and pagination
    filters,
    totalPages,
    currentPage,
    
    // Actions
    loadStats,
    loadNotifications,
    loadTemplates,
    createNotification,
    sendNotification,
    deleteNotification,
    createTemplate,
    applyTemplate,
    updateFilters,
    previewUserGroup,
    resetCreateForm,
    
    // Form state
    createForm,
    setCreateForm,
  };
}