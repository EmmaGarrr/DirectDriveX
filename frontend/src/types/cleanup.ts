export interface CleanupResult {
  message: string;
  mode: 'soft' | 'hard';
  files_marked_deleted: number;
  files_hard_deleted: number;
  batches_deleted: number;
  gdrive: {
    summary: { deleted: number; errors: number };
    per_account: Record<string, { deleted: number; errors: number; message?: string }>;
  };
}