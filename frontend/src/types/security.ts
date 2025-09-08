// Security Types - Complete Angular Parity
export interface SecurityConfig {
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  require_strong_passwords: boolean;
  enable_two_factor_auth: boolean;
  allowed_cors_origins: string[];
  enable_api_rate_limiting: boolean;
}

export interface AccessRule {
  rule_name: string;
  ip_pattern: string;
  action: 'allow' | 'deny' | 'rate_limit';
  description: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  last_modified: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history_count: number;
  password_expiry_days: number;
}

export interface SessionManagement {
  active_sessions: Array<{
    admin_email: string;
    ip_address: string;
    user_agent: string;
    login_time: string;
    last_activity: string;
    session_id: string;
  }>;
  total_active: number;
}

export interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'failed_login' | 'session_created' | 'session_terminated' | 'config_changed' | 'access_denied';
  admin_email?: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface SecurityScore {
  overall_score: number;
  authentication_score: number;
  access_control_score: number;
  session_management_score: number;
  password_policy_score: number;
  recommendations: string[];
  last_updated: string;
}

export interface PasswordTestResult {
  isValid: boolean;
  violations: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

export interface IPPatternTestResult {
  isValid: boolean;
  type: 'ipv4' | 'ipv6' | 'cidr' | 'invalid';
  conflicts: string[];
  description: string;
}

// API Response Types
export interface SecurityConfigResponse {
  data: SecurityConfig;
  message: string;
}

export interface AccessRulesResponse {
  rules: AccessRule[];
  total: number;
}

export interface PasswordPolicyResponse {
  data: PasswordPolicy;
  message: string;
}

export interface SessionManagementResponse {
  data: SessionManagement;
  message: string;
}

export interface SecurityEventsResponse {
  events: SecurityEvent[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface SecurityConfigForm extends SecurityConfig {
  // Add any form-specific properties
}

export interface AccessRuleForm {
  rule_name: string;
  ip_pattern: string;
  action: 'allow' | 'deny' | 'rate_limit';
  description: string;
  priority: number;
  is_active: boolean;
}

export interface PasswordPolicyForm extends PasswordPolicy {
  // Add any form-specific properties
}

// Validation Types
export interface SecurityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CORSValidation {
  isValid: boolean;
  invalid_origins: string[];
  valid_origins: string[];
}

// Real-time Event Types
export interface SecurityEventPayload {
  event_type: string;
  data: any;
  timestamp: string;
  severity: string;
}

// Hook Return Types
export interface UseSecuritySettingsReturn {
  securityConfig: SecurityConfig | null;
  originalConfig: SecurityConfig | null;
  loading: boolean;
  error: string;
  hasChanges: boolean;
  loadSecurityConfig: () => Promise<void>;
  saveSecurityConfig: () => Promise<void>;
  resetSecurityConfig: () => void;
  updateSecurityConfig: (config: Partial<SecurityConfig>) => void;
  validateSecurityConfig: () => SecurityValidation;
  getSecurityScore: () => Promise<SecurityScore>;
}

export interface UseAccessRulesReturn {
  rules: AccessRule[];
  loading: boolean;
  error: string;
  loadAccessRules: () => Promise<void>;
  createAccessRule: (rule: AccessRuleForm) => Promise<void>;
  updateAccessRule: (ruleId: string, rule: Partial<AccessRuleForm>) => Promise<void>;
  deleteAccessRule: (ruleId: string) => Promise<void>;
  testIPPattern: (pattern: string) => Promise<IPPatternTestResult>;
  validateAccessRule: (rule: AccessRuleForm) => SecurityValidation;
}

export interface UsePasswordPolicyReturn {
  passwordPolicy: PasswordPolicy | null;
  originalPolicy: PasswordPolicy | null;
  loading: boolean;
  error: string;
  hasChanges: boolean;
  loadPasswordPolicy: () => Promise<void>;
  savePasswordPolicy: () => Promise<void>;
  resetPasswordPolicy: () => void;
  updatePasswordPolicy: (policy: Partial<PasswordPolicy>) => void;
  testPassword: (password: string) => Promise<PasswordTestResult>;
  validatePasswordPolicy: () => SecurityValidation;
}

export interface UseActiveSessionsReturn {
  sessionManagement: SessionManagement | null;
  loading: boolean;
  error: string;
  loadActiveSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export interface UseSecurityEventsReturn {
  events: SecurityEvent[];
  loading: boolean;
  error: string;
  loadSecurityEvents: (filters?: any) => Promise<void>;
  markEventResolved: (eventId: string) => Promise<void>;
  getSecurityAlerts: () => SecurityEvent[];
}