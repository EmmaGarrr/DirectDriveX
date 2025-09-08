"use client";

import { useState, useEffect } from 'react';
import { FileBrowserHeader } from '@/components/admin/files/FileBrowserHeader';
import { FileFilters } from '@/components/admin/files/FileFilters';
import { FileListView } from '@/components/admin/files/FileListView';
import { FileGridView } from '@/components/admin/files/FileGridView';
import { FilePagination } from '@/components/admin/files/FilePagination';
import { FileTypeAnalytics } from '@/components/admin/files/FileTypeAnalytics';
import { BulkActionsBar } from '@/components/admin/files/BulkActionsBar';
import { OrphanedFilesModal } from '@/components/admin/files/modals/OrphanedFilesModal';
import { useFileBrowser } from '@/hooks/useFileBrowser';
import { useFileOperations } from '@/hooks/useFileOperations';
import { adminSocketService } from '@/services/adminSocketService';
import { toastService } from '@/services/toastService';
import { FileItem } from '@/types/file-browser';

export default function FileBrowserPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showOrphanedModal, setShowOrphanedModal] = useState(false);
  
  const {
    files,
    storageStats,
    fileTypeAnalytics,
    loading,
    error,
    selectedFileIds,
    filters,
    sort,
    pagination,
    loadFiles,
    handleFileOperation,
    handleBulkAction,
    setSelectedFileIds,
    setFilters,
    setSort,
    setPagination,
    refreshData,
  } = useFileBrowser();

  const {
    downloadFile,
    deleteFile,
    checkFileIntegrity,
    moveFile,
    forceBackup,
    recoverFile,
    quarantineFile,
    previewFile,
    viewOrphanedFiles,
    cleanupOrphanedFiles,
    executeBulkAction,
  } = useFileOperations();

  // WebSocket integration for real-time updates
  useEffect(() => {
    const unsubscribeFileIntegrity = adminSocketService.onFileIntegrityCheck((data) => {
      console.log('File integrity check completed:', data);
      toastService.success('File integrity check completed');
      refreshData();
    });

    const unsubscribeFileBackup = adminSocketService.onFileBackup((data) => {
      console.log('File backup completed:', data);
      toastService.success('File backup completed');
      refreshData();
    });

    const unsubscribeFileRecovery = adminSocketService.onFileRecovery((data) => {
      console.log('File recovery completed:', data);
      toastService.success('File recovery completed');
      refreshData();
    });

    const unsubscribeStorageStats = adminSocketService.onStorageStatsUpdate((data) => {
      console.log('Storage stats updated:', data);
      refreshData();
    });

    const unsubscribeOrphanedCleanup = adminSocketService.onOrphanedFilesCleanup((data) => {
      console.log('Orphaned files cleanup completed:', data);
      toastService.success('Orphaned files cleanup completed');
      refreshData();
    });

    return () => {
      unsubscribeFileIntegrity();
      unsubscribeFileBackup();
      unsubscribeFileRecovery();
      unsubscribeStorageStats();
      unsubscribeOrphanedCleanup();
    };
  }, [refreshData]);

  const handleFileOperationWrapper = async (operation: string, file: FileItem, params?: any) => {
    console.log('FileBrowserPage: File operation triggered:', { operation, fileId: file._id, fileName: file.filename });
    
    try {
      switch (operation) {
        case 'download':
          downloadFile(file);
          break;
        case 'delete':
          await deleteFile(file);
          await refreshData();
          break;
        case 'integrity_check':
          await checkFileIntegrity(file);
          break;
        case 'move':
          await moveFile(file);
          await refreshData();
          break;
        case 'force_backup':
          await forceBackup(file);
          await refreshData();
          break;
        case 'recover':
          await recoverFile(file);
          await refreshData();
          break;
        case 'quarantine':
          await quarantineFile(file);
          await refreshData();
          break;
        case 'preview':
          await previewFile(file);
          break;
        default:
          // Fallback to the hook's handleFileOperation
          await handleFileOperation(operation, file._id, params);
      }
    } catch (error) {
      console.error('Error in file operation:', error);
      // Error handling is done in the individual operation functions
    }
  };

  const handleBulkActionWrapper = async (action: string, fileIds: string[], reason?: string) => {
    try {
      await executeBulkAction(action, fileIds, reason);
      setSelectedFileIds(new Set());
      await refreshData();
    } catch (error) {
      console.error('Error in bulk action:', error);
      // Error handling is done in the executeBulkAction function
    }
  };

  const handleViewOrphanedFiles = async () => {
    try {
      await viewOrphanedFiles();
    } catch (error) {
      console.error('Error viewing orphaned files:', error);
    }
  };

  const handleCleanupOrphanedFiles = async () => {
    try {
      await cleanupOrphanedFiles();
      await refreshData();
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  };

  const handleOrphanedModalCleanup = (result: any) => {
    console.log('Orphaned files cleanup completed:', result);
    setShowOrphanedModal(false);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Stats */}
        <FileBrowserHeader
          stats={storageStats}
          loading={loading}
          onCleanup={handleCleanupOrphanedFiles}
          onRefresh={refreshData}
          onViewOrphaned={() => setShowOrphanedModal(true)}
        />

        {/* File Type Analytics */}
        {fileTypeAnalytics && (
          <FileTypeAnalytics data={fileTypeAnalytics.file_types} />
        )}

        {/* Filters and View Controls */}
        <FileFilters
          filters={filters}
          onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Bulk Actions Bar */}
        {selectedFileIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedFileIds.size}
            onAction={(action) => handleBulkActionWrapper(action, Array.from(selectedFileIds))}
            onClear={() => setSelectedFileIds(new Set())}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}

        {/* File List/Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-slate-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">No files found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your filters or check back later for new uploads.
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <FileListView
                files={files}
                selectedFileIds={selectedFileIds}
                setSelectedFileIds={setSelectedFileIds}
                sortConfig={sort}
                onSortChange={(key) => setSort(prev => ({ 
                  key, 
                  direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
                onFileOperation={handleFileOperationWrapper}
              />
            ) : (
              <FileGridView
                files={files}
                selectedFileIds={selectedFileIds}
                setSelectedFileIds={setSelectedFileIds}
                onFileOperation={handleFileOperationWrapper}
              />
            )}

            {/* Pagination */}
            <FilePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
            />
          </>
        )}

        {/* Orphaned Files Modal */}
        <OrphanedFilesModal
          isOpen={showOrphanedModal}
          onClose={() => setShowOrphanedModal(false)}
          onCleanupComplete={handleOrphanedModalCleanup}
        />
      </div>
    </div>
  );
}