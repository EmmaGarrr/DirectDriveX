import {
  ReportTemplate,
  ReportFormState,
  CustomReportFormState,
  GeneratedReport,
  SystemOverviewReport,
  UserActivityReport,
  StorageUsageReport,
  CustomReport,
} from '@/types/reports';
import { adminAuthService } from '../adminAuthService';
import { activityLogsService } from './activityLogsService';
import { toastService } from '../toastService';

class ReportsService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/reports`;

  private getAuthHeaders(): HeadersInit {
    try {
      const token = adminAuthService.getAdminToken();
      
      if (!token) {
        console.warn('No admin token available for reports service');
        return {
          'Content-Type': 'application/json',
        };
      }
      
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Auth service error in reports service:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      console.log('Fetching report templates from:', `${this.API_URL}/templates`);
      
      const response = await fetch(`${this.API_URL}/templates`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report templates: ${response.status}`);
      }

      const data = await response.json();
      console.log('Report templates loaded successfully from API:', data.templates?.length || 0, 'templates');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'report_templates_viewed',
          details: {
            template_count: data.templates?.length || 0,
            category: 'reports'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      return data.templates || [];
      
    } catch (error) {
      console.error('API Error fetching report templates:', error);
      
      // Show error toast
      toastService.error('Failed to load report templates. Using cached data.');
      
      // Return fallback mock data for demo
      return [
        {
          id: 'template-1',
          name: 'Weekly User Activity Summary',
          description: 'Comprehensive analysis of user sign-ups, logins, and file uploads over the last 7 days with growth metrics.',
          type: 'user_activity',
          default_period_days: 7,
          includes: ['Users', 'Activity', 'Growth', 'Trends']
        },
        {
          id: 'template-2',
          name: 'Monthly Storage Overview',
          description: 'Detailed breakdown of storage usage by file type, top users, and storage trends for the last month.',
          type: 'storage_usage',
          default_period_days: 30,
          includes: ['Storage', 'Files', 'Users', 'Distribution']
        },
        {
          id: 'template-3',
          name: 'Quarterly System Health Report',
          description: 'Comprehensive system performance, uptime, error rate statistics, and admin activity for the last quarter.',
          type: 'system_overview',
          default_period_days: 90,
          includes: ['System', 'Performance', 'Admin', 'Health']
        }
      ];
    }
  }

  async generateReport(params: ReportFormState): Promise<GeneratedReport> {
    try {
      console.log('Generating report with params:', params);
      
      // Real API call
      const response = await fetch(`${this.API_URL}/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Report generated successfully via API');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'report_generated',
          details: {
            report_type: params.report_type,
            date_from: params.date_from,
            date_to: params.date_to,
            category: 'reports'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      return result;
      
    } catch (error) {
      console.error('API Error generating report:', error);
      
      // Show error toast
      toastService.error('Failed to generate report. Using sample data.');
      
      // Return mock data as fallback for development
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      const reportInfo = {
        type: params.report_type,
        title: this.getReportTypeLabel(params.report_type),
        generated_at: new Date().toISOString(),
        generated_by: adminAuthService.getCurrentAdmin()?.email || 'admin@enterprise.com',
        period: {
          from: params.date_from,
          to: params.date_to,
          days: Math.ceil((new Date(params.date_to).getTime() - new Date(params.date_from).getTime()) / (1000 * 60 * 60 * 24))
        },
        group_by: params.group_by
      };

      if (params.report_type === 'system_overview') {
        return {
          report_info: { ...reportInfo, title: 'System Overview Report' },
          user_statistics: {
            total_users: 1247,
            active_users: 892,
            new_users_in_period: 48,
            growth_rate: 4.2
          },
          file_statistics: {
            total_files: 58432,
            files_uploaded_in_period: 1456,
            total_storage_gb: 134.7,
            average_file_size_mb: 2.4,
            type_distribution: [
              { type: 'images', count: 28500, size_gb: 68.2 },
              { type: 'videos', count: 5200, size_gb: 42.1 },
              { type: 'documents', count: 18400, size_gb: 18.9 },
              { type: 'other', count: 6332, size_gb: 5.5 }
            ]
          },
          system_performance: {
            uptime_percentage: 99.97,
            average_response_time_ms: 118,
            total_api_requests: 1289456,
            error_rate_percentage: 0.08
          },
          growth_metrics: {
            user_growth_percentage: 4.2,
            file_growth_percentage: 2.8
          },
          admin_activity: {
            top_actions: [
              { action: 'user_management', count: 342 },
              { action: 'file_operations', count: 287 },
              { action: 'system_monitoring', count: 156 },
              { action: 'backup_management', count: 89 },
              { action: 'security_settings', count: 67 }
            ]
          }
        } as SystemOverviewReport;
      }

      if (params.report_type === 'user_activity') {
        return {
          report_info: { ...reportInfo, title: 'User Activity Report' },
          summary: {
            total_users_analyzed: 1247,
            active_users_in_period: 892,
            total_files_in_period: 1456,
            average_files_per_active_user: 1.6
          },
          top_users_by_activity: [
            { email: 'power.user@example.com', files_in_period: 87, storage_mb: 234.5 },
            { email: 'content.creator@example.com', files_in_period: 73, storage_mb: 512.8 },
            { email: 'frequent.uploader@example.com', files_in_period: 68, storage_mb: 178.3 },
            { email: 'active.member@example.com', files_in_period: 52, storage_mb: 145.7 },
            { email: 'regular.user@example.com', files_in_period: 45, storage_mb: 98.2 }
          ]
        } as UserActivityReport;
      }

      if (params.report_type === 'storage_usage') {
        return {
          report_info: { ...reportInfo, title: 'Storage Usage Report' },
          summary: {
            total_files: 58432,
            total_storage_gb: 134.7,
            files_in_period: 1456,
            average_file_size_mb: 2.4
          },
          detailed_breakdown: params.group_by === 'user' ? [
            { user: 'power.user@example.com', files: 287, storage_gb: 12.4 },
            { user: 'content.creator@example.com', files: 234, storage_gb: 18.7 },
            { user: 'frequent.uploader@example.com', files: 198, storage_gb: 8.9 }
          ] : params.group_by === 'file_type' ? [
            { type: 'images', files: 28500, storage_gb: 68.2 },
            { type: 'videos', files: 5200, storage_gb: 42.1 },
            { type: 'documents', files: 18400, storage_gb: 18.9 }
          ] : [
            { date: '2024-01-07', files: 245, storage_gb: 5.8 },
            { date: '2024-01-06', files: 198, storage_gb: 4.2 }
          ]
        } as StorageUsageReport;
      }

      throw new Error('Invalid report type');
    }
  }

  async generateCustomReport(params: CustomReportFormState): Promise<CustomReport> {
    try {
      console.log('Generating custom report with params:', params);
      
      // Real API call
      const response = await fetch(`${this.API_URL}/custom`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Custom report generated successfully via API');
      
      // Log activity
      try {
        await activityLogsService.logActivity({
          action: 'custom_report_generated',
          details: {
            title: params.title,
            data_sources_count: params.data_sources.length,
            category: 'reports'
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      return result;
      
    } catch (error) {
      console.error('API Error generating custom report:', error);
      
      // Show error toast
      toastService.error('Failed to generate custom report. Using sample data.');
      
      // Return mock data as fallback for development
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults: Record<string, { count: number; data: Array<Record<string, any>> }> = {};

      params.data_sources.forEach(source => {
        switch (source) {
          case 'users':
            mockResults[source] = {
              count: 15,
              data: [
                { email: 'user1@example.com', username: 'user1', created_at: '2024-01-01T10:00:00Z', is_active: true },
                { email: 'user2@example.com', username: 'user2', created_at: '2024-01-02T14:30:00Z', is_active: true },
                { email: 'user3@example.com', username: 'user3', created_at: '2024-01-03T09:15:00Z', is_active: false }
              ].slice(0, Math.min(10, 15))
            };
            break;
          case 'files':
            mockResults[source] = {
              count: 32,
              data: [
                { filename: 'report.pdf', file_size: 2048576, file_type: 'pdf', created_at: '2024-01-05T16:20:00Z' },
                { filename: 'image.jpg', file_size: 1024000, file_type: 'image', created_at: '2024-01-06T11:45:00Z' },
                { filename: 'document.docx', file_size: 512000, file_type: 'document', created_at: '2024-01-07T08:30:00Z' }
              ].slice(0, Math.min(10, 32))
            };
            break;
          case 'admin_activity_logs':
            mockResults[source] = {
              count: 8,
              data: [
                { action: 'user_created', timestamp: '2024-01-07T12:00:00Z', details: 'Created new user account', ip_address: '192.168.1.100' },
                { action: 'file_deleted', timestamp: '2024-01-07T10:30:00Z', details: 'Deleted inactive file', ip_address: '192.168.1.100' }
              ].slice(0, Math.min(10, 8))
            };
            break;
          default:
            mockResults[source] = { count: 0, data: [] };
        }
      });

      return {
        report_info: {
          type: 'custom',
          title: params.title,
          generated_at: new Date().toISOString(),
          generated_by: adminAuthService.getCurrentAdmin()?.email || 'admin@enterprise.com',
          period: {
            from: params.date_from,
            to: params.date_to,
            days: Math.ceil((new Date(params.date_to).getTime() - new Date(params.date_from).getTime()) / (1000 * 60 * 60 * 24))
          }
        },
        results: mockResults
      };
    }
  }

  private getReportTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'system_overview': 'System Overview Report',
      'user_activity': 'User Activity Report',
      'storage_usage': 'Storage Usage Report',
      'custom': 'Custom Report'
    };
    return typeMap[type] || type;
  }
}

export const reportsService = new ReportsService();