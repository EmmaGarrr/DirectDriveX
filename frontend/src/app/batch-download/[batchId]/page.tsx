"use client";

import { useParams } from 'next/navigation';
import { useBatchDownload } from '@/hooks/use-batch-download';
import { BatchDownloadCard } from '@/components/batch-download/BatchDownloadCard';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function BatchDownloadPage() {
  const params = useParams();
  const batchId = typeof params.batchId === 'string' ? params.batchId : null;
  const { batchDetails, loading, error, retry } = useBatchDownload(batchId);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-bolt-white">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-bolt-cyan" />
          <p className="mt-4">Loading batch information...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full max-w-md p-8 text-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-400" />
          <h2 className="mt-4 text-xl font-bold text-bolt-white">Error Loading Batch</h2>
          <p className="mt-2 text-slate-300">{error}</p>
          <button
            onClick={retry}
            className="mt-6 px-6 py-2 font-semibold text-white rounded-lg bg-bolt-blue hover:bg-bolt-blue/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (batchDetails) {
      return <BatchDownloadCard batchDetails={batchDetails} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-bolt-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {renderContent()}
    </div>
  );
}