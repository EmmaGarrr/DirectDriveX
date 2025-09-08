"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Database, 
  Cloud, 
  HardDrive, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Loader2,
  AlertCircle,
  LinkIcon,
  ExternalLink,
  DownloadCloud,
  FileSearch
} from "lucide-react";
import { userManagementService } from "@/services/admin/userManagementService";
import { User, StorageInsights } from "@/types/admin";

interface StorageInsightsModalProps {
  fileId: string;
  user?: User;
  isOpen?: boolean;
  onClose: () => void;
}

// Function to get storage status icon and color
const getStatusInfo = (exists: boolean, accessible: boolean) => {
  if (!exists) {
    return {
      icon: XCircle,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/10",
      borderColor: "border-red-200 dark:border-red-900/20",
      status: "Missing"
    };
  }
  
  if (!accessible) {
    return {
      icon: AlertCircle,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/10",
      borderColor: "border-amber-200 dark:border-amber-900/20",
      status: "Inaccessible"
    };
  }
  
  return {
    icon: CheckCircle,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
    borderColor: "border-emerald-200 dark:border-emerald-900/20",
    status: "Available"
  };
};

export function StorageInsightsModal({ fileId, user, onClose }: StorageInsightsModalProps) {
  const [insights, setInsights] = useState<StorageInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load storage insights
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await userManagementService.getStorageInsights(fileId);
        setInsights(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load storage insights');
        setLoading(false);
      }
    };
    
    loadInsights();
  }, [fileId]);

  // Format bytes to human-readable string
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Helper to render storage status badge
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      optimal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      degraded: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      critical: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    
    const badgeClass = statusStyles[status as keyof typeof statusStyles] || statusStyles.degraded;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-3xl p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Storage Insights</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                File Storage Analysis {user && `for ${user.email}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading storage insights...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
              <p className="text-xl font-semibold">Failed to load storage insights</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Status summary */}
              <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <FileSearch className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">File Storage Status</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {insights.storage_location || 'Primary storage'}
                    </p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(insights.status)}
                </div>
              </div>
              
              {/* Storage locations grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Google Drive */}
                <div className="border rounded-lg dark:border-slate-700">
                  <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <h4 className="font-medium text-slate-900 dark:text-white">Google Drive</h4>
                    </div>
                    <div>
                      {(() => {
                        const { icon: StatusIcon, color, status } = getStatusInfo(
                          insights.google_drive.exists, 
                          insights.google_drive.accessible
                        );
                        return (
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-4 h-4 ${color}`} />
                            <span className={`text-sm ${color}`}>{status}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {insights.google_drive.details}
                    </p>
                    
                    {insights.google_drive.exists && (
                      <>
                        {insights.google_drive.account_id && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Account ID:</span>
                            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              {insights.google_drive.account_id}
                            </span>
                          </div>
                        )}
                        
                        {insights.google_drive.file_size !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">File Size:</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {formatBytes(insights.google_drive.file_size)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View in Drive
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Hetzner Storage */}
                <div className="border rounded-lg dark:border-slate-700">
                  <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      <h4 className="font-medium text-slate-900 dark:text-white">Hetzner Storage</h4>
                    </div>
                    <div>
                      {(() => {
                        const { icon: StatusIcon, color, status } = getStatusInfo(
                          insights.hetzner_storage.exists, 
                          insights.hetzner_storage.accessible
                        );
                        return (
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-4 h-4 ${color}`} />
                            <span className={`text-sm ${color}`}>{status}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {insights.hetzner_storage.details}
                    </p>
                    
                    {insights.hetzner_storage.exists && (
                      <>
                        {insights.hetzner_storage.path && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Path:</span>
                            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              {insights.hetzner_storage.path}
                            </span>
                          </div>
                        )}
                        
                        {insights.hetzner_storage.file_size !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">File Size:</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {formatBytes(insights.hetzner_storage.file_size)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-100 rounded-md hover:bg-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/30">
                            <DownloadCloud className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div className="p-4 border rounded-lg dark:border-slate-700">
                  <h4 className="mb-3 font-medium text-slate-900 dark:text-white">Recommendations</h4>
                  <ul className="space-y-2">
                    {insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="flex-shrink-0 w-4 h-4 mt-0.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t dark:border-slate-700">
          {insights && insights.status === 'critical' && (
            <button
              className="px-4 py-2 mr-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Attempt Recovery
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
