"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, FolderOpen, HardDrive, Server, Bell, BarChart2, UserPlus, File, Bot, Shield, DatabaseBackup, Activity, Settings, FileText, RefreshCw, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const navSections = [
  {
    title: "Dashboard",
    icon: Home,
    links: [
      { href: "/admin-panel", label: "Home", icon: Home },
      { href: "/admin-panel/analytics", label: "User Analytics", icon: BarChart2 },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    links: [
      { href: "/admin-panel/users", label: "Manage Users", icon: Users },
      { href: "/admin-panel/logs", label: "Activity Logs", icon: Activity },
      { href: "/admin-panel/create-admin", label: "Create Admin", icon: UserPlus, superAdminOnly: true },
    ],
  },
  {
    title: "File Management",
    icon: FolderOpen,
    links: [
      { href: "/admin-panel/files", label: "File Browser", icon: File },
      { href: "/admin-panel/drive", label: "Drive Management", icon: HardDrive },
      { href: "/admin-panel/hetzner", label: "Hetzner Management", icon: Server },
    ],
  },
  {
    title: "Storage",
    icon: HardDrive,
    links: [      { href: "/admin-panel/google-drive", label: "Google Drive", icon: HardDrive },
      { href: "/admin-panel/cleanup", label: "Storage Cleanup", icon: Trash2 },
      { href: "/admin-panel/backup", label: "Backup Management", icon: DatabaseBackup },
    ],
  },
  {
    title: "System",
    icon: Server,
    links: [
      { href: "/admin-panel/monitoring", label: "Monitoring", icon: Server },
      { href: "/admin-panel/background-processes", label: "Background Processes", icon: Bot },
      { href: "/admin-panel/security", label: "Security Settings", icon: Shield },
      { href: "/admin-panel/system-logs", label: "System Logs", icon: FileText },
    ],
  },
  {
    title: "Communication",
    icon: Bell,
    links: [
      { href: "/admin-panel/notifications", label: "Notifications", icon: Bell },
      { href: "/admin-panel/reports", label: "Reports & Export", icon: BarChart2 },
    ],
  },
];

export function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { isSuperAdmin } = useAdminAuth();

  return (
    <aside className={cn(
      "fixed top-20 left-0 h-[calc(100vh-80px)] z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-400/20 dark:border-slate-400/10 transition-all duration-300 ease-in-out",
      collapsed ? "w-[60px] overflow-hidden" : "w-[280px]"
    )}>
      <div className="flex flex-col h-full">
        <nav className="flex-grow p-2 space-y-2 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.title}>
              <h3 className={cn(
                "px-3 py-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400",
                collapsed && "text-center"
              )}>
                {collapsed ? <section.icon className="w-4 h-4 mx-auto" /> : section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map(link => {
                  if (link.superAdminOnly && !isSuperAdmin()) return null;
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link href={link.href} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50",
                        collapsed && "justify-center"
                      )}>
                        <link.icon className="w-5 h-5" />
                        {!collapsed && <span>{link.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-400/20 dark:border-slate-400/10">
            <button className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                collapsed && "justify-center"
            )}>
                <RefreshCw className="w-5 h-5" />
                {!collapsed && <span>Refresh Stats</span>}
            </button>
        </div>
      </div>
    </aside>
  );
}