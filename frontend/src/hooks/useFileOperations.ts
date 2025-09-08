import { useCallback } from 'react';
import { FileItem } from '@/types/file-browser';
import { fileManagementService } from '@/services/admin/fileManagementService';
import { toastService } from '@/services/toastService';

interface UseFileOperationsReturn {
  // File operations matching Angular exactly
  downloadFile: (file: FileItem) => void;
  deleteFile: (file: FileItem) => Promise<void>;
  checkFileIntegrity: (file: FileItem) => Promise<void>;
  moveFile: (file: FileItem) => Promise<void>;
  forceBackup: (file: FileItem) => Promise<void>;
  recoverFile: (file: FileItem) => Promise<void>;
  quarantineFile: (file: FileItem) => Promise<void>;
  previewFile: (file: FileItem) => Promise<void>;
  
  // System operations
  viewOrphanedFiles: () => Promise<void>;
  cleanupOrphanedFiles: () => Promise<void>;
  
  // Bulk operations
  executeBulkAction: (action: string, fileIds: string[], reason?: string) => Promise<void>;
}

/**
 * Custom hook for file operations
 * Provides all file management operations with professional confirmation dialogs
 */
export function useFileOperations(): UseFileOperationsReturn {
  
  /**
   * Download file
   */
  const downloadFile = useCallback((file: FileItem) => {
    fileManagementService.downloadFile(file._id);
  }, []);

  /**
   * Delete file with confirmation
   */
  const deleteFile = useCallback(async (file: FileItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${file.filename}"?`);
    if (!confirmed) return;

    const reason = window.prompt('Reason for deletion (optional):');
    await fileManagementService.deleteFile(file._id, reason || undefined);
  }, []);

  /**
   * Check file integrity
   */
  const checkFileIntegrity = useCallback(async (file: FileItem) => {
    try {
      const result = await fileManagementService.checkFileIntegrity(file._id);
      
      // Show detailed result in alert (matching Angular behavior)
      let message = '';
      if (result.status === 'verified') {
        message = `File integrity check passed!\n\nStatus: ${result.status}\nChecksum match: ${result.checksum_match}\nLast check: ${result.last_check ? new Date(result.last_check).toLocaleString() : 'N/A'}`;
      } else if (result.status === 'corrupted') {
        message = `WARNING: File integrity check failed!\n\nStatus: ${result.status}\nCorruption detected: ${result.corruption_detected}\nCorruption type: ${result.corruption_type || 'Unknown'}\n\nPlease consider recovering from backup.`;
      } else if (result.status === 'inaccessible') {
        message = `ERROR: File is inaccessible!\n\nStatus: ${result.status}\nError: ${result.error}\n\nFile may need to be recovered from backup.`;
      }
      
      if (message) {
        alert(message);
      }
    } catch (error) {
      // Error handling is done in the service layer
    }
  }, []);

  /**
   * Move file with target location prompt
   */
  const moveFile = useCallback(async (file: FileItem) => {
    const targetLocation = window.prompt('Enter target Google Drive account ID (e.g., account_1, account_2, account_3):');
    if (!targetLocation) return;

    const reason = window.prompt('Reason for moving file (optional):');
    await fileManagementService.moveFile(file._id, targetLocation, reason || undefined);
  }, []);

  /**
   * Force backup with confirmation
   */
  const forceBackup = useCallback(async (file: FileItem) => {
    const confirmed = window.confirm(`Force backup for "${file.filename}" to Hetzner storage?`);
    if (!confirmed) return;

    const reason = window.prompt('Reason for force backup (optional):');
    await fileManagementService.forceBackup(file._id, reason || undefined);
  }, []);

  /**
   * Recover file with confirmation
   */
  const recoverFile = useCallback(async (file: FileItem) => {
    const confirmed = window.confirm(`Recover "${file.filename}" from backup? This will restore the file if it's corrupted or missing.`);
    if (!confirmed) return;

    const reason = window.prompt('Reason for file recovery (optional):');
    await fileManagementService.recoverFile(file._id, reason || undefined);
  }, []);

  /**
   * Quarantine file with reason requirement
   */
  const quarantineFile = useCallback(async (file: FileItem) => {
    const confirmed = window.confirm(`Quarantine "${file.filename}"? This will mark the file as suspicious and prevent access.`);
    if (!confirmed) return;

    const reason = window.prompt('Reason for quarantine:');
    if (!reason) {
      alert('Reason is required for quarantine');
      return;
    }

    await fileManagementService.quarantineFile(file._id, reason);
  }, []);

  /**
   * Preview file
   */
  const previewFile = useCallback(async (file: FileItem) => {
    if (!file.preview_available) {
      toastService.error('Preview not available for this file type');
      return;
    }

    try {
      const previewData = await fileManagementService.getFilePreview(file._id);
      window.open(previewData.preview_url, '_blank');
    } catch (error) {
      // Error handling is done in the service layer
    }
  }, []);

  /**
   * View orphaned files
   */
  const viewOrphanedFiles = useCallback(async () => {
    try {
      const response = await fileManagementService.getOrphanedFiles(1, 50);
      const orphanedFiles = response.orphaned_files;
      const total = response.total;

      if (orphanedFiles.length === 0) {
        alert('No orphaned files found!');
        return;
      }

      let message = `Found ${total} orphaned files:\n\n`;
      orphanedFiles.slice(0, 10).forEach((file) => {
        message += `• ${file.filename} (${file.size_formatted})\n  Reason: ${file.orphan_reason}\n\n`;
      });

      if (orphanedFiles.length > 10) {
        message += `... and ${orphanedFiles.length - 10} more files.\n\n`;
      }

      message += 'Would you like to clean up orphaned files?';

      if (window.confirm(message)) {
        await cleanupOrphanedFiles();
      }
    } catch (error) {
      // Error handling is done in the service layer
    }
  }, []);

  /**
   * Cleanup orphaned files
   */
  const cleanupOrphanedFiles = useCallback(async () => {
    const cleanupType = window.confirm('Choose cleanup type:\n\nOK = Soft delete (mark as deleted)\nCancel = Hard delete (remove from database)') ? 'soft' : 'hard';
    const daysOldInput = window.prompt('Clean up files older than how many days?', '7');
    
    if (!daysOldInput || isNaN(Number(daysOldInput))) {
      alert('Invalid number of days');
      return;
    }

    const daysOld = Number(daysOldInput);
    const confirmMessage = `This will ${cleanupType} delete all orphaned files older than ${daysOld} days.\n\nThis action cannot be undone${cleanupType === 'hard' ? ' (files will be permanently removed)' : ''}.\n\nContinue?`;
    
    if (window.confirm(confirmMessage)) {
      await fileManagementService.cleanupOrphanedFiles(cleanupType, daysOld);
    }
  }, []);

  /**
   * Execute bulk action
   */
  const executeBulkAction = useCallback(async (action: string, fileIds: string[], reason?: string) => {
    if (fileIds.length === 0) {
      toastService.error('No files selected');
      return;
    }

    // Show confirmation for destructive actions
    if (['delete', 'quarantine'].includes(action)) {
      const actionText = action === 'delete' ? 'delete' : 'quarantine';
      const confirmed = window.confirm(`Are you sure you want to ${actionText} ${fileIds.length} file(s)?`);
      if (!confirmed) return;
    }

    await fileManagementService.bulkAction(fileIds, action, reason);
  }, []);

  return {
    // File operations
    downloadFile,
    deleteFile,
    checkFileIntegrity,
    moveFile,
    forceBackup,
    recoverFile,
    quarantineFile,
    previewFile,
    
    // System operations
    viewOrphanedFiles,
    cleanupOrphanedFiles,
    
    // Bulk operations
    executeBulkAction,
  };
}
