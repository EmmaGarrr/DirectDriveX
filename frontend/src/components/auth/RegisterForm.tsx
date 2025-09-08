"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { authService, RegisterData } from "@/services/authService";
import { googleAuthService } from "@/services/googleAuthService";
import { toastService } from "@/services/toastService";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

function RegisterFormContent() {
  const [loading, setLoading] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Increased toast duration for better readability (matching Angular)
  const TOAST_DURATION = 2500;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setError,
  } = form;

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const hasMinLength = passwordValue?.length >= 6;
  const doPasswordsMatch =
    passwordValue && confirmPasswordValue && passwordValue === confirmPasswordValue;

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
      router.replace('/register');
    }
  }, [searchParams, router]);

  const onSubmit = async (data: FormValues): Promise<void> => {
    if (!form.formState.isValid || loading) return;
    
    setLoading(true);
    
    const registerData: RegisterData = {
      email: data.email,
      password: data.password
    };

    try {
      const response = await authService.register(registerData);
      console.log('Registration successful:', response);
      
      // Show success toast with consistent duration
      await showToastAndWait('success', 'Registration successful! Please log in.');
      
      // Navigate to login after successful registration
      router.push('/login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show error toast with consistent duration and wait for completion
      await showToastAndWait('error', error.message || 'Registration failed. Please try again.');
      
      // Reset loading state after error toast completes
      setLoading(false);
    }
  };

  // Google registration handler
  const onGoogleRegister = (): void => {
    googleAuthService.initiateGoogleLogin();
  };

  // Error message helpers matching Angular exactly
  const getEmailErrorMessage = (): string => {
    if (errors.email?.type === 'required') {
      return 'Email is required';
    }
    if (errors.email?.type === 'email') {
      return 'Please enter a valid email address';
    }
    return errors.email?.message || '';
  };

  const getPasswordErrorMessage = (): string => {
    if (errors.password?.type === 'required') {
      return 'Password is required';
    }
    if (errors.password?.type === 'min') {
      return 'Password must be at least 6 characters long';
    }
    return errors.password?.message || '';
  };

  const getConfirmPasswordErrorMessage = (): string => {
    if (errors.confirmPassword?.type === 'required') {
      return 'Please confirm your password';
    }
    if (errors.confirmPassword?.message === 'Passwords do not match') {
      return 'Passwords do not match';
    }
    return errors.confirmPassword?.message || '';
  };

  const getErrorClass = (field: keyof FormValues) =>
    errors[field] && touchedFields[field]
      ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-300 focus:border-bolt-blue focus:ring-bolt-blue/20";

  return (
    <div className="w-full p-6 sm:p-8 bg-white/[.95] backdrop-blur border border-white/[.2] shadow-glass rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Create your account
        </h2>
        <p className="text-slate-600 mt-2">
          Join our secure file storage platform
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register("email")}
                placeholder="Enter your email"
                className={cn(
                  "w-full h-11 pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2",
                  getErrorClass("email")
                )}
                autoComplete="email"
              />
            </div>
            {errors.email && touchedFields.email && (
              <div className="flex items-center text-sm text-red-600 gap-1.5" role="alert" aria-live="polite">
                <AlertCircle className="w-4 h-4" />
                {getEmailErrorMessage()}
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
                type={hidePassword ? "password" : "text"}
                {...register("password")}
                placeholder="Create a password"
                className={cn(
                  "w-full h-11 pl-10 pr-10 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2",
                  getErrorClass("password")
                )}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setHidePassword(!hidePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={hidePassword ? "Show password" : "Hide password"}
              >
                {hidePassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <div className="flex items-center text-sm text-red-600 gap-1.5" role="alert" aria-live="polite">
                <AlertCircle className="w-4 h-4" />
                {getPasswordErrorMessage()}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-800"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="confirmPassword"
                type={hideConfirmPassword ? "password" : "text"}
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className={cn(
                  "w-full h-11 pl-10 pr-10 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2",
                  getErrorClass("confirmPassword")
                )}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={
                  hideConfirmPassword
                    ? "Show confirm password"
                    : "Hide confirm password"
                }
              >
                {hideConfirmPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <div className="flex items-center text-sm text-red-600 gap-1.5" role="alert" aria-live="polite">
                <AlertCircle className="w-4 h-4" />
                {getConfirmPasswordErrorMessage()}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {passwordValue && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700 font-medium">
                  Password Requirements
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {hasMinLength ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      hasMinLength ? "text-green-700" : "text-slate-600"
                    )}
                  >
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {doPasswordsMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      doPasswordsMatch ? "text-green-700" : "text-slate-600"
                    )}
                  >
                    Passwords match
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!form.formState.isValid || loading}
            className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
            aria-label={
              loading
                ? "Creating account, please wait"
                : "Create your account"
            }
            aria-busy={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account
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
            <span className="bg-white/[.95] px-2 text-slate-500">or</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={onGoogleRegister}
          className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          aria-label="Sign up with Google"
        >
          <img
            src="/assets/images/google.svg"
            alt="Google"
            className="w-5 h-5 mr-3"
          />
          Continue with Google
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-bolt-blue hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={
      <div className="w-full p-6 sm:p-8 bg-white/[.95] backdrop-blur border border-white/[.2] shadow-glass rounded-2xl">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-bolt-blue" />
          <h2 className="text-2xl font-bold text-slate-900">Loading...</h2>
        </div>
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}