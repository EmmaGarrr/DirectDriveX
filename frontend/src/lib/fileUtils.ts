import { FileTypeInfo } from '@/types/api';

export const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeInfo = (filename: string): FileTypeInfo => {
  if (!filename) return { iconType: 'file', color: 'text-gray-500', bgColor: 'bg-gray-100' };
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
    return { iconType: 'image', color: 'text-blue-500', bgColor: 'bg-blue-50' };
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension || '')) {
    return { iconType: 'video', color: 'text-red-500', bgColor: 'bg-red-50' };
  }
  
  // Audio files
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension || '')) {
    return { iconType: 'audio', color: 'text-green-500', bgColor: 'bg-green-50' };
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
    return { iconType: 'document', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return { iconType: 'archive', color: 'text-purple-500', bgColor: 'bg-purple-50' };
  }
  
  // Code files
  if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension || '')) {
    return { iconType: 'code', color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
  }
  
  // Default
  return { iconType: 'file', color: 'text-gray-500', bgColor: 'bg-gray-50' };
};

export const validateFileSize = (file: File, isAuthenticated: boolean): boolean => {
  const maxSize = isAuthenticated ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024; // 5GB vs 2GB
  
  if (file.size > maxSize) {
    const limitText = isAuthenticated ? '5GB' : '2GB';
    return false;
  }
  return true;
};

export const validateBatchFiles = (files: File[], isAuthenticated: boolean): boolean => {
  const maxSize = isAuthenticated ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
  
  // Check individual files
  for (const file of files) {
    if (file.size > maxSize) {
      return false;
    }
  }
  
  // Check total batch size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxSize) {
    return false;
  }
  
  return true;
};

export const validateFileCount = (files: File[]): boolean => {
  const maxFiles = 5;
  return files.length <= maxFiles;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
};
