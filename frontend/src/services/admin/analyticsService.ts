import {
  ActiveUsersStats,
  RegistrationTrends,
  GeographicDistribution,
  StorageUsageAnalytics,
  ActivityPatterns,
  UserRetentionMetrics,
} from '@/types/analytics';
import { adminAuthService } from '../adminAuthService';

class AnalyticsService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/analytics`;

  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAdminToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetchData<T>(endpoint: string, mockData: T): Promise<T> {
    try {
      if (!adminAuthService.isAdminAuthenticated()) {
        return mockData;
      }
      const response = await fetch(`${this.API_URL}${endpoint}`, { headers: this.getAuthHeaders() });
      if (!response.ok) {
        console.warn(`API for ${endpoint} failed, using mock data.`);
        return mockData;
      }
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching ${endpoint}, using mock data:`, error);
      return mockData;
    }
  }

  getActiveUsersStats = () => this.fetchData<ActiveUsersStats>('/active-users', mockActiveUsersStats);
  getRegistrationTrends = (period: string = 'monthly', days: number = 30) => this.fetchData<RegistrationTrends>(`/registration-trends?period=${period}&days=${days}`, mockRegistrationTrends);
  getGeographicDistribution = () => this.fetchData<GeographicDistribution>('/geographic-distribution', mockGeographicData);
  getStorageAnalytics = () => this.fetchData<StorageUsageAnalytics>('/storage-usage', mockStorageAnalytics);
  getActivityPatterns = (days: number = 7) => this.fetchData<ActivityPatterns>(`/user-activity-patterns?days=${days}`, mockActivityPatterns);
  getRetentionMetrics = () => this.fetchData<UserRetentionMetrics>('/user-retention', mockRetentionMetrics);
}

// Mock Data
const mockActiveUsersStats: ActiveUsersStats = {
  total_active: 1247,
  daily_active: 456,
  weekly_active: 892,
  monthly_active: 1247,
};

const mockRegistrationTrends: RegistrationTrends = {
  period: 'monthly',
  data: Array.from({ length: 12 }, (_, i) => ({ date: `Month ${i + 1}`, count: Math.floor(Math.random() * 200) + 50 })),
  total_registrations: 3829,
  growth_rate: 12.5,
};

const mockGeographicData: GeographicDistribution = {
  countries: [
    { country: 'United States', count: 450, percentage: 36.1 },
    { country: 'Germany', count: 210, percentage: 16.8 },
    { country: 'United Kingdom', count: 150, percentage: 12.0 },
    { country: 'Canada', count: 95, percentage: 7.6 },
    { country: 'Australia', count: 75, percentage: 6.0 },
  ],
  total_countries: 5,
};

const mockStorageAnalytics: StorageUsageAnalytics = {
  total_storage: 2.4 * 1024 * 1024 * 1024 * 1024, // 2.4 TB
  average_per_user: 1.8 * 1024 * 1024 * 1024, // 1.8 GB
  top_users: [
    { email: 'user1@example.com', files_count: 520, storage_used: 50e9 },
    { email: 'user2@example.com', files_count: 480, storage_used: 45e9 },
    { email: 'user3@example.com', files_count: 450, storage_used: 42e9 },
  ],
  storage_distribution: [
    { range: '0-1GB', count: 600 },
    { range: '1-5GB', count: 450 },
    { range: '5-10GB', count: 150 },
    { range: '10GB+', count: 47 },
  ],
};

const mockActivityPatterns: ActivityPatterns = {
  upload_patterns: Array.from({ length: 24 }, (_, i) => ({ hour: i, uploads: Math.floor(Math.random() * 100) })),
  download_patterns: Array.from({ length: 24 }, (_, i) => ({ hour: i, downloads: Math.floor(Math.random() * 150) })),
  most_active_users: [
    { email: 'active1@example.com', last_login: new Date().toISOString() },
    { email: 'active2@example.com', last_login: new Date(Date.now() - 3600000).toISOString() },
    { email: 'inactive@example.com', last_login: null },
  ],
};

const mockRetentionMetrics: UserRetentionMetrics = {
  retention_rate_7d: 89.2,
  retention_rate_30d: 78.5,
  churn_rate: 21.5,
  new_users_last_30d: 320,
};

export const analyticsService = new AnalyticsService();