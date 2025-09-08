"use client";

import { ReportTemplate } from "@/types/reports";
import { FileText, Play, Tag } from "lucide-react";

interface ReportTemplatesTabProps {
  templates: ReportTemplate[];
  onUseTemplate: (template: ReportTemplate) => void;
}

export function ReportTemplatesTab({ templates, onUseTemplate }: ReportTemplatesTabProps) {
  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-400/20">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Report Templates Available
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Custom report templates will appear here once created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <div key={template.id} className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{template.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span>Type: <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{template.type.replace('_', ' ')}</span></span>
              <span>Default Period: <span className="font-medium text-slate-700 dark:text-slate-300">{template.default_period_days} days</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {template.includes.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Tag className="w-3 h-3" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onUseTemplate(template)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Use Template
          </button>
        </div>
      ))}
    </div>
  );
}