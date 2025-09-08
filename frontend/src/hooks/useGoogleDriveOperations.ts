import { useState, useCallback } from 'react';
import { 
  AddAccountRequest, 
  UseGoogleDriveOperationsReturn,
  FormValidationResult,
  ServiceAccountKeyValidation 
} from '@/types/google-drive';

export const useGoogleDriveOperations = (): UseGoogleDriveOperationsReturn => {
  // Form state
  const [addAccountForm, setAddAccountForm] = useState<AddAccountRequest>({
    service_account_key: '',
    account_email: '',
    account_alias: ''
  });

  // Set form data
  const setForm = useCallback((form: AddAccountRequest) => {
    setAddAccountForm(form);
  }, []);

  // Reset form
  const resetAddAccountForm = useCallback(() => {
    setAddAccountForm({
      service_account_key: '',
      account_email: '',
      account_alias: ''
    });
  }, []);

  // Validate service account key JSON
  const validateServiceAccountKey = useCallback((key: string): ServiceAccountKeyValidation => {
    if (!key.trim()) {
      return { isValid: false, error: 'Service account key is required' };
    }

    try {
      const parsed = JSON.parse(key);
      
      // Check for required fields
      const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      
      if (missingFields.length > 0) {
        return { 
          isValid: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parsed.client_email)) {
        return { 
          isValid: false, 
          error: 'Invalid client_email format in service account key' 
        };
      }

      // Check if it's a service account
      if (parsed.type !== 'service_account') {
        return { 
          isValid: false, 
          error: 'Invalid service account type. Must be "service_account"' 
        };
      }

      return { 
        isValid: true, 
        parsedKey: parsed 
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Invalid JSON format. Please check your service account key.' 
      };
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback((): FormValidationResult => {
    const errors: Record<string, string> = {};

    // Validate email
    if (!addAccountForm.account_email.trim()) {
      errors.account_email = 'Account email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addAccountForm.account_email)) {
        errors.account_email = 'Please enter a valid email address';
      }
    }

    // Validate alias
    if (!addAccountForm.account_alias.trim()) {
      errors.account_alias = 'Account alias is required';
    } else if (addAccountForm.account_alias.trim().length < 3) {
      errors.account_alias = 'Alias must be at least 3 characters long';
    }

    // Validate service account key
    const keyValidation = validateServiceAccountKey(addAccountForm.service_account_key);
    if (!keyValidation.isValid) {
      errors.service_account_key = keyValidation.error || 'Invalid service account key';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [addAccountForm, validateServiceAccountKey]);

  // Submit form (this would be called by the component with the actual service)
  const submitAddAccount = useCallback(async (): Promise<void> => {
    const validation = validateForm();
    if (!validation.isValid) {
      throw new Error('Form validation failed');
    }
    
    // The actual submission would be handled by the component
    // that has access to the googleDriveService
    console.log('useGoogleDriveOperations: Form validated successfully');
  }, [validateForm]);

  return {
    // Form state
    addAccountForm,
    setAddAccountForm: setForm,
    resetAddAccountForm,
    
    // Form validation
    validateForm,
    validateServiceAccountKey,
    
    // Form submission
    submitAddAccount
  };
};
