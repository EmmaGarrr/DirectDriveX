import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, LoginCredentials } from '../../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  // Increased toast duration for better readability
  private readonly TOAST_DURATION = 2500; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private appComponent: AppComponent
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.maxLength(128)
      ]]
    });

    // Track login page view
    this.appComponent.trackHotjarEvent('login_page_viewed');
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      // Track login attempt
      this.appComponent.trackHotjarEvent('login_attempted', {
        email_provided: !!this.loginForm.value.email,
        password_provided: !!this.loginForm.value.password
      });
      
      const credentials: LoginCredentials = {
        username: this.loginForm.value.email, // API expects username field
        password: this.loginForm.value.password
      };

      try {
        const response = await firstValueFrom(this.authService.login(credentials));
        console.log('Login successful:', response);
        
        // Track successful login
        this.appComponent.trackHotjarEvent('login_success', {
          user_type: 'returning_user',
          login_method: 'email'
        });
        
        // Show success toast with consistent duration
        await this.showToastAndWait('success', 'Login successful! Redirecting...');
        
        // Navigate to home after toast completion
        this.router.navigate(['/']);
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Track failed login
        this.appComponent.trackHotjarEvent('login_failed', {
          error_type: error.message || 'unknown_error',
          error_code: error.status || 'unknown'
        });
        
        // Show error toast with consistent duration and wait for completion
        await this.showToastAndWait('error', error.message || 'Login failed. Please try again.');
        
        // Reset loading state after error toast completes
        this.loading = false;
      }
    } else {
      // Track form validation errors
      this.appComponent.trackHotjarEvent('login_form_validation_error', {
        email_valid: this.loginForm.get('email')?.valid,
        password_valid: this.loginForm.get('password')?.valid,
        form_valid: this.loginForm.valid
      });
    }
  }

  // Helper method to show toast and wait for completion
  private async showToastAndWait(type: 'success' | 'error' | 'warning' | 'info', message: string): Promise<void> {
    // Show toast with consistent duration
    switch (type) {
      case 'success':
        this.toastService.success(message, this.TOAST_DURATION);
        break;
      case 'error':
        this.toastService.error(message, this.TOAST_DURATION);
        break;
      case 'warning':
        this.toastService.warning(message, this.TOAST_DURATION);
        break;
      case 'info':
        this.toastService.info(message, this.TOAST_DURATION);
        break;
    }

    // Wait a moment for the toast to appear and start progress
    await this.delay(100);
    
    // Wait for toast completion
    await this.toastService.ensureToastCompletion();
  }

  // Helper method to create delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced test method to verify all toast types work consistently
  async testToast(): Promise<void> {
    console.log('Testing all toast types with consistent behavior...');
    
    // Test success toast
    await this.showToastAndWait('success', 'This is a success toast!');
    await this.delay(500); // Wait between toasts
    
    // Test error toast
    await this.showToastAndWait('error', 'This is an error toast!');
    await this.delay(500); // Wait between toasts
    
    // Test warning toast
    await this.showToastAndWait('warning', 'This is a warning toast!');
    await this.delay(500); // Wait between toasts
    
    // Test info toast
    await this.showToastAndWait('info', 'This is an info toast!');
    
    console.log('All toast tests completed successfully!');
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (emailControl?.hasError('maxlength')) {
      return 'Email address is too long';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    if (passwordControl?.hasError('maxlength')) {
      return 'Password is too long';
    }
    return '';
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
