export type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error' | 'cancelled';

export type BatchUploadState = 'idle' | 'selected' | 'processing' | 'success' | 'error' | 'cancelled';

export interface FileState {
  id: string;
  file: File;
  state: 'pending' | 'uploading' | 'cancelling' | 'success' | 'error' | 'cancelled';
  progress: number;
  error?: string;
}