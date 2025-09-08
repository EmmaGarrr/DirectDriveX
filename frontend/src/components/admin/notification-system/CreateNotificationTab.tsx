/**
 * CreateNotificationTab Component
 * Comprehensive notification creation form with user group preview
 */

"use client";

import { useState, useEffect } from "react";
import { CreateNotificationRequest, UserGroupPreview } from "@/types/notification-system";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Users, 
  Eye,
  Send,
  RotateCcw,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface CreateNotificationTabProps {
  createForm: CreateNotificationRequest;
  setCreateForm: (form: Partial<CreateNotificationRequest>) => void;
  userGroupPreview: UserGroupPreview | null;
  loading: boolean;
  error: string | null;
  onCreateNotification: (data: CreateNotificationRequest) => Promise<boolean>;
  onPreviewUserGroup: (targetType: string, targetUsers?: string[]) => Promise<void>;
  onResetForm: () => void;
}

export function CreateNotificationTab({
  createForm,
  setCreateForm,
  userGroupPreview,
  loading,
  error,
  onCreateNotification,
  onPreviewUserGroup,
  onResetForm,
}: CreateNotificationTabProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTypeConfig = (type: string) => {
    const configs = {
      system: { icon: Bell, color: "text-blue-600 dark:text-blue-400" },
      email: { icon: Mail, color: "text-purple-600 dark:text-purple-400" },
      in_app: { icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400" },
      scheduled: { icon: Clock, color: "text-amber-600 dark:text-amber-400" },
    };
    return configs[type as keyof typeof configs] || configs.system;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      medium: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      high: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      urgent: "bg-purple-900 text-white dark:bg-purple-800",
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title.trim() || !createForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const success = await onCreateNotification(createForm);
    setIsSubmitting(false);
    
    if (success) {
      onResetForm();
    }
  };

  const handleTargetTypeChange = (targetType: string) => {
    setCreateForm({ target_type: targetType as any });
    
    // Trigger user group preview
    if (targetType === 'specific_users') {
      onPreviewUserGroup(targetType, createForm.target_users);
    } else {
      onPreviewUserGroup(targetType);
    }
  };

  const handlePreviewUserGroup = () => {
    if (createForm.target_type === 'specific_users') {
      onPreviewUserGroup(createForm.target_type, createForm.target_users);
    } else {
      onPreviewUserGroup(createForm.target_type);
    }
    setShowPreview(true);
  };

  const TypeIcon = getTypeConfig(createForm.notification_type).icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Create Notification
        </h2>
        <button
          onClick={onResetForm}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 dark:text-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Form
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 border rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Notification Title *
              </label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ title: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notification title"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Notification Message *
              </label>
              <textarea
                value={createForm.message}
                onChange={(e) => setCreateForm({ message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notification message"
                required
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 border rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Notification Settings
          </h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Notification Type
              </label>
              <select
                value={createForm.notification_type}
                onChange={(e) => setCreateForm({ notification_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="system">System Notification</option>
                <option value="email">Email</option>
                <option value="in_app">In-App Notification</option>
                <option value="scheduled">Scheduled Notification</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority Level
              </label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {createForm.notification_type === 'email' && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Subject
              </label>
              <input
                type="text"
                value={createForm.subject || ''}
                onChange={(e) => setCreateForm({ subject: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>
          )}

          {createForm.notification_type === 'scheduled' && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={createForm.scheduled_at || ''}
                onChange={(e) => setCreateForm({ scheduled_at: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="p-6 border rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Target Audience
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Target Type
              </label>
              <select
                value={createForm.target_type}
                onChange={(e) => handleTargetTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all_users">All Users</option>
                <option value="active_users">Active Users Only</option>
                <option value="inactive_users">Inactive Users Only</option>
                <option value="specific_users">Specific Users</option>
              </select>
            </div>

            {createForm.target_type === 'specific_users' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  User IDs (comma-separated)
                </label>
                <textarea
                  value={createForm.target_users?.join(', ') || ''}
                  onChange={(e) => setCreateForm({ 
                    target_users: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                  })}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user IDs separated by commas"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePreviewUserGroup}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              >
                <Eye className="w-4 h-4" />
                Preview Target Users
              </button>
              
              {userGroupPreview && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {userGroupPreview.total_users.toLocaleString()} users will receive this notification
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Group Preview */}
        {showPreview && userGroupPreview && (
          <div className="p-6 border rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              <Users className="w-5 h-5" />
              Target User Preview
            </h3>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {userGroupPreview.total_users.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total users will receive this notification
              </div>
            </div>

            {userGroupPreview.sample_users.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sample Users:
                </h4>
                <div className="space-y-2">
                  {userGroupPreview.sample_users.map((user, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Preview */}
        <div className="p-6 border rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Notification Preview
          </h3>
          
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${getTypeConfig(createForm.notification_type).color === 'text-blue-600 dark:text-blue-400' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-600'}`}>
                <TypeIcon className={`w-4 h-4 ${getTypeConfig(createForm.notification_type).color}`} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {createForm.title || 'Notification Title'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {createForm.notification_type.toUpperCase()} • {createForm.priority.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {createForm.message || 'Notification message will appear here...'}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onResetForm}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 dark:text-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !createForm.title.trim() || !createForm.message.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
