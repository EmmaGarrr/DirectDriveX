/**
 * TemplatesTab Component
 * Template management with creation form and usage tracking
 */

"use client";

import { useState } from "react";
import { NotificationTemplate } from "@/types/notification-system";
import { 
  FileText, 
  Plus, 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy
} from "lucide-react";

interface TemplatesTabProps {
  templates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  onCreateTemplate: (data: Partial<NotificationTemplate>) => Promise<boolean>;
  onApplyTemplate: (templateId: string) => void;
}

export function TemplatesTab({
  templates,
  loading,
  error,
  onCreateTemplate,
  onApplyTemplate,
}: TemplatesTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    subject: '',
    content: '',
    notification_type: 'system',
    priority: 'medium',
    is_active: true,
  });

  const getTypeConfig = (type: string) => {
    const configs = {
      system: { icon: Bell, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
      email: { icon: Mail, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
      in_app: { icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
      scheduled: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim() || !createForm.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const success = await onCreateTemplate(createForm);
    if (success) {
      setCreateForm({
        name: '',
        subject: '',
        content: '',
        notification_type: 'system',
        priority: 'medium',
        is_active: true,
      });
      setShowCreateForm(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    onApplyTemplate(templateId);
    // In a real implementation, this would switch to the Create tab
    alert('Template applied! Switch to Create tab to see the populated form.');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Failed to load templates
          </h3>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Notification Templates
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create New Template
          </h3>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notification Type
                </label>
                <select
                  value={createForm.notification_type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notification_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="system">System</option>
                  <option value="email">Email</option>
                  <option value="in_app">In-App</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {createForm.notification_type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Active Template
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Template Content *
              </label>
              <textarea
                value={createForm.content}
                onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template content..."
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Create Template
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Create your first template to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const typeConfig = getTypeConfig(template.notification_type);
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={template._id}
                className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {template.notification_type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityConfig(template.priority)}`}>
                        {template.priority.toUpperCase()}
                      </span>
                      {template.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                          <XCircle className="w-3 h-3" />
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                  {template.content}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div>Used {template.usage_count} times</div>
                  <div>Created {formatDate(template.created_at)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyTemplate(template._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Apply
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
