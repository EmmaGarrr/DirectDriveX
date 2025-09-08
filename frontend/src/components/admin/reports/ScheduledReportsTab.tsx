"use client";

import { Clock } from "lucide-react";

export function ScheduledReportsTab() {
  const features = [
    "Schedule reports to run daily, weekly, or monthly",
    "Automatically deliver reports via email to stakeholders",
    "Set up recurring reports for compliance and monitoring",
    "Manage and view all your report delivery schedules",
  ];

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 mb-6 bg-purple-100 rounded-full dark:bg-purple-900/30">
          <Clock className="w-12 h-12 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Scheduled Reports: Coming Soon
        </h3>
        <p className="max-w-2xl mx-auto mb-6 text-slate-600 dark:text-slate-400">
          Automate your reporting workflow. This feature is currently under development and will be available soon.
        </p>
        <div className="text-left max-w-md mx-auto space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span className="text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}