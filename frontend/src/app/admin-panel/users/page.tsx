"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Download, 
  FileJson, 
  Filter, 
  RefreshCw, 
  X, 
  Trash,
  Ban,
  Shield,
  CheckCircle2
} from "lucide-react";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserModals } from "@/components/admin/users/UserModals";
import { useUserManagement } from "@/hooks/useUserManagement";

export default function UserManagementPage() {
  const {
    // State
    users,
    loading,
    error,
    pagination,
    filters,
    sortConfig,
    selectedUserIds,
    modalState,
    selectionFlags,
    
    // Actions
    setSelectedUserIds,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    clearFilters,
    handleSortChange,
    handleUserAction,
    handleBulkAction,
    confirmUserAction,
    confirmBulkAction,
    updateUser,
    resetUserPassword,
    exportUsers,
    closeModal,
    loadUsers
  } = useUserManagement();

  // Bulk actions menu state
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 text-blue-500 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pagination.totalItems > 0 
                ? `${pagination.totalItems} users found`
                : 'Manage, edit, and monitor all users'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk actions dropdown */}
          {selectedUserIds.size > 0 && (
            <div className="relative">
              <button
                onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <span>Bulk Action ({selectedUserIds.size})</span>
                <span className="sr-only">Toggle dropdown</span>
              </button>
              
              {bulkActionsOpen && (
                <div 
                  className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-lg shadow-lg dark:bg-slate-800 ring-1 ring-black ring-opacity-5"
                  onBlur={() => setBulkActionsOpen(false)}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setBulkActionsOpen(false);
                        handleBulkAction('suspend');
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    >
                      <Shield className="w-4 h-4" /> Suspend Users
                    </button>
                    <button
                      onClick={() => {
                        setBulkActionsOpen(false);
                        handleBulkAction('ban');
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Ban className="w-4 h-4" /> Ban Users
                    </button>
                    <button
                      onClick={() => {
                        setBulkActionsOpen(false);
                        handleBulkAction('activate');
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Activate Users
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-600" />
                    <button
                      onClick={() => {
                        setBulkActionsOpen(false);
                        handleBulkAction('delete');
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash className="w-4 h-4" /> Delete Users
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Clear selection button */}
          {selectedUserIds.size > 0 && (
            <button
              onClick={() => setSelectedUserIds(new Set())}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <X className="w-4 h-4" /> Clear Selection
            </button>
          )}
          
          {/* Refresh button */}
          <button
            onClick={() => loadUsers(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          
          {/* Export buttons */}
          <button
            onClick={() => exportUsers('csv')}
            disabled={loading || pagination.totalItems === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => exportUsers('json')}
            disabled={loading || pagination.totalItems === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters 
        filters={filters}
        setFilters={handleFilterChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onClearFilters={clearFilters}
        loading={loading}
      />

      {/* Data Table */}
      <div className="overflow-hidden border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
        <UserTable
          users={users}
          loading={loading}
          error={error}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          onAction={handleUserAction}
          sortConfig={sortConfig}
          onSort={handleSortChange}
        />
      </div>

      {/* Modals */}
      <UserModals 
        modalState={modalState}
        onClose={closeModal}
        onConfirmAction={confirmUserAction}
        onBulkAction={confirmBulkAction}
        onUpdateUser={updateUser}
        onResetPassword={resetUserPassword}
        loading={loading}
      />
    </div>
  );
}