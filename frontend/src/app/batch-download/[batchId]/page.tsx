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
        <div className="text-center">
          <div className="inline-block p-4 mb-4 bg-gradient-to-br from-bolt-blue/10 to-bolt-cyan/10 rounded-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-bolt-blue" />
          </div>
          <p className="text-lg text-bolt-black font-medium">Loading batch information...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-bolt-purple" />
          <h2 className="mt-4 text-xl font-bold text-bolt-black">Error Loading Batch</h2>
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

    if (batchDetails) {
      return <BatchDownloadCard batchDetails={batchDetails} />;
    }

    return null;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-bolt-white sm:p-6 lg:p-8">
      {renderContent()}
    </div>
  );
}