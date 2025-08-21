import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleAuthService } from '../../shared/services/google-auth.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-google-callback',
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-lg text-slate-600">Completing Google sign-in...</p>
      </div>
    </div>
  `,
  styles: []
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private googleAuthService: GoogleAuthService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      
      if (error) {
        // Handle error - redirect to login with error message
        console.error('Google OAuth error:', error);
        this.router.navigate(['/login'], { 
          queryParams: { error: 'Google authentication failed' } 
        });
        return;
      }
      
      if (code) {
        // Exchange code for token
        this.googleAuthService.handleGoogleCallback(code).subscribe({
          next: (response) => {
            // Store token
            localStorage.setItem('access_token', response.access_token);
            
            // Load user profile and update auth state
            this.authService.loadUserProfile().subscribe({
              next: (user: any) => {
                // The loadUserProfile method already updates the auth state internally
                // Redirect to dashboard
                this.router.navigate(['/']);
              },
              error: (error: any) => {
                console.error('Failed to load user profile:', error);
                this.router.navigate(['/login'], { 
                  queryParams: { error: 'Profile loading failed' } 
                });
              }
            });
          },
          error: (error: any) => {
            console.error('Google callback error:', error);
            // Redirect to login with error message
            this.router.navigate(['/login'], { 
              queryParams: { error: 'Authentication failed. Please try again.' } 
            });
          }
        });
      } else {
        // No code provided - redirect to login
        this.router.navigate(['/login'], { 
          queryParams: { error: 'No authorization code received' } 
        });
      }
    });
  }
}
