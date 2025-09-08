import { useState, useCallback } from 'react';
import { 
  SecurityConfig, 
  SecurityValidation, 
  SecurityScore,
  UseSecuritySettingsReturn 
} from '@/types/security';
import { securityService } from '@/services/admin/securityService';

export const useSecuritySettings = (): UseSecuritySettingsReturn => {
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSecurityConfig = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading security configuration...');
      const config = await securityService.getSecurityConfig();
      setSecurityConfig(config);
      setOriginalConfig({ ...config });
      console.log('Security configuration loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security configuration';
      setError(errorMessage);
      console.error('Error loading security configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSecurityConfig = useCallback(async () => {
    if (!securityConfig) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Saving security configuration...');
      await securityService.updateSecurityConfig(securityConfig);
      setOriginalConfig({ ...securityConfig });
      console.log('Security configuration saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save security configuration';
      setError(errorMessage);
      console.error('Error saving security configuration:', err);
    } finally {
      setLoading(false);
    }
  }, [securityConfig]);

  const resetSecurityConfig = useCallback(() => {
    if (originalConfig) {
      setSecurityConfig({ ...originalConfig });
      setError('');
      console.log('Security configuration reset to original values');
    }
  }, [originalConfig]);

  const updateSecurityConfig = useCallback((updates: Partial<SecurityConfig>) => {
    if (securityConfig) {
      const updatedConfig = { ...securityConfig, ...updates };
      setSecurityConfig(updatedConfig);
      console.log('Security configuration updated:', updates);
    }
  }, [securityConfig]);

  const validateSecurityConfig = useCallback((): SecurityValidation => {
    if (!securityConfig) {
      return {
        isValid: false,
        errors: ['No security configuration loaded'],
        warnings: []
      };
    }
    
    return securityService.validateSecurityConfig(securityConfig);
  }, [securityConfig]);

  const getSecurityScore = useCallback(async (): Promise<SecurityScore> => {
    try {
      console.log('Getting security score...');
      return await securityService.getSecurityScore();
    } catch (err) {
      console.error('Error getting security score:', err);
      throw err;
    }
  }, []);

  const hasChanges = securityConfig && originalConfig 
    ? JSON.stringify(securityConfig) !== JSON.stringify(originalConfig)
    : false;

  return {
    securityConfig,
    originalConfig,
    loading,
    error,
    hasChanges,
    loadSecurityConfig,
    saveSecurityConfig,
    resetSecurityConfig,
    updateSecurityConfig,
    validateSecurityConfig,
    getSecurityScore
  };
};
