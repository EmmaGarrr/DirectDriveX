"use client";

import { AlertTriangle, FileX, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { BackupFailuresProps } from "@/types/backup";
import { cn } from "@/lib/utils";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function BackupFailures({ 
  failures, 
  failurePatterns, 
  loading, 
  currentPage, 
  period, 
  onPageChange, 
  onPeriodChange, 
  onRefresh 
}: BackupFailuresProps) {
  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex flex-col items-start justify-between gap-4 mb-4 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Backup Failures
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => onPeriodChange(Number(e.target.value))}
            disabled={loading}
            className="px-3 py-1 text-sm bg-white border rounded-md dark:bg-slate-800 border-slate-300 dark:border-slate-600 disabled:opacity-50"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600",
              "text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-medium text-slate-800 dark:text-slate-200">Most Common Errors</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse">
                <div className="w-32 h-4 mb-2 rounded bg-slate-200 dark:bg-slate-600" />
                <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-600" />
              </div>
            ))
          ) : failurePatterns.length === 0 ? (
            <div className="p-4 text-center col-span-full text-slate-500 dark:text-slate-400">
              No error patterns found for this period.
            </div>
          ) : (
            failurePatterns.map((pattern, i) => (
              <div key={pattern.error_type || `pattern-${i}`} className="p-3 transition-all duration-200 rounded-lg bg-red-50 dark:bg-red-900/20 hover:shadow-md">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{pattern.error_type}</p>
                <p className="text-xs text-red-600 dark:text-red-400">{pattern.count} occurrences</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3">Filename</th>
              <th scope="col" className="px-6 py-3">Size</th>
              <th scope="col" className="px-6 py-3">Failed At</th>
              <th scope="col" className="px-6 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                  <td className="px-6 py-4"><div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" /></td>
                </tr>
              ))
            ) : failures.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">No backup failures in this period.</td>
              </tr>
            ) : (
              failures.map(failure => (
                <tr key={failure.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-red-50/50 dark:hover:bg-red-900/10">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FileX className="w-4 h-4 text-red-400" />
                      <span className="max-w-xs truncate">{failure.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatBytes(failure.size_bytes)}</td>
                  <td className="px-6 py-4">{new Date(failure.failed_at).toLocaleString()}</td>
                  <td className="max-w-xs px-6 py-4 text-red-600 truncate dark:text-red-400" title={failure.backup_error}>
                    {failure.backup_error}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {failures.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {failures.length} failures for last {period} days
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600",
                "text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600",
                "text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}