"use client";

import { useState } from "react";
import { Trash2, Info, HardDrive, Database, Layers } from "lucide-react";
import { CleanupResult } from "@/types/cleanup";
import { mockCleanupResult } from "./data";
import { cn } from "@/lib/utils";

// Custom Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
      checked ? "bg-red-500" : "bg-slate-300 dark:bg-slate-600"
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-4" : "translate-x-0"
      )}
    />
  </button>
);

export function StorageCleanup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [useHardDelete, setUseHardDelete] = useState(false);

  const appendLog = (line: string) => {
    const stamp = new Date().toLocaleString();
    setLogs(prev => [`[${stamp}] ${line}`, ...prev]);
  };

  const runCleanup = () => {
    if (!confirm(`Are you sure you want to run a ${useHardDelete ? 'HARD' : 'SOFT'} reset? This cannot be undone.`)) return;
    
    setLoading(true);
    setResult(null);
    setLogs([]);
    appendLog(`Starting ${useHardDelete ? 'HARD' : 'SOFT'} storage reset...`);

    // Simulate API call
    setTimeout(() => {
      const res: CleanupResult = { 
        ...mockCleanupResult, 
        mode: useHardDelete ? 'hard' as const : 'soft' as const 
      };
      if (useHardDelete) {
        res.files_hard_deleted = res.files_marked_deleted;
        res.files_marked_deleted = 0;
      }
      setResult(res);
      appendLog(`Reset completed: ${res.message}`);
      appendLog(`GDrive deleted=${res.gdrive.summary.deleted}, errors=${res.gdrive.summary.errors}`);
      Object.entries(res.gdrive.per_account || {}).forEach(([account, info]) => {
        appendLog(`Account ${account}: deleted=${info.deleted}, errors=${info.errors}${info.message ? `, note=${info.message}` : ''}`);
      });
      appendLog(`DB files marked deleted=${res.files_marked_deleted}, hard deleted=${res.files_hard_deleted}, batches deleted=${res.batches_deleted}`);
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Storage Cleanup</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Google Drive storage reset operations</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <ToggleSwitch checked={useHardDelete} onChange={setUseHardDelete} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hard delete (wipe DB records)
            </span>
          </label>
          <button onClick={runCleanup} disabled={loading} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {loading ? 'Running...' : 'Run Cleanup'}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Info} title="Reset Mode" value={result.mode.toUpperCase()} color="blue" />
          <StatCard icon={HardDrive} title="GDrive Files Deleted" value={result.gdrive.summary.deleted} detail={`Errors: ${result.gdrive.summary.errors}`} color="green" />
          <StatCard icon={Database} title="DB Files Marked Deleted" value={result.files_marked_deleted} detail={`Hard deleted: ${result.files_hard_deleted}`} color="amber" />
          <StatCard icon={Layers} title="Batches Deleted" value={result.batches_deleted} color="purple" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-2xl space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin"></div>
            <div className="text-center">
              <div className="text-lg font-medium text-slate-900 dark:text-slate-100">Running cleanup...</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">This may take several minutes</div>
            </div>
          </div>
        ) : !result ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-slate-900 dark:text-slate-100">No cleanup run yet</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Select mode and click Run Cleanup to start</div>
            </div>
          </div>
        ) : (
          <>
            {/* Per-Account Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">
                Per-Account Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(result.gdrive.per_account).map(([account, details]) => (
                  <div key={account} className="p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{account}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Deleted: <span className="font-medium text-emerald-600">{details.deleted}</span> | 
                      Errors: <span className="font-medium text-red-600">{details.errors}</span> | 
                      <span className="font-medium"> {details.message || 'OK'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Logs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">
                Operation Logs
              </h3>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="font-mono text-sm text-green-400 space-y-1">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, title, value, detail, color }: { icon: React.ElementType, title: string, value: string | number, detail?: string, color: string }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };
  
  return (
    <div className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors[color as keyof typeof colors])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
          {detail && <div className="text-xs text-red-500">{detail}</div>}
        </div>
      </div>
    </div>
  );
};