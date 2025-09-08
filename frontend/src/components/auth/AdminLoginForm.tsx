"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { adminAuthService } from "@/services/adminAuthService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLoginRequest } from "@/types/admin";

const PasswordStrengthIndicator = ({ password }: { password?: string }) => {
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "bg-red-500" });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "Weak", color: "bg-red-500" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = "Weak";
    let color = "from-red-500 to-red-600";
    if (score >= 3) {
      label = "Medium";
      color = "from-amber-500 to-amber-600";
    }
    if (score >= 4) {
      label = "Strong";
      color = "from-emerald-500 to-emerald-600";
    }
    setStrength({ score, label, color });
  }, [password]);

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 flex gap-1 p-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full w-1/5 rounded-full transition-all duration-300",
              i < strength.score ? `bg-gradient-to-r ${strength.color}` : "bg-transparent"
            )}
          />
        ))}
      </div>
      <span className="w-16 text-xs font-medium text-right text-slate-600 dark:text-slate-300">
        {strength.label}
      </span>
    </div>
  );
};

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const { login, forceClearSession } = useAdminAuth();

  // Clear any stale admin sessions when landing on login page
  useEffect(() => {
    forceClearSession();

    // Check if we came here due to authentication issues from URL params
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');
    if (authError) {
      setError('Your session has expired. Please log in again.');
    }
  }, [forceClearSession]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string): string => {
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  // Get password strength color
  const getPasswordStrengthColor = (): string => {
    const passwordStrength = calculatePasswordStrength(password);
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get password strength text
  const getPasswordStrengthText = (): string => {
    const passwordStrength = calculatePasswordStrength(password);
    switch (passwordStrength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  };

  // Handle form input changes
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigate to user login
  const goToUserLogin = () => {
    router.push('/login');
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError("");
    setEmailError("");
    setPasswordError("");
    
    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Prepare login data
    const loginData: AdminLoginRequest = {
      email,
      password
    };
    
    try {
      // Call admin login API
      await login(loginData);
      // Navigation is handled in the useAdminAuth hook
    } catch (err) {
      // Handle error
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md p-8 space-y-8 border shadow-2xl sm:p-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/10 dark:shadow-black/20">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 right-4">
        <div className="px-3 py-1 text-[11px] font-bold text-white uppercase tracking-widest bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-violet-400 rounded-full animate-pulse">
          Enterprise
        </div>
      </div>

      <div className="space-y-4 text-center">
        <div className="inline-block p-3 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-violet-400">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Administrative Portal
        </h1>
        <p className="text-base font-medium text-slate-600 dark:text-slate-300">
          Secure Management Console
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 text-sm font-medium text-red-800 border rounded-lg dark:text-red-400 bg-red-500/10 border-red-500/20 animate-shake">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="absolute w-5 h-5 transition-colors -translate-y-1/2 left-4 top-1/2 text-slate-400 dark:text-slate-300 peer-focus:text-blue-500 dark:peer-focus:text-blue-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateEmail(email)}
            className={cn(
              "peer h-14 w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/60 pl-12 pr-4 text-base text-slate-900 dark:text-slate-50 placeholder-transparent transition-colors focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none",
              emailError && "border-red-400 dark:border-red-500"
            )}
            placeholder="admin@enterprise.com"
            required
            disabled={loading}
          />
          <label
            htmlFor="email"
            className="absolute left-12 -top-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:left-11 peer-focus:text-xs peer-focus:text-blue-500 dark:peer-focus:text-blue-400"
          >
            Administrator Email
          </label>
          {emailError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{emailError}</p>
          )}
        </div>

        <div className="relative">
          <Lock className="absolute w-5 h-5 transition-colors -translate-y-1/2 left-4 top-1/2 text-slate-400 dark:text-slate-300 peer-focus:text-blue-500 dark:peer-focus:text-blue-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => validatePassword(password)}
            className={cn(
              "peer h-14 w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/60 pl-12 pr-12 text-base text-slate-900 dark:text-slate-50 placeholder-transparent transition-colors focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none",
              passwordError && "border-red-400 dark:border-red-500"
            )}
            placeholder="Enter admin passphrase"
            required
            disabled={loading}
          />
          <label
            htmlFor="password"
            className="absolute left-12 -top-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:left-11 peer-focus:text-xs peer-focus:text-blue-500 dark:peer-focus:text-blue-400"
          >
            Security Passphrase
          </label>
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute -translate-y-1/2 right-4 top-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {passwordError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordError}</p>
          )}
          <PasswordStrengthIndicator password={password} />
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/>256-bit Encryption</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500"/>Session Secured</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center w-full text-base font-semibold text-white transition-all duration-300 group h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              ADMIN SIGN IN
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <button 
          className="relative text-sm font-medium transition-colors text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 group"
          onClick={goToUserLogin}
          disabled={loading}
        >
          Switch to User Portal
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </button>
      </div>
    </div>
  );
}