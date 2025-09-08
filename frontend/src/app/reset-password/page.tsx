"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, ResetPasswordData } from "@/services/authService";
import { toastService } from "@/services/toastService";

function ResetPasswordContent() {
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [errors, setErrors] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [touched, setTouched] = useState({
    new_password: false,
    confirm_password: false
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setTokenValid(true);
    } else {
      setTokenValid(false);
      toastService.error('Invalid reset link. Please request a new password reset.', 2500);
      // Auto-redirect to forgot password page
      setTimeout(() => {
        router.push('/forgot-password');
      }, 3000);
    }
  }, [searchParams, router]);

  // Validation functions matching Angular exactly
  const getNewPasswordErrorMessage = (): string => {
    if (!formData.new_password) {
      return 'New password is required';
    }
    if (formData.new_password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };
  
  const getConfirmPasswordErrorMessage = (): string => {
    if (!formData.confirm_password) {
      return 'Please confirm your password';
    }
    if (formData.new_password !== formData.confirm_password) {
      return 'Passwords do not match';
    }
    return '';
  };
  
  const validate = () => {
    const newErrors = {
      new_password: getNewPasswordErrorMessage(),
      confirm_password: getConfirmPasswordErrorMessage()
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };
  
  // Form handlers
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleInputBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    let error = '';
    if (field === 'new_password') {
      error = getNewPasswordErrorMessage();
    } else if (field === 'confirm_password') {
      error = getConfirmPasswordErrorMessage();
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      new_password: true,
      confirm_password: true
    });
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const resetData: ResetPasswordData = {
        reset_token: resetToken,
        new_password: formData.new_password
      };
      
      await authService.resetPassword(resetData);
      setPasswordReset(true);
      toastService.success('Password reset successfully!', 2500);
    } catch (error: any) {
      toastService.error(error.message || 'Failed to reset password', 2500);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation functions
  const goToLogin = () => {
    router.push('/login');
  };
  
  const goToForgotPassword = () => {
    router.push('/forgot-password');
  };

  const renderFormState = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-bolt-white">
          Reset Password
        </h2>
        <p className="text-bolt-light-blue mt-2 text-sm">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-bolt-light-blue"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={formData.new_password}
              onChange={(e) => handleInputChange('new_password', e.target.value)}
              onBlur={() => handleInputBlur('new_password')}
              placeholder="Enter new password"
              className={cn(
                "w-full h-12 px-4 text-sm text-bolt-white bg-bolt-light-blue/20 border rounded-lg backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-bolt-blue",
                errors.new_password && touched.new_password
                  ? "border-bolt-cyan"
                  : "border-bolt-purple/30 focus:border-bolt-blue"
              )}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bolt-light-blue/70 hover:text-bolt-light-blue"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.new_password && touched.new_password && (
            <div className="flex items-center text-sm text-bolt-cyan gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errors.new_password}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-bolt-light-blue"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirm_password}
              onChange={(e) => handleInputChange('confirm_password', e.target.value)}
              onBlur={() => handleInputBlur('confirm_password')}
              placeholder="Confirm new password"
              className={cn(
                "w-full h-12 px-4 text-sm text-bolt-white bg-bolt-light-blue/20 border rounded-lg backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-bolt-blue",
                errors.confirm_password && touched.confirm_password
                  ? "border-bolt-cyan"
                  : "border-bolt-purple/30 focus:border-bolt-blue"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bolt-light-blue/70 hover:text-bolt-light-blue"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirm_password && touched.confirm_password && (
            <div className="flex items-center text-sm text-bolt-cyan gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errors.confirm_password}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center px-4 text-sm font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bolt-black focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-bolt-cyan" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={goToLogin}
          className="text-sm font-medium text-bolt-dark-purple hover:underline"
        >
          Back to Login
        </button>
        <button
          onClick={goToForgotPassword}
          className="text-sm font-medium text-bolt-dark-purple hover:underline"
        >
          Request New Link
        </button>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-bolt-purple mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-bolt-white">
        Password Reset Successfully!
      </h2>
      <p className="text-bolt-light-blue mt-4 text-sm">
        Your password has been updated. You can now log in with your new
        password.
      </p>
      <button
        onClick={goToLogin}
        className="mt-8 w-full h-12 flex items-center justify-center px-4 text-sm font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-lg transition-colors duration-300"
      >
        Go to Login
      </button>
    </div>
  );

  const renderInvalidState = () => (
    <div className="text-center">
      <XCircle className="w-16 h-16 text-bolt-cyan mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-bolt-white">
        Invalid Reset Link
      </h2>
      <p className="text-bolt-light-blue mt-4 text-sm">
        The password reset link is invalid or has expired.
      </p>
      <button
        onClick={goToForgotPassword}
        className="mt-8 w-full h-12 flex items-center justify-center px-4 text-sm font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-lg transition-colors duration-300"
      >
        Request New Reset Link
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-bolt-black via-bolt-dark-purple to-bolt-blue -z-10" />
      <div className="w-full max-w-md rounded-2xl border border-bolt-purple/20 bg-white/10 p-8 sm:p-10 shadow-2xl shadow-bolt-black/25 backdrop-blur-xl">
        {tokenValid && !passwordReset && renderFormState()}
        {passwordReset && renderSuccessState()}
        {!tokenValid && renderInvalidState()}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-bolt-black via-bolt-dark-purple to-bolt-blue -z-10" />
          <Loader2 className="w-8 h-8 animate-spin text-bolt-white" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}