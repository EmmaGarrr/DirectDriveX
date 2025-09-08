export enum UserRole {
  REGULAR = 'regular',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminToken {
  access_token: string;
  token_type: string;
  admin_role: string;
  expires_in: number;
}

export interface AdminUserInDB {
  id: string;
  email: string;
  role: UserRole;
  is_admin: boolean;
  created_at?: string;
  last_login?: string;
}

export interface AdminActivityLog {
  id?: string;
  admin_email: string;
  action: string;
  timestamp: string;
  ip_address?: string;
  endpoint?: string;
  details?: string;
}

export interface AdminActivityLogResponse {
  logs: AdminActivityLog[];
  total: number;
  limit: number;
  skip: number;
}

export interface AdminProfileResponse {
  data: AdminUserInDB;
  message: string;
}

export interface AdminCreateResponse {
  data: AdminUserInDB;
  message: string;
}

export interface AdminTokenVerification {
  valid: boolean;
  admin_email: string;
  admin_role: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface CreateAdminForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface AdminSession {
  token: string;
  adminEmail: string;
  adminRole: UserRole;
  expiresAt: Date;
}

export interface PasswordStrength {
  score: number;
  label: 'weak' | 'medium' | 'strong';
  color: string;
  text: string;
}

export interface AdminAuthError {
  message: string;
  code?: string;
  field?: string;
}

// New types for Admin Dashboard
export type SystemHealth = 'good' | 'warning' | 'critical' | 'unknown';

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

export interface SystemStats {
  totalUsers: number;
  totalFiles: number;
  totalStorage: number; // in bytes
  systemHealth: SystemHealth;
}

export interface GoogleDriveStats {
  totalAccounts: number;
  activeAccounts: number;
  totalQuota: number; // in bytes
  totalUsed: number; // in bytes
  health: SystemHealth;
}

export interface UploadActivityData {
  day: string;
  uploads: number;
}

export interface StorageDistributionData {
  googleDrive: number; // in bytes
  hetzner: number; // in bytes
}

// User Management Types

export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  files_count: number;
  storage_used: number; // in bytes
  created_at: string;
  last_login?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface UpdateUserData {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
}

export interface UserFile {
  _id: string;
  filename: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  size_bytes: number;
  size_formatted: string;
  upload_date: string;
  upload_date_formatted: string;
  status: 'completed' | 'uploading' | 'failed' | 'pending';
  file_id: string; // Unique identifier in storage systems
}

export interface UserFilesResponse {
  files: UserFile[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface StorageInsights {
  status: string;
  storage_location?: string;
  google_drive: {
    exists: boolean;
    accessible: boolean;
    details: string;
    account_id?: string;
    file_size?: number;
  };
  hetzner_storage: {
    exists: boolean;
    accessible: boolean;
    details: string;
    path?: string;
    file_size?: number;
  };
  recommendations: string[];
}

export interface ModalState {
  type: 'view' | 'edit' | 'bulk' | 'files' | 'storage' | 'confirm' | 'reset_password' | null;
  data: any;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}