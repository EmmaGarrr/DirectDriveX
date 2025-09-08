import { FileItem, StorageStats, FileTypeAnalytics, FileType, FileStatus, StorageLocation } from "@/types/file-browser";

export const mockStorageStats: StorageStats = {
  total_files: 1234,
  total_storage: 45.2 * 1024 * 1024 * 1024, // 45.2 GB
  total_storage_formatted: "45.2 GB",
  average_file_size: 36.7 * 1024 * 1024, // 36.7 MB
  gdrive_files: 890,
  hetzner_files: 344,
};

export const mockFileTypeAnalytics: FileTypeAnalytics = {
  file_types: [
    { _id: 'image', count: 450, total_size: 12.3 * 1024 * 1024 * 1024, percentage: 36.5, size_formatted: '12.3 GB' },
    { _id: 'document', count: 300, total_size: 8.7 * 1024 * 1024 * 1024, percentage: 24.3, size_formatted: '8.7 GB' },
    { _id: 'video', count: 200, total_size: 18.2 * 1024 * 1024 * 1024, percentage: 16.2, size_formatted: '18.2 GB' },
    { _id: 'archive', count: 184, total_size: 4.5 * 1024 * 1024 * 1024, percentage: 14.9, size_formatted: '4.5 GB' },
    { _id: 'audio', count: 100, total_size: 1.5 * 1024 * 1024 * 1024, percentage: 8.1, size_formatted: '1.5 GB' }
  ],
  total_files: 1234
};

export const mockFiles: FileItem[] = Array.from({ length: 1234 }, (_, i) => {
  const types: FileType[] = ['image', 'video', 'document', 'archive', 'audio', 'other'];
  const statuses: FileStatus[] = ['completed', 'pending', 'uploading', 'failed', 'deleted', 'quarantined'];
  const storages: StorageLocation[] = ['gdrive', 'hetzner'];
  const owners = ['user@company.com', 'admin@company.com', 'guest@visitor.com', 'service-account@api.com'];
  const extensions = {
    image: 'jpg', video: 'mp4', document: 'pdf', archive: 'zip', audio: 'mp3', other: 'dat'
  };

  const fileType = types[i % types.length];
  const date = new Date(Date.now() - i * 3600000 * Math.random());
  const sizeBytes = Math.floor(Math.random() * 1024 * 1024 * 100); // up to 100MB

  return {
    _id: `file_${i + 1}`,
    filename: `document_${i + 1}_${date.toISOString().split('T')[0]}.${extensions[fileType]}`,
    size_bytes: sizeBytes,
    size_formatted: formatBytes(sizeBytes),
    content_type: getContentType(fileType),
    file_type: fileType,
    upload_date: date.toISOString(),
    owner_email: owners[i % owners.length],
    status: statuses[i % statuses.length],
    storage_location: storages[i % storages.length],
    download_url: `/api/files/${i + 1}/download`,
    preview_available: Math.random() > 0.3,
    version: Math.floor(Math.random() * 3) + 1,
  };
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getContentType(fileType: FileType): string {
  const contentTypes = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    archive: 'application/zip',
    audio: 'audio/mpeg',
    other: 'application/octet-stream'
  };
  return contentTypes[fileType];
}