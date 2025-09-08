"use client";

import { ReportFormState, GeneratedReport } from "@/types/reports";
import { ReportDisplay } from "./ReportDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileSignature, Loader2 } from "lucide-react";

interface GenerateReportsTabProps {
  formState: ReportFormState;
  setFormState: (form: Partial<ReportFormState>) => void;
  onGenerate: () => void;
  currentReport: GeneratedReport | null;
  onCloseReport: () => void;
  onExportReport: (format: 'json' | 'csv') => void;
  loading: boolean;
}

export function GenerateReportsTab({ formState, setFormState, onGenerate, currentReport, onCloseReport, onExportReport, loading }: GenerateReportsTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Generate Standard Report</h3>
        <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={formState.report_type} onValueChange={(value) => setFormState({ report_type: value as any })}>
              <SelectTrigger><SelectValue placeholder="Report Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system_overview">System Overview</SelectItem>
                <SelectItem value="user_activity">User Activity</SelectItem>
                <SelectItem value="storage_usage">Storage Usage</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formState.export_format} onValueChange={(value) => setFormState({ export_format: value as any })}>
              <SelectTrigger><SelectValue placeholder="Export Format" /></SelectTrigger>
              <SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input id="date-from" type="date" value={formState.date_from} onChange={(e) => setFormState({ date_from: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input id="date-to" type="date" value={formState.date_to} onChange={(e) => setFormState({ date_to: e.target.value })} required />
            </div>
          </div>
          {formState.report_type === 'user_activity' && (
            <div className="flex items-center gap-2">
              <Checkbox id="include-inactive" checked={formState.include_inactive} onCheckedChange={(checked) => setFormState({ include_inactive: !!checked })} />
              <Label htmlFor="include-inactive">Include Inactive Users</Label>
            </div>
          )}
          {formState.report_type === 'storage_usage' && (
            <div>
              <Label>Group By</Label>
              <Select value={formState.group_by} onValueChange={(value) => setFormState({ group_by: value as any })}>
                <SelectTrigger><SelectValue placeholder="Group By" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="file_type">File Type</SelectItem>
                  <SelectItem value="storage_location">Storage Location</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </form>
      </div>

      {loading && !currentReport && (
        <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Generating your report...</p>
          </div>
        </div>
      )}

      {currentReport && (
        <ReportDisplay report={currentReport} onClose={onCloseReport} onExport={onExportReport} />
      )}
    </div>
  );
}