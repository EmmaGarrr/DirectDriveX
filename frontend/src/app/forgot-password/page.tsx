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
    <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-bolt-black to-bolt-medium-black -z-10" />

      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-bolt-purple/20 bg-white/10 p-8 sm:p-10 shadow-2xl shadow-bolt-black/25 backdrop-blur-xl transition-all duration-500",
          emailSent ? "h-auto" : "h-auto"
        )}
      >
        {!emailSent ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-bolt-white">
                Forgot Password
              </h2>
              <p className="text-bolt-light-blue mt-2 text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder=" "
                  className={cn(
                    "peer w-full h-14 px-4 pt-4 text-sm text-bolt-white bg-bolt-medium-black/50 border rounded-lg backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-bolt-blue",
                    error
                      ? "border-bolt-cyan"
                      : "border-bolt-purple/30 focus:border-bolt-blue"
                  )}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-4 text-bolt-light-blue text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Email Address
                </label>
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bolt-light-blue/50" />
              </div>

              {error && (
                <div className="flex items-center text-sm text-bolt-cyan gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !!error || !email}
                className="w-full h-12 flex items-center justify-center px-4 text-sm font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bolt-black focus:ring-bolt-blue disabled:bg-bolt-blue/50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-bolt-cyan" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-bolt-cyan hover:underline bg-transparent border-none cursor-pointer"
              >
                Back to Login
              </button>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-sm font-medium text-bolt-purple hover:underline bg-transparent border-none cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-bolt-cyan mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-bolt-white">Email Sent!</h2>
            <div className="text-bolt-light-blue mt-4 space-y-3 text-sm">
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
              className="mt-8 w-full h-12 flex items-center justify-center px-4 text-sm font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-lg transition-colors duration-300"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}