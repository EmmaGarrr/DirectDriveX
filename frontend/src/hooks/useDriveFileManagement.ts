import { useState, useEffect, useCallback } from 'react';
import { DriveFileItem, DriveStats, FileTypeAnalytics } from '@/types/drive';
import { driveFileManagementService } from '@/services/admin/driveFileManagementService';
import { toastService } from '@/services/toastService';
import { activityLogsService } from '@/services/admin/activityLogsService';

interface DriveFileFilters {
  search: string;
  fileType: string;
  owner: string;
  backupStatus: string;
  sizeMin: number | null;
  sizeMax: number | null;
}

interface UseDriveFileManagementReturn {
  // Data
  files: DriveFileItem[];
  stats: DriveStats | null;
  analytics: FileTypeAnalytics | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalFiles: number;
  pageSize: number;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: DriveFileFilters;
  showFilters: boolean;
  
  // Selection
  selectedFiles: string[];
  
  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // View mode
  viewMode: 'list' | 'grid';
  
  // Actions
  loadFiles: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  setFilters: (filters: Partial<DriveFileFilters>) => void;
  clearFilters: () => void;
  setShowFilters: (show: boolean) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  setSortBy: (field: string) => void;
  setPage: (page: number) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  
  // File operations
  downloadFile: (file: DriveFileItem) => Promise<void>;
  checkIntegrity: (file: DriveFileItem) => Promise<void>;
  moveFile: (file: DriveFileItem) => Promise<void>;
  forceBackup: (file: DriveFileItem) => Promise<void>;
  recoverFile: (file: DriveFileItem) => Promise<void>;
  deleteFile: (file: DriveFileItem) => Promise<void>;
  previewFile: (file: DriveFileItem) => Promise<void>;
  
  // Bulk operations
  executeBulkAction: (action: string, reason?: string, targetLocation?: string) => Promise<void>;
}

