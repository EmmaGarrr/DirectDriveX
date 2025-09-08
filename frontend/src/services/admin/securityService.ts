import { 
  SecurityConfig, 
  AccessRule, 
  PasswordPolicy, 
  SessionManagement,
  SecurityEvent,
  SecurityScore,
  PasswordTestResult,
  IPPatternTestResult,
  SecurityValidation,
  CORSValidation,
  SecurityConfigResponse,
  AccessRulesResponse,
  PasswordPolicyResponse,
  SessionManagementResponse,
  SecurityEventsResponse,
  AccessRuleForm
} from '@/types/security';
import { adminAuthService } from '../adminAuthService';
import { toastService } from '../toastService';
import { activityLogsService } from './activityLogsService';

class SecurityService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  
  // API Endpoints
  private readonly ENDPOINTS = {
    SECURITY_CONFIG: '/api/v1/admin/config/security',
    ACCESS_RULES: '/api/v1/admin/security/access-rules',
    PASSWORD_POLICY: '/api/v1/admin/security/password-policy',
    ACTIVE_SESSIONS: '/api/v1/admin/security/session-management',
    SECURITY_EVENTS: '/api/v1/admin/security/events',
    SECURITY_SCORE: '/api/v1/admin/security/score',
    PASSWORD_TEST: '/api/v1/admin/security/test-password',
    IP_PATTERN_TEST: '/api/v1/admin/security/test-ip-pattern'
  };

  constructor() {
    console.log('SecurityService initialized with API URL:', this.API_URL);
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    try {
      const token = adminAuthService.getAdminToken();
      if (!token) {
        console.warn('No admin token found for security operations');
        return { 'Content-Type': 'application/json' };
      }
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.warn('Error getting auth headers for security operations:', error);
      return { 'Content-Type': 'application/json' };
    }
  }

  /**
   * SECURITY CONFIGURATION METHODS
   */
  async getSecurityConfig(): Promise<SecurityConfig> {
    try {
      console.log('Fetching security configuration...');

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.SECURITY_CONFIG}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Security config API endpoint not available, using default config');
          return this.getDefaultSecurityConfig();
        }
        throw new Error(`Security config API error: ${response.status}`);
      }

      const data: SecurityConfigResponse = await response.json();
      console.log('Security configuration loaded successfully');
      return data.data;
    } catch (error) {
      console.warn('Failed to load security configuration, using default:', error);
      return this.getDefaultSecurityConfig();
    }
  }

  async updateSecurityConfig(config: SecurityConfig): Promise<void> {
    try {
      console.log('Updating security configuration...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Security config update simulated');
        toastService.success('Demo mode - Security configuration updated successfully');
        await activityLogsService.logActivity({
          action: 'security_config_updated',
          details: 'Demo mode - Security configuration updated',
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.SECURITY_CONFIG}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Security config API endpoint not available, logging locally');
          toastService.success('Security configuration updated (demo mode)');
          await activityLogsService.logActivity({
            action: 'security_config_updated',
            details: 'Security configuration updated (API unavailable)',
            category: 'security'
          } as any);
          return;
        }
        throw new Error(`Security config update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Security configuration updated successfully');
      toastService.success('Security configuration updated successfully');
      
      await activityLogsService.logActivity({
        action: 'security_config_updated',
        details: 'Security configuration updated successfully',
        category: 'security'
      } as any);
    } catch (error) {
      console.error('Error updating security configuration:', error);
      toastService.error('Failed to update security configuration');
      throw error;
    }
  }

  /**
   * ACCESS RULES METHODS
   */
  async getAccessRules(): Promise<AccessRule[]> {
    try {
      console.log('Fetching access rules...');

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACCESS_RULES}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Access rules API endpoint not available, using empty list');
          return [];
        }
        throw new Error(`Access rules API error: ${response.status}`);
      }

      const data: AccessRulesResponse = await response.json();
      console.log('Access rules loaded successfully:', data.rules.length);
      return data.rules;
    } catch (error) {
      console.warn('Failed to load access rules, using empty list:', error);
      return [];
    }
  }

  async createAccessRule(rule: AccessRuleForm): Promise<AccessRule> {
    try {
      console.log('Creating access rule:', rule.rule_name);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Access rule creation simulated');
        const demoRule: AccessRule = {
          ...rule,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        };
        toastService.success('Demo mode - Access rule created successfully');
        await activityLogsService.logActivity({
          action: 'access_rule_created',
          details: `Demo mode - Access rule "${rule.rule_name}" created`,
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return demoRule;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACCESS_RULES}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(rule)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Access rules API endpoint not available, logging locally');
          const demoRule: AccessRule = {
            ...rule,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString()
          };
          toastService.success('Access rule created (demo mode)');
          await activityLogsService.logActivity({
            action: 'access_rule_created',
            details: `Access rule "${rule.rule_name}" created (API unavailable)`,
            category: 'security'
          } as any);
          return demoRule;
        }
        throw new Error(`Access rule creation failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Access rule created successfully');
      toastService.success('Access rule created successfully');
      
      await activityLogsService.logActivity({
        action: 'access_rule_created',
        details: `Access rule "${rule.rule_name}" created successfully`,
        category: 'security'
      } as any);
      
      return result.data;
    } catch (error) {
      console.error('Error creating access rule:', error);
      toastService.error('Failed to create access rule');
      throw error;
    }
  }

  async updateAccessRule(ruleId: string, rule: Partial<AccessRuleForm>): Promise<AccessRule> {
    try {
      console.log('Updating access rule:', ruleId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Access rule update simulated');
        const demoRule: AccessRule = {
          rule_name: ruleId,
          ip_pattern: rule.ip_pattern || '',
          action: rule.action || 'allow',
          description: rule.description || '',
          priority: rule.priority || 1,
          is_active: rule.is_active ?? true,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        };
        toastService.success('Demo mode - Access rule updated successfully');
        await activityLogsService.logActivity({
          action: 'access_rule_updated',
          details: `Demo mode - Access rule "${ruleId}" updated`,
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return demoRule;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACCESS_RULES}/${ruleId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(rule)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Access rules API endpoint not available, logging locally');
          const demoRule: AccessRule = {
            rule_name: ruleId,
            ip_pattern: rule.ip_pattern || '',
            action: rule.action || 'allow',
            description: rule.description || '',
            priority: rule.priority || 1,
            is_active: rule.is_active ?? true,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString()
          };
          toastService.success('Access rule updated (demo mode)');
          await activityLogsService.logActivity({
            action: 'access_rule_updated',
            details: `Access rule "${ruleId}" updated (API unavailable)`,
            category: 'security'
          } as any);
          return demoRule;
        }
        throw new Error(`Access rule update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Access rule updated successfully');
      toastService.success('Access rule updated successfully');
      
      await activityLogsService.logActivity({
        action: 'access_rule_updated',
        details: `Access rule "${ruleId}" updated successfully`,
        category: 'security'
      } as any);
      
      return result.data;
    } catch (error) {
      console.error('Error updating access rule:', error);
      toastService.error('Failed to update access rule');
      throw error;
    }
  }

  async deleteAccessRule(ruleId: string): Promise<void> {
    try {
      console.log('Deleting access rule:', ruleId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Access rule deletion simulated');
        toastService.success('Demo mode - Access rule deleted successfully');
        await activityLogsService.logActivity({
          action: 'access_rule_deleted',
          details: `Demo mode - Access rule "${ruleId}" deleted`,
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACCESS_RULES}/${ruleId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Access rules API endpoint not available, logging locally');
          toastService.success('Access rule deleted (demo mode)');
          await activityLogsService.logActivity({
            action: 'access_rule_deleted',
            details: `Access rule "${ruleId}" deleted (API unavailable)`,
            category: 'security'
          } as any);
          return;
        }
        throw new Error(`Access rule deletion failed: ${response.status}`);
      }

      console.log('Access rule deleted successfully');
      toastService.success('Access rule deleted successfully');
      
      await activityLogsService.logActivity({
        action: 'access_rule_deleted',
        details: `Access rule "${ruleId}" deleted successfully`,
        category: 'security'
      } as any);
    } catch (error) {
      console.error('Error deleting access rule:', error);
      toastService.error('Failed to delete access rule');
      throw error;
    }
  }

  /**
   * PASSWORD POLICY METHODS
   */
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      console.log('Fetching password policy...');

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.PASSWORD_POLICY}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Password policy API endpoint not available, using default policy');
          return this.getDefaultPasswordPolicy();
        }
        throw new Error(`Password policy API error: ${response.status}`);
      }

      const data: PasswordPolicyResponse = await response.json();
      console.log('Password policy loaded successfully');
      return data.data;
    } catch (error) {
      console.warn('Failed to load password policy, using default:', error);
      return this.getDefaultPasswordPolicy();
    }
  }

  async updatePasswordPolicy(policy: PasswordPolicy): Promise<void> {
    try {
      console.log('Updating password policy...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Password policy update simulated');
        toastService.success('Demo mode - Password policy updated successfully');
        await activityLogsService.logActivity({
          action: 'password_policy_updated',
          details: 'Demo mode - Password policy updated',
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.PASSWORD_POLICY}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(policy)
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Password policy API endpoint not available, logging locally');
          toastService.success('Password policy updated (demo mode)');
          await activityLogsService.logActivity({
            action: 'password_policy_updated',
            details: 'Password policy updated (API unavailable)',
            category: 'security'
          } as any);
          return;
        }
        throw new Error(`Password policy update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Password policy updated successfully');
      toastService.success('Password policy updated successfully');
      
      await activityLogsService.logActivity({
        action: 'password_policy_updated',
        details: 'Password policy updated successfully',
        category: 'security'
      } as any);
    } catch (error) {
      console.error('Error updating password policy:', error);
      toastService.error('Failed to update password policy');
      throw error;
    }
  }

  /**
   * SESSION MANAGEMENT METHODS
   */
  async getActiveSessions(): Promise<SessionManagement> {
    try {
      console.log('Fetching active sessions...');

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACTIVE_SESSIONS}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Active sessions API endpoint not available, using empty sessions');
          return this.getDefaultSessionManagement();
        }
        throw new Error(`Active sessions API error: ${response.status}`);
      }

      const data: SessionManagementResponse = await response.json();
      console.log('Active sessions loaded successfully:', data.data.total_active);
      return data.data;
    } catch (error) {
      console.warn('Failed to load active sessions, using default:', error);
      return this.getDefaultSessionManagement();
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      console.log('Terminating session:', sessionId);
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: Session termination simulated');
        toastService.success('Demo mode - Session terminated successfully');
        await activityLogsService.logActivity({
          action: 'session_terminated',
          details: `Demo mode - Session "${sessionId}" terminated`,
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACTIVE_SESSIONS}/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Session termination API endpoint not available, logging locally');
          toastService.success('Session terminated (demo mode)');
          await activityLogsService.logActivity({
            action: 'session_terminated',
            details: `Session "${sessionId}" terminated (API unavailable)`,
            category: 'security'
          } as any);
          return;
        }
        throw new Error(`Session termination failed: ${response.status}`);
      }

      console.log('Session terminated successfully');
      toastService.success('Session terminated successfully');
      
      await activityLogsService.logActivity({
        action: 'session_terminated',
        details: `Session "${sessionId}" terminated successfully`,
        category: 'security'
      } as any);
    } catch (error) {
      console.error('Error terminating session:', error);
      toastService.error('Failed to terminate session');
      throw error;
    }
  }

  async terminateAllSessions(): Promise<void> {
    try {
      console.log('Terminating all sessions...');
      
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log('Demo mode: All sessions termination simulated');
        toastService.success('Demo mode - All sessions terminated successfully');
        await activityLogsService.logActivity({
          action: 'all_sessions_terminated',
          details: 'Demo mode - All sessions terminated',
          category: 'security',
          admin_id: 'demo_admin'
        } as any);
        return;
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.ACTIVE_SESSIONS}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Session termination API endpoint not available, logging locally');
          toastService.success('All sessions terminated (demo mode)');
          await activityLogsService.logActivity({
            action: 'all_sessions_terminated',
            details: 'All sessions terminated (API unavailable)',
            category: 'security'
          } as any);
          return;
        }
        throw new Error(`All sessions termination failed: ${response.status}`);
      }

      console.log('All sessions terminated successfully');
      toastService.success('All sessions terminated successfully');
      
      await activityLogsService.logActivity({
        action: 'all_sessions_terminated',
        details: 'All sessions terminated successfully',
        category: 'security'
      } as any);
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toastService.error('Failed to terminate all sessions');
      throw error;
    }
  }

  /**
   * SECURITY EVENTS METHODS
   */
  async getSecurityEvents(filters?: any): Promise<SecurityEvent[]> {
    try {
      console.log('Fetching security events...');

      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.SECURITY_EVENTS}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Security events API endpoint not available, using empty list');
          return [];
        }
        throw new Error(`Security events API error: ${response.status}`);
      }

      const data: SecurityEventsResponse = await response.json();
      console.log('Security events loaded successfully:', data.events.length);
      return data.events;
    } catch (error) {
      console.warn('Failed to load security events, using empty list:', error);
      return [];
    }
  }

  /**
   * SECURITY SCORE METHODS
   */
  async getSecurityScore(): Promise<SecurityScore> {
    try {
      console.log('Calculating security score...');

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.SECURITY_SCORE}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Security score API endpoint not available, using default score');
          return this.getDefaultSecurityScore();
        }
        throw new Error(`Security score API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Security score calculated successfully');
      return data.data;
    } catch (error) {
      console.warn('Failed to calculate security score, using default:', error);
      return this.getDefaultSecurityScore();
    }
  }

  /**
   * PASSWORD TESTING METHODS
   */
  async testPassword(password: string): Promise<PasswordTestResult> {
    try {
      console.log('Testing password strength...');
      
      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.PASSWORD_TEST}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Password test API endpoint not available, using local validation');
          return this.testPasswordLocally(password);
        }
        throw new Error(`Password test API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Password test completed successfully');
      return data.data;
    } catch (error) {
      console.warn('Failed to test password via API, using local validation:', error);
      return this.testPasswordLocally(password);
    }
  }

  /**
   * IP PATTERN TESTING METHODS
   */
  async testIPPattern(pattern: string): Promise<IPPatternTestResult> {
    try {
      console.log('Testing IP pattern:', pattern);

      const response = await fetch(`${this.API_URL}${this.ENDPOINTS.IP_PATTERN_TEST}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ pattern })
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('IP pattern test API endpoint not available, using local validation');
          return this.testIPPatternLocally(pattern);
        }
        throw new Error(`IP pattern test API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('IP pattern test completed successfully');
      return data.data;
    } catch (error) {
      console.warn('Failed to test IP pattern via API, using local validation:', error);
      return this.testIPPatternLocally(pattern);
    }
  }

  /**
   * VALIDATION METHODS
   */
  validateSecurityConfig(config: SecurityConfig): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Session timeout validation
    if (config.session_timeout_minutes < 5) {
      errors.push('Session timeout must be at least 5 minutes');
    } else if (config.session_timeout_minutes > 10080) {
      errors.push('Session timeout cannot exceed 1 week (10080 minutes)');
    }

    // Login attempts validation
    if (config.max_login_attempts < 1) {
      errors.push('Maximum login attempts must be at least 1');
    } else if (config.max_login_attempts > 100) {
      warnings.push('Maximum login attempts is very high, consider reducing for security');
    }

    // Lockout duration validation
    if (config.lockout_duration_minutes < 1) {
      errors.push('Lockout duration must be at least 1 minute');
    } else if (config.lockout_duration_minutes > 1440) {
      warnings.push('Lockout duration is very long, consider reducing for better user experience');
    }

    // CORS origins validation
    const corsValidation = this.validateCORSOrigins(config.allowed_cors_origins);
    if (!corsValidation.isValid) {
      errors.push(`Invalid CORS origins: ${corsValidation.invalid_origins.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateCORSOrigins(origins: string[]): CORSValidation {
    const validOrigins: string[] = [];
    const invalidOrigins: string[] = [];

    origins.forEach(origin => {
      if (origin.trim() === '') return; // Skip empty origins
      
      try {
        new URL(origin);
        validOrigins.push(origin);
      } catch {
        invalidOrigins.push(origin);
      }
    });

    return {
      isValid: invalidOrigins.length === 0,
      invalid_origins: invalidOrigins,
      valid_origins: validOrigins
    };
  }

  /**
   * DEFAULT DATA METHODS
   */
  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      session_timeout_minutes: 60,
      max_login_attempts: 5,
      lockout_duration_minutes: 30,
      require_strong_passwords: true,
      enable_two_factor_auth: false,
      allowed_cors_origins: ['http://localhost:3000', 'http://localhost:4200'],
      enable_api_rate_limiting: true
    };
  }

  private getDefaultPasswordPolicy(): PasswordPolicy {
    return {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special_chars: true,
      password_history_count: 5,
      password_expiry_days: 90
    };
  }

  private getDefaultSessionManagement(): SessionManagement {
    return {
      active_sessions: [],
      total_active: 0
    };
  }

  private getDefaultSecurityScore(): SecurityScore {
    return {
      overall_score: 75,
      authentication_score: 80,
      access_control_score: 70,
      session_management_score: 75,
      password_policy_score: 80,
      recommendations: [
        'Enable two-factor authentication',
        'Review and update access rules',
        'Implement stronger password requirements'
      ],
      last_updated: new Date().toISOString()
    };
  }

  private testPasswordLocally(password: string): PasswordTestResult {
    const violations: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      violations.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      violations.push('Password must contain at least one uppercase letter');
    } else {
      score += 20;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      violations.push('Password must contain at least one lowercase letter');
    } else {
      score += 20;
    }

    // Number check
    if (!/\d/.test(password)) {
      violations.push('Password must contain at least one number');
    } else {
      score += 20;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      violations.push('Password must contain at least one special character');
    } else {
      score += 20;
    }

    let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (score < 40) strength = 'weak';
    else if (score < 60) strength = 'medium';
    else if (score < 80) strength = 'strong';
    else strength = 'very_strong';

    return {
      isValid: violations.length === 0,
      violations,
      strength,
      score
    };
  }

  private testIPPatternLocally(pattern: string): IPPatternTestResult {
    // Basic IP pattern validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

    if (ipv4Regex.test(pattern)) {
      return {
        isValid: true,
        type: 'ipv4',
        conflicts: [],
        description: 'Valid IPv4 address'
      };
    } else if (ipv6Regex.test(pattern)) {
      return {
        isValid: true,
        type: 'ipv6',
        conflicts: [],
        description: 'Valid IPv6 address'
      };
    } else if (cidrRegex.test(pattern)) {
      return {
        isValid: true,
        type: 'cidr',
        conflicts: [],
        description: 'Valid CIDR notation'
      };
    } else {
      return {
        isValid: false,
        type: 'invalid',
        conflicts: [],
        description: 'Invalid IP pattern format'
      };
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService();
export default securityService;
