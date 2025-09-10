"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Download, RefreshCw, Loader2, AlertTriangle, FileText, Activity, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface AdminActivityLog {
  id: string;
  admin_email: string;
  action: string;
  timestamp: string;
  ip_address?: string;
  details?: string;
}

// Mock Data Generation
const generateMockLogs = (count: number): AdminActivityLog[] => {
  const actions = ['login', 'login_failed', 'create_admin', 'view_profile', 'view_activity_logs', 'update_user', 'delete_file'];
  const admins = ['super@admin.com', 'ops@admin.com', 'support@admin.com', 'dev@admin.com'];
  const details = [
    'User session initiated successfully.',
    'Failed login attempt for user: unknown@user.com',
    'New administrator account created for new@admin.com.',
    'Viewed user profile for user_id: usr_12345',
    'Accessed the main activity log dashboard.',
    'Updated user role for user_id: usr_67890 to admin.',
    'Permanently deleted file: report_q3.pdf'
  ];

  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(Date.now() - i * 3600000 * Math.random()).toISOString();
    const action = actions[i % actions.length];
    return {
      id: `log_${i + 1}`,
      admin_email: admins[i % admins.length],
      action: action,
      timestamp: timestamp,
      ip_address: `192.168.1.${i % 255}`,
      details: details[i % details.length],
    };
  });
};

const mockLogs = generateMockLogs(150);

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    admin: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const availableActions = useMemo(() => [...new Set(mockLogs.map(log => log.action))].sort(), []);
  const availableAdmins = useMemo(() => [...new Set(mockLogs.map(log => log.admin_email))].sort(), []);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const searchMatch = !filters.search || log.admin_email.toLowerCase().includes(filters.search.toLowerCase()) || (log.details && log.details.toLowerCase().includes(filters.search.toLowerCase()));
      const actionMatch = filters.action === 'all' || log.action === filters.action;
      const adminMatch = filters.admin === 'all' || log.admin_email === filters.admin;
      let dateMatch = true;
      if (filters.dateFrom || filters.dateTo) {
        const logDate = new Date(log.timestamp);
        if (filters.dateFrom) dateMatch = dateMatch && logDate >= new Date(filters.dateFrom);
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && logDate <= toDate;
        }
      }
      return searchMatch && actionMatch && adminMatch && dateMatch;
    });
  }, [filters]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = useMemo(() => Math.ceil(filteredLogs.length / pageSize), [filteredLogs, pageSize]);

  const loadLogs = useCallback(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', action: 'all', admin: 'all', dateFrom: '', dateTo: '' });
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'login_failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'create_admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'view_profile': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'view_activity_logs': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatAction = (action: string) => action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 text-blue-500 dark:text-blue-400 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Activity Logs</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Monitor all administrative actions and system access.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={loadLogs} disabled={loading} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="overflow-hidden border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search by email or details..." className="w-full pl-10 pr-4 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Actions</option>
              {availableActions.map(action => <option key={action} value={action}>{formatAction(action)}</option>)}
            </select>
            <select name="admin" value={filters.admin} onChange={handleFilterChange} className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Admins</option>
              {availableAdmins.map(admin => <option key={admin} value={admin}>{admin}</option>)}
            </select>
            <button onClick={clearFilters} className="w-full px-4 py-2 text-sm font-medium bg-white border rounded-lg h-11 text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">Clear</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-500"><AlertTriangle className="w-12 h-12 mb-4" /><p>{error}</p></div>
          ) : paginatedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500"><FileText className="w-12 h-12 mb-4" /><p>No logs match your criteria.</p></div>
          ) : (
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-3">Timestamp</th>
                  <th scope="col" className="px-6 py-3">Admin</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                  <th scope="col" className="px-6 py-3">IP Address</th>
                  <th scope="col" className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-200">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-200">{log.admin_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getActionBadgeClass(log.action))}>{formatAction(log.action)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{log.ip_address || 'N/A'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{log.details || 'No details'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between w-full px-4 py-3 space-y-3 border-t sm:flex-row sm:space-y-0 border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-700 dark:text-slate-400">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredLogs.length)}</span> of <span className="font-medium">{filteredLogs.length}</span> results
          </div>
          <div className="inline-flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronsLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}