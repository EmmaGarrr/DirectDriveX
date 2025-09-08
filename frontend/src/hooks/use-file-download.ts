"use client";

import { useState, useEffect, useCallback } from 'react';
import { FileMeta, PreviewMeta } from '@/types/download';
import { fileService } from '@/services/fileService';

export function useFileDownload(fileId: string | null) {
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [previewMeta, setPreviewMeta] = useState<PreviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFileData = useCallback(async () => {
    if (!fileId) {
      setError("No file ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [meta, pMeta] = await Promise.all([
        fileService.getFileMeta(fileId),
        fileService.getPreviewMeta(fileId),
      ]);
      setFileMeta(meta);
      setPreviewMeta(pMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadFileData();
  }, [loadFileData]);

  return { fileMeta, previewMeta, loading, error, retry: loadFileData };
}