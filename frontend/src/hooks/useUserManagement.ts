"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, 
  UserStatus,
  UserRole, 
  GetUsersParams,
  PaginationState, 
  SortConfig, 
  ModalState,
  UpdateUserData
} from '@/types/admin';
import { userManagementService } from '@/services/admin/userManagementService';
// Import toast service
import { toastService } from '@/services/toastService';

// Initial filter state
const defaultFilters = {
  search: '',
  role: 'all',
  status: 'all'
};

// Initial pagination state
const defaultPagination: PaginationState = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0
};

// Initial sort config
const defaultSortConfig: SortConfig = {
  key: 'created_at',
  direction: 'desc'
};

export function useUserManagement() {
  // Core state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  
  // Filter state
  const [filters, setFilters] = useState(defaultFilters);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSortConfig);
  
  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    data: null
  });

  // UI toast notifications using the singleton service

  /**
   * Load users with current filters, pagination, and sorting
   */
  const loadUsers = useCallback(async (resetPage: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: GetUsersParams = {
        page: resetPage ? 1 : pagination.currentPage,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        role: filters.role,
        status: filters.status,
        sort_by: sortConfig.key,
        sort_direction: sortConfig.direction
      };
      
      const response = await userManagementService.getUsers(params);
      
      setUsers(response.users);
      setPagination({
        currentPage: response.page,
        pageSize: response.limit,
        totalItems: response.total,
        totalPages: response.total_pages
      });
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading users');
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.pageSize, sortConfig]);

  /**
   * Handle changing page
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  /**
   * Handle changing page size
   */
  const handlePageSizeChange = useCallback((size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1 // Reset to first page when changing page size
    }));
  }, []);

  /**
   * Handle changing filters
   */
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  /**
   * Reset all filters to default
   */
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  /**
   * Handle changing sort configuration
   */
  const handleSortChange = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  /**
   * Handle user action (view, edit, suspend, etc.)
   */
  const handleUserAction = useCallback(async (action: string, userData: any) => {
    if (['view', 'edit', 'files', 'storage'].includes(action)) {
      // Modal actions, just open the modal
      setModalState({
        type: action as ModalState['type'],
        data: userData
      });
      return;
    }

    // Status change actions
    if (['suspend', 'ban', 'activate'].includes(action)) {
      setModalState({
        type: 'confirm',
        data: { user: userData, action }
      });
      return;
    }

    // Reset password action
    if (action === 'reset_password') {
      setModalState({
        type: 'reset_password',
        data: userData
      });
      return;
    }

    // For any other action, open a generic confirm dialog
    setModalState({
      type: 'confirm',
      data: { user: userData, action }
    });
  }, []);

  /**
   * Handle bulk action (on multiple selected users)
   */
  const handleBulkAction = useCallback((action: string) => {
    if (selectedUserIds.size === 0) {
      toastService.error("Please select users before performing bulk actions");
      return;
    }

    setModalState({
      type: 'bulk',
      data: { action, userIds: Array.from(selectedUserIds) }
    });
  }, [selectedUserIds]);

  /**
   * Confirm and process user action with optional reason
   */
  const confirmUserAction = useCallback(async (userId: string, action: string, reason?: string) => {
    setLoading(true);
    
    try {
      await userManagementService.updateUserStatus(userId, action, reason);
      
      toastService.success(`Successfully ${action}ed user`);
      
      // Reload users to get updated data
      await loadUsers();
      
      // Close any open modals
      setModalState({ type: null, data: null });
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : `Failed to ${action} user`);
      setLoading(false);
    }
  }, [loadUsers]);

  /**
   * Confirm and process bulk action with optional reason
   */
  const confirmBulkAction = useCallback(async (userIds: string[], action: string, reason?: string) => {
    setLoading(true);
    
    try {
      await userManagementService.bulkAction(userIds, action, reason);
      
      toastService.success(`${action} action completed for ${userIds.length} users`);
      
      // Reload users to get updated data
      await loadUsers();
      
      // Clear selection
      setSelectedUserIds(new Set());
      
      // Close any open modals
      setModalState({ type: null, data: null });
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : `Failed to ${action} users`);
      setLoading(false);
    }
  }, [loadUsers]);

  /**
   * Update user details
   */
  const updateUser = useCallback(async (userId: string, data: UpdateUserData) => {
    setLoading(true);
    
    try {
      await userManagementService.updateUser(userId, data);
      
      toastService.success("User information has been updated successfully");
      
      // Reload users to get updated data
      await loadUsers();
      
      // Close any open modals
      setModalState({ type: null, data: null });
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : "Failed to update user");
      setLoading(false);
    }
  }, [loadUsers]);

  /**
   * Reset user password
   */
  const resetUserPassword = useCallback(async (userId: string, newPassword?: string) => {
    setLoading(true);
    
    try {
      const response = await userManagementService.resetUserPassword(userId, newPassword);
      
      // If we get back a generated password, show it
      const generatedPassword = response.password;
      
      toastService.success(generatedPassword 
        ? `Password reset successful. Generated password: ${generatedPassword}` 
        : "User password has been reset");
      
      // Close any open modals
      setModalState({ type: null, data: null });
      setLoading(false);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : "Failed to reset password");
      setLoading(false);
    }
  }, []);

  /**
   * Export users data
   */
  const exportUsers = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      const blob = await userManagementService.exportUsers(format, filters);
      
      // Generate file name based on date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `users_export_${date}.${format}`;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toastService.success(`Users exported to ${format.toUpperCase()} successfully`);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : `Failed to export users to ${format}`);
    }
  }, [filters]);

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setModalState({ type: null, data: null });
  }, []);

  /**
   * Memoized flags for indeterminate checkbox state
   */
  const selectionFlags = useMemo(() => {
    const isAllSelected = selectedUserIds.size === users.length && users.length > 0;
    const isIndeterminate = selectedUserIds.size > 0 && selectedUserIds.size < users.length;
    return { isAllSelected, isIndeterminate };
  }, [selectedUserIds, users]);

  // Initial data load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reload when pagination, filters, or sorting changes
  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage, pagination.pageSize, filters, sortConfig, loadUsers]);

  return {
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
    
    // State setters
    setSelectedUserIds,
    
    // Actions
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
  };
}