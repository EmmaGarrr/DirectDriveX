"use client";

import { Trash2, Shield, CheckCircle, Download } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onAction, onClear }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 p-3 border sm:flex-row bg-slate-100 dark:bg-slate-900/50 rounded-xl border-slate-200 dark:border-slate-700">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className="px-2 py-1 mr-2 text-white bg-blue-600 rounded-md">{selectedCount}</span>
        {selectedCount === 1 ? 'file selected' : 'files selected'}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onAction('download')} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
          <Download className="w-4 h-4" /> Download
        </button>
        <button onClick={() => onAction('quarantine')} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700">
          <Shield className="w-4 h-4" /> Quarantine
        </button>
        <button onClick={() => onAction('delete')} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        <button onClick={onClear} className="px-3 py-2 text-sm bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
          Clear Selection
        </button>
      </div>
    </div>
  );
}