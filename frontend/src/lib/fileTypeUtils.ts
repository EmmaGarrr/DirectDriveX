import { FileType } from '@/types/hetzner';

/**
 * Enhanced file type detection matching Angular implementation
 * Falls back through multiple detection methods
 */
export const getEnhancedFileType = (file: any): FileType => {
  // First: Use existing file_type if available and not 'unknown' or 'other'
  if (file.file_type && file.file_type !== 'unknown' && file.file_type !== 'other') {
    return file.file_type;
  }
  
  // Second: Fallback to content type detection
  if (file.content_type) {
    const contentType = file.content_type.toLowerCase();
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.includes('pdf') || contentType.includes('document') || contentType.includes('text/')) return 'document';
    if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('compressed')) return 'archive';
  }
  
  // Third: Fallback to filename extension
  const filename = file.filename || '';
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension) {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'jfif', 'pjpeg', 'pjp'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'mpeg', 'mpg', 'm2v'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff', 'au', 'ra'];
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pages', 'numbers', 'key'];
    const archiveExts = ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz', 'tar.gz', 'tar.bz2', 'tar.xz', 'cab', 'iso'];
    
    if (imageExts.includes(extension)) return 'image';
    if (videoExts.includes(extension)) return 'video';
    if (audioExts.includes(extension)) return 'audio';
    if (documentExts.includes(extension)) return 'document';
    if (archiveExts.includes(extension)) return 'archive';
  }
  
  // Fourth: Check filename patterns for common file types
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('screenshot') || lowerFilename.includes('photo') || lowerFilename.includes('image')) {
    return 'image';
  }
  if (lowerFilename.includes('video') || lowerFilename.includes('movie') || lowerFilename.includes('clip')) {
    return 'video';
  }
  if (lowerFilename.includes('audio') || lowerFilename.includes('music') || lowerFilename.includes('sound')) {
    return 'audio';
  }
  if (lowerFilename.includes('document') || lowerFilename.includes('report') || lowerFilename.includes('text')) {
    return 'document';
  }
  if (lowerFilename.includes('archive') || lowerFilename.includes('backup') || lowerFilename.includes('compressed')) {
    return 'archive';
  }
  
  // Default fallback
  return 'other';
};

/**
 * Get file type icon based on enhanced detection
 */
export const getFileTypeIcon = (file: any) => {
  const fileType = getEnhancedFileType(file);
  
  const iconMap = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    other: '📁'
  };
  
  return iconMap[fileType] || iconMap.other;
};

/**
 * Get file type color class based on enhanced detection
 */
export const getFileTypeColor = (file: any) => {
  const fileType = getEnhancedFileType(file);
  
  const colorMap = {
    image: 'text-emerald-600',
    video: 'text-purple-600',
    audio: 'text-amber-600',
    document: 'text-blue-600',
    archive: 'text-red-600',
    other: 'text-slate-600'
  };
  
  return colorMap[fileType] || colorMap.other;
};
