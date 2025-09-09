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
    <div className="flex items-center p-4 bg-gradient-to-br from-bolt-cyan/5 to-bolt-blue/5 rounded-xl border border-bolt-cyan/20 hover:bg-gradient-to-br hover:from-bolt-cyan/10 hover:to-bolt-blue/10 transition-all duration-300">
      <div className="mr-4">
        <FileText className="w-8 h-8 text-bolt-blue" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-bolt-black break-words">{file.filename}</p>
        <p className="text-sm text-bolt-cyan font-medium">{formatFileSize(file.size_bytes)}</p>
      </div>
      <a
        href={downloadUrl}
        download={file.filename}
        className="ml-4 px-4 py-2 bg-bolt-blue text-white font-bold text-sm rounded-lg hover:bg-bolt-blue/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shrink-0"
        aria-label={`Download ${file.filename}`}
      >
        Download
      </a>
    </div>
  );
}