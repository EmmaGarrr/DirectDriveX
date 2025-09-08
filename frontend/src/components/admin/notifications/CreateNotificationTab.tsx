"use client";

import { useState } from 'react';
import { UserGroupPreview, NotificationType, NotificationPriority, TargetType } from '@/types/notifications';

export function CreateNotificationTab({ form, setForm, onCreate, onPreview }: { form: any, setForm: (f: any) => void, onCreate: (f: any) => void, onPreview: (t: TargetType) => Promise<UserGroupPreview | null> }) {
  const [preview, setPreview] = useState<UserGroupPreview | null>(null);

  const handlePreview = async () => {
    const p = await onPreview(form.target_type);
    setPreview(p);
  };

  return (
    <div className="p-6 space-y-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md">
      <h3 className="font-semibold">Create New Notification</h3>
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full p-2 border rounded-md" />
      <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Message" className="w-full p-2 border rounded-md" rows={4}></textarea>
      {form.notification_type === 'email' && <input value={form.email_subject} onChange={e => setForm({ ...form, email_subject: e.target.value })} placeholder="Email Subject" className="w-full p-2 border rounded-md" />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select value={form.notification_type} onChange={e => setForm({ ...form, notification_type: e.target.value as NotificationType })} className="w-full p-2 border rounded-md"><option value="in_app">In-App</option><option value="email">Email</option><option value="system">System</option></select>
        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as NotificationPriority })} className="w-full p-2 border rounded-md"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
        <select value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value as TargetType })} className="w-full p-2 border rounded-md"><option value="all_users">All Users</option><option value="active_users">Active Users</option><option value="inactive_users">Inactive Users</option><option value="specific_users">Specific Users</option></select>
      </div>
      {form.target_type === 'specific_users' && <input value={form.target_users} onChange={e => setForm({ ...form, target_users: e.target.value })} placeholder="user1@example.com, user2@example.com" className="w-full p-2 border rounded-md" />}
      <input type="datetime-local" value={form.schedule_time} onChange={e => setForm({ ...form, schedule_time: e.target.value })} className="w-full p-2 border rounded-md" />
      
      <div className="p-4 mt-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
        <button onClick={handlePreview} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md">Preview Target Users</button>
        {preview && (
          <div className="mt-4 text-sm">
            <p>Matching Users: {preview.total_matching_users}</p>
            <p>Sample Users:</p>
            <ul className="pl-5 list-disc">
              {preview.sample_users.map((u, i) => <li key={i}>{u.email} [{u.is_active ? 'Active' : 'Inactive'}]</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => setForm({ title: '', message: '', notification_type: 'in_app', priority: 'medium', target_type: 'all_users', target_users: '', email_subject: '', schedule_time: '' })} className="px-4 py-2 text-sm rounded-md">Reset</button>
        <button onClick={() => onCreate(form)} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md">Create Notification</button>
      </div>
    </div>
  );
}