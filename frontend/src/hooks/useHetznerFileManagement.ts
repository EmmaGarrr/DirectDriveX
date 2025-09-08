import { useState, useEffect, useCallback, useRef } from 'react';
import { HetznerFileItem, HetznerStats, HetznerFileTypeAnalytics, HetznerFileFilters } from '@/types/hetzner';
import { hetznerFileManagementService } from '@/services/admin/hetznerFileManagementService';
import { toastService } from '@/services/toastService';
import { activityLogsService } from '@/services/admin/activityLogsService';

interface UseHetznerFileManagementReturn {
  // Data
  files: HetznerFileItem[];
  stats: HetznerStats | null;
  analytics: HetznerFileTypeAnalytics | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalFiles: number;
  pageSize: number;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: HetznerFileFilters;
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
  setFilters: (filters: Partial<HetznerFileFilters>) => void;
  clearFilters: () => void;
  setShowFilters: (show: boolean) => void;
  handleSearchInput: (searchTerm: string) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  setSortBy: (field: string) => void;
  setPage: (page: number) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  
  // File operations
  downloadFile: (file: HetznerFileItem) => Promise<void>;
  checkIntegrity: (file: HetznerFileItem) => Promise<void>;
  recoverFile: (file: HetznerFileItem) => Promise<void>;
  deleteFile: (file: HetznerFileItem) => Promise<void>;
  previewFile: (file: HetznerFileItem) => Promise<void>;
  
  // Bulk operations
  executeBulkAction: (action: string, reason?: string) => Promise<void>;
}

