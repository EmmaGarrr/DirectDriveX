"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CloudUpload,
  Star,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ChevronRight,
  LogOut,
  Home,
  FileCog,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, User as AuthUser, PasswordChangeData } from "@/services/authService";
import { toastService } from "@/services/toastService";

// Premium features list
const premiumFeatures = [
  "Unlimited storage",
  "ZIP download for multiple files", 
  "Batch upload capabilities",
  "Advanced sharing options",
  "Priority customer support",
  "Secure cloud storage with Google Drive integration"
];

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  
  const router = useRouter();

  // Load user profile from AuthService
  const loadUserProfile = async () => {
    setProfileLoading(true);
    setProfileError(false);
    
    try {
      const userData = await authService.loadUserProfile();
      setUser(userData);
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message?.includes('Authentication expired')) {
        router.push('/login');
        return;
      }
      
      setProfileError(true);
      toastService.error('Failed to load profile. Please try again.', 2500);
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Check authentication and load profile on mount
  useEffect(() => {
    // CRITICAL: Check authentication first
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // CRITICAL: Always load fresh user data from API
    loadUserProfile();
  }, []);
  
  // Retry loading profile
  const retryLoadProfile = () => {
    loadUserProfile();
  };

  // Validation functions matching Angular exactly
  const getCurrentPasswordErrorMessage = (): string => {
    if (!passwordForm.currentPassword) {
      return 'Current password is required';
    }
    return '';
  };
  
  const getNewPasswordErrorMessage = (): string => {
    if (!passwordForm.newPassword) {
      return 'New password is required';
    }
    if (passwordForm.newPassword.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };
  
  const getConfirmPasswordErrorMessage = (): string => {
    if (!passwordForm.confirmPassword) {
      return 'Please confirm your new password';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };
  
  // Form handlers
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePasswordInputBlur = (field: keyof typeof passwordForm) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    let error = '';
    if (field === 'currentPassword') {
      error = getCurrentPasswordErrorMessage();
    } else if (field === 'newPassword') {
      error = getNewPasswordErrorMessage();
    } else if (field === 'confirmPassword') {
      error = getConfirmPasswordErrorMessage();
    }
    
    setPasswordErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    
    // Validate form
    const errors = {
      currentPassword: getCurrentPasswordErrorMessage(),
      newPassword: getNewPasswordErrorMessage(),
      confirmPassword: getConfirmPasswordErrorMessage()
    };
    
    setPasswordErrors(errors);
    
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    
    setPasswordUpdateLoading(true);
    try {
      const passwordData: PasswordChangeData = {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      };
      
      await authService.changePassword(passwordData);
      toastService.success('Password changed successfully!', 2500);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      toastService.error(error.message || 'Failed to change password', 2500);
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  // Utility functions matching Angular exactly
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    if (i >= sizes.length) {
      return `${(bytes / Math.pow(1024, sizes.length - 1)).toFixed(2)} ${sizes[sizes.length - 1]}`;
    }
    
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
  };
  
  const getMemberSinceDate = (): string => {
    if (!user) return 'Loading...';
    
    if (user.created_at) {
      return new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  
  const getAccountType = (): string => {
    return 'Basic';
  };
  
  // Navigation functions
  const navigateHome = () => {
    router.push('/');
  };
  
  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      authService.logout();
      await toastService.ensureToastCompletion();
      toastService.success('Logged out successfully', 2500);
      router.push('/');
    }
  };
  
  const togglePasswordChange = () => {
    setIsChangingPassword(!isChangingPassword);
    if (!isChangingPassword) {
      // Reset form when opening
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
    }
  };
  
  const handleFeatureComingSoon = (feature: string) => {
    toastService.info(`${feature} feature coming soon`, 2500);
  };

  const cardClasses =
    "backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6";

  const renderLoadingState = () => (
    <div className="space-y-6 animate-pulse">
      <div className={cn(cardClasses, "flex items-center space-x-4")}>
        <div className="w-12 h-12 bg-bolt-light-blue rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bolt-light-blue rounded w-3/4"></div>
          <div className="h-3 bg-bolt-light-blue rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="h-6 bg-bolt-light-blue rounded w-1/2"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-full"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-full"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-5/6"></div>
        </div>
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="h-6 bg-bolt-light-blue rounded w-1/2"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-full"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-full"></div>
          <div className="h-4 bg-bolt-light-blue rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className={cardClasses}>
      <div className="text-center py-8">
        <AlertTriangle className="w-10 h-10 text-bolt-blue mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-bolt-black mb-2">
          Failed to Load Profile
        </h3>
        <p className="text-bolt-medium-black mb-6">
          We couldn't load your profile information. Please try again.
        </p>
        <button
          onClick={retryLoadProfile}
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* User Overview Card */}
      <div className={cn(cardClasses, "flex items-center space-x-4")}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bolt-blue to-bolt-mid-blue flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-bolt-black">{user?.email || "Loading..."}</h3>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-300 text-white mt-1">
            ⭐ {getAccountType()} Account
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Storage Usage Card */}
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="flex items-center space-x-3">
            <CloudUpload className="w-5 h-5 text-bolt-blue" />
            <h3 className="text-lg font-semibold text-bolt-black">
              Storage Usage
            </h3>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-bolt-medium-black">Used Storage</span>
              <span className="font-medium text-bolt-black">{user?.storage_used_gb || 0} GB</span>
            </div>
            <p className="text-xs text-bolt-medium-black mt-2">
              Unlimited storage available
            </p>
          </div>
          <div className="border-t border-bolt-light-blue pt-4">
            <h4 className="text-base font-medium text-bolt-black mb-3">
              Storage breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bolt-medium-black">Documents</span>
                <span className="text-bolt-black">{formatFileSize(user?.file_type_breakdown?.documents || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bolt-medium-black">Images</span>
                <span className="text-bolt-black">{formatFileSize(user?.file_type_breakdown?.images || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bolt-medium-black">Videos</span>
                <span className="text-bolt-black">{formatFileSize(user?.file_type_breakdown?.videos || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bolt-medium-black">Other</span>
                <span className="text-bolt-black">{formatFileSize(user?.file_type_breakdown?.other || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-bolt-blue" />
            <h3 className="text-lg font-semibold text-bolt-black">
              Account Information
            </h3>
          </div>
          <div className="space-y-3 text-sm">
                      <div>
            <label className="text-sm text-gray-500 font-medium">Email Address</label>
            <p className="text-bolt-black">{user?.email || "Loading..."}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 font-medium">Account Type</label>
            <p className="text-bolt-black">{getAccountType()} Account</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 font-medium">Member Since</label>
            <p className="text-bolt-black">{getMemberSinceDate()}</p>
          </div>
          </div>
        </div>
      </div>

      {/* Premium Features Card */}
      <div className={cn(cardClasses, "md:col-span-2")}>
        <div className="flex items-center space-x-3 mb-4">
          <Star className="w-5 h-5 text-bolt-blue" />
          <h3 className="text-lg font-semibold text-bolt-black">
            Premium Features
          </h3>
        </div>
        <p className="text-sm text-bolt-medium-black mb-4">
          You have access to all premium features.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {premiumFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-center space-x-2 border border-border rounded-lg p-3"
            >
              <CheckCircle className="w-4 h-4 text-bolt-cyan" />
              <span className="text-sm text-bolt-black">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password Change Form */}
      {isChangingPassword && (
        <div className={cn(cardClasses, "md:col-span-2")}>
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-bolt-black">
              Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password Field */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-slate-900">
                Current Password
              </label>
              <div className="input-with-icon relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={hideCurrentPassword ? "password" : "text"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  onBlur={() => handlePasswordInputBlur('currentPassword')}
                  placeholder="Enter current password"
                  className={cn(
                    "w-full h-11 pl-10 pr-12 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-colors",
                    passwordErrors.currentPassword && passwordTouched.currentPassword
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  )}
                  autoComplete="current-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setHideCurrentPassword(!hideCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-5 h-5"
                >
                  {hideCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && passwordTouched.currentPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {passwordErrors.currentPassword}
                </div>
              )}
            </div>
            
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-900">
                New Password
              </label>
              <div className="input-with-icon relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={hideNewPassword ? "password" : "text"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  onBlur={() => handlePasswordInputBlur('newPassword')}
                  placeholder="Enter new password"
                  className={cn(
                    "w-full h-11 pl-10 pr-12 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-colors",
                    passwordErrors.newPassword && passwordTouched.newPassword
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  )}
                  autoComplete="new-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setHideNewPassword(!hideNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-5 h-5"
                >
                  {hideNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && passwordTouched.newPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {passwordErrors.newPassword}
                </div>
              )}
            </div>
            
            {/* Confirm New Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">
                Confirm New Password
              </label>
              <div className="input-with-icon relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={hideConfirmPassword ? "password" : "text"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  onBlur={() => handlePasswordInputBlur('confirmPassword')}
                  placeholder="Confirm new password"
                  className={cn(
                    "w-full h-11 pl-10 pr-12 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-colors",
                    passwordErrors.confirmPassword && passwordTouched.confirmPassword
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  )}
                  autoComplete="new-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-5 h-5"
                >
                  {hideConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && passwordTouched.confirmPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {passwordErrors.confirmPassword}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={togglePasswordChange}
                className="px-10 bg-gray-300 rounded-md text-bolt-black py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordUpdateLoading || Object.values(passwordErrors).some(error => error !== '')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-pointer font-medium px-8 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {passwordUpdateLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security & Privacy Card */}
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-bolt-blue" />
            <h3 className="text-lg font-semibold text-bolt-black">
              Security & Privacy
            </h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={togglePasswordChange}
              className="w-full flex items-center text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-gray-300 shadow-sm"
            >
              <Lock className="w-4 h-4 mr-3 text-bolt-blue" />
              <span className="text-sm text-bolt-black">
                {isChangingPassword ? "Cancel Password Change" : "Change Password"}
              </span>
            </button>
            <button
              onClick={() => handleFeatureComingSoon('Two-Factor Authentication')}
              disabled
              className="w-full flex items-center text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-3 text-bolt-blue" />
              <span className="text-sm text-bolt-black">
                Two-Factor Authentication
              </span>
            </button>
            <button
              onClick={() => handleFeatureComingSoon('Download My Data')}
              disabled
              className="w-full flex items-center text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 mr-3 text-bolt-blue" />
              <span className="text-sm text-bolt-black">
                Download My Data
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className={cn(cardClasses, "space-y-4")}>
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-bolt-blue" />
            <h3 className="text-lg font-semibold text-bolt-black">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <button 
              onClick={navigateHome}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-2 rounded-xl transition-all"
            >
              Back to Home
            </button>
            <button 
              onClick={navigateHome}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-bolt-blue border border-bolt-blue hover:bg-bolt-blue/10 rounded-lg transition-colors"
            >
              Manage Files
            </button>
            <button 
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-bolt-white to-bolt-light-blue -z-10" />
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-bolt-black">User Profile</h1>
          <p className="text-bolt-medium-black">
            Manage your account settings and storage
          </p>
        </div>
        {profileLoading
          ? renderLoadingState()
          : profileError
          ? renderErrorState()
          : renderProfile()}
      </main>
    </div>
  );
}