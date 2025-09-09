"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  FileText,
  Database,
  CloudUpload,
  Network,
  Download,
  Share2,
  FolderPlus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, User } from "@/services/authService";
import { toastService } from "@/services/toastService";
import { UploadService } from "@/services/uploadService";

// Initialize services
const uploadService = new UploadService();

// File type icons configuration
const getFileTypeInfo = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(extension)) {
    return {
    icon: <FileText className="w-5 h-5 text-red-600" strokeWidth={2} />,
      bg: "bg-red-100"
    };
  }
  if (['doc', 'docx', 'txt'].includes(extension)) {
    return {
    icon: <FileText className="w-5 h-5 text-blue-600" strokeWidth={2} />,
      bg: "bg-blue-100"
    };
  }
  if (['sql', 'db'].includes(extension)) {
    return {
    icon: <Database className="w-5 h-5 text-green-600" strokeWidth={2} />,
      bg: "bg-green-100"
    };
  }
  // Default
  return {
    icon: <FileText className="w-5 h-5 text-slate-600" strokeWidth={2} />,
    bg: "bg-slate-100"
  };
};

interface DashboardFile {
  id: string;
  filename: string;
  size: number;
  uploaded_at: string;
  content_type?: string;
}

interface DashboardStats {
  total_files: number;
  storage_used_gb: number;
  storage_limit_gb?: number;
  storage_percentage?: number;
  remaining_storage_gb?: number;
  recent_files?: DashboardFile[];
}



