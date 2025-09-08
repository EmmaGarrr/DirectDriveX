"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFileDownload } from '@/hooks/use-file-download';
import { DownloadCard } from '@/components/download/DownloadCard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

export default function DownloadPage() {
  const params = useParams();
  const fileId = typeof params.fileId === 'string' ? params.fileId : null;
  const { fileMeta, previewMeta, loading, error, retry } = useFileDownload(fileId);

  // Track page view when fileId is available (only on client side)
  useEffect(() => {
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackDownloadPageView(fileId);
    }
  }, [fileId]);

  // Track preview metadata when loaded (only on client side)
  useEffect(() => {
    if (previewMeta && fileId && typeof window !== 'undefined') {
      analyticsService.trackPreviewMetadataLoaded(
        fileId,
        previewMeta.preview_available,
        previewMeta.preview_type
      );
    }
  }, [previewMeta, fileId]);

  const renderContent = () => {
    if (!fileId) {
      return (
        <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-bolt-purple" />
          <h2 className="mt-4 text-xl font-bold text-bolt-black">Invalid File ID</h2>
          <p className="mt-2 text-bolt-cyan">No file ID provided in the URL.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center">
          <div className="inline-block p-4 mb-4 bg-gradient-to-br from-bolt-blue/10 to-bolt-cyan/10 rounded-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-bolt-blue" />
          </div>
          <p className="text-lg text-bolt-black font-medium">Loading file information...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-bolt-purple" />
          <h2 className="mt-4 text-xl font-bold text-bolt-black">Error Loading File</h2>
          <p className="mt-2 text-bolt-cyan">{error}</p>
          <button
            onClick={retry}
            className="px-6 py-2 mt-6 font-semibold text-white transition-colors rounded-lg bg-bolt-blue hover:bg-bolt-blue/90"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (fileMeta && previewMeta) {
      return <DownloadCard fileMeta={fileMeta} previewMeta={previewMeta} />;
    }

    return null;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-bolt-white sm:p-6 lg:p-8">
      {renderContent()}
    </div>
  );
}