"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, ForgotPasswordData } from "@/services/authService";
import { toastService } from "@/services/toastService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      validateEmail(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const forgotData: ForgotPasswordData = { email };
      await authService.forgotPassword(forgotData);
      
      setEmailSent(true);
      toastService.success('Password reset email sent successfully', 2500);
    } catch (error: any) {
      toastService.error(error.message || 'Failed to send reset email', 2500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 xs:p-4 sm:p-5 overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />

      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-5 xs:p-6 sm:p-8 shadow-xl backdrop-blur transition-all duration-500",
          emailSent ? "h-auto" : "h-auto"
        )}
      >
        {!emailSent ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Forgot Password
              </h2>
              <p className="text-slate-600 mt-2">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-800"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={cn(
                    "w-full h-11 pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20",
                    error
                      ? "border-red-500 bg-red-50/50 focus:border-red-500"
                      : "border-slate-300 focus:border-bolt-blue"
                  )}
                  autoComplete="email"
                />
              </div>
            </div>

              {error && (
                <div className="flex items-center text-sm text-red-600 gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !!error || !email}
                className="w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-bolt-cyan" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-8 flex sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-bolt-blue hover:text-bolt-blue/80"
              >
                Back to Login
              </button>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-sm font-medium text-bolt-blue hover:text-bolt-blue/80"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900">Email Sent!</h2>
            <div className="text-slate-600 mt-4 space-y-3 text-sm">
              <p>
                If an account with that email exists, we&apos;ve sent a password
                reset link.
              </p>
              <p>
                Please check your inbox and click the link to continue.
              </p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="mt-8 w-full h-11 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}