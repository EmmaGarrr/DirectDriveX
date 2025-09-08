// Custom implementation of BehaviorSubject for React
class BehaviorSubject<T> {
  value: T;
  private observers: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  next(value: T): void {
    this.value = value;
    this.observers.forEach(observer => observer(value));
  }

  getValue(): T {
    return this.value;
  }

  subscribe(observer: (value: T) => void): { unsubscribe: () => void } {
    this.observers.push(observer);
    observer(this.value);
    return {
      unsubscribe: () => {
        this.observers = this.observers.filter(obs => obs !== observer);
      }
    };
  }
}

import {
  AdminLoginRequest,
  AdminToken,
  AdminUserInDB,
  AdminActivityLog,
  AdminActivityLogResponse,
  AdminProfileResponse,
  AdminCreateResponse,
  AdminTokenVerification,
  AdminSession,
  UserRole
} from '../types/admin';

// Add AdminUserCreate interface
export interface AdminUserCreate {
  email: string;
  password: string;
  role: UserRole;
}

class AdminAuthService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/auth`;
  private currentAdminSubject = new BehaviorSubject<AdminUserInDB | null>(null);
  private isAdminAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private adminSessionSubject = new BehaviorSubject<AdminSession | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAdminAuth();
    }
  }

  private initializeAdminAuth(): void {
    const token = this.getAdminToken();
    if (token) {
      // Validate token format first
      if (!this.isValidTokenFormat(token)) {
        console.log('Invalid token format detected - clearing stale session');
        this.clearAdminSession();
        return;
      }
      
      // Check if we already have a valid session
      const currentSession = this.adminSessionSubject.value;
      if (currentSession && currentSession.token === token) {
        // Session already exists and is valid
        this.isAdminAuthenticatedSubject.next(true);
        return;
      }
      
      // Set authenticated state immediately to prevent redirect loops
      this.isAdminAuthenticatedSubject.next(true);
      
      // Try to verify the token and load profile
      this.verifyAdminToken().then(verification => {
        // Token is valid, create session with verified data
        const session: AdminSession = {
          token: token,
          adminEmail: verification.admin_email,
          adminRole: verification.admin_role === 'superadmin' ? UserRole.SUPERADMIN : UserRole.ADMIN,
          expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours
        };
        
        this.adminSessionSubject.next(session);
        
        // Load full profile
        this.loadAdminProfile().then(admin => {
          // Update session with complete admin data
          session.adminEmail = admin.email;
          session.adminRole = admin.role;
          this.adminSessionSubject.next(session);
        }).catch(error => {
          console.log('Profile load failed after token verification:', error);
          // Don't clear session if profile load fails - token is still valid
        });
      }).catch(error => {
        // Token verification failed - clear invalid session
        console.log('Token verification failed - clearing invalid session:', error.message);
        this.clearAdminSession();
      });
    } else {
      // No token found - ensure we're not authenticated
      this.isAdminAuthenticatedSubject.next(false);
    }
  }

  /**
   * Check if token has valid JWT format
   */
  private isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Admin login
   */
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminToken> {
    try {
      const response = await fetch(`${this.API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      }

      const data: AdminToken = await response.json();
      
      // Store admin token
      localStorage.setItem('admin_access_token', data.access_token);
      
      // Map the role string to UserRole enum
      let adminRole: UserRole;
      switch (data.admin_role) {
        case 'superadmin':
          adminRole = UserRole.SUPERADMIN;
          break;
        case 'admin':
          adminRole = UserRole.ADMIN;
          break;
        default:
          adminRole = UserRole.REGULAR;
      }
      
      // Create admin session
      const session: AdminSession = {
        token: data.access_token,
        adminEmail: '', // Will be populated when profile is loaded
        adminRole: adminRole,
        expiresAt: new Date(Date.now() + (data.expires_in * 1000))
      };
      
      this.adminSessionSubject.next(session);
      this.isAdminAuthenticatedSubject.next(true);
      
      // Load admin profile after successful login
      this.loadAdminProfile().then(admin => {
        // Update session with actual admin data
        session.adminEmail = admin.email;
        session.adminRole = admin.role;
        this.adminSessionSubject.next(session);
      }).catch(error => {
        console.log('Profile load failed after login:', error);
        // If profile load fails after login, there might be a backend issue
        // but don't clear the session since login was successful
      });

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Create new admin user (superadmin only)
   */
  async createAdminUser(adminData: AdminUserCreate): Promise<AdminCreateResponse> {
    try {
      const response = await fetch(`${this.API_URL}/create-admin`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to create admin user');
      }

      const data: AdminCreateResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Get current admin profile
   */
  async loadAdminProfile(): Promise<AdminUserInDB> {
    try {
      const response = await fetch(`${this.API_URL}/me`, {
        headers: this.getAdminAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAdminSession();
          throw new Error('Unauthorized: Invalid admin credentials');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to load admin profile');
      }

      const data: AdminProfileResponse = await response.json();
      const admin = data.data;
      this.currentAdminSubject.next(admin);
      
      // Update session with admin email
      const currentSession = this.adminSessionSubject.value;
      if (currentSession) {
        currentSession.adminEmail = admin.email;
        this.adminSessionSubject.next(currentSession);
      }
      
      return admin;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Get admin activity logs
   */
  async getActivityLogs(limit: number = 50, skip: number = 0): Promise<AdminActivityLogResponse> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      const response = await fetch(`${this.API_URL}/activity-logs?${params.toString()}`, {
        headers: this.getAdminAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to load activity logs');
      }

      const data: AdminActivityLogResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Verify admin token
   */
  async verifyAdminToken(): Promise<AdminTokenVerification> {
    try {
      const response = await fetch(`${this.API_URL}/verify-admin`, {
        headers: this.getAdminAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAdminSession();
          throw new Error('Unauthorized: Invalid admin credentials');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to verify token');
      }

      const data: AdminTokenVerification = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Admin logout
   */
  adminLogout(): void {
    this.clearAdminSession();
  }

  /**
   * Force clear all admin session data (useful for fixing stale token issues)
   */
  forceClearSession(): void {
    console.log('Force clearing admin session...');
    this.clearAdminSession();
    // Also clear any other related storage
    localStorage.removeItem('access_token'); // Regular user token
    console.log('All admin session data cleared');
  }

  /**
   * Refresh admin session (useful when navigating between routes)
   */
  refreshAdminSession(): void {
    this.initializeAdminAuth();
  }

  /**
   * Get admin token from localStorage
   */
  getAdminToken(): string | null {
    try {
      return localStorage.getItem('admin_access_token');
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated as admin
   */
  isAdminAuthenticated(): boolean {
    const token = this.getAdminToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    const session = this.adminSessionSubject.value;
    if (session && session.expiresAt < new Date()) {
      console.log('Session expired - clearing admin session');
      this.clearAdminSession();
      return false;
    }

    // If we have a valid token, return the current authentication state
    // This allows the async verification process to complete
    return this.isAdminAuthenticatedSubject.value;
  }

  /**
   * Check if current admin is superadmin
   */
  isSuperAdmin(): boolean {
    const session = this.adminSessionSubject.value;
    return session?.adminRole === UserRole.SUPERADMIN;
  }

  /**
   * Get current admin user
   */
  getCurrentAdmin(): AdminUserInDB | null {
    return this.currentAdminSubject.value;
  }

  /**
   * Get current admin session
   */
  getCurrentAdminSession(): AdminSession | null {
    return this.adminSessionSubject.value;
  }

  /**
   * Clear admin session and logout
   */
  clearAdminSession(): void {
    try {
      localStorage.removeItem('admin_access_token');
      this.currentAdminSubject.next(null);
      this.isAdminAuthenticatedSubject.next(false);
      this.adminSessionSubject.next(null);
    } catch {
      // Handle case where localStorage is not available
    }
  }

  /**
   * Get admin auth headers
   */
  getAdminAuthHeaders(): Record<string, string> {
    const token = this.getAdminToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Observable getters for React components
  get currentAdmin$() {
    return {
      subscribe: (callback: (admin: AdminUserInDB | null) => void) => {
        callback(this.currentAdminSubject.value);
        const subscription = this.currentAdminSubject.subscribe(callback);
        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      }
    };
  }

  get isAdminAuthenticated$() {
    return {
      subscribe: (callback: (isAuthenticated: boolean) => void) => {
        callback(this.isAdminAuthenticatedSubject.value);
        const subscription = this.isAdminAuthenticatedSubject.subscribe(callback);
        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      }
    };
  }

  get adminSession$() {
    return {
      subscribe: (callback: (session: AdminSession | null) => void) => {
        callback(this.adminSessionSubject.value);
        const subscription = this.adminSessionSubject.subscribe(callback);
        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      }
    };
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
