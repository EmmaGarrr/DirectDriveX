"use client";

import { AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { SystemAlert } from "@/types/monitoring";
import { cn } from "@/lib/utils";

interface SystemAlertsProps {
  alerts: SystemAlert[];
  loading: boolean;
}

export function SystemAlerts({ alerts, loading }: SystemAlertsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">System Alerts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border flex items-start gap-3 transition-all hover:shadow-md",
              alert.type === 'critical' ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20" : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/20"
            )}
          >
            {alert.type === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            )}
            <div>
              <h3 className={cn("font-semibold", alert.type === 'critical' ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300")}>
                {alert.category}
              </h3>
              <p className={cn("text-sm", alert.type === 'critical' ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400")}>
                {alert.message}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}