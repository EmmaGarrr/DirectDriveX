/**
 * Notification System Page
 * Comprehensive notification management with complete Angular feature parity
 */

"use client";

import { useState } from "react";
import { useNotificationSystem } from "@/hooks/useNotificationSystem";
import { notificationSystemService } from "@/services/admin/notificationSystemService";
import { DashboardTab } from "@/components/admin/notification-system/DashboardTab";
import { NotificationsTab } from "@/components/admin/notification-system/NotificationsTab";
import { TemplatesTab } from "@/components/admin/notification-system/TemplatesTab";
import { CreateNotificationTab } from "@/components/admin/notification-system/CreateNotificationTab";
import { 
  Bell, 
  BarChart3, 
  FileText, 
  Plus,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

export default function NotificationSystemPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'templates' | 'create'>('dashboard');
  
  const {
    // Data states
    stats,
    notifications,
    templates,
    userGroupPreview,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Filter and pagination
    filters,
    totalPages,
    currentPage,
    
    // Actions
    loadStats,
    loadNotifications,
    loadTemplates,
    createNotification,
    sendNotification,
    deleteNotification,
    createTemplate,
    applyTemplate,
    updateFilters,
    previewUserGroup,
    resetCreateForm,
    
    // Form state
    createForm,
    setCreateForm,
  } = useNotificationSystem();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'create', label: 'Create', icon: Plus },
  ];

  const handleRefreshAll = async () => {
    // Test API connection before refreshing
    const isConnected = await notificationSystemService.testConnection();
    console.log('API Connection Status:', isConnected ? 'Connected' : 'Disconnected');
    
    await Promise.all([
      loadStats(),
      loadNotifications(),
      loadTemplates(),
    ]);
  };

  const isAnyLoading = Object.values(loading).some(loading => loading);
  const hasAnyError = Object.values(errors).some(error => error);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="p-8 text-white shadow-xl rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <Bell className="flex-shrink-0 w-8 h-8" />
            <div>
              <h2 className="mb-2 text-3xl font-bold">Notification System</h2>
              <p className="opacity-90">Manage notifications, templates, and delivery analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefreshAll}
              disabled={isAnyLoading}
              className="inline-flex items-center gap-2 px-4 py-2 transition-all duration-200 border rounded-lg bg-white/20 border-white/30 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
              {isAnyLoading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {hasAnyError && (
        <div className="flex items-center gap-3 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500" />
          <div className="flex-1">
            <p className="font-medium text-red-700 dark:text-red-200">Some data failed to load</p>
            <p className="text-sm text-red-600 dark:text-red-300">
              {Object.entries(errors).filter(([_, error]) => error).map(([key, error]) => `${key}: ${error}`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border rounded-lg shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            loading={loading.stats}
            error={errors.stats}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            loading={loading.notifications}
            error={errors.notifications}
            filters={filters}
            totalPages={totalPages}
            currentPage={currentPage}
            onUpdateFilters={updateFilters}
            onSendNotification={sendNotification}
            onDeleteNotification={deleteNotification}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            templates={templates}
            loading={loading.templates}
            error={errors.templates}
            onCreateTemplate={createTemplate}
            onApplyTemplate={applyTemplate}
          />
        )}

        {activeTab === 'create' && (
          <CreateNotificationTab
            createForm={createForm}
            setCreateForm={setCreateForm}
            userGroupPreview={userGroupPreview}
            loading={loading.userGroupPreview}
            error={errors.userGroupPreview}
            onCreateNotification={createNotification}
            onPreviewUserGroup={previewUserGroup}
            onResetForm={resetCreateForm}
          />
        )}
      </div>

    </div>
  );
}
