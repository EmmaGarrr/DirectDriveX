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
    <div className="w-full max-w-4xl p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-bolt-black/10 border border-bolt-cyan/20">
      <div className="text-center">
        <div className="inline-block p-4 mb-4 bg-gradient-to-br from-bolt-blue/10 to-bolt-cyan/10 rounded-2xl">
          <Download className="w-12 h-12 text-bolt-blue" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-bolt-black break-words">
          Files Ready for Download
        </h1>
        <p className="mt-2 text-sm sm:text-base text-bolt-cyan font-medium">
          {batchDetails.files.length} file{batchDetails.files.length !== 1 ? 's' : ''} • Batch Download
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <a
          href={zipDownloadUrl}
          className="w-full flex items-center justify-center gap-3 text-lg font-bold py-4 rounded-xl text-white bg-gradient-to-r from-bolt-blue to-bolt-purple hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <Download className="w-6 h-6" />
          Download All Files (ZIP)
        </a>
      </div>

      <div className="mt-8 space-y-3">
        {batchDetails.files.map((file) => (
          <FileListItem key={file._id} file={file} />
        ))}
      </div>
    </div>
  );
}