"use client";

import { BackgroundProcess } from "@/types/processes";
import { cn } from "@/lib/utils";
import { Play, Check, X, Clock } from "lucide-react";

export function ProcessCard({ process, onCancel }: { process: BackgroundProcess, onCancel: (id: string) => void }) {
  const statusConfig = {
    PENDING: { color: "border-amber-500", icon: Clock },
    RUNNING: { color: "border-blue-500", icon: Play },
    COMPLETED: { color: "border-emerald-500", icon: Check },
    FAILED: { color: "border-red-500", icon: X },
  };
  const { color, icon: Icon } = statusConfig[process.status];

  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className={cn("p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l-4 rounded-lg shadow-md", color)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{process.description}</h4>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {process.process_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${process.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{process.status}</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${process.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{process.priority}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div><span className="font-medium text-slate-600 dark:text-slate-400">Type:</span> {process.process_type}</div>
        <div><span className="font-medium text-slate-600 dark:text-slate-400">Created:</span> {formatDateTime(process.created_at)}</div>
        <div><span className="font-medium text-slate-600 dark:text-slate-400">Started:</span> {formatDateTime(process.started_at)}</div>
      </div>
      {process.progress > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${process.progress}%` }}></div>
          </div>
          <span className="text-sm font-semibold">{process.progress.toFixed(1)}%</span>
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={() => onCancel(process.process_id)} disabled={process.status === 'COMPLETED' || process.status === 'FAILED'} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50">
          Cancel
        </button>
      </div>
    </div>
  );
}