export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<DashboardFile[]>([]);
  
  const router = useRouter();

  // Load user profile and dashboard data
  const loadUserProfile = async () => {
    try {
    setLoading(true);
    setError(null);
      
      const userData = await authService.loadUserProfile();
      setUser(userData);
      
      // Calculate storage statistics from user data
      const stats: DashboardStats = {
        total_files: userData.total_files || 0,
        storage_used_gb: userData.storage_used_gb || 0,
        storage_limit_gb: userData.storage_limit_gb || userData.storage_quota_gb || 10,
        storage_percentage: userData.storage_percentage,
        remaining_storage_gb: userData.remaining_storage_gb
      };
      
      setDashboardStats(stats);
      
      // Load recent files (placeholder for now)
      await loadRecentFiles();
      
    } catch (error: any) {
      console.error('Dashboard error:', error);
      
      if (error.message?.includes('Authentication expired')) {
        // Redirect to login on auth failure
        router.push('/login');
        return;
      }
      
      const errorMessage = error.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toastService.error(errorMessage, 2500);
    } finally {
      setLoading(false);
    }
  };
  
  // Load recent files (mock implementation for now)
  const loadRecentFiles = async () => {
    try {
      // For now, use mock data until API endpoint is available
      const mockRecentFiles: DashboardFile[] = [
        {
          id: "1",
          filename: "presentation-final.pdf",
          size: 2516582, // 2.4 MB in bytes
          uploaded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          content_type: "application/pdf"
        },
        {
          id: "2",
          filename: "project-requirements.docx",
          size: 1887437, // 1.8 MB in bytes
          uploaded_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        {
          id: "3",
          filename: "database-backup.sql",
          size: 15941917, // 15.2 MB in bytes
          uploaded_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          content_type: "application/sql"
        }
      ];
      
      setRecentFiles(mockRecentFiles);
    } catch (error) {
      console.error('Failed to load recent files:', error);
      // Don't show error for recent files failure
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const uploadTime = new Date(dateString);
    const diffMs = now.getTime() - uploadTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  };
  
  // Check authentication and load data on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadUserProfile();
  }, [router]);
  
  // Button click handlers
  const handleUploadFiles = () => {
    router.push('/');
  };
  
  const handleQuickUpload = () => {
    router.push('/');
  };
  
  const handleCreateFolder = () => {
    toastService.info('Folder creation feature coming soon', 2500);
  };
  
  const handleShareLink = () => {
    toastService.info('Link sharing feature coming soon', 2500);
  };
  
  const handleDownloadAll = () => {
    toastService.info('Bulk download feature coming soon', 2500);
  };
  
  const handleUpgradeStorage = () => {
    toastService.info('Storage upgrade feature coming soon', 2500);
  };
  
  const handleViewAllFiles = () => {
    toastService.info('File browser feature coming soon', 2500);
  };
  
  const handleFileDownload = (file: DashboardFile) => {
    toastService.info(`Download feature for ${file.filename} coming soon`, 2500);
  };
  
  const handleFileShare = (file: DashboardFile) => {
    toastService.info(`Share feature for ${file.filename} coming soon`, 2500);
  };

  const handleRetry = () => {
    loadUserProfile();
  };

  // Calculate storage metrics from real user data
  const storageUsedGB = dashboardStats?.storage_used_gb || 0;
  const storageLimitGB = dashboardStats?.storage_limit_gb || 10;
  const storagePercentage = dashboardStats?.storage_percentage || 
    (storageLimitGB > 0 ? (storageUsedGB / storageLimitGB) * 100 : 0);
  const remainingStorageGB = dashboardStats?.remaining_storage_gb || 
    (storageLimitGB - storageUsedGB);
  const totalFiles = dashboardStats?.total_files || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-bolt-blue mx-auto animate-spin mb-4" />
          <p className="text-lg text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      <div className="relative z-10 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {user?.email || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleUploadFiles}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-bolt-blue bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
                Upload Files
              </button>
              <button 
                onClick={handleQuickUpload}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
                Quick Upload
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat Card: Total Files */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Files</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalFiles.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Files in your account</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-bolt-blue/10">
                  <FileText className="w-6 h-6 text-bolt-blue" strokeWidth={2} />
                </div>
              </div>
            </div>
            {/* Stat Card: Storage Used */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Storage Used</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{`${storageUsedGB.toFixed(1)} GB`}</p>
                  <p className="text-xs text-slate-500 mt-1">{`of ${storageLimitGB} GB available`}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-bolt-cyan/10">
                  <Database className="w-6 h-6 text-bolt-cyan" strokeWidth={2} />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
                  <div className="h-2 rounded-full bg-bolt-cyan" style={{ width: `${storagePercentage}%` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
            {/* Stat Card: Remaining Storage */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Remaining Storage</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{`${remainingStorageGB.toFixed(1)} GB`}</p>
                  <p className="text-xs text-slate-500 mt-1">storage available</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/10">
                  <CloudUpload className="w-6 h-6 text-green-600" strokeWidth={2} />
                </div>
              </div>
            </div>
            {/* Stat Card: Usage Percentage */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Usage Percentage</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{`${storagePercentage.toFixed(0)}%`}</p>
                  <p className="text-xs text-slate-500 mt-1">of storage used</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-bolt-purple/10">
                  <Network className="w-6 h-6 text-bolt-purple" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Files */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Files
                </h3>
                <button 
                  onClick={handleViewAllFiles}
                  className="text-bolt-blue hover:underline text-sm font-medium"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-slate-100 -mx-6">
                {recentFiles.map((file, index) => {
                  const fileIconInfo = getFileTypeInfo(file.filename);
                  return (
                    <div key={file.id || index} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", fileIconInfo.bg)}>
                          {fileIconInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.size)} &bull; {formatRelativeTime(file.uploaded_at)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleFileDownload(file)}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button 
                            onClick={() => handleFileShare(file)}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            title="Share file"
                          >
                            <Share2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleCreateFolder}
                    className="w-full inline-flex items-center justify-start px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-bolt-blue hover:border-bolt-blue transition-colors"
                  >
                    <span className="mr-3"><FolderPlus className="w-5 h-5" /></span>
                    Create New Folder
                  </button>
                  <button 
                    onClick={handleShareLink}
                    className="w-full inline-flex items-center justify-start px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-bolt-blue hover:border-bolt-blue transition-colors"
                  >
                    <span className="mr-3"><Share2 className="w-5 h-5" /></span>
                    Share Link
                  </button>
                  <button 
                    onClick={handleDownloadAll}
                    className="w-full inline-flex items-center justify-start px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-bolt-blue hover:border-bolt-blue transition-colors"
                  >
                    <span className="mr-3"><Download className="w-5 h-5" /></span>
                    Download All
                  </button>
                </div>
              </div>

              {/* Storage Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Storage
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Used</span>
                    <span className="font-medium text-slate-900">{storageUsedGB.toFixed(1)} GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Available</span>
                    <span className="font-medium text-slate-900">{remainingStorageGB.toFixed(1)} GB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
                    <div className="bg-gradient-to-r from-bolt-blue to-bolt-cyan h-3 rounded-full" style={{ width: `${storagePercentage}%` }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                  </div>
                  <p className="text-xs text-center text-slate-500">
                    {storagePercentage.toFixed(0)}% of your storage is used
                  </p>
                  <button 
                    onClick={handleUpgradeStorage}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-bolt-blue hover:bg-bolt-blue/90 rounded-lg transition-colors"
                  >
                    Upgrade Storage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}