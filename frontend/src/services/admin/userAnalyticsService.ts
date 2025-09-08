/**
 * User Analytics Service
 * Handles all API operations for user analytics data
 */

import { adminAuthService } from '../adminAuthService';
import { toastService } from '../toastService';
import { activityLogsService } from './activityLogsService';
import {
  ActiveUsersStats,
  RegistrationTrends,
  GeographicDistribution,
  StorageUsageAnalytics,
  ActivityPatterns,
  UserRetentionMetrics
} from '@/types/analytics';

class UserAnalyticsService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/analytics`;

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAdminToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get active users statistics
   */
  async getActiveUsersStats(): Promise<ActiveUsersStats> {
    try {
      const response = await fetch(`${this.API_URL}/active-users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch active users stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_active_users_viewed',
        details: {
          target_type: 'analytics',
          description: 'Viewed active users statistics',
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get active users stats error:', error);
      
      // Return mock data for development
      return this.getMockActiveUsersStats();
    }
  }

  /**
   * Get registration trends data
   */
  async getRegistrationTrends(period: string = '30d'): Promise<RegistrationTrends> {
    try {
      const response = await fetch(`${this.API_URL}/registration-trends?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch registration trends: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_registration_trends_viewed',
        details: {
          target_type: 'analytics',
          description: `Viewed registration trends for period: ${period}`,
          period: period,
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get registration trends error:', error);
      
      // Return mock data for development
      return this.getMockRegistrationTrends(period);
    }
  }

  /**
   * Get geographic distribution data
   */
  async getGeographicDistribution(): Promise<GeographicDistribution> {
    try {
      const response = await fetch(`${this.API_URL}/geographic-distribution`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch geographic distribution: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_geographic_distribution_viewed',
        details: {
          target_type: 'analytics',
          description: 'Viewed geographic distribution analytics',
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get geographic distribution error:', error);
      
      // Return mock data for development
      return this.getMockGeographicDistribution();
    }
  }

  /**
   * Get storage usage analytics
   */
  async getStorageUsageAnalytics(): Promise<StorageUsageAnalytics> {
    try {
      const response = await fetch(`${this.API_URL}/storage-usage`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch storage usage analytics: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_storage_usage_viewed',
        details: {
          target_type: 'analytics',
          description: 'Viewed storage usage analytics',
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get storage usage analytics error:', error);
      
      // Return mock data for development
      return this.getMockStorageUsageAnalytics();
    }
  }

  /**
   * Get user activity patterns
   */
  async getUserActivityPatterns(period: string = '7d'): Promise<ActivityPatterns> {
    try {
      const response = await fetch(`${this.API_URL}/user-activity-patterns?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch user activity patterns: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_activity_patterns_viewed',
        details: {
          target_type: 'analytics',
          description: `Viewed user activity patterns for period: ${period}`,
          period: period,
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get user activity patterns error:', error);
      
      // Return mock data for development
      return this.getMockActivityPatterns(period);
    }
  }

  /**
   * Get user retention metrics
   */
  async getUserRetentionMetrics(): Promise<UserRetentionMetrics> {
    try {
      const response = await fetch(`${this.API_URL}/user-retention`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          adminAuthService.clearAdminSession();
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch user retention metrics: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'analytics_retention_metrics_viewed',
        details: {
          target_type: 'analytics',
          description: 'Viewed user retention metrics',
          result: 'success'
        }
      });

      return data;
    } catch (error) {
      console.error('UserAnalyticsService: Get user retention metrics error:', error);
      
      // Return mock data for development
      return this.getMockUserRetentionMetrics();
    }
  }

  /**
   * Mock data for development
   */
  private getMockActiveUsersStats(): ActiveUsersStats {
    return {
      total_active: 1247,
      daily_active: 89,
      weekly_active: 456,
      monthly_active: 1247
    };
  }

  private getMockRegistrationTrends(period: string): RegistrationTrends {
    const data = this.generateMockTrendData(period);
    return {
      period,
      data,
      total_registrations: data.reduce((sum, item) => sum + item.count, 0),
      growth_rate: 12.5
    };
  }

  private getMockGeographicDistribution(): GeographicDistribution {
    return {
      countries: [
        { country: 'United States', count: 456, percentage: 36.6 },
        { country: 'United Kingdom', count: 234, percentage: 18.8 },
        { country: 'Canada', count: 189, percentage: 15.2 },
        { country: 'Germany', count: 156, percentage: 12.5 },
        { country: 'Australia', count: 98, percentage: 7.9 },
        { country: 'France', count: 67, percentage: 5.4 },
        { country: 'Japan', count: 45, percentage: 3.6 }
      ],
      total_countries: 7
    };
  }

  private getMockStorageUsageAnalytics(): StorageUsageAnalytics {
    return {
      total_storage: 2847392000, // ~2.8GB
      average_per_user: 2285000, // ~2.3MB per user
      top_users: [
        { email: 'john.doe@example.com', files_count: 156, storage_used: 450000000 },
        { email: 'jane.smith@example.com', files_count: 89, storage_used: 320000000 },
        { email: 'mike.wilson@example.com', files_count: 67, storage_used: 280000000 },
        { email: 'sarah.jones@example.com', files_count: 45, storage_used: 190000000 },
        { email: 'alex.brown@example.com', files_count: 34, storage_used: 150000000 }
      ],
      storage_distribution: [
        { range: '0-1GB', count: 892 },
        { range: '1-5GB', count: 234 },
        { range: '5-10GB', count: 89 },
        { range: '10-50GB', count: 23 },
        { range: '50GB+', count: 9 }
      ]
    };
  }

  private getMockActivityPatterns(period: string): ActivityPatterns {
    return {
      upload_patterns: [
        { hour: 0, uploads: 12 }, { hour: 1, uploads: 8 }, { hour: 2, uploads: 5 },
        { hour: 3, uploads: 3 }, { hour: 4, uploads: 4 }, { hour: 5, uploads: 7 },
        { hour: 6, uploads: 15 }, { hour: 7, uploads: 28 }, { hour: 8, uploads: 45 },
        { hour: 9, uploads: 67 }, { hour: 10, uploads: 89 }, { hour: 11, uploads: 95 },
        { hour: 12, uploads: 78 }, { hour: 13, uploads: 82 }, { hour: 14, uploads: 91 },
        { hour: 15, uploads: 88 }, { hour: 16, uploads: 76 }, { hour: 17, uploads: 65 },
        { hour: 18, uploads: 52 }, { hour: 19, uploads: 38 }, { hour: 20, uploads: 29 },
        { hour: 21, uploads: 24 }, { hour: 22, uploads: 18 }, { hour: 23, uploads: 14 }
      ],
      download_patterns: [
        { hour: 0, downloads: 8 }, { hour: 1, downloads: 5 }, { hour: 2, downloads: 3 },
        { hour: 3, downloads: 2 }, { hour: 4, downloads: 3 }, { hour: 5, downloads: 6 },
        { hour: 6, downloads: 12 }, { hour: 7, downloads: 25 }, { hour: 8, downloads: 42 },
        { hour: 9, downloads: 58 }, { hour: 10, downloads: 72 }, { hour: 11, downloads: 78 },
        { hour: 12, downloads: 65 }, { hour: 13, downloads: 68 }, { hour: 14, downloads: 75 },
        { hour: 15, downloads: 72 }, { hour: 16, downloads: 61 }, { hour: 17, downloads: 52 },
        { hour: 18, downloads: 41 }, { hour: 19, downloads: 32 }, { hour: 20, downloads: 25 },
        { hour: 21, downloads: 20 }, { hour: 22, downloads: 15 }, { hour: 23, downloads: 11 }
      ],
      most_active_users: [
        { email: 'john.doe@example.com', last_login: '2024-01-15T14:30:00Z' },
        { email: 'jane.smith@example.com', last_login: '2024-01-15T13:45:00Z' },
        { email: 'mike.wilson@example.com', last_login: '2024-01-15T12:20:00Z' },
        { email: 'sarah.jones@example.com', last_login: '2024-01-15T11:15:00Z' },
        { email: 'alex.brown@example.com', last_login: null }
      ]
    };
  }

  private getMockUserRetentionMetrics(): UserRetentionMetrics {
    return {
      retention_rate_7d: 78.5,
      retention_rate_30d: 65.2,
      churn_rate: 12.3,
      new_users_last_30d: 234
    };
  }

  private generateMockTrendData(period: string): Array<{ date: string; count: number }> {
    const data: Array<{ date: string; count: number }> = [];
    const now = new Date();
    
    if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 10
        });
      }
    } else if (period === '30d') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15) + 5
        });
      }
    } else { // 90d
      for (let i = 89; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 25) + 8
        });
      }
    }
    
    return data;
  }
}

// Export singleton instance
export const userAnalyticsService = new UserAnalyticsService();
