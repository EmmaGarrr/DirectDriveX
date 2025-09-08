"use client";

import { BatchDetails } from '@/types/batch-download';
import { BatchUploadService } from '@/services/batchUploadService';
import { FileListItem } from './FileListItem';
import { Download } from 'lucide-react';

const batchUploadService = new BatchUploadService();

interface BatchDownloadCardProps {
  batchDetails: BatchDetails;
}

export function BatchDownloadCard({ batchDetails }: BatchDownloadCardProps) {
  const zipDownloadUrl = batchUploadService.getZipDownloadUrl(batchDetails.batch_id);

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-cyan-500/20 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-bolt-white">Files Ready for Download</h2>
        <a
          href={zipDownloadUrl}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-bolt-blue to-bolt-purple text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-bolt-cyan/20 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
        >
          <Download className="w-4 h-4" />
          Download All (ZIP)
        </a>
      </div>

      <div className="space-y-3">
        {batchDetails.files.map((file) => (
          <FileListItem key={file._id} file={file} />
        ))}
      </div>
    </div>
  );
}