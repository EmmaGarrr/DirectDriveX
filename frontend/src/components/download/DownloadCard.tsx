"use client";

import { useState, useEffect } from 'react';
import { FileMeta, PreviewMeta } from '@/types/download';
import { FilePreview } from './FilePreview';
import { fileService } from '@/services/fileService';
import { analyticsService } from '@/services/analyticsService';
import { Download, Eye, X, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadCardProps {
  fileMeta: FileMeta;
  previewMeta: PreviewMeta;
}

export function DownloadCard({ fileMeta, previewMeta }: DownloadCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Handle both file_id and _id field names from backend
  const fileId = fileMeta.file_id || (fileMeta as any)._id;
  const downloadUrl = fileId ? fileService.getDownloadUrl(fileId) : '#';


  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackPreviewToggled(
        fileId,
        !showPreview,
        previewMeta.preview_type
      );
    }
  };

  const handleDownloadClick = () => {
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackDownloadInitiated(
        fileId,
        previewMeta.preview_available,
        previewMeta.preview_type
      );
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-bolt-black/10 border border-bolt-cyan/20">
      <div className="text-center">
        <div className="inline-block p-4 mb-4 bg-gradient-to-br from-bolt-blue/10 to-bolt-cyan/10 rounded-2xl">
          <FileIcon className="w-12 h-12 text-bolt-blue" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-bolt-black break-words">
          {fileMeta.filename}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-bolt-cyan font-medium">
          {formatFileSize(fileMeta.size_bytes)} • {fileMeta.content_type}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {previewMeta.preview_available ? (
          <button
            onClick={handlePreviewToggle}
            className={cn(
              "w-full flex items-center justify-center gap-2 text-base font-semibold py-3 rounded-xl transition-all duration-300",
              showPreview 
                ? "bg-bolt-cyan/20 text-bolt-black/80 hover:bg-bolt-cyan/30" 
                : "bg-bolt-blue text-white hover:bg-bolt-blue/90"
            )}
          >
            {showPreview ? <X className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showPreview ? 'Hide Preview' : `Preview ${previewMeta.preview_type}`}
          </button>
        ) : (
          <div className="p-4 text-center bg-gradient-to-br from-bolt-cyan/10 to-bolt-blue/10 rounded-xl border border-bolt-blue/20">
            <p className="text-sm text-bolt-cyan">{previewMeta.message || 'Preview is not available for this file type.'}</p>
          </div>
        )}

        <a
          href={downloadUrl}
          download={fileMeta.filename}
          onClick={handleDownloadClick}
          className="w-full flex items-center justify-center gap-3 text-lg font-bold py-4 rounded-xl text-white bg-gradient-to-r from-bolt-blue to-bolt-purple hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <Download className="w-6 h-6" />
          Download File
        </a>
      </div>

      {showPreview && previewMeta.preview_available && fileId && (
        <div className="mt-6">
          <FilePreview 
            fileId={fileId} 
            fileName={fileMeta.filename}
            previewType={previewMeta.preview_type}
            contentType={fileMeta.content_type}
          />
        </div>
      )}
    </div>
  );
}