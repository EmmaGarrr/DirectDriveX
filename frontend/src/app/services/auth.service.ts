import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FileTypeBreakdown {
  documents: number;
  images: number;
  videos: number;
  other: number;
}

export interface User {
  id: string;
  email: string;
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
  is_google_user?: boolean;  // Flag indicating Google OAuth user
  has_password?: boolean;    // Flag indicating if user has a password
}

export interface LoginCredentials {
  username: string; // API expects username field for email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface PasswordChangeData {
  current_password?: string | null;  // Optional for Google users without password
  new_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  reset_token: string;
  new_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token on service initialization
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      // Validate token format first
      if (!this.isValidTokenFormat(token)) {
        console.log('Invalid user token format detected - clearing session');
        this.logout();
        return;
      }
      
      this.loadUserProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        },
        error: (error) => {
          // Token might be expired or invalid
          console.log('User profile load failed - clearing session:', error.message);
          this.logout();
        }
      });
    }
  }

  /**
   * Validate JWT token format
   */
  private isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.API_URL}/token`, formData)
      .pipe(
        map(response => {
          // Store token
          localStorage.setItem('access_token', response.access_token);
          
          // Load user profile after successful login
          this.loadUserProfile().subscribe(user => {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          });
          
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    // Remove token from storage
    localStorage.removeItem('access_token');
    
    // Clear user state
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Optional: Call backend logout endpoint
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.API_URL}/logout`, {}, { headers: this.getAuthHeaders() })
        .subscribe(); // Fire and forget
    }
  }

  changePassword(passwordData: PasswordChangeData): Observable<any> {
    console.log('Auth service: sending password change request', {
      has_current_password: passwordData.hasOwnProperty('current_password'),
      endpoint: `${this.API_URL}/change-password`,
      new_password_length: passwordData.new_password?.length || 0
    });
    
    // Add retry logic for better reliability
    return this.http.post(`${this.API_URL}/change-password`, passwordData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('Password change response:', response)),
      catchError(error => {
        console.error('Password change error in service:', error);
        
        // Add more specific logging for debugging
        if (error.status === 400) {
          console.error('Bad request error:', error.error);
        } else if (error.status === 401) {
          console.error('Authentication error:', error.error);
        } else {
          console.error('Unexpected error:', error);
        }
        
        return this.handleError(error);
      })
    );
  }

  forgotPassword(forgotData: ForgotPasswordData): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, forgotData)
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(resetData: ResetPasswordData): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, resetData)
      .pipe(
        catchError(this.handleError)
      );
  }

  loadUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(user => {
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(this.handleError)
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.detail) {
      errorMessage = error.error.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Preserve specific error messages from backend
    if (error.status === 401 && error.error?.detail) {
      errorMessage = error.error.detail;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Add method to refresh user data globally
  public refreshUserData(): void {
    if (this.isAuthenticated()) {
      this.loadUserProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        },
        error: (error) => {
          console.error('Failed to refresh user data:', error);
          this.logout();
        }
      });
    }
  }
}
