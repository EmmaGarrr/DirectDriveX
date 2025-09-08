import { useState, useCallback } from 'react';
import { googleDriveService } from '@/services/admin/googleDriveService';
import { 
  GoogleDriveAccount, 
  AddAccountRequest, 
  DeleteAllFilesResponse,
  UseGoogleDriveAccountsReturn 
} from '@/types/google-drive';

export const useGoogleDriveAccounts = (): UseGoogleDriveAccountsReturn => {
  // Operation loading states
  const [operationLoading, setOperationLoading] = useState({
    add: false,
    remove: false,
    toggle: false,
    refresh: false,
    deleteFiles: false,
    viewDetails: false
  });

  // Add account
  const addAccount = useCallback(async (accountData: AddAccountRequest): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, add: true }));
      console.log('useGoogleDriveAccounts: Adding account:', accountData.account_email);
      
      await googleDriveService.addAccount(accountData);
      
      console.log('useGoogleDriveAccounts: Account added successfully');
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error adding account:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, add: false }));
    }
  }, []);

  // Remove account
  const removeAccount = useCallback(async (accountId: string, force: boolean = false): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, remove: true }));
      console.log('useGoogleDriveAccounts: Removing account:', accountId, { force });
      
      await googleDriveService.removeAccount(accountId, force);
      
      console.log('useGoogleDriveAccounts: Account removed successfully');
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error removing account:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, remove: false }));
    }
  }, []);

  // Toggle account status
  const toggleAccount = useCallback(async (accountId: string): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, toggle: true }));
      console.log('useGoogleDriveAccounts: Toggling account:', accountId);
      
      await googleDriveService.toggleAccount(accountId);
      
      console.log('useGoogleDriveAccounts: Account toggled successfully');
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error toggling account:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, toggle: false }));
    }
  }, []);

  // Refresh account stats
  const refreshAccountStats = useCallback(async (accountId: string): Promise<void> => {
    try {
      setOperationLoading(prev => ({ ...prev, refresh: true }));
      console.log('useGoogleDriveAccounts: Refreshing account stats:', accountId);
      
      await googleDriveService.refreshAccountStats(accountId);
      
      console.log('useGoogleDriveAccounts: Account stats refreshed successfully');
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error refreshing account stats:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, refresh: false }));
    }
  }, []);

  // Delete all account files
  const deleteAllAccountFiles = useCallback(async (accountId: string): Promise<DeleteAllFilesResponse> => {
    try {
      setOperationLoading(prev => ({ ...prev, deleteFiles: true }));
      console.log('useGoogleDriveAccounts: Deleting all files for account:', accountId);
      
      const result = await googleDriveService.deleteAllAccountFiles(accountId);
      
      console.log('useGoogleDriveAccounts: All files deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error deleting all files:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, deleteFiles: false }));
    }
  }, []);

  // View account details
  const viewAccountDetails = useCallback(async (accountId: string): Promise<GoogleDriveAccount> => {
    try {
      setOperationLoading(prev => ({ ...prev, viewDetails: true }));
      console.log('useGoogleDriveAccounts: Loading account details:', accountId);
      
      const account = await googleDriveService.getAccountDetails(accountId);
      
      console.log('useGoogleDriveAccounts: Account details loaded:', account);
      return account;
    } catch (error) {
      console.error('useGoogleDriveAccounts: Error loading account details:', error);
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, viewDetails: false }));
    }
  }, []);

  return {
    // Account operations
    addAccount,
    removeAccount,
    toggleAccount,
    refreshAccountStats,
    deleteAllAccountFiles,
    viewAccountDetails,
    
    // Loading states
    operationLoading
  };
};
