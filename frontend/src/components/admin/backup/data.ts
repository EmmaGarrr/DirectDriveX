import { BackupStatus, BackupQueue, BackupFailure, FailurePattern } from "@/types/backup";

export const mockBackupStatus: BackupStatus = {
  backup_summary: {
    total_files: 15823,
    backed_up_files: 15450,
    backup_percentage: 97.6,
    in_progress: 12,
    failed: 5,
    total_backup_size: 1.2 * 1024 * 1024 * 1024 * 1024, // 1.2 TB
  },
  hetzner_status: 'connected',
};

export const mockBackupQueue: BackupQueue = {
  queue_files: [
    { id: 'q1', filename: 'project_alpha_final_v3.zip', size_bytes: 1.5 * 1024 * 1024 * 1024, upload_date: new Date().toISOString(), backup_status: 'in_progress', user_id: 'usr_abc1' },
    { id: 'q2', filename: 'marketing_video_hd.mp4', size_bytes: 2.2 * 1024 * 1024 * 1024, upload_date: new Date(Date.now() - 3600000).toISOString(), backup_status: 'pending', user_id: 'usr_def2' },
    { id: 'q3', filename: 'financials_q3_report.xlsx', size_bytes: 25 * 1024 * 1024, upload_date: new Date(Date.now() - 7200000).toISOString(), backup_status: 'pending', user_id: 'usr_ghi3' },
  ],
  total_in_queue: 12,
  page: 1,
  limit: 20,
  total_pages: 1,
};

export const mockBackupFailures: BackupFailure[] = [
  { id: 'f1', filename: 'research_data_archive.rar', size_bytes: 5.6 * 1024 * 1024 * 1024, failed_at: new Date(Date.now() - 86400000).toISOString(), backup_error: 'Checksum mismatch', user_id: 'usr_jkl4' },
  { id: 'f2', filename: 'presentation_assets.pptx', size_bytes: 300 * 1024 * 1024, failed_at: new Date(Date.now() - 2 * 86400000).toISOString(), backup_error: 'Hetzner API timeout', user_id: 'usr_mno5' },
  { id: 'f3', filename: 'client_database_dump.sql', size_bytes: 800 * 1024 * 1024, failed_at: new Date(Date.now() - 5 * 86400000).toISOString(), backup_error: 'Hetzner API timeout', user_id: 'usr_pqr6' },
  { id: 'f4', filename: 'old_project_archive.zip', size_bytes: 12 * 1024 * 1024 * 1024, failed_at: new Date(Date.now() - 40 * 86400000).toISOString(), backup_error: 'File not found in primary storage', user_id: 'usr_stu7' },
  { id: 'f5', filename: 'video_render_v12.mov', size_bytes: 22 * 1024 * 1024 * 1024, failed_at: new Date(Date.now() - 80 * 86400000).toISOString(), backup_error: 'Checksum mismatch', user_id: 'usr_vwx8' },
];

export const mockFailurePatterns: FailurePattern[] = [
    { error_type: 'Hetzner API timeout', count: 2 },
    { error_type: 'Checksum mismatch', count: 2 },
    { error_type: 'File not found in primary storage', count: 1 },
];