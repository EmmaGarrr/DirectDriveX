export interface FileMeta {
  file_id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

export interface MediaInfo {
  duration?: number;
  width?: number;
  height?: number;
  has_audio?: boolean;
  format?: string;
  bitrate?: number;
  fps?: number;
  sample_rate?: number;
  channels?: number;
}

export interface StreamingUrls {
  full: string;
  preview: string;
}

export interface PreviewMeta {
  file_id: string;
  filename: string;
  content_type: string;
  preview_available: boolean;
  preview_type: 'video' | 'audio' | 'image' | 'document' | 'text' | 'thumbnail' | 'viewer' | 'unknown';
  message?: string;
  can_stream: boolean;
  suggested_action: string;
  preview_url?: string;
  // Legacy fields for backward compatibility
  size_bytes?: number;
  media_info?: MediaInfo;
  streaming_urls?: StreamingUrls;
  preview_status?: string;
}