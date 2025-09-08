"use client";

import { BatchFileMetadata } from '@/types/batch-download';
import { BatchUploadService } from '@/services/batchUploadService';
import { FileText, Download } from 'lucide-react';

const batchUploadService = new BatchUploadService();

interface FileListItemProps {
  file: BatchFileMetadata;
}

export function FileListItem({ file }: FileListItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const downloadUrl = batchUploadService.getStreamUrl(file._id);

  return (
    <div className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
      <div className="mr-4">
        <FileText className="w-8 h-8 text-bolt-cyan" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-bolt-white break-words">{file.filename}</p>
        <p className="text-sm text-bolt-cyan">{formatFileSize(file.size_bytes)}</p>
      </div>
      <a
        href={downloadUrl}
        download={file.filename}
        className="ml-4 px-3 py-1.5 bg-bolt-blue text-white font-bold text-xs rounded-md hover:bg-bolt-cyan transition-colors duration-300 shrink-0"
        aria-label={`Download ${file.filename}`}
      >
        Download
      </a>
    </div>
  );
}