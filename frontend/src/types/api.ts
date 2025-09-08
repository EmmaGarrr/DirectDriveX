export interface UploadEvent {
  type: 'progress' | 'success' | 'error';
  value: number | string;
}

export interface QuotaInfo {
  daily_limit_gb: number;
  current_usage_gb: number;
  remaining_gb: number;
  usage_percentage: number;
  user_type: 'anonymous' | 'authenticated';
}

export interface UploadResponse {
  file_id: string;
  download_url: string;
  expires_at: string;
}

export interface BatchFileInfo {
  filename: string;
  size: number;
  content_type: string;
}

export interface BatchInitResponse {
  batch_id: string;
  files: Array<{
    file_id: string;
    original_filename: string;
    gdrive_upload_url: string;
  }>;
}

export interface BatchUploadResponse {
  batch_id: string;
  download_url: string;
  files: Array<{
    file_id: string;
    filename: string;
    status: 'success' | 'failed';
  }>;
}

export interface ApiError {
  detail: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  storage_quota_gb: number;
}

export interface FileTypeInfo {
  iconType: string;
  color: string;
  bgColor: string;
}
