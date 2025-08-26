import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User, PasswordChangeData } from '../../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  passwordForm!: FormGroup;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  loading = false;
  profileLoading = true;
  profileError = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializePasswordForm();
    
    // Subscribe to user changes first
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      this.profileLoading = false;
    });

    // Only load if not already loaded
    if (!this.authService.getCurrentUser()) {
      this.loadUserProfile();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializePasswordForm(): void {
    // Create form with conditional validators based on user type
    const formConfig: any = {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    };
    
    // Only add current password field if user has a password
    // (Regular users or Google users who have already set a password)
    if (!this.user?.is_google_user || this.user?.has_password) {
      formConfig.currentPassword = ['', [Validators.required]];
    }
    
    this.passwordForm = this.fb.group(formConfig, { 
      validators: this.passwordMatchValidator 
    });
  }

  private passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (newPassword && confirmPassword && 
        newPassword.value !== confirmPassword.value && 
        newPassword.value && confirmPassword.value) {
      console.log('Password mismatch detected:', {
        newPasswordValue: newPassword.value ? '[REDACTED]' : null,
        confirmPasswordValue: confirmPassword.value ? '[REDACTED]' : null,
        match: newPassword.value === confirmPassword.value
      });
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.profileLoading = true;
    this.profileError = false;
    
    this.authService.loadUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileLoading = false;
        // Reinitialize form with updated user info to handle Google vs regular users
        this.initializePasswordForm();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.profileError = true;
        this.profileLoading = false;
        this.toastService.error('Failed to load profile. Please try again.');
      }
    });
  }

  retryLoadProfile(): void {
    this.loadUserProfile();
  }

  onChangePassword(): void {
    console.log('onChangePassword called');
    
    // Set loading state to prevent multiple submissions
    this.loading = true;
    
    try {
      // Special handling for Google users without password
      if (this.user?.is_google_user && !this.user?.has_password) {
        console.log('Google user without password - special handling');
        
        // Final validation check for Google users
        const newPassword = this.passwordForm.value.newPassword;
        const confirmPassword = this.passwordForm.value.confirmPassword;
        
        if (!newPassword || !confirmPassword) {
          throw new Error('Please enter both password fields');
        }
        
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        // Create password data without current_password
        const passwordData: PasswordChangeData = {
          new_password: newPassword
        };
        
        // Enhanced debug logging for Google users
        console.log('Google user password change request details:', {
          is_google_user: true,
          has_password: false,
          new_password_length: newPassword.length,
          passwords_match: newPassword === confirmPassword
        });
        
        // Send request to backend
        this.authService.changePassword(passwordData).subscribe({
          next: (response) => {
            console.log('Password changed successfully for Google user:', response);
            this.toastService.success('Password set successfully!');
            
            // Update user info to reflect that they now have a password
            if (this.user) {
              this.user.has_password = true;
              // Reinitialize form to show current password field for future changes
              this.initializePasswordForm();
            }
            
            this.passwordForm.reset();
            this.isChangingPassword = false;
            this.loading = false;
          },
          error: (error) => {
            console.error('Password change error for Google user:', error);
            this.toastService.error(error.message || 'Failed to set password. Please try again.');
            this.loading = false;
          }
        });
        
        return;
      }
      
      // Standard flow for regular users or Google users with password
      if (!this.passwordForm.valid) {
        throw new Error('Please fix the form errors before submitting');
      }
      
      const passwordData: PasswordChangeData = {
        new_password: this.passwordForm.value.newPassword
      };
      
      // Include current password for regular users or Google users with password
      if (this.passwordForm.get('currentPassword')) {
        passwordData.current_password = this.passwordForm.value.currentPassword;
      }
      
      // Enhanced debug logging to track what's being sent
      console.log('Password change request details:', {
        is_google_user: this.user?.is_google_user,
        has_password: this.user?.has_password,
        has_current_password_field: passwordData.hasOwnProperty('current_password'),
        form_valid: this.passwordForm.valid
      });

      this.authService.changePassword(passwordData).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.toastService.success('Password changed successfully!');
          
          this.passwordForm.reset();
          this.isChangingPassword = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Password change error:', error);
          
          // Provide more specific error messages
          if (error.status === 400) {
            if (error.message?.includes('Current password is incorrect')) {
              this.toastService.error('Current password is incorrect');
            } else if (error.message?.includes('Current password is required')) {
              this.toastService.error('Current password is required');
            } else {
              this.toastService.error(error.message || 'Invalid password data');
            }
          } else {
            this.toastService.error(error.message || 'Failed to change password. Please try again.');
          }
          
          this.loading = false;
        }
      });
    } catch (error: any) {
      // Handle validation errors
      console.error('Validation error:', error);
      this.toastService.error(error.message || 'Please check your input and try again');
      this.loading = false;
    }
  }

  onLogout(): void {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      this.authService.logout();
      this.toastService.success('Logged out successfully');
      this.router.navigate(['/']);
    }
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }
  
  onButtonClick(event: Event): void {
    // Prevent default form submission to have more control
    event.preventDefault();
    
    // Debug logging
    console.log('Update Password button clicked');
    console.log('Form valid:', this.passwordForm.valid);
    console.log('Form values:', {
      newPassword: this.passwordForm.value.newPassword ? '[REDACTED]' : null,
      confirmPassword: this.passwordForm.value.confirmPassword ? '[REDACTED]' : null,
      currentPassword: this.passwordForm.value.currentPassword ? '[REDACTED]' : null
    });
    console.log('Form errors:', this.passwordForm.errors);
    console.log('User is Google user:', this.user?.is_google_user);
    console.log('User has password:', this.user?.has_password);
    
    // If already loading, prevent multiple submissions
    if (this.loading) {
      console.log('Already processing a request, ignoring click');
      return;
    }
    
    // Special handling for Google users without password
    if (this.user?.is_google_user && !this.user?.has_password) {
      console.log('Google user without password detected - using special validation');
      
      // Validate passwords match
      if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
        this.toastService.error('Passwords do not match');
        return;
      }
      
      // Validate password length
      if (!this.passwordForm.value.newPassword || this.passwordForm.value.newPassword.length < 6) {
        this.toastService.error('Password must be at least 6 characters long');
        return;
      }
      
      // Skip other validations and proceed with password change
      console.log('Proceeding with password change for Google user');
      this.onChangePassword();
      return;
    }
    
    // Standard validation for regular users
    if (!this.passwordForm.valid) {
      console.log('Form is invalid, showing validation errors');
      
      if (this.passwordForm.get('newPassword')?.errors) {
        console.log('New password errors:', this.passwordForm.get('newPassword')?.errors);
      }
      if (this.passwordForm.get('confirmPassword')?.errors) {
        console.log('Confirm password errors:', this.passwordForm.get('confirmPassword')?.errors);
      }
      if (this.passwordForm.errors?.['passwordMismatch']) {
        this.toastService.error('Passwords do not match');
        return;
      }
      
      // Show appropriate error message
      if (this.passwordForm.get('newPassword')?.invalid) {
        this.toastService.error(this.getNewPasswordErrorMessage() || 'New password is invalid');
        return;
      }
      if (this.passwordForm.get('confirmPassword')?.invalid) {
        this.toastService.error(this.getConfirmPasswordErrorMessage() || 'Confirm password is invalid');
        return;
      }
      
      // Check for current password if required
      if (!this.user?.is_google_user && this.passwordForm.get('currentPassword')?.invalid) {
        this.toastService.error(this.getCurrentPasswordErrorMessage() || 'Current password is required');
        return;
      }
      
      return;
    }
    
    // If form is valid, call onChangePassword directly
    console.log('Form is valid, proceeding with password change');
    this.onChangePassword();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    if (i >= sizes.length) return `${(bytes / Math.pow(1024, sizes.length - 1)).toFixed(2)} ${sizes[sizes.length - 1]}`;
    
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
  }

  getStorageColor(): string {
    const percentage = this.user?.storage_percentage || 0;
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  getMemberSinceDate(): string {
    if (!this.user) return 'Loading...';
    
    // If user has a created_at field, use it
    if (this.user.created_at) {
      return new Date(this.user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    
    // Fallback to current date if no creation date available
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  getAccountType(): string {
    if (!this.user) return 'Loading...';
    
    // All users have unlimited storage now
    return 'Basic';
  }

  // Form validation helpers
  getCurrentPasswordErrorMessage(): string {
    const control = this.passwordForm.get('currentPassword');
    if (control?.hasError('required')) {
      return 'Current password is required';
    }
    return '';
  }

  getNewPasswordErrorMessage(): string {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required')) {
      return 'New password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Please confirm your new password';
    }
    if (this.passwordForm.hasError('passwordMismatch') && control?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
  
  isButtonDisabled(): boolean {
    // For Google users without password, only check if passwords match and meet length requirements
    if (this.user?.is_google_user && !this.user?.has_password) {
      const newPassword = this.passwordForm.get('newPassword')?.value;
      const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
      
      // Check if passwords are entered, match, and meet minimum length
      const passwordsEntered = !!newPassword && !!confirmPassword;
      const passwordsMatch = newPassword === confirmPassword;
      const meetsLengthRequirement = newPassword && newPassword.length >= 6;
      
      return !passwordsEntered || !passwordsMatch || !meetsLengthRequirement || this.loading;
    }
    
    // For regular users, use standard form validation
    return !this.passwordForm.valid || this.loading;
  }
}
