"use client";

import { useState } from "react";
import { Bell, CheckCircle, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminNotification, UserRole } from "@/types/admin";

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { adminUser, logout } = useAdminAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    { id: '1', type: 'success', title: 'Backup Complete', message: 'Daily backup completed successfully.', timestamp: new Date() },
    { id: '2', type: 'warning', title: 'High CPU Usage', message: 'CPU usage is at 85%.', timestamp: new Date(Date.now() - 3600000) },
  ]);

  const getRoleDisplayName = (role?: UserRole) => {
    if (role === UserRole.SUPERADMIN) return "Super Admin";
    if (role === UserRole.ADMIN) return "Admin";
    return "Admin";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-400/20 dark:border-slate-400/10">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">mfcnextgen Admin Panel</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">Welcome, {adminUser?.email || 'Admin'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10">
                <div className="p-3 flex justify-between items-center border-b border-slate-400/20 dark:border-slate-400/10">
                  <h4 className="font-semibold">Notifications</h4>
                  <button onClick={() => setNotifications([])} className="text-xs text-blue-500 hover:underline">Clear All</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-slate-400/20 dark:border-slate-400/10 text-sm">
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <ThemeToggle />
          <span className={cn(
            "hidden sm:inline-block px-3 py-1 text-xs font-bold text-white rounded-full",
            adminUser?.role === UserRole.SUPERADMIN ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-blue-500 to-blue-600"
          )}>
            {getRoleDisplayName(adminUser?.role)}
          </span>
          <button onClick={logout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}