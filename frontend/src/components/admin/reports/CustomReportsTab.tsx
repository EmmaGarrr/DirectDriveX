"use client";

import { useState } from "react";
import { CustomReportFormState, DataSource } from "@/types/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus, RotateCcw, FileSignature } from "lucide-react";

interface CustomReportsTabProps {
  formState: CustomReportFormState;
  setFormState: (form: Partial<CustomReportFormState>) => void;
  onGenerate: () => void;
  onReset: () => void;
  loading: boolean;
}

const availableDataSources: { value: DataSource; label: string }[] = [
  { value: 'users', label: 'Users' },
  { value: 'files', label: 'Files' },
  { value: 'admin_activity_logs', label: 'Admin Activity' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'notification_deliveries', label: 'Deliveries' },
  { value: 'backup_logs', label: 'Backup Logs' },
];

const commonFields = [
  'email', 'username', 'created_at', 'last_login', 'is_active',
  'filename', 'file_size', 'file_type', 'action', 'timestamp'
];

export function CustomReportsTab({ formState, setFormState, onGenerate, onReset, loading }: CustomReportsTabProps) {
  const [customField, setCustomField] = useState('');

  const handleDataSourceToggle = (source: DataSource) => {
    const currentSources = formState.data_sources;
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    setFormState({ data_sources: newSources });
  };

  const addField = (field: string) => {
    if (field && !formState.fields.includes(field)) {
      setFormState({ fields: [...formState.fields, field] });
    }
  };

  const removeField = (field: string) => {
    setFormState({ fields: formState.fields.filter(f => f !== field) });
  };

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Report Title" value={formState.title} onChange={(e) => setFormState({ title: e.target.value })} required />
            <Select value={formState.export_format} onValueChange={(value) => setFormState({ export_format: value as 'json' | 'csv' })}>
              <SelectTrigger><SelectValue placeholder="Export Format" /></SelectTrigger>
              <SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Description (optional)" value={formState.description} onChange={(e) => setFormState({ description: e.target.value })} />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="custom-date-from">From Date</Label>
            <Input id="custom-date-from" type="date" value={formState.date_from} onChange={(e) => setFormState({ date_from: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="custom-date-to">To Date</Label>
            <Input id="custom-date-to" type="date" value={formState.date_to} onChange={(e) => setFormState({ date_to: e.target.value })} required />
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <Label>Data Sources</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 mt-2 border rounded-lg border-slate-200 dark:border-slate-700">
            {availableDataSources.map(source => (
              <div key={source.value} className="flex items-center gap-2">
                <Checkbox id={`ds-${source.value}`} checked={formState.data_sources.includes(source.value)} onCheckedChange={() => handleDataSourceToggle(source.value)} />
                <Label htmlFor={`ds-${source.value}`}>{source.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Label>Fields to Include</Label>
          <div className="p-4 border rounded-lg min-h-[6rem] border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
            {formState.fields.map(field => (
              <div key={field} className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {field}
                <button type="button" onClick={() => removeField(field)}><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add custom field..." value={customField} onChange={(e) => setCustomField(e.target.value)} />
            <Button type="button" onClick={() => { addField(customField); setCustomField(''); }}><Plus className="w-4 h-4 mr-2" /> Add</Button>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Common Fields</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonFields.map(field => (
                <Button key={field} type="button" variant="outline" size="sm" onClick={() => addField(field)} disabled={formState.fields.includes(field)}>{field}</Button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onReset} disabled={loading}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
          <Button type="submit" disabled={loading}><FileSignature className="w-4 h-4 mr-2" /> Generate Custom Report</Button>
        </div>
      </form>
    </div>
  );
}