export function useDriveFileManagement(): UseDriveFileManagementReturn {
  // Data state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [stats, setStats] = useState<DriveStats | null>(null);
  const [analytics, setAnalytics] = useState<FileTypeAnalytics | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [pageSize] = useState(50);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Filters state
  const [filters, setFiltersState] = useState<DriveFileFilters>({
    search: '',
    fileType: '',
    owner: '',
    backupStatus: '',
    sizeMin: null,
    sizeMax: null,
  });
  
  // Selection state
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  // Sorting state
  const [sortBy, setSortByState] = useState('upload_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load files with current filters and pagination
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await driveFileManagementService.getFileList({
        search: filters.search || undefined,
        file_type: filters.fileType || undefined,
        owner_email: filters.owner || undefined,
        backup_status: filters.backupStatus || undefined,
        size_min: filters.sizeMin || undefined,
        size_max: filters.sizeMax || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: pageSize,
      });
      
      setFiles(response.files);
      setStats(response.drive_stats);
      setTotalFiles(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      setError('Failed to load drive files. Please try again.');
      console.error('useDriveFileManagement: Load files error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, currentPage, pageSize]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await driveFileManagementService.getFileTypeAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('useDriveFileManagement: Load analytics error:', error);
    }
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<DriveFileFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      search: '',
      fileType: '',
      owner: '',
      backupStatus: '',
      sizeMin: null,
      sizeMax: null,
    });
    setCurrentPage(1);
  }, []);

  // Toggle file selection
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  // Select all files on current page
  const selectAllFiles = useCallback(() => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file._id));
    }
  }, [selectedFiles, files]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Handle sorting
  const setSortBy = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortByState(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  // Handle pagination
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // File operations with activity logging
  const downloadFile = useCallback(async (file: DriveFileItem) => {
    try {
      await driveFileManagementService.downloadFile(file._id, file.filename || 'unknown_file');
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'file_download',
        details: {
          target_type: 'drive_file',
          target_id: file._id,
          description: `Downloaded file: ${file.filename}`,
          filename: file.filename,
          file_size: file.size_formatted,
          file_type: file.file_type
        }
      });
    } catch (error) {
      console.error('useDriveFileManagement: Download error:', error);
    }
  }, []);

  const checkIntegrity = useCallback(async (file: DriveFileItem) => {
    try {
      const result = await driveFileManagementService.checkFileIntegrity(file._id);
      if (result.message) {
        // Show detailed integrity check results
        alert(result.message);
      }
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'file_integrity_check',
        details: {
          target_type: 'drive_file',
          target_id: file._id,
          description: `Integrity check for file: ${file.filename}`,
          filename: file.filename,
          integrity_status: result.data?.status,
          result: result.success ? 'passed' : 'failed'
        }
      });
    } catch (error) {
      console.error('useDriveFileManagement: Integrity check error:', error);
    }
  }, []);

  const moveFile = useCallback(async (file: DriveFileItem) => {
    const targetLocation = prompt('Enter target Google Drive account ID (e.g., account_1, account_2, account_3):');
    if (!targetLocation) return;
    
    const reason = prompt('Reason for moving file (optional):');
    
    try {
      const result = await driveFileManagementService.moveFile(file._id, targetLocation, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'file_move',
          details: {
            target_type: 'drive_file',
            target_id: file._id,
            description: `Moved file: ${file.filename} to ${targetLocation}`,
            filename: file.filename,
            source_account: file.gdrive_account_id,
            target_account: targetLocation,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Move file error:', error);
    }
  }, [loadFiles]);

  const forceBackup = useCallback(async (file: DriveFileItem) => {
    if (!confirm(`Force backup for "${file.filename || 'Unknown'}" to Hetzner storage?`)) return;
    
    const reason = prompt('Reason for force backup (optional):');
    
    try {
      const result = await driveFileManagementService.forceBackup(file._id, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'file_force_backup',
          details: {
            target_type: 'drive_file',
            target_id: file._id,
            description: `Force backup for file: ${file.filename}`,
            filename: file.filename,
            backup_path: result.data?.backup_path,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Force backup error:', error);
    }
  }, [loadFiles]);

  const recoverFile = useCallback(async (file: DriveFileItem) => {
    if (!confirm(`Recover "${file.filename || 'Unknown'}" from backup? This will restore the file if it's corrupted or missing.`)) return;
    
    const reason = prompt('Reason for file recovery (optional):');
    
    try {
      const result = await driveFileManagementService.recoverFile(file._id, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'file_recover',
          details: {
            target_type: 'drive_file',
            target_id: file._id,
            description: `Recovered file from backup: ${file.filename}`,
            filename: file.filename,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Recover file error:', error);
    }
  }, [loadFiles]);

  const deleteFile = useCallback(async (file: DriveFileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.filename || 'Unknown'}"?`)) return;
    
    const reason = prompt('Reason for deletion (optional):');
    
    try {
      const result = await driveFileManagementService.deleteFile(file._id, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        await loadAnalytics(); // Refresh analytics
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'file_delete',
          details: {
            target_type: 'drive_file',
            target_id: file._id,
            description: `Deleted file: ${file.filename}`,
            filename: file.filename,
            file_size: file.size_formatted,
            file_type: file.file_type,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Delete file error:', error);
    }
  }, [loadFiles, loadAnalytics]);

  const previewFile = useCallback(async (file: DriveFileItem) => {
    if (!file.preview_available) return;
    
    try {
      const previewUrl = await driveFileManagementService.previewFile(file._id);
      if (previewUrl) {
        window.open(previewUrl, '_blank');
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'file_preview',
          details: {
            target_type: 'drive_file',
            target_id: file._id,
            description: `Previewed file: ${file.filename}`,
            filename: file.filename,
            file_type: file.file_type
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Preview file error:', error);
    }
  }, []);

  // Bulk operations with activity logging
  const executeBulkAction = useCallback(async (action: string, reason?: string, targetLocation?: string) => {
    if (selectedFiles.length === 0) {
      toastService.error('No files selected');
      return;
    }

    // Additional validation for move operations
    if (action === 'move' && !targetLocation) {
      toastService.error('Target location is required for move operations');
      return;
    }

    try {
      const result = await driveFileManagementService.executeBulkAction({
        file_ids: selectedFiles,
        action: action as any,
        reason,
        target_location: targetLocation,
      });

      if (result.success) {
        setSelectedFiles([]); // Clear selection
        await loadFiles(); // Refresh file list
        await loadAnalytics(); // Refresh analytics

        // Log bulk activity
        await activityLogsService.logActivity({
          action: `bulk_file_${action}`,
          details: {
            target_type: 'drive_files',
            target_id: 'bulk_operation',
            description: `Bulk ${action} on ${selectedFiles.length} files`,
            action: action,
            file_count: selectedFiles.length,
            file_ids: selectedFiles,
            reason: reason || 'No reason provided',
            target_location: targetLocation
          }
        });
      }
    } catch (error) {
      console.error('useDriveFileManagement: Bulk action error:', error);
    }
  }, [selectedFiles, loadFiles, loadAnalytics]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    // Data
    files,
    stats,
    analytics,
    
    // Pagination
    currentPage,
    totalPages,
    totalFiles,
    pageSize,
    
    // State
    loading,
    error,
    
    // Filters
    filters,
    showFilters,
    
    // Selection
    selectedFiles,
    
    // Sorting
    sortBy,
    sortOrder,
    
    // View mode
    viewMode,
    
    // Actions
    loadFiles,
    loadAnalytics,
    setFilters,
    clearFilters,
    setShowFilters,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setSortBy,
    setPage,
    setViewMode,
    
    // File operations
    downloadFile,
    checkIntegrity,
    moveFile,
    forceBackup,
    recoverFile,
    deleteFile,
    previewFile,
    
    // Bulk operations
    executeBulkAction,
  };
}
