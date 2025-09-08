"use client";

import { HetznerHeader } from "@/components/admin/hetzner/HetznerHeader";
import { HetznerStatsDashboard } from "@/components/admin/hetzner/HetznerStatsDashboard";
import { HetznerFilters } from "@/components/admin/hetzner/HetznerFilters";
import { HetznerFileTypeAnalytics } from "@/components/admin/hetzner/HetznerFileTypeAnalytics";
import { HetznerBulkActionsBar } from "@/components/admin/hetzner/HetznerBulkActionsBar";
import { HetznerFileListView } from "@/components/admin/hetzner/HetznerFileListView";
import { HetznerFileGridView } from "@/components/admin/hetzner/HetznerFileGridView";
import { HetznerPagination } from "@/components/admin/hetzner/HetznerPagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHetznerFileManagement } from "@/hooks/useHetznerFileManagement";
import { Server, Grid3X3, List } from "lucide-react";

export default function HetznerManagementPage() {
  const {
    files, stats, analytics, loading, error, currentPage, totalPages, totalFiles, pageSize,
    selectedFiles, showFilters, viewMode, sortBy, sortOrder, filters,
    loadFiles, setFilters, clearFilters, setShowFilters, handleSearchInput,
    toggleFileSelection, selectAllFiles, clearSelection, setSortBy,
    setPage, setViewMode,
    downloadFile, checkIntegrity, previewFile, recoverFile, deleteFile, executeBulkAction,
  } = useHetznerFileManagement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <HetznerHeader 
        loading={loading} 
        showFilters={showFilters} 
        onToggleFilters={() => setShowFilters(!showFilters)} 
        onRefresh={loadFiles} 
      />

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => {
            if (selectedFiles.length === 0) {
              alert('Please select files to download');
              return;
            }
            executeBulkAction('download');
          }}
          disabled={selectedFiles.length === 0}
          className="p-4 transition-all duration-200 border cursor-pointer bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Download Selected</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedFiles.length > 0 ? `${selectedFiles.length} files` : 'Bulk download files'}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            loadFiles();
          }}
          disabled={loading}
          className="p-4 transition-all duration-200 border cursor-pointer bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Refresh Data</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update file list</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-4 transition-all duration-200 border cursor-pointer bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
              <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Advanced Filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Filter by type, size, status</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          className="p-4 transition-all duration-200 border cursor-pointer bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Server className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Switch View</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {viewMode === 'list' ? 'Switch to Grid' : 'Switch to List'}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Statistics Dashboard */}
      <HetznerStatsDashboard stats={stats} />

      {/* Filters */}
      {showFilters && (
        <HetznerFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          onSearch={loadFiles}
          onSearchInput={handleSearchInput}
          onClearFilters={clearFilters} 
        />
      )}

      {/* Analytics */}
      <HetznerFileTypeAnalytics analytics={analytics} />

      {/* Bulk Actions */}
      <HetznerBulkActionsBar 
        selectedCount={selectedFiles.length} 
        onExecute={executeBulkAction} 
        onClear={clearSelection} 
      />

      {/* Main Content */}
      <div className="border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Hetzner Backup Files
            </h2>
            <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {totalFiles} files
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Loading Hetzner backup files...
            </h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Please wait while we fetch your storage information
            </p>
          </div>
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={loadFiles}
          />
        ) : files.length === 0 ? (
          <EmptyState
            icon={Server}
            title="No Hetzner backup files found"
            description="Try adjusting your search or filter criteria"
          />
        ) : (
          <>
            {viewMode === 'list' ? (
              <HetznerFileListView
                files={files}
                selectedFiles={selectedFiles}
                onToggleSelection={toggleFileSelection}
                onSelectAll={selectAllFiles}
                onSort={setSortBy}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onDownload={downloadFile}
                onPreview={previewFile}
                onCheckIntegrity={checkIntegrity}
                onRecover={recoverFile}
                onDelete={deleteFile}
              />
            ) : (
              <div className="p-6">
                <HetznerFileGridView
                  files={files}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDownload={downloadFile}
                  onPreview={previewFile}
                  onDelete={deleteFile}
                />
              </div>
            )}
            <HetznerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalFiles={totalFiles}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}