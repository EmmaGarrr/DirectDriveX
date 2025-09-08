"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminAuthService, AdminUserCreate } from "@/services/adminAuthService";
import { UserRole } from "@/types/admin";
import { toastService } from "@/services/toastService";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
  role: z.nativeEnum(UserRole),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const PasswordStrengthIndicator = ({ password }: { password?: string }) => {
  const [strength, setStrength] = useState({ 
    score: 0, 
    width: "0%", 
    color: "bg-slate-200", 
    text: "", 
    label: "weak" as "weak" | "medium" | "strong" 
  });

  useEffect(() => {
    if (!password) {
      setStrength({ 
        score: 0, 
        width: "0%", 
        color: "bg-slate-200", 
        text: "", 
        label: "weak" 
      });
      return;
    }

    // Calculate password strength exactly like Angular
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Determine strength level and styling exactly like Angular
    let width = "0%";
    let color = "bg-[#ef4444]"; // red
    let text = "";
    let label: "weak" | "medium" | "strong" = "weak";

    if (score <= 2) {
      width = "33%";
      color = "bg-[#ef4444]"; // red
      text = "Weak password";
      label = "weak";
    } else if (score === 3) {
      width = "66%";
      color = "bg-[#f59e0b]"; // orange
      text = "Medium strength";
      label = "medium";
    } else if (score >= 4) {
      width = "100%";
      color = "bg-[#10b981]"; // green
      text = "Strong password";
      label = "strong";
    }
    
    setStrength({ score, width, color, text, label });
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <div 
          className={cn("h-2 rounded-full transition-all duration-300", strength.color)} 
          style={{ width: strength.width }} 
        />
      </div>
      {strength.text && (
        <p className={cn(
          "mt-1 text-xs font-medium",
          strength.label === "weak" && "text-red-600 dark:text-red-400",
          strength.label === "medium" && "text-orange-600 dark:text-orange-400", 
          strength.label === "strong" && "text-green-600 dark:text-green-400"
        )}>
          {strength.text}
        </p>
      )}
    </div>
  );
};

export default function CreateAdminPage() {
  const router = useRouter();
  const { isSuperAdmin, isAuthenticated } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", role: UserRole.ADMIN },
    mode: 'onChange', // Enable real-time validation
  });

  const passwordValue = form.watch("password");

  // Helper function to get role display name (matching Angular)
  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.SUPERADMIN:
        return 'Super Admin';
      default:
        return 'Unknown';
    }
  };

  // Check authentication on mount - let the layout handle redirects
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't redirect here - let the admin panel layout handle it
      setIsInitializing(false);
      return;
    }
    setIsInitializing(false);
  }, [isAuthenticated]);

  const onSubmit = async (data: FormValues) => {
    // 1. Validate superadmin access
    if (!isSuperAdmin()) {
      const errorMsg = "Only superadmin can create new admin users";
      setError(errorMsg);
      toastService.error(errorMsg);
      return;
    }

    // 2. Set loading state
    setLoading(true);
    
    // 3. Clear previous messages
    setError("");
    setSuccess("");

    const adminData: AdminUserCreate = {
      email: data.email,
      password: data.password,
      role: data.role,
    };

    try {
      // 4. Call adminAuthService.createAdminUser
      const response = await adminAuthService.createAdminUser(adminData);
      
      // 5. Handle success: show message, toast, reset form
      const successMsg = `Admin user ${response.data.email} created successfully with role ${response.data.role}`;
      setSuccess(successMsg);
      toastService.success("Admin user created successfully!");
      
      // Reset form exactly like Angular - reset then set role to ADMIN default
      form.reset();
      form.setValue('role', UserRole.ADMIN);
      
    } catch (err) {
      // 6. Handle error: show error message, toast
      const errorMessage = err instanceof Error ? err.message : "Failed to create admin user";
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      // 7. Clear loading state
      setLoading(false);
    }
  };

  // Check superadmin access on component mount and during operation
  useEffect(() => {
    if (!isInitializing && isAuthenticated && !isSuperAdmin()) {
      setError("Only superadmin can create new admin users");
    }
  }, [isSuperAdmin, isInitializing, isAuthenticated]);

  // Clear messages when form values change
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000); // Auto-clear messages after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="max-w-lg p-4 mx-auto">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return (
      <div className="max-w-lg p-4 mx-auto">
        <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-500/20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Only superadmin users can create new admin accounts.</p>
          <button onClick={() => router.push('/admin-panel')} className="px-4 py-2 mt-6 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="overflow-hidden border shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-white/20 dark:border-slate-700/30 rounded-2xl shadow-slate-900/10 dark:shadow-black/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Admin User</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create new admin user accounts (Superadmin only)</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input id="email" type="email" {...form.register("email")} className={cn("w-full h-11 pl-10 pr-4 bg-white border rounded-md dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", form.formState.errors.email && "border-red-500")} />
            </div>
            {form.formState.errors.email && <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password"  className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input id="password" type={showPassword ? "text" : "password"} {...form.register("password")} className={cn("w-full h-11 pl-10 pr-10 bg-white border rounded-md dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", form.formState.errors.password && "border-red-500")} />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={passwordValue} />
            {form.formState.errors.password && <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword"  className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...form.register("confirmPassword")} className={cn("w-full h-11 pl-10 pr-10 bg-white border rounded-md dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", form.formState.errors.confirmPassword && "border-red-500")} />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{form.formState.errors.confirmPassword.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Admin Role</label>
            <select 
              id="role" 
              {...form.register("role")} 
              className={cn(
                "w-full px-3 bg-white border rounded-md h-11 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                form.formState.errors.role && "border-red-500"
              )}
            >
              <option value={UserRole.ADMIN}>{getRoleDisplayName(UserRole.ADMIN)}</option>
              <option value={UserRole.SUPERADMIN}>{getRoleDisplayName(UserRole.SUPERADMIN)}</option>
            </select>
            {form.formState.errors.role && <p className="mt-1 text-xs text-red-600">{form.formState.errors.role.message}</p>}
          </div>

          {/* Messages */}
          {success && (
            <div className="flex items-start gap-3 p-3 text-sm font-medium text-green-800 border border-green-200 rounded-lg dark:text-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-500/20 animate-slideInDown">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-3 p-3 text-sm font-medium text-red-800 border border-red-200 rounded-lg dark:text-red-400 bg-red-50 dark:bg-red-900/10 dark:border-red-500/20 animate-shake">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={() => router.push('/admin-panel')} 
              className="px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Panel
            </button>
            <button 
              type="submit" 
              disabled={loading || form.formState.isSubmitting || !isSuperAdmin()}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-[linear-gradient(45deg,_#667eea_0%,_#764ba2_100%)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? "Creating..." : "Create Admin User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}