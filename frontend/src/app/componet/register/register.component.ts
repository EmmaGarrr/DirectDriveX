import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, RegisterData } from '../../services/auth.service';
import { GoogleAuthService } from '../../shared/services/google-auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Increased toast duration for better readability
  private readonly TOAST_DURATION = 2500;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Check for error messages from Google OAuth callback
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.showToastAndWait('error', params['error']);
        // Clear the error from URL
        this.router.navigate([], { 
          queryParams: {}, 
          replaceUrl: true 
        });
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid && !this.loading) {
      this.loading = true;
      
      const registerData: RegisterData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      try {
        const response = await firstValueFrom(this.authService.register(registerData));
        console.log('Registration successful:', response);
        
        // Show success toast with consistent duration
        await this.showToastAndWait('success', 'Registration successful! Please log in.');
        
        // Navigate to login after successful registration
        this.router.navigate(['/login']);
        
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Show error toast with consistent duration and wait for completion
        await this.showToastAndWait('error', error.message || 'Registration failed. Please try again.');
        
        // Reset loading state after error toast completes
        this.loading = false;
      }
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

  getEmailErrorMessage(): string {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.registerForm.hasError('passwordMismatch') && confirmPasswordControl?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onGoogleRegister(): void {
    this.googleAuthService.initiateGoogleLogin();
  }
}
