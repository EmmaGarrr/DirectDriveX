"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatchDetails } from '@/types/batch-download';
import { BatchUploadService } from '@/services/batchUploadService';

const batchUploadService = new BatchUploadService();

export function useBatchDownload(batchId: string | null) {
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBatchData = useCallback(async () => {
    if (!batchId) {
      setError("No batch ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await batchUploadService.getBatchDetails(batchId);
      setBatchDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadBatchData();
  }, [loadBatchData]);

  return { batchDetails, loading, error, retry: loadBatchData };
}