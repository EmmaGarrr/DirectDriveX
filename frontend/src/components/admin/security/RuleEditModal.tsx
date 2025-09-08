"use client";

import { useState, useEffect } from "react";
import { AccessRule } from "@/types/security";
import { cn } from "@/lib/utils";

interface RuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: AccessRule) => void;
  rule: AccessRule | null;
}

// Custom Switch Component
const CustomSwitch = ({ checked, onCheckedChange, id }: { id: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    id={id}
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      checked ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

export function RuleEditModal({ isOpen, onClose, onSave, rule }: RuleEditModalProps) {
  const [formData, setFormData] = useState<Partial<AccessRule>>({});

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        rule_name: '',
        ip_pattern: '',
        action: 'allow',
        priority: 10,
        is_active: true,
        description: '',
      });
    }
  }, [rule, isOpen]);

  const handleChange = (field: keyof AccessRule, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData as AccessRule);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-md p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="pb-4 border-b dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{rule ? 'Edit' : 'Add'} Access Rule</h3>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="rule_name" className="text-right">Name</label>
            <input id="rule_name" value={formData.rule_name || ''} onChange={(e) => handleChange('rule_name', e.target.value)} className="col-span-3 w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="ip_pattern" className="text-right">IP Pattern</label>
            <input id="ip_pattern" value={formData.ip_pattern || ''} onChange={(e) => handleChange('ip_pattern', e.target.value)} className="col-span-3 w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="action" className="text-right">Action</label>
            <select value={formData.action} onChange={(e) => handleChange('action', e.target.value)} className="col-span-3 w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
              <option value="rate_limit">Rate Limit</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right">Priority</label>
            <input id="priority" type="number" value={formData.priority || 10} onChange={(e) => handleChange('priority', +e.target.value)} className="col-span-3 w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">Description</label>
            <textarea id="description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="col-span-3 w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
          <div className="flex items-center justify-end col-span-4 space-x-2">
            <label htmlFor="is_active">Rule is Active</label>
            <CustomSwitch id="is_active" checked={!!formData.is_active} onCheckedChange={(checked) => handleChange('is_active', checked)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Rule</button>
        </div>
      </div>
    </div>
  );
}