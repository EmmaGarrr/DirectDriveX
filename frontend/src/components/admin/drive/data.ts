import { DriveFileItem, DriveStats, FileTypeAnalytics, FileType, BackupStatus } from "@/types/drive";

export const mockDriveStats: DriveStats = {
  total_files: 12345,
  total_storage: 15.2 * 1024 * 1024 * 1024 * 1024, // 15.2 TB
  total_storage_formatted: "15.2 TB",
  transferring_to_hetzner: 123,
  backed_up_to_hetzner: 11234,
  failed_backups: 45,
};

export const mockFileTypeAnalytics: FileTypeAnalytics = {
  file_types: [
    { _id: 'image', count: 4500, total_size: 5.3 * 1024 * 1024 * 1024 * 1024, percentage: 36.5, size_formatted: '5.3 TB' },
    { _id: 'video', count: 2000, total_size: 8.2 * 1024 * 1024 * 1024 * 1024, percentage: 16.2, size_formatted: '8.2 TB' },
    { _id: 'document', count: 3000, total_size: 0.7 * 1024 * 1024 * 1024 * 1024, percentage: 24.3, size_formatted: '0.7 TB' },
    { _id: 'archive', count: 1845, total_size: 1.0 * 1024 * 1024 * 1024 * 1024, percentage: 14.9, size_formatted: '1.0 TB' },
    { _id: 'audio', count: 1000, total_size: 0.5 * 1024 * 1024 * 1024 * 1024, percentage: 8.1, size_formatted: '0.5 TB' },
  ],
  total_files: 12345,
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const mockFiles: DriveFileItem[] = Array.from({ length: 50 }, (_, i) => {
  const fileTypes: FileType[] = ['image', 'video', 'document', 'archive', 'audio', 'other'];
  const backupStatuses: BackupStatus[] = ['none', 'in_progress', 'completed', 'failed'];
  const fileType = fileTypes[i % fileTypes.length];
  const sizeBytes = Math.random() * 1024 * 1024 * 1024 * 5; // up to 5GB
  return {
    _id: `file_${i}`,
    filename: `project_file_${i}.${fileType === 'image' ? 'jpg' : 'zip'}`,
    size_bytes: sizeBytes,
    size_formatted: formatBytes(sizeBytes),
    content_type: 'application/octet-stream',
    file_type: fileType,
    upload_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    owner_email: `user${i % 5}@example.com`,
    gdrive_account_id: `account_${i % 3}`,
    backup_status: backupStatuses[i % backupStatuses.length],
    download_url: '#',
    preview_available: Math.random() > 0.5,
  };
});