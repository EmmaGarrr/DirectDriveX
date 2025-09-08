import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { 
  FileItem, 
  StorageStats, 
  FileTypeAnalytics, 
  FilterState, 
  SortConfig, 
  PaginationState,
  FileListParams
} from '@/types/file-browser';
import { fileManagementService } from '@/services/admin/fileManagementService';
import { adminSocketService } from '@/services/adminSocketService';
import { toastService } from '@/services/toastService';
import { adminAuthService } from '@/services/adminAuthService';

interface UseFileBrowserReturn {
  // Data state
  files: FileItem[];
  storageStats: StorageStats | null;
  fileTypeAnalytics: FileTypeAnalytics | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedFileIds: Set<string>;
  filters: FilterState;
  sort: SortConfig;
  pagination: PaginationState;
  
  // Actions
  loadFiles: () => void;
  handleFileOperation: (operation: string, fileId: string, params?: any) => Promise<void>;
  handleBulkAction: (action: string, fileIds: string[], reason?: string) => Promise<void>;
  setSelectedFileIds: Dispatch<SetStateAction<Set<string>>>;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  setSort: Dispatch<SetStateAction<SortConfig>>;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  refreshData: () => void;
}

/**
 * Custom hook for file browser state management
 * Provides complete file management functionality with real-time updates
 */
export function useFileBrowser(): UseFileBrowserReturn {
  // Data state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [fileTypeAnalytics, setFileTypeAnalytics] = useState<FileTypeAnalytics | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    owner: '',
    storage: 'all',
    status: 'all',
    sizeMin: 0,
    sizeMax: 50 * 1024 * 1024 * 1024, // 50GB
  });
  
  const [sort, setSort] = useState<SortConfig>({ 
    key: 'upload_date', 
    direction: 'desc' 
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
  });

  /**
   * FIXED: Load files with better error handling
   */
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if admin is authenticated
      if (!adminAuthService.isAdminAuthenticated()) {
        console.warn('Admin not authenticated, using demo mode');
        toastService.info('Demo mode - please log in for full functionality');
      }

      const params: FileListParams = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        sort_by: sort.key,
        sort_order: sort.direction,
        search: filters.search || undefined,
        file_type: filters.type !== 'all' ? filters.type : undefined,
        owner_email: filters.owner || undefined,
        storage_location: filters.storage !== 'all' ? filters.storage : undefined,
        file_status: filters.status !== 'all' ? filters.status : undefined,
        size_min: filters.sizeMin > 0 ? filters.sizeMin : undefined,
        size_max: filters.sizeMax < 50 * 1024 * 1024 * 1024 ? filters.sizeMax : undefined,
      };

      const response = await fileManagementService.getFiles(params);
      
      setFiles(response.files);
      setStorageStats(response.storage_stats);
      setPagination(prev => ({
        ...prev,
        totalItems: response.total,
        totalPages: response.total_pages,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files';
      console.error('Error loading files:', err);
      // Don't set error state, let the service handle fallbacks
      toastService.error('Using demonstration data - check console for details');
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pagination.currentPage, pagination.pageSize]);

  /**
   * Load file type analytics
   */
  const loadFileTypeAnalytics = useCallback(async () => {
    try {
      const analytics = await fileManagementService.getFileTypeAnalytics();
      setFileTypeAnalytics(analytics);
    } catch (err) {
      console.error('Error loading file type analytics:', err);
    }
  }, []);

  /**
   * Handle file operations
   */
  const handleFileOperation = useCallback(async (operation: string, fileId: string, params?: any) => {
    console.log('useFileBrowser: handleFileOperation called:', { operation, fileId, params });
    try {
      switch (operation) {
        case 'download':
          console.log('useFileBrowser: Executing download for file:', fileId, 'filename:', params?.filename);
          await fileManagementService.downloadFile(fileId, params?.filename);
          break;
        case 'delete':
          await fileManagementService.deleteFile(fileId, params?.reason);
          await loadFiles(); // Refresh file list
          break;
        case 'integrity_check':
          await fileManagementService.checkFileIntegrity(fileId);
          break;
        case 'move':
          await fileManagementService.moveFile(fileId, params?.targetLocation, params?.reason);
          await loadFiles(); // Refresh file list
          break;
        case 'force_backup':
          await fileManagementService.forceBackup(fileId, params?.reason);
          await loadFiles(); // Refresh file list
          break;
        case 'recover':
          await fileManagementService.recoverFile(fileId, params?.reason);
          await loadFiles(); // Refresh file list
          break;
        case 'quarantine':
          await fileManagementService.quarantineFile(fileId, params?.reason);
          await loadFiles(); // Refresh file list
          break;
        case 'preview':
          const previewData = await fileManagementService.getFilePreview(fileId);
          window.open(previewData.preview_url, '_blank');
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (err) {
      console.error(`Error executing ${operation}:`, err);
      // Error handling is done in the service layer with toast notifications
    }
  }, [loadFiles]);

  /**
   * Handle bulk actions
   */
  const handleBulkAction = useCallback(async (action: string, fileIds: string[], reason?: string) => {
    try {
      await fileManagementService.bulkAction(fileIds, action, reason);
      setSelectedFileIds(new Set()); // Clear selection
      await loadFiles(); // Refresh file list
      await loadFileTypeAnalytics(); // Refresh analytics
    } catch (err) {
      console.error(`Error executing bulk ${action}:`, err);
      // Error handling is done in the service layer with toast notifications
    }
  }, [loadFiles, loadFileTypeAnalytics]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadFiles(),
      loadFileTypeAnalytics()
    ]);
  }, [loadFiles, loadFileTypeAnalytics]);



  // Load data on mount and when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    loadFileTypeAnalytics();
  }, [loadFileTypeAnalytics]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    const unsubscribe = adminSocketService.onEvent((event) => {
      // Listen for file-related events and refresh data
      if (event.includes('file') || event.includes('storage') || event.includes('backup')) {
        refreshData();
      }
    });

    return unsubscribe;
  }, [refreshData]);

  return {
    // Data state
    files,
    storageStats,
    fileTypeAnalytics,
    
    // UI state
    loading,
    error,
    selectedFileIds,
    filters,
    sort,
    pagination,
    
    // Actions
    loadFiles,
    handleFileOperation,
    handleBulkAction,
    setSelectedFileIds,
    setFilters,
    setSort,
    setPagination,
    refreshData,
  };
}
