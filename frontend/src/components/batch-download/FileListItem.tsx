"use client";

import { useState } from 'react';
import { BatchFileMetadata } from '@/types/batch-download';
import { BatchUploadService } from '@/services/batchUploadService';
import { FileText, Download, Loader2 } from 'lucide-react';

const batchUploadService = new BatchUploadService();

interface FileListItemProps {
  file: BatchFileMetadata;
}

export function FileListItem({ file }: FileListItemProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadUrl = batchUploadService.getStreamUrl(file._id);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center p-4 bg-gradient-to-br from-bolt-cyan/5 to-bolt-blue/5 rounded-xl border border-bolt-cyan/20 hover:bg-gradient-to-br hover:from-bolt-cyan/10 hover:to-bolt-blue/10 transition-all duration-300">
      <div className="mr-4">
        <FileText className="w-8 h-8 text-bolt-blue" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-bolt-black break-words">{file.filename}</p>
        <p className="text-sm text-bolt-cyan font-medium">{formatFileSize(file.size_bytes)}</p>
      </div>
      <button
        onClick={handleDownloadClick}
        disabled={isDownloading}
        className="ml-4 px-4 py-2 bg-bolt-blue text-white font-bold text-sm rounded-lg hover:bg-bolt-blue/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 flex items-center gap-2"
        aria-label={`Download ${file.filename}`}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Download..
          </>
        ) : (
          'Download'
        )}
      </button>
    </div>
  );
}