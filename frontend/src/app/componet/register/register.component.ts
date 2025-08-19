import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, RegisterData } from '../../services/auth.service';
import { AppComponent } from '../../app.component';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private appComponent: AppComponent
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Track registration page view
    this.appComponent.trackHotjarEvent('registration_page_viewed');
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

  onSubmit(): void {
    if (this.registerForm.valid && !this.loading) {
      this.loading = true;
      
      // Track registration attempt
      this.appComponent.trackHotjarEvent('registration_attempted', {
        email_provided: !!this.registerForm.value.email,
        password_provided: !!this.registerForm.value.password,
        confirm_password_provided: !!this.registerForm.value.confirmPassword
      });
      
      const registerData: RegisterData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          
          // Track successful registration
          this.appComponent.trackHotjarEvent('registration_success', {
            user_type: 'new_user',
            registration_method: 'email'
          });
          
          this.snackBar.open('Registration successful! Please log in.', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']); // Navigate to login after successful registration
        },
        error: (error) => {
          console.error('Registration error:', error);
          
          // Track failed registration
          this.appComponent.trackHotjarEvent('registration_failed', {
            error_type: error.message || 'unknown_error',
            error_code: error.status || 'unknown'
          });
          
          this.snackBar.open(error.message || 'Registration failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Track form validation errors
      this.appComponent.trackHotjarEvent('registration_form_validation_error', {
        email_valid: this.registerForm.get('email')?.valid,
        password_valid: this.registerForm.get('password')?.valid,
        confirm_password_valid: this.registerForm.get('confirmPassword')?.valid,
        passwords_match: !this.registerForm.hasError('passwordMismatch'),
        form_valid: this.registerForm.valid
      });
    }
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
}
