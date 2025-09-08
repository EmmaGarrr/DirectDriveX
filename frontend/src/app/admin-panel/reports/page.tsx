"use client";

import { useState } from "react";
import { useReports } from "@/hooks/useReports";
import { GenerateReportsTab } from "@/components/admin/reports/GenerateReportsTab";
import { ReportTemplatesTab } from "@/components/admin/reports/ReportTemplatesTab";
import { CustomReportsTab } from "@/components/admin/reports/CustomReportsTab";
import { ScheduledReportsTab } from "@/components/admin/reports/ScheduledReportsTab";
import { BarChart3, FileText, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsExportPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    reportForm,
    setReportForm,
    customReportForm,
    setCustomReportForm,
    templates,
    currentReport,
    generateReport,
    generateCustomReport,
    clearCurrentReport,
    useTemplate,
    resetCustomReport,
  } = useReports();

  const tabs = [
    { id: "generate", label: "Generate Reports", icon: BarChart3 },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "custom", label: "Custom Reports", icon: Plus },
    { id: "scheduled", label: "Scheduled", icon: Calendar },
  ];

  const handleExport = (format: 'json' | 'csv') => {
    // This is a placeholder. In a real app, you'd trigger a download.
    const data = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport?.report_info.title.replace(/\s/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 text-blue-500 dark:text-blue-400 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Export</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Generate comprehensive reports and export data.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border rounded-lg shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'generate' && (
          <GenerateReportsTab
            formState={reportForm}
            setFormState={setReportForm}
            onGenerate={generateReport}
            currentReport={currentReport}
            onCloseReport={clearCurrentReport}
            onExportReport={handleExport}
            loading={loading}
          />
        )}
        {activeTab === 'templates' && (
          <ReportTemplatesTab templates={templates} onUseTemplate={useTemplate} />
        )}
        {activeTab === 'custom' && (
          <CustomReportsTab
            formState={customReportForm}
            setFormState={setCustomReportForm}
            onGenerate={generateCustomReport}
            onReset={resetCustomReport}
            loading={loading}
          />
        )}
        {activeTab === 'scheduled' && <ScheduledReportsTab />}
      </div>
    </div>
  );
}