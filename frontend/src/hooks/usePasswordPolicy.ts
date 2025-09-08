import { useState, useCallback } from 'react';
import { 
  PasswordPolicy, 
  SecurityValidation, 
  PasswordTestResult,
  UsePasswordPolicyReturn 
} from '@/types/security';
import { securityService } from '@/services/admin/securityService';

export const usePasswordPolicy = (): UsePasswordPolicyReturn => {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [originalPolicy, setOriginalPolicy] = useState<PasswordPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPasswordPolicy = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading password policy...');
      const policy = await securityService.getPasswordPolicy();
      setPasswordPolicy(policy);
      setOriginalPolicy({ ...policy });
      console.log('Password policy loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load password policy';
      setError(errorMessage);
      console.error('Error loading password policy:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePasswordPolicy = useCallback(async () => {
    if (!passwordPolicy) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Saving password policy...');
      await securityService.updatePasswordPolicy(passwordPolicy);
      setOriginalPolicy({ ...passwordPolicy });
      console.log('Password policy saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save password policy';
      setError(errorMessage);
      console.error('Error saving password policy:', err);
    } finally {
      setLoading(false);
    }
  }, [passwordPolicy]);

  const resetPasswordPolicy = useCallback(() => {
    if (originalPolicy) {
      setPasswordPolicy({ ...originalPolicy });
      setError('');
      console.log('Password policy reset to original values');
    }
  }, [originalPolicy]);

  const updatePasswordPolicy = useCallback((updates: Partial<PasswordPolicy>) => {
    if (passwordPolicy) {
      const updatedPolicy = { ...passwordPolicy, ...updates };
      setPasswordPolicy(updatedPolicy);
      console.log('Password policy updated:', updates);
    }
  }, [passwordPolicy]);

  const testPassword = useCallback(async (password: string): Promise<PasswordTestResult> => {
    try {
      console.log('Testing password strength...');
      return await securityService.testPassword(password);
    } catch (err) {
      console.error('Error testing password:', err);
      throw err;
    }
  }, []);

  const validatePasswordPolicy = useCallback((): SecurityValidation => {
    if (!passwordPolicy) {
      return {
        isValid: false,
        errors: ['No password policy loaded'],
        warnings: []
      };
    }
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Minimum length validation
    if (passwordPolicy.min_length < 4) {
      errors.push('Minimum password length must be at least 4 characters');
    } else if (passwordPolicy.min_length < 8) {
      warnings.push('Consider increasing minimum password length to 8 characters for better security');
    } else if (passwordPolicy.min_length > 128) {
      warnings.push('Very long minimum password length may impact user experience');
    }

    // Password history validation
    if (passwordPolicy.password_history_count < 0) {
      errors.push('Password history count cannot be negative');
    } else if (passwordPolicy.password_history_count > 24) {
      warnings.push('Very high password history count may impact performance');
    }

    // Password expiry validation
    if (passwordPolicy.password_expiry_days < 0) {
      errors.push('Password expiry days cannot be negative');
    } else if (passwordPolicy.password_expiry_days > 365) {
      warnings.push('Very long password expiry period may reduce security');
    } else if (passwordPolicy.password_expiry_days === 0) {
      warnings.push('Passwords that never expire may pose a security risk');
    }

    // Check if no complexity requirements are enabled
    const hasComplexityRequirements = 
      passwordPolicy.require_uppercase ||
      passwordPolicy.require_lowercase ||
      passwordPolicy.require_numbers ||
      passwordPolicy.require_special_chars;

    if (!hasComplexityRequirements) {
      warnings.push('Consider enabling password complexity requirements for better security');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [passwordPolicy]);

  const hasChanges = passwordPolicy && originalPolicy 
    ? JSON.stringify(passwordPolicy) !== JSON.stringify(originalPolicy)
    : false;

  return {
    passwordPolicy,
    originalPolicy,
    loading,
    error,
    hasChanges,
    loadPasswordPolicy,
    savePasswordPolicy,
    resetPasswordPolicy,
    updatePasswordPolicy,
    testPassword,
    validatePasswordPolicy
  };
};
