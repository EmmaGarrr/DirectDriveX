// In file: Frontend/src/app/componet/file-preview/enhanced-video-preview.component.ts

import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileService, PreviewMetadata, MediaInfo } from '../../shared/services/file.service';

@Component({
  selector: 'app-enhanced-video-preview',
  templateUrl: './enhanced-video-preview.component.html',
  styleUrls: ['./enhanced-video-preview.component.css']
})
export class EnhancedVideoPreviewComponent implements OnInit, OnDestroy {
  @Input() fileId!: string;
  
  // Preview metadata
  previewMetadata?: PreviewMetadata;
  
  // Loading states
  loading = true;
  error = false;
  errorMessage = '';
  
  // iframe specific properties
  mediaUrl = '';
  thumbnailUrl = '';
  mediaInfo?: MediaInfo;
  
  // iframe player states
  videoReady = false;
  iframeLoading = false;
  videoError = false;
  
  // Connection speed detection
  connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  
  // Cache statistics
  cacheStats: any = null;
  
  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeVideoPreview();
  }

  ngOnDestroy(): void {
    // Clean up any resources
  }

  async initializeVideoPreview(): Promise<void> {
    try {
      this.loading = true;
      this.error = false;
      
      // Load preview metadata
      this.previewMetadata = await this.fileService.getPreviewMetadata(this.fileId).toPromise();
      
      if (!this.previewMetadata) {
        throw new Error('Failed to load preview metadata');
      }
      
      // Check if it's a video file
      if (!this.previewMetadata.content_type?.startsWith('video/')) {
        throw new Error('This component is only for video files');
      }
      
      // Load cache statistics
      await this.loadCacheStats();
      
      // Detect connection speed
      this.connectionSpeed = await this.detectConnectionSpeed();
      
      // Initialize iframe loading
      await this.initializeVideoLoading();
      
    } catch (error) {
      console.error('Error initializing video preview:', error);
      this.error = true;
      this.errorMessage = 'Failed to initialize video preview.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  private async initializeVideoLoading(): Promise<void> {
    // Get gdplayer.vip streaming URL for iframe embedding
    console.log('[VIDEO_PREVIEW] Getting gdplayer.vip URL for iframe preview');
    
    this.iframeLoading = true;
    this.videoReady = false;
    
    this.fileService.getPreviewStreamUrl(this.fileId).subscribe({
      next: (streamUrl: string) => {
        this.mediaUrl = streamUrl;
        this.iframeLoading = false;
        this.videoReady = true;
        console.log('[VIDEO_PREVIEW] iframe stream URL loaded:', streamUrl);
      },
      error: (error) => {
        console.error('[VIDEO_PREVIEW] Error loading stream URL:', error);
        this.error = true;
        this.errorMessage = 'Failed to get video stream URL. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.iframeLoading = false;
      }
    });
  }

  // iframe event handlers
  onIframeLoaded(): void {
    console.log('[VIDEO_PREVIEW] iframe loaded successfully');
    this.iframeLoading = false;
    this.videoReady = true;
    this.cdr.detectChanges();
  }

  // iframe error handling
  onIframeError(): void {
    console.error('[VIDEO_PREVIEW] iframe error occurred');
    this.videoError = true;
    this.errorMessage = 'Failed to load video player. Please try downloading the file instead.';
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
  }

  // Utility methods
  async loadCacheStats(): Promise<void> {
    try {
      this.cacheStats = await this.fileService.getCacheStats().toPromise();
      console.log('[VIDEO_PREVIEW] Cache stats:', this.cacheStats);
    } catch (error) {
      console.warn('[VIDEO_PREVIEW] Failed to load cache stats:', error);
    }
  }

  async detectConnectionSpeed(): Promise<'slow' | 'medium' | 'fast'> {
    // Simple connection speed detection
    try {
      const startTime = performance.now();
      await fetch('/api/v1/preview/cache/stats');
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 100) return 'fast';
      if (responseTime < 500) return 'medium';
      return 'slow';
    } catch (error) {
      console.warn('[VIDEO_PREVIEW] Connection speed detection failed:', error);
      return 'medium';
    }
  }

  getFormattedFileSize(): string {
    if (!this.previewMetadata?.size_bytes) return 'Unknown size';
    return this.fileService.formatFileSize(this.previewMetadata.size_bytes);
  }

  getConnectionSpeedText(): string {
    switch (this.connectionSpeed) {
      case 'fast': return 'Fast Connection';
      case 'slow': return 'Slow Connection';
      default: return 'Medium Connection';
    }
  }

  retry(): void {
    console.log('[VIDEO_PREVIEW] Retry requested');
    this.error = false;
    this.videoError = false;
    this.errorMessage = '';
    this.initializeVideoPreview();
  }

  downloadFile(): void {
    console.log('[VIDEO_PREVIEW] Download requested');
    // Implement download logic
    const downloadUrl = `${window.location.origin}/api/v1/download/stream/${this.fileId}`;
    window.open(downloadUrl, '_blank');
  }
}
