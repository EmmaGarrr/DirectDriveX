import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2032%2032%22%20width=%2232%22%20height=%2232%22%20fill=%22none%22%20stroke=%22rgb(15%2023%2042%20/%200.05)%22%3E%3Cpath%20d=%22M0%20.5H31.5V32%22/%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2032%2032%22%20width=%2232%22%20height=%2232%22%20fill=%22none%22%20stroke=%22rgb(248%20250%20252%20/%200.05)%22%3E%3Cpath%20d=%22M0%20.5H31.5V32%22/%3E%3C/svg%3E')] animate-pattern-move"></div>
      <AdminLoginForm />
    </div>
  );
}