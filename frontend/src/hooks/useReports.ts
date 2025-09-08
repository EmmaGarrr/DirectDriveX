"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  ReportTemplate,
  ReportFormState,
  CustomReportFormState,
  GeneratedReport,
  UseReportsReturn,
} from '@/types/reports';
import { reportsService } from '@/services/admin/reportsService';
import { toastService } from '@/services/toastService';

const getDefaultDates = () => {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    to: today.toISOString().split('T')[0],
    from: lastWeek.toISOString().split('T')[0],
  };
};

export function useReports(): UseReportsReturn {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);

  const [reportForm, setReportFormState] = useState<ReportFormState>({
    report_type: 'system_overview',
    export_format: 'json',
    date_from: getDefaultDates().from,
    date_to: getDefaultDates().to,
    include_inactive: false,
    group_by: 'user',
  });

  const [customReportForm, setCustomReportFormState] = useState<CustomReportFormState>({
    title: '',
    description: '',
    export_format: 'json',
    date_from: getDefaultDates().from,
    date_to: getDefaultDates().to,
    data_sources: [],
    fields: [],
  });

  const setReportForm = useCallback((form: Partial<ReportFormState>) => {
    setReportFormState(prev => ({ ...prev, ...form }));
  }, []);

  const setCustomReportForm = useCallback((form: Partial<CustomReportFormState>) => {
    setCustomReportFormState(prev => ({ ...prev, ...form }));
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await reportsService.getReportTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toastService.error('Failed to load report templates');
    }
  }, []);

  const generateReport = useCallback(async () => {
    if (!reportForm.date_from || !reportForm.date_to) {
      toastService.error('Please select date range');
      return;
    }

    if (new Date(reportForm.date_from) >= new Date(reportForm.date_to)) {
      toastService.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    setCurrentReport(null);
    try {
      const report = await reportsService.generateReport(reportForm);
      setCurrentReport(report);
      toastService.success('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastService.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [reportForm]);

  const generateCustomReport = useCallback(async () => {
    if (!customReportForm.title) {
      toastService.error('Please enter a report title');
      return;
    }

    if (customReportForm.data_sources.length === 0) {
      toastService.error('Please select at least one data source');
      return;
    }

    if (!customReportForm.date_from || !customReportForm.date_to) {
      toastService.error('Please select date range');
      return;
    }

    if (new Date(customReportForm.date_from) >= new Date(customReportForm.date_to)) {
      toastService.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    setCurrentReport(null);
    try {
      const report = await reportsService.generateCustomReport(customReportForm);
      setCurrentReport(report);
      setActiveTab('generate'); // Switch to view the report
      toastService.success('Custom report generated successfully!');
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      toastService.error('Failed to generate custom report');
    } finally {
      setLoading(false);
    }
  }, [customReportForm]);

  const clearCurrentReport = useCallback(() => {
    setCurrentReport(null);
  }, []);

  const useTemplate = useCallback((template: ReportTemplate) => {
    const today = new Date();
    const fromDate = new Date(today.getTime() - template.default_period_days * 24 * 60 * 60 * 1000);
    
    setReportForm({
      report_type: template.type,
      export_format: 'json',
      date_from: fromDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0],
      include_inactive: false,
      group_by: 'user'
    });
    
    setActiveTab('generate');
    toastService.info(`Template "${template.name}" loaded`);
  }, [setReportForm]);

  const resetCustomReport = useCallback(() => {
    setCustomReportFormState({
      title: '',
      description: '',
      export_format: 'json',
      date_from: getDefaultDates().from,
      date_to: getDefaultDates().to,
      data_sources: [],
      fields: [],
    });
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
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
  };
}