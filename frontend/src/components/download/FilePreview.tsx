"use client";

import { useState, useEffect } from 'react';
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer';
import { fileService } from '@/services/fileService';
import { analyticsService } from '@/services/analyticsService';
import { AlertTriangle, RefreshCw, FileText, Image, Music, File, FileImage, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  fileId: string;
  fileName: string;
  previewType: 'video' | 'audio' | 'image' | 'document' | 'text' | 'thumbnail' | 'viewer' | 'unknown' | 'unsupported';
  contentType?: string;
}

export function FilePreview({ fileId, fileName, previewType, contentType }: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<any>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple, reliable URL handling
  const previewUrl = fileService.getPreviewStreamUrl(fileId);

  useEffect(() => {
    if (!fileId) {
      setError('No file ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    loadPreviewMetadata();
  }, [fileId, previewType]);


  const loadPreviewMetadata = async () => {
    if (!fileId) {
      setError('No file ID provided');
      setLoading(false);
      return;
    }

    try {
      const metadata = await fileService.getPreviewMeta(fileId);
      setPreviewMetadata(metadata);
      
      // Load text content for text files
      if (previewType === 'text') {
        await loadTextContent();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.warn('Preview metadata not available, using fallback:', err);
      // Create fallback metadata for preview
      setPreviewMetadata({
        file_id: fileId,
        filename: fileName,
        content_type: getContentTypeFromPreviewType(previewType),
        preview_available: isPreviewTypeSupported(previewType),
        preview_type: previewType,
        can_stream: false,
        suggested_action: 'download',
        message: 'Preview metadata not available from server'
      });
      setLoading(false);
    }
  };

  const getContentTypeFromPreviewType = (type: string): string => {
    switch (type) {
      case 'video': return 'video/mp4';
      case 'audio': return 'audio/mpeg';
      case 'image': return 'image/jpeg';
      case 'document': return 'application/pdf';
      case 'text': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };

  const isPreviewTypeSupported = (type: string): boolean => {
    return ['video', 'audio', 'image', 'document', 'text'].includes(type);
  };

  const loadTextContent = async () => {
    try {
      const response = await fetch(previewUrl);
      if (!response.ok) {
        throw new Error('Failed to load text content');
      }
      const content = await response.text();
      setTextContent(content);
    } catch (err) {
      setError('Failed to load text content');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    console.error('Image preview failed for:', fileId);
    setError('Unable to load image preview. Please try downloading the file.');
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackPreviewError(fileId, 'image_load_error', 'Failed to load image preview');
    }
  };

  const handleAudioError = () => {
    console.error('Audio preview failed for:', fileId);
    setError('Unable to load audio preview. Please try downloading the file.');
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackPreviewError(fileId, 'audio_load_error', 'Failed to load audio preview');
    }
  };

  const handlePdfError = () => {
    console.error('PDF preview failed for:', fileId);
    setError('Unable to load PDF preview. Please try downloading the file.');
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackPreviewError(fileId, 'pdf_load_error', 'Failed to load PDF preview');
    }
  };

  const retry = () => {
    setError(null);
    setImageError(false);
    setAudioError(false);
    setPdfError(false);
    setImageLoading(false);
    setRetryCount(prev => prev + 1);
    if (previewType === 'text') {
      loadTextContent();
    }
  };

  // Skeleton loader component
  const SkeletonLoader = ({ type = 'image' }: { type?: string }) => {
    if (type === 'image') {
      return (
        <div className="flex justify-center">
          <div className="relative w-full h-64 max-w-2xl overflow-hidden bg-bolt-cyan/10 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-bolt-cyan/20 via-bolt-blue/20 to-bolt-cyan/20 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 text-bolt-blue animate-spin" />
                <p className="text-sm text-bolt-cyan">Loading image preview...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-bolt-blue animate-spin" />
          <p className="text-bolt-cyan">Loading preview...</p>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (loading) {
      return <SkeletonLoader type={previewType} />;
    }

    if (error) {
      return (
        <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
          <h3 className="mb-2 text-lg font-semibold text-bolt-black">Preview Error</h3>
          <p className="mb-4 text-bolt-cyan">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-bolt-blue hover:bg-bolt-blue/90"
          >
            Try Again
          </button>
        </div>
      );
    }


    switch (previewType) {
      case 'video':
        return <EnhancedVideoPlayer src={previewUrl} fileName={fileName} fileId={fileId} />;
      
      case 'image':
      case 'thumbnail':
        if (imageError) {
          return (
            <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
              <FileImage className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
              <p className="text-bolt-cyan">Failed to load image preview</p>
              <button
                onClick={retry}
                className="px-4 py-2 mt-4 text-white transition-colors rounded-lg bg-bolt-blue hover:bg-bolt-blue/90"
              >
                Try Again
              </button>
            </div>
          );
        }
        if (!previewUrl) {
          return (
            <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
              <FileImage className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
              <p className="text-bolt-cyan">Preview URL not available</p>
            </div>
          );
        }
        return (
          <div className="flex justify-center">
            {imageLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-6 h-6 text-bolt-blue animate-spin" />
                  <p className="text-sm text-bolt-cyan">Loading image...</p>
                </div>
              </div>
            )}
            <img 
              src={previewUrl} 
              alt={`Preview of ${fileName}`} 
              className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl shadow-bolt-black/20 relative"
              onLoad={() => setImageLoading(false)}
              onLoadStart={() => setImageLoading(true)}
              onError={handleImageError}
            />
          </div>
        );
      
      case 'audio':
        if (audioError) {
          return (
            <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
              <Music className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
              <p className="text-bolt-cyan">Failed to load audio preview</p>
            </div>
          );
        }
        return (
          <div className="w-full max-w-2xl mx-auto">
            <audio 
              controls 
              src={previewUrl} 
              className="w-full h-16 shadow-lg rounded-xl"
              onError={handleAudioError}
            />
          </div>
        );
      
      case 'document':
        if (pdfError) {
          return (
            <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
              <File className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
              <p className="text-bolt-cyan">Failed to load PDF preview</p>
            </div>
          );
        }
        return (
          <div className="w-full h-[80vh] rounded-2xl shadow-2xl shadow-bolt-black/20 overflow-hidden">
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-0" 
              title={`Preview of ${fileName}`}
              onError={handlePdfError}
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="p-6 border shadow-lg bg-bolt-black/5 rounded-2xl border-bolt-cyan/20">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-bolt-blue" />
                <h3 className="font-semibold text-bolt-black">Text Preview</h3>
              </div>
              <pre className="text-sm text-bolt-blue whitespace-pre-wrap font-mono overflow-auto max-h-[60vh]">
                {textContent}
              </pre>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-8 text-center border bg-bolt-cyan/10 rounded-xl border-bolt-cyan/20">
            <File className="w-12 h-12 mx-auto mb-4 text-bolt-purple" />
            <p className="text-bolt-cyan">Preview not supported for this file type</p>
          </div>
        );
    }
  };

  const renderFileInfo = () => {
    if (!previewMetadata) return null;

    return (
      <div className="p-4 mb-6 border bg-bolt-cyan/5 rounded-xl border-bolt-cyan/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-bolt-black">{previewMetadata.filename}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-bolt-cyan">
              {previewMetadata.size_bytes && (
                <span>Size: {fileService.formatFileSize(previewMetadata.size_bytes)}</span>
              )}
              <span>Type: {previewMetadata.content_type}</span>
              {previewMetadata.media_info?.duration && (
                <span>Duration: {fileService.formatDuration(previewMetadata.media_info.duration)}</span>
              )}
              {previewMetadata.media_info?.width && previewMetadata.media_info?.height && (
                <span>Dimensions: {previewMetadata.media_info.width} × {previewMetadata.media_info.height}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={retry}
              className="p-2 transition-colors rounded-lg text-bolt-blue hover:bg-bolt-blue/10"
              title="Refresh preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={fileService.getDownloadUrl(fileId)}
              download
              className="p-2 transition-colors rounded-lg text-bolt-blue hover:bg-bolt-blue/10"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderMediaInfo = () => {
    if (!previewMetadata?.media_info) return null;

    const { media_info } = previewMetadata;
    const infoItems = [];

    if (media_info.format) infoItems.push(`Format: ${media_info.format}`);
    if (media_info.bitrate) infoItems.push(`Bitrate: ${media_info.bitrate} kbps`);
    if (media_info.sample_rate) infoItems.push(`Sample Rate: ${media_info.sample_rate} Hz`);
    if (media_info.channels) infoItems.push(`Channels: ${media_info.channels}`);
    if (media_info.fps) infoItems.push(`FPS: ${media_info.fps}`);

    if (infoItems.length === 0) return null;

    return (
      <div className="p-3 mt-4 rounded-lg bg-bolt-black/5">
        <div className="text-sm text-bolt-cyan">
          {infoItems.map((item, index) => (
            <span key={index} className="block">{item}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6">
      {renderFileInfo()}
      {renderPreview()}
      {renderMediaInfo()}
    </div>
  );
}