export interface FileTypeBreakdown {
  documents: number;
  images: number;
  videos: number;
  other: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  is_admin?: boolean;
  storage_limit_bytes?: number;  // Optional for unlimited
  storage_used_bytes: number;
  storage_used_gb: number;
  storage_limit_gb?: number;  // Optional for unlimited
  storage_percentage?: number;  // Optional for unlimited
  remaining_storage_bytes?: number;  // Optional for unlimited
  remaining_storage_gb?: number;  // Optional for unlimited
  file_type_breakdown: FileTypeBreakdown;
  total_files: number;
  created_at?: string;
  storage_quota_gb: number; // Keep for backward compatibility
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  reset_token: string;
  new_password: string;
}

export class AuthService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/auth`;

  isAuthenticated(): boolean {
    try {
      return !!localStorage.getItem('access_token');
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      
      // Decode JWT payload (simple base64 decode for demo)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        storage_quota_gb: payload.storage_quota_gb || 10,
        // Default values for required fields - these will be loaded from API
        storage_used_bytes: payload.storage_used_bytes || 0,
        storage_used_gb: payload.storage_used_gb || 0,
        storage_limit_gb: payload.storage_limit_gb || payload.storage_quota_gb || 10,
        storage_percentage: payload.storage_percentage || 0,
        remaining_storage_bytes: payload.remaining_storage_bytes || 0,
        remaining_storage_gb: payload.remaining_storage_gb || 0,
        file_type_breakdown: payload.file_type_breakdown || {
          documents: 0,
          images: 0,
          videos: 0,
          other: 0
        },
        total_files: payload.total_files || 0,
        role: payload.role,
        is_admin: payload.is_admin || false,
        created_at: payload.created_at
      };
    } catch {
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${this.API_URL}/token`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 400) {
            errorMessage = 'Invalid registration data. Please check your inputs.';
          } else if (response.status === 409) {
            errorMessage = 'An account with this email already exists.';
          } else if (response.status === 422) {
            errorMessage = 'Please check your email and password format.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store token if provided in registration response
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      // Re-throw the error to preserve the message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  async loadUserProfile(): Promise<User> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          this.logout();
          throw new Error('Authentication expired. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to load user profile');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  async changePassword(passwordData: PasswordChangeData): Promise<any> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Authentication expired. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  async forgotPassword(forgotData: ForgotPasswordData): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(forgotData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 400) {
            errorMessage = 'Invalid email address. Please check your input.';
          } else if (response.status === 404) {
            errorMessage = 'No account found with this email address.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please try again later.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw the error to preserve the message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  async resetPassword(resetData: ResetPasswordData): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify(resetData)
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to reset password. Please try again.';
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 400) {
            errorMessage = 'Invalid password format.';
          } else if (response.status === 404) {
            errorMessage = 'Reset token not found or expired.';
          } else if (response.status === 422) {
            errorMessage = 'Invalid reset token or password requirements not met.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw the error to preserve the message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  logout(): void {
    try {
      localStorage.removeItem('access_token');
      window.location.reload();
    } catch {
      // Handle case where localStorage is not available
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