export function useHetznerFileManagement(): UseHetznerFileManagementReturn {
  // Data state
  const [files, setFiles] = useState<HetznerFileItem[]>([]);
  const [stats, setStats] = useState<HetznerStats | null>(null);
  const [analytics, setAnalytics] = useState<HetznerFileTypeAnalytics | null>(null);
  
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
  const [filters, setFiltersState] = useState<HetznerFileFilters>({
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
  
  // Search debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load files with current filters and pagination
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await hetznerFileManagementService.getFiles({
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
      setStats(response.hetzner_stats);
      setTotalFiles(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      setError('Failed to load Hetzner backup files. Please try again.');
      console.error('useHetznerFileManagement: Load files error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, currentPage, pageSize]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await hetznerFileManagementService.getFileTypeAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('useHetznerFileManagement: Load analytics error:', error);
    }
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<HetznerFileFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Debounced search function (matching Angular implementation)
  const handleSearchInput = useCallback((searchTerm: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const timeout = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 500); // 500ms delay matching Angular
    
    searchTimeoutRef.current = timeout;
  }, [setFilters]);

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
  const downloadFile = useCallback(async (file: HetznerFileItem) => {
    try {
      await hetznerFileManagementService.downloadFile(file._id);
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'hetzner_file_download',
        details: {
          target_type: 'hetzner_file',
          target_id: file._id,
          description: `Downloaded Hetzner backup file: ${file.filename}`,
          filename: file.filename,
          file_size: file.size_formatted,
          file_type: file.file_type
        }
      });
    } catch (error) {
      console.error('useHetznerFileManagement: Download error:', error);
    }
  }, []);

  const checkIntegrity = useCallback(async (file: HetznerFileItem) => {
    try {
      const result = await hetznerFileManagementService.checkFileIntegrity(file._id);
      
      // Show detailed integrity check results matching Angular implementation
      if (result.data?.integrity_check?.status === 'verified') {
        alert(`File integrity check passed!\n\nStatus: ${result.data.integrity_check.status}\nChecksum match: ${result.data.integrity_check.checksum_match}\nLast check: ${new Date(result.data.integrity_check.last_check).toLocaleString()}`);
      } else if (result.data?.integrity_check?.status === 'corrupted') {
        alert(`WARNING: File integrity check failed!\n\nStatus: ${result.data.integrity_check.status}\nCorruption detected: ${result.data.integrity_check.corruption_detected}\nCorruption type: ${result.data.integrity_check.corruption_type || 'Unknown'}\n\nPlease consider recovering from backup.`);
      } else if (result.data?.integrity_check?.status === 'pending') {
        alert(`File integrity check is pending.\n\nStatus: ${result.data.integrity_check.status}\nQueued at: ${new Date(result.data.integrity_check.queued_at).toLocaleString()}`);
      } else if (result.data?.integrity_check?.status === 'failed') {
        alert(`File integrity check failed to complete.\n\nStatus: ${result.data.integrity_check.status}\nError: ${result.data.integrity_check.error || 'Unknown error'}`);
      } else if (result.message) {
        alert(result.message);
      }
      
      // Log activity
      await activityLogsService.logActivity({
        action: 'hetzner_file_integrity_check',
        details: {
          target_type: 'hetzner_file',
          target_id: file._id,
          description: `Integrity check for Hetzner file: ${file.filename}`,
          filename: file.filename,
          integrity_status: result.data?.integrity_check?.status,
          result: result.success ? 'passed' : 'failed'
        }
      });
    } catch (error) {
      console.error('useHetznerFileManagement: Integrity check error:', error);
      alert('Failed to check file integrity. Please try again.');
    }
  }, []);

  const recoverFile = useCallback(async (file: HetznerFileItem) => {
    if (!confirm(`Recover "${file.filename || 'Unknown'}" from Hetzner backup? This will restore the file to Google Drive.`)) return;
    
    const reason = prompt('Reason for file recovery (optional):');
    
    try {
      const result = await hetznerFileManagementService.recoverFile(file._id, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'hetzner_file_recover',
          details: {
            target_type: 'hetzner_file',
            target_id: file._id,
            description: `Recovered file from Hetzner backup: ${file.filename}`,
            filename: file.filename,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useHetznerFileManagement: Recover file error:', error);
    }
  }, [loadFiles]);

  const deleteFile = useCallback(async (file: HetznerFileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.filename || 'Unknown'}" from Hetzner backup?`)) return;
    
    const reason = prompt('Reason for deletion (optional):');
    
    try {
      const result = await hetznerFileManagementService.deleteFile(file._id, reason || undefined);
      if (result.success) {
        await loadFiles(); // Refresh file list
        await loadAnalytics(); // Refresh analytics
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'hetzner_file_delete',
          details: {
            target_type: 'hetzner_file',
            target_id: file._id,
            description: `Deleted file from Hetzner backup: ${file.filename}`,
            filename: file.filename,
            file_size: file.size_formatted,
            file_type: file.file_type,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useHetznerFileManagement: Delete file error:', error);
    }
  }, [loadFiles, loadAnalytics]);

  const previewFile = useCallback(async (file: HetznerFileItem) => {
    if (!file.preview_available) return;
    
    try {
      const previewUrl = await hetznerFileManagementService.previewFile(file._id);
      if (previewUrl) {
        window.open(previewUrl, '_blank');
        
        // Log activity
        await activityLogsService.logActivity({
          action: 'hetzner_file_preview',
          details: {
            target_type: 'hetzner_file',
            target_id: file._id,
            description: `Previewed Hetzner file: ${file.filename}`,
            filename: file.filename,
            file_type: file.file_type
          }
        });
      }
    } catch (error) {
      console.error('useHetznerFileManagement: Preview file error:', error);
    }
  }, []);

  // Bulk operations with activity logging
  const executeBulkAction = useCallback(async (action: string, reason?: string) => {
    if (selectedFiles.length === 0) {
      toastService.error('No files selected');
      return;
    }

    try {
      const result = await hetznerFileManagementService.executeBulkAction({
        file_ids: selectedFiles,
        action: action as any,
        reason,
      });

      if (result.success) {
        setSelectedFiles([]); // Clear selection
        await loadFiles(); // Refresh file list
        await loadAnalytics(); // Refresh analytics

        // Log bulk activity
        await activityLogsService.logActivity({
          action: `bulk_hetzner_file_${action}`,
          details: {
            target_type: 'hetzner_files',
            target_id: 'bulk_operation',
            description: `Bulk ${action} on ${selectedFiles.length} Hetzner files`,
            action: action,
            file_count: selectedFiles.length,
            file_ids: selectedFiles,
            reason: reason || 'No reason provided'
          }
        });
      }
    } catch (error) {
      console.error('useHetznerFileManagement: Bulk action error:', error);
    }
  }, [selectedFiles, loadFiles, loadAnalytics]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
    handleSearchInput,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setSortBy,
    setPage,
    setViewMode,
    
    // File operations
    downloadFile,
    checkIntegrity,
    recoverFile,
    deleteFile,
    previewFile,
    
    // Bulk operations
    executeBulkAction,
  };
}