import { SecurityConfig, AccessRule, PasswordPolicy, SessionManagement } from "@/types/security";

export const mockSecurityConfig: SecurityConfig = {
  session_timeout_minutes: 60,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  require_strong_passwords: true,
  enable_two_factor_auth: true,
  allowed_cors_origins: ['https://app.mfcnextgen.com', 'http://localhost:4200'],
  enable_api_rate_limiting: true,
};

export const mockAccessRules: AccessRule[] = [
  {
    rule_name: 'Allow Office Network',
    ip_pattern: '192.168.1.0/24',
    action: 'allow',
    description: 'Main office IP range',
    priority: 1,
    is_active: true,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
  },
  {
    rule_name: 'Deny Malicious Actor',
    ip_pattern: '103.22.14.5',
    action: 'deny',
    description: 'Known malicious IP from threat intel',
    priority: 2,
    is_active: true,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
  },
  {
    rule_name: 'Rate Limit Staging API',
    ip_pattern: '10.0.0.0/8',
    action: 'rate_limit',
    description: 'Internal staging network',
    priority: 10,
    is_active: false,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
  },
];

export const mockPasswordPolicy: PasswordPolicy = {
  min_length: 12,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_special_chars: true,
  password_history_count: 5,
  password_expiry_days: 90,
};

export const mockSessionManagement: SessionManagement = {
  total_active: 2,
  active_sessions: [
    {
      session_id: 'sess_abc123',
      admin_email: 'super@admin.com',
      ip_address: '73.125.88.10',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      login_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      last_activity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      session_id: 'sess_def456',
      admin_email: 'ops@admin.com',
      ip_address: '203.0.113.42',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      login_time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};