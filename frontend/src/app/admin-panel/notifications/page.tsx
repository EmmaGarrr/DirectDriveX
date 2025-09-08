"use client";

import { useState } from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { DashboardTab } from '@/components/admin/notifications/DashboardTab';
import { NotificationsTab } from '@/components/admin/notifications/NotificationsTab';
import { TemplatesTab } from '@/components/admin/notifications/TemplatesTab';
import { CreateNotificationTab } from '@/components/admin/notifications/CreateNotificationTab';
import { Bell, LayoutDashboard, List, FileText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'notifications', label: 'Notifications', icon: List },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'create', label: 'Create', icon: PlusCircle },
];

export default function NotificationSystemPage() {
  const {
    loading, stats, notifications, templates, filters, pagination, activeTab, createNotificationForm,
    setActiveTab, setFilters, setPage, refreshData, createNotification, createTemplate,
    deleteNotification, sendNotificationNow, useTemplate, previewUserGroup, setCreateNotificationForm
  } = useNotificationSystem();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 text-blue-500 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification System</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage system announcements, email broadcasts, and user notifications.</p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 p-1 rounded-lg md:grid-cols-4 bg-slate-100 dark:bg-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
        {activeTab === 'notifications' && <NotificationsTab notifications={notifications} filters={filters} setFilters={setFilters} pagination={pagination} setPage={setPage} onAction={(action, id) => action === 'delete' ? deleteNotification(id) : sendNotificationNow(id)} onCreate={() => setActiveTab('create')} />}
        {activeTab === 'templates' && <TemplatesTab templates={templates} onCreate={createTemplate} onUse={useTemplate} />}
        {activeTab === 'create' && <CreateNotificationTab form={createNotificationForm} setForm={setCreateNotificationForm} onCreate={createNotification} onPreview={previewUserGroup} />}
      </div>
    </div>
  );
}