import { useState, useCallback } from 'react';
import { 
  AccessRule, 
  AccessRuleForm, 
  SecurityValidation, 
  IPPatternTestResult,
  UseAccessRulesReturn 
} from '@/types/security';
import { securityService } from '@/services/admin/securityService';

export const useAccessRules = (): UseAccessRulesReturn => {
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAccessRules = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading access rules...');
      const accessRules = await securityService.getAccessRules();
      setRules(accessRules);
      console.log('Access rules loaded successfully:', accessRules.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load access rules';
      setError(errorMessage);
      console.error('Error loading access rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccessRule = useCallback(async (rule: AccessRuleForm) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating access rule:', rule.rule_name);
      const newRule = await securityService.createAccessRule(rule);
      setRules(prevRules => [...prevRules, newRule]);
      console.log('Access rule created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create access rule';
      setError(errorMessage);
      console.error('Error creating access rule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccessRule = useCallback(async (ruleId: string, rule: Partial<AccessRuleForm>) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Updating access rule:', ruleId);
      const updatedRule = await securityService.updateAccessRule(ruleId, rule);
      setRules(prevRules => 
        prevRules.map(r => r.rule_name === ruleId ? updatedRule : r)
      );
      console.log('Access rule updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update access rule';
      setError(errorMessage);
      console.error('Error updating access rule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccessRule = useCallback(async (ruleId: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Deleting access rule:', ruleId);
      await securityService.deleteAccessRule(ruleId);
      setRules(prevRules => prevRules.filter(r => r.rule_name !== ruleId));
      console.log('Access rule deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete access rule';
      setError(errorMessage);
      console.error('Error deleting access rule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testIPPattern = useCallback(async (pattern: string): Promise<IPPatternTestResult> => {
    try {
      console.log('Testing IP pattern:', pattern);
      return await securityService.testIPPattern(pattern);
    } catch (err) {
      console.error('Error testing IP pattern:', err);
      throw err;
    }
  }, []);

  const validateAccessRule = useCallback((rule: AccessRuleForm): SecurityValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rule name validation
    if (!rule.rule_name || rule.rule_name.trim() === '') {
      errors.push('Rule name is required');
    } else if (rule.rule_name.length < 3) {
      errors.push('Rule name must be at least 3 characters long');
    }

    // IP pattern validation
    if (!rule.ip_pattern || rule.ip_pattern.trim() === '') {
      errors.push('IP pattern is required');
    }

    // Action validation
    if (!rule.action) {
      errors.push('Action is required');
    }

    // Priority validation
    if (rule.priority < 1 || rule.priority > 100) {
      errors.push('Priority must be between 1 and 100');
    }

    // Description validation
    if (rule.description && rule.description.length > 500) {
      warnings.push('Description is very long, consider shortening it');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  return {
    rules,
    loading,
    error,
    loadAccessRules,
    createAccessRule,
    updateAccessRule,
    deleteAccessRule,
    testIPPattern,
    validateAccessRule
  };
};
