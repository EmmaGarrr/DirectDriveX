export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
export type BackupStatus = 'none' | 'in_progress' | 'completed' | 'failed';

export interface DriveFileItem {
  _id: string;
  filename?: string;
  size_bytes?: number;
  size_formatted?: string;
  content_type?: string;
  file_type?: FileType;
  upload_date?: string;
  owner_email?: string;
  status?: string;
  storage_location?: string;
  backup_status?: BackupStatus;
  gdrive_account_id?: string;
  download_url?: string;
  preview_available?: boolean;
}

export interface DriveStats {
  total_files: number;
  total_storage: number;
  total_storage_formatted: string;
  transferring_to_hetzner: number;
  backed_up_to_hetzner: number;
  failed_backups: number;
}

export interface FileTypeAnalyticsItem {
  _id: string;
  count: number;
  total_size: number;
  percentage: number;
  size_formatted: string;
}

export interface FileTypeAnalytics {
  file_types: FileTypeAnalyticsItem[];
  total_files: number;
  backup_distribution: { [key: string]: number };
  account_distribution: {
    account_id: string;
    count: number;
    total_size: number;
    size_formatted: string;
  }[];
}

export interface DriveFileListResponse {
  files: DriveFileItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  drive_stats: DriveStats;
}