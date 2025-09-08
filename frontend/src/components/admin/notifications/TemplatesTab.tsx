"use client";

import { useState } from 'react';
import { NotificationTemplate } from '@/types/notifications';

export function TemplatesTab({ templates, onCreate, onUse }: { templates: NotificationTemplate[], onCreate: (t: any) => void, onUse: (t: NotificationTemplate) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ template_id: '', name: '', subject: '', content: '', notification_type: 'in_app', priority: 'medium', is_active: true });

  const handleCreate = () => {
    onCreate(newTemplate);
    setShowCreate(false);
    setNewTemplate({ template_id: '', name: '', subject: '', content: '', notification_type: 'in_app', priority: 'medium', is_active: true });
  };

  return (
    <div className="space-y-6">
      <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ Create Template</button>
      
      {showCreate && (
        <div className="p-6 space-y-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
          <h3 className="font-semibold">Create New Template</h3>
          <input value={newTemplate.template_id} onChange={e => setNewTemplate({ ...newTemplate, template_id: e.target.value })} placeholder="Template ID" className="w-full p-2 border rounded-md" />
          <input value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="Template Name" className="w-full p-2 border rounded-md" />
          <input value={newTemplate.subject} onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })} placeholder="Email Subject" className="w-full p-2 border rounded-md" />
          <textarea value={newTemplate.content} onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })} placeholder="Content" className="w-full p-2 border rounded-md" rows={4}></textarea>
          <div className="flex gap-4">
            <select value={newTemplate.notification_type} onChange={e => setNewTemplate({ ...newTemplate, notification_type: e.target.value as any })} className="w-full p-2 border rounded-md"><option value="in_app">In-App</option><option value="email">Email</option></select>
            <select value={newTemplate.priority} onChange={e => setNewTemplate({ ...newTemplate, priority: e.target.value as any })} className="w-full p-2 border rounded-md"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={newTemplate.is_active} onChange={e => setNewTemplate({ ...newTemplate, is_active: e.target.checked })} /> Active</div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-md">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md">Create</button>
          </div>
        </div>
      )}

      <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
        <h3 className="mb-4 font-semibold">Available Templates</h3>
        <div className="space-y-4">
          {templates.map(t => (
            <div key={t._id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-xs text-slate-500">ID: {t.template_id}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.content}</p>
                  <p className="mt-2 text-xs text-slate-500">Used: {t.usage_count} times</p>
                </div>
                <button onClick={() => onUse(t)} className="px-3 py-1 text-xs text-white bg-emerald-600 rounded-md">Use Template</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}