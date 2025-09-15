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
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Real-time validation to track form validity (matching login/register behavior)
  useEffect(() => {
    const isValid = validateWithoutErrors();
    setIsFormValid(isValid);
  }, [formData.new_password, formData.confirm_password]);

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

  // Validation function for real-time checking (doesn't set errors)
  const validateWithoutErrors = () => {
    // New password validation
    if (!formData.new_password) {
      return false;
    } else if (formData.new_password.length < 8) {
      return false;
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      return false;
    } else if (formData.new_password !== formData.confirm_password) {
      return false;
    }

    return true;
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
        <h2 className="text-2xl font-bold text-slate-900">
          Reset Password
        </h2>
        <p className="text-slate-600 mt-2">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-slate-800"
          >
            New Password
          </label>
          <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-slate-400" />
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={formData.new_password}
              onChange={(e) => handleInputChange('new_password', e.target.value)}
              onBlur={() => handleInputBlur('new_password')}
              placeholder="Enter new password"
              className={cn(
                "w-full h-11 pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20",
                errors.new_password && touched.new_password
                  ? "border-red-500 bg-red-50/50 focus:border-red-500"
                  : "border-slate-300 focus:border-bolt-blue"
              )}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {errors.new_password && touched.new_password && (
            <div className="flex items-center text-sm text-red-600 gap-1.5">
              <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              <span>{errors.new_password}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-slate-800"
          >
            Confirm New Password
          </label>
          <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-slate-400" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirm_password}
              onChange={(e) => handleInputChange('confirm_password', e.target.value)}
              onBlur={() => handleInputBlur('confirm_password')}
              placeholder="Confirm new password"
              className={cn(
                "w-full h-11 pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20",
                errors.confirm_password && touched.confirm_password
                  ? "border-red-500 bg-red-50/50 focus:border-red-500"
                  : "border-slate-300 focus:border-bolt-blue"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {errors.confirm_password && touched.confirm_password && (
            <div className="flex items-center text-sm text-red-600 gap-1.5">
              <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
              <span>{errors.confirm_password}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-8 flex sm:flex-row items-center justify-between gap-4">
        <button
          onClick={goToLogin}
          className="font-medium text-sm text-bolt-blue hover:text-bolt-blue/80"
        >
          Back to Login
        </button>
        <button
          onClick={goToForgotPassword}
          className="font-medium text-sm text-bolt-blue hover:text-bolt-blue/80"
        >
          Request New Link
        </button>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-slate-900">
        Password Reset Successfully!
      </h2>
      <p className="text-slate-600 mt-4 text-sm">
        Your password has been updated. You can now log in with your new
        password.
      </p>
      <button
        onClick={goToLogin}
        className="mt-8 w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300"
      >
        Go to Login
      </button>
    </div>
  );

  const renderInvalidState = () => (
    <div className="text-center">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-slate-900">
        Invalid Reset Link
      </h2>
      <p className="text-slate-600 mt-4 text-sm">
        The password reset link is invalid or has expired.
      </p>
      <button
        onClick={goToForgotPassword}
        className="mt-8 w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300"
      >
        Request New Reset Link
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 xs:p-4 sm:p-5 overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      <div className="w-full max-w-md p-5 xs:p-6 sm:p-8 bg-white/95 backdrop-blur border border-white/20 shadow-xl rounded-2xl">
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
        <div className="relative min-h-screen w-full flex items-center justify-center p-3 xs:p-4 sm:p-5 overflow-hidden">
          <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
          <Loader2 className="w-8 h-8 animate-spin text-bolt-blue" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}