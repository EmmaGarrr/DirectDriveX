"use client";

import { DriveHeader } from '@/components/admin/drive/DriveHeader';
import { DriveFilters } from '@/components/admin/drive/DriveFilters';
import { DriveAnalytics } from '@/components/admin/drive/DriveAnalytics';
import { DriveBulkActions } from '@/components/admin/drive/DriveBulkActions';
import { DriveListView } from '@/components/admin/drive/DriveListView';
import { DriveGridView } from '@/components/admin/drive/DriveGridView';
import { DrivePagination } from '@/components/admin/drive/DrivePagination';
import { useDriveFileManagement } from '@/hooks/useDriveFileManagement';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Cloud } from 'lucide-react';

export default function DriveManagementPage() {
  const {
    files,
    stats,
    analytics,
    currentPage,
    totalPages,
    totalFiles,
    pageSize,
    loading,
    error,
    filters,
    showFilters,
    selectedFiles,
    sortBy,
    sortOrder,
    viewMode,
    loadFiles,
    setFilters,
    clearFilters,
    setShowFilters,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setSortBy,
    setPage,
    setViewMode,
    downloadFile,
    checkIntegrity,
    moveFile,
    forceBackup,
    recoverFile,
    deleteFile,
    previewFile,
    executeBulkAction,
  } = useDriveFileManagement();

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading drive files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadFiles}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DriveHeader
        stats={stats}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onRefresh={loadFiles}
      />
      
      <DriveFilters
        showFilters={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={() => loadFiles()}
        onClearFilters={clearFilters}
      />
      
      <DriveAnalytics analytics={analytics} />
      
      <DriveBulkActions 
        selectedCount={selectedFiles.length} 
        onClear={clearSelection}
        onExecute={executeBulkAction}
      />
      
      {files.length === 0 ? (
        <EmptyState
          icon={Cloud}
          title="No drive files found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="overflow-hidden border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
          {viewMode === 'list' ? (
            <DriveListView 
              files={files}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
              onSelectAll={selectAllFiles}
              onSort={setSortBy}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onDownload={downloadFile}
              onCheckIntegrity={checkIntegrity}
              onMove={moveFile}
              onForceBackup={forceBackup}
              onRecover={recoverFile}
              onDelete={deleteFile}
              onPreview={previewFile}
            />
          ) : (
            <div className="p-4">
              <DriveGridView 
                files={files}
                selectedFiles={selectedFiles}
                onToggleSelection={toggleFileSelection}
                onDownload={downloadFile}
                onPreview={previewFile}
                onDelete={deleteFile}
              />
            </div>
          )}
          
          <DrivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiles={totalFiles}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}