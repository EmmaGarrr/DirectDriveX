"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, LoginCredentials } from "@/services/authService";
import { toastService } from "@/services/toastService";
import { googleAuthService } from "@/services/googleAuthService";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>(
    {}
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  // Increased toast duration for better readability (matching Angular)
  const TOAST_DURATION = 2500;

  // Helper method to show toast and wait for completion (matching Angular pattern)
  const showToastAndWait = async (type: 'success' | 'error' | 'warning' | 'info', message: string): Promise<void> => {
    // Show toast with consistent duration
    switch (type) {
      case 'success':
        toastService.success(message, TOAST_DURATION);
        break;
      case 'error':
        toastService.error(message, TOAST_DURATION);
        break;
      case 'warning':
        toastService.warning(message, TOAST_DURATION);
        break;
      case 'info':
        toastService.info(message, TOAST_DURATION);
        break;
    }

    // Wait a moment for the toast to appear and start progress
    await delay(100);
    
    // Wait for toast completion
    await toastService.ensureToastCompletion();
  };

  // Helper method to create delays
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Check for error messages from Google OAuth callback (matching Angular pattern)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      showToastAndWait('error', decodeURIComponent(error));
      // Clear the error from URL
      router.replace('/login');
    }
  }, [searchParams, router]);

  // Validation function matching Angular exactly
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation matching Angular exactly
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (email.length > 255) {
      newErrors.email = "Email address is too long";
    }
    
    // Password validation matching Angular exactly
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (password.length > 128) {
      newErrors.password = "Password is too long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation on blur
  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    if (touched.email) {
      validate();
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    if (touched.password) {
      validate();
    }
  };

  // Handle form submission matching Angular logic exactly
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    if (validate() && !loading) {
      setLoading(true);
      
      const credentials: LoginCredentials = {
        username: email, // API expects username field
        password: password
      };

      try {
        const response = await authService.login(credentials);
        console.log('Login successful:', response);
        
        // Show success toast with consistent duration
        await showToastAndWait('success', 'Login successful! Redirecting...');
        
        // Navigate to home after toast completion
        router.push('/');
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let errorMessage = error.message || 'Login failed. Please try again.';
        
        // Check for Google OAuth user error (matching Angular pattern)
        if (error.message && error.message.includes('You are logged in with Google')) {
          errorMessage = 'You are logged in with Google or you have forgotten your password.';
        }
        
        // Show error toast with consistent duration and wait for completion
        await showToastAndWait('error', errorMessage);
        
        // Reset loading state after error toast completes
        setLoading(false);
      }
    }
  };

  // Google login handler
  const handleGoogleLogin = (): void => {
    googleAuthService.initiateGoogleLogin();
  };

  // Error message helpers matching Angular exactly
  const getEmailErrorMessage = (): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 255) {
      return 'Email address is too long';
    }
    return '';
  };

  const getPasswordErrorMessage = (): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password.length > 128) {
      return 'Password is too long';
    }
    return '';
  };

  return (
    <div className="w-full p-6 sm:p-8 bg-white/95 backdrop-blur border border-white/20 shadow-xl rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Sign in to your account
        </h2>
        <p className="text-slate-600 mt-2">Access your secure file storage</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-800"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                className={cn(
                  "w-full h-11 pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20",
                  errors.email && touched.email
                    ? "border-red-500 bg-red-50/50 focus:border-red-500"
                    : "border-slate-300 focus:border-bolt-blue"
                )}
                autoComplete="email"
              />
            </div>
            {errors.email && touched.email && (
              <div className="flex items-center text-sm text-red-600 gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{getEmailErrorMessage()}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-800"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                placeholder="Enter your password"
                className={cn(
                  "w-full h-11 pl-10 pr-10 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20",
                  errors.password && touched.password
                    ? "border-red-500 bg-red-50/50 focus:border-red-500"
                    : "border-slate-300 focus:border-bolt-blue"
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <div className="flex items-center text-sm text-red-600 gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{getPasswordErrorMessage()}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-bolt-blue bg-slate-100 border-slate-300 rounded focus:ring-bolt-blue focus:ring-offset-0"
              />
              <label
                htmlFor="rememberMe"
                className="text-slate-600 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="font-medium text-bolt-blue hover:text-bolt-blue/80"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/95 px-2 text-slate-500">or</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
        >
          <img
            src="/assets/images/google.svg"
            alt="Google"
            className="w-6 h-6 mr-3"
          />
          Continue with Google
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-bolt-blue hover:text-bolt-blue/80"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={
      <div className="w-full p-6 sm:p-8 bg-white/95 backdrop-blur border border-white/20 shadow-xl rounded-2xl">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-bolt-blue" />
          <h2 className="text-2xl font-bold text-slate-900">Loading...</h2>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}