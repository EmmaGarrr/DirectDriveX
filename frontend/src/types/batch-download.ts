export interface BatchFileMetadata {
  _id: string;
  filename: string;
  size_bytes: number;
}

export interface BatchDetails {
  batch_id: string;
  files: BatchFileMetadata[];
  created_at: string;
  total_size_bytes: number;
}