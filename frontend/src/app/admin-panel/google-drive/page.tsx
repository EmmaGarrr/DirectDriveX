"use client";

import { useEffect } from 'react';
import { GoogleDriveManagement } from '@/components/admin/gdrive';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { adminAuthService } from '@/services/adminAuthService';

export default function GoogleDriveManagementPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const { isConnected } = useAdminSocket();

  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const token = adminAuthService.getAdminToken();
      if (token) {
        console.log('GoogleDriveManagementPage: Initializing WebSocket connection');
        // WebSocket connection is handled by useAdminSocket hook
      }
    }
  }, [isAuthenticated, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          <span>Loading Google Drive Management...</span>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please log in to access Google Drive Management.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <GoogleDriveManagement />
      </div>
    </div>
  );
}
