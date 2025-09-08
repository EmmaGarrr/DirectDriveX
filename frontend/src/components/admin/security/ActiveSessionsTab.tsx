
"use client";

import { useState } from "react";
import { SessionManagement, UseActiveSessionsReturn } from "@/types/security";
import { RefreshCw } from "lucide-react";

interface ActiveSessionsTabProps {
  activeSessions: UseActiveSessionsReturn;
}

export function ActiveSessionsTab({ activeSessions }: ActiveSessionsTabProps) {
  const { sessionManagement: sessions, loading, error, refreshSessions } = activeSessions;

  if (!sessions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading active sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active Admin Sessions ({sessions.total_active})</h3>
        <button 
          onClick={refreshSessions}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3">Admin Email</th>
              <th scope="col" className="px-6 py-3">IP Address</th>
              <th scope="col" className="px-6 py-3">Login Time</th>
              <th scope="col" className="px-6 py-3">Last Activity</th>
              <th scope="col" className="px-6 py-3">User Agent</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
            {sessions.active_sessions.map(session => (
              <tr key={session.session_id}>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{session.admin_email}</td>
                <td className="px-6 py-4"><code>{session.ip_address}</code></td>
                <td className="px-6 py-4">{new Date(session.login_time).toLocaleString()}</td>
                <td className="px-6 py-4">{new Date(session.last_activity).toLocaleString()}</td>
                <td className="max-w-xs px-6 py-4 truncate">{session.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}