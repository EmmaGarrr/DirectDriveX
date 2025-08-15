// In file: Frontend/src/app/componet/file-preview/enhanced-video-preview.component.ts

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileService, PreviewMetadata, MediaInfo } from '../../shared/services/file.service';

interface VideoChunk {
  start: number;
  end: number;
  blob: Blob;
  loaded: boolean;
}

@Component({
  selector: 'app-enhanced-video-preview',
  templateUrl: './enhanced-video-preview.component.html',
  styleUrls: ['./enhanced-video-preview.component.css']
})
export class EnhancedVideoPreviewComponent implements OnInit, OnDestroy {
  @Input() fileId!: string;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  // Preview metadata
  previewMetadata?: PreviewMetadata;
  
  // Loading states
  loading = true;
  error = false;
  errorMessage = '';
  
  // Video specific properties
  mediaUrl = '';
  thumbnailUrl = '';
  mediaInfo?: MediaInfo;
  
  // Progressive loading properties
  videoChunks: VideoChunk[] = [];
  loadingProgress = 0;
  chunksLoaded = 0;
  totalChunks = 0;
  
  // Video player states
  videoReady = false;
  videoLoading = false;
  videoError = false;
  isSeeking = false;
  
  // Connection speed detection
  connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  
  // Cache statistics
  cacheStats: any = null;
  
  // Chunk size configuration
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private readonly INITIAL_CHUNKS = 3; // Load first 3 chunks to start playing
  
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
    this.videoChunks = [];
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
      
      // Initialize video loading
      await this.initializeVideoLoading();
      
    } catch (error) {
      console.error('Error initializing video preview:', error);
      this.error = true;
      this.errorMessage = error instanceof Error ? error.message : 'Failed to initialize video preview. Please try again.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  private async loadCacheStats(): Promise<void> {
    try {
      this.cacheStats = await this.fileService.getCacheStats().toPromise();
      console.log('[VIDEO_PREVIEW] Cache stats:', this.cacheStats);
    } catch (error) {
      console.warn('[VIDEO_PREVIEW] Failed to load cache stats:', error);
      // Don't fail the entire preview if cache stats fail
      this.cacheStats = null;
    }
  }

  private async detectConnectionSpeed(): Promise<'slow' | 'medium' | 'fast'> {
    // Simple connection speed detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      } else if (connection.effectiveType === '3g') {
        return 'medium';
      } else {
        return 'fast';
      }
    }
    
    // Fallback detection based on user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android')) {
      return 'medium';
    }
    
    return 'fast';
  }

  private async initializeVideoLoading(): Promise<void> {
    // For now, use direct streaming instead of chunked loading
    // This avoids the range request issues with the backend
    console.log('[VIDEO_PREVIEW] Using direct streaming for video preview');
    
    this.mediaUrl = this.fileService.getPreviewStreamUrl(this.fileId);
    this.videoReady = true;
    this.videoLoading = false;
    
    // Skip chunked loading for now
    this.totalChunks = 0;
    this.chunksLoaded = 0;
    this.loadingProgress = 100;
  }

  // Simplified loading methods for direct streaming
  private async startProgressiveLoading(): Promise<void> {
    // Not used with direct streaming
    console.log('[VIDEO_PREVIEW] Progressive loading disabled - using direct streaming');
  }

  private async loadInitialChunks(): Promise<void> {
    // Not used with direct streaming
  }

  private async loadRemainingChunks(): Promise<void> {
    // Not used with direct streaming
  }

  private async loadChunk(chunkIndex: number): Promise<void> {
    // Not used with direct streaming
  }

  private async createVideoBlob(): Promise<void> {
    // Not used with direct streaming
  }

  // Enhanced video player event handlers
  onVideoLoaded(): void {
    console.log('[VIDEO_PREVIEW] Video metadata loaded');
    this.videoLoading = false;
    this.videoReady = true;
    
    // Initialize video player for controls
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      console.log(`[VIDEO_PREVIEW] Video duration: ${video.duration}s`);
      console.log(`[VIDEO_PREVIEW] Video ready state: ${video.readyState}`);
      
      // Enhanced event listeners for video state
      video.addEventListener('loadedmetadata', () => {
        console.log(`[VIDEO_PREVIEW] Video metadata loaded - Duration: ${video.duration}s`);
        this.videoReady = true;
        this.cdr.detectChanges();
      });
      
      video.addEventListener('canplay', () => {
        console.log('[VIDEO_PREVIEW] Video can start playing');
        this.videoReady = true;
        this.videoLoading = false;
        this.cdr.detectChanges();
      });
      
      video.addEventListener('canplaythrough', () => {
        console.log('[VIDEO_PREVIEW] Video can play through without buffering');
        this.videoReady = true;
        this.videoLoading = false;
        this.cdr.detectChanges();
      });
      
      video.addEventListener('seeking', () => {
        console.log(`[VIDEO_PREVIEW] Video seeking to: ${video.currentTime}s`);
        this.cdr.detectChanges();
      });
      
      video.addEventListener('seeked', () => {
        console.log(`[VIDEO_PREVIEW] Video seeked to: ${video.currentTime}s`);
        this.cdr.detectChanges();
      });
      
      video.addEventListener('waiting', () => {
        console.log('[VIDEO_PREVIEW] Video waiting for data');
        this.videoLoading = true;
        this.cdr.detectChanges();
      });
      
      video.addEventListener('playing', () => {
        console.log('[VIDEO_PREVIEW] Video started playing');
        this.videoLoading = false;
        this.cdr.detectChanges();
      });
      
      video.addEventListener('pause', () => {
        console.log('[VIDEO_PREVIEW] Video paused');
        this.cdr.detectChanges();
      });
      
      video.addEventListener('ended', () => {
        console.log('[VIDEO_PREVIEW] Video ended');
        this.cdr.detectChanges();
      });
      
      // Enhanced error handling
      video.addEventListener('error', (event) => {
        console.error('[VIDEO_PREVIEW] Video error:', event);
        console.error('[VIDEO_PREVIEW] Video error details:', video.error);
        this.videoError = true;
        this.cdr.detectChanges();
      });
      
      // Add loadstart event
      video.addEventListener('loadstart', () => {
        console.log('[VIDEO_PREVIEW] Video load started');
        this.videoLoading = true;
        this.cdr.detectChanges();
      });
      
      // Add progress event for buffering
      video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          const bufferedPercent = (bufferedEnd / duration) * 100;
          console.log(`[VIDEO_PREVIEW] Video buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      });
    }
  }

  onVideoError(event: any): void {
    console.error('[VIDEO_PREVIEW] Video error:', event);
    this.videoError = true;
    this.errorMessage = 'Failed to load video. Please try downloading the file instead.';
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
  }

  onVideoProgress(): void {
    // Update progress based on video playback
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      if (duration > 0) {
        const playbackProgress = (currentTime / duration) * 100;
        console.log(`[VIDEO_PREVIEW] Playback progress: ${playbackProgress.toFixed(1)}%`);
      }
    }
  }

  onVideoCanPlay(): void {
    console.log('[VIDEO_PREVIEW] Video can start playing');
    this.videoReady = true;
    this.videoLoading = false;
  }

  onVideoTimeUpdate(): void {
    // Update current time display
    this.cdr.detectChanges();
  }

  // Enhanced video control methods with proper seeking
  skipForward(): void {
    console.log('[VIDEO_PREVIEW] Skip forward button clicked');
    
    if (!this.videoPlayer?.nativeElement) {
      console.warn('[VIDEO_PREVIEW] Video player element not found');
      return;
    }
    
    const video = this.videoPlayer.nativeElement;
    
    // Check if video is ready for seeking
    if (!this.isVideoReadyForSeeking(video)) {
      console.warn('[VIDEO_PREVIEW] Video not ready for seeking');
      this.snackBar.open('Video not ready yet. Please wait...', 'Close', { duration: 2000 });
      return;
    }
    
    const currentTime = video.currentTime || 0;
    const duration = video.duration || 0;
    const newTime = Math.min(currentTime + 10, duration);
    
    if (newTime !== currentTime) {
      this.performSeek(video, newTime, 'forward');
    }
  }

  skipBackward(): void {
    console.log('[VIDEO_PREVIEW] Skip backward button clicked');
    
    if (!this.videoPlayer?.nativeElement) {
      console.warn('[VIDEO_PREVIEW] Video player element not found');
      return;
    }
    
    const video = this.videoPlayer.nativeElement;
    
    // Check if video is ready for seeking
    if (!this.isVideoReadyForSeeking(video)) {
      console.warn('[VIDEO_PREVIEW] Video not ready for seeking');
      this.snackBar.open('Video not ready yet. Please wait...', 'Close', { duration: 2000 });
      return;
    }
    
    const currentTime = video.currentTime || 0;
    const newTime = Math.max(currentTime - 10, 0);
    
    if (newTime !== currentTime) {
      this.performSeek(video, newTime, 'backward');
    }
  }

  // Enhanced seeking method with proper state management
  private performSeek(video: HTMLVideoElement, newTime: number, direction: 'forward' | 'backward'): void {
    console.log(`[VIDEO_PREVIEW] Performing ${direction} seek to ${newTime}s`);
    
    // Set seeking state
    this.isSeeking = true;
    this.cdr.detectChanges();
    
    // Store current playback state
    const wasPlaying = !video.paused;
    const wasMuted = video.muted;
    const volume = video.volume;
    
    // Set up seeking event listeners
    const onSeeking = () => {
      console.log(`[VIDEO_PREVIEW] Video seeking to ${newTime}s`);
      this.isSeeking = true;
      this.cdr.detectChanges();
    };
    
    const onSeeked = () => {
      console.log(`[VIDEO_PREVIEW] Video seeked to ${video.currentTime}s`);
      
      // Reset seeking state
      this.isSeeking = false;
      this.cdr.detectChanges();
      
      // Restore playback state
      if (wasPlaying && video.paused) {
        video.play().catch(e => {
          console.log('[VIDEO_PREVIEW] Auto-play prevented after seek:', e);
        });
      }
      
      // Restore audio state
      video.muted = wasMuted;
      video.volume = volume;
      
      // Show success message
      this.snackBar.open(`Skipped ${direction} to ${this.formatTime(newTime)}`, 'Close', { duration: 1500 });
      
      // Clean up event listeners
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
    };
    
    const onError = (event: Event) => {
      console.error('[VIDEO_PREVIEW] Error during seeking:', event);
      
      // Reset seeking state
      this.isSeeking = false;
      this.cdr.detectChanges();
      
      this.snackBar.open(`Failed to skip ${direction}. Please try again.`, 'Close', { duration: 3000 });
      
      // Clean up event listeners
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    
    // Add event listeners
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    
    // Perform the seek
    try {
      video.currentTime = newTime;
    } catch (error) {
      console.error('[VIDEO_PREVIEW] Error setting currentTime:', error);
      
      // Reset seeking state
      this.isSeeking = false;
      this.cdr.detectChanges();
      
      this.snackBar.open(`Failed to skip ${direction}. Please try again.`, 'Close', { duration: 3000 });
      
      // Clean up event listeners
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    }
  }

  // Check if video is ready for seeking
  private isVideoReadyForSeeking(video: HTMLVideoElement): boolean {
    // Check if video has metadata loaded
    if (video.readyState < 1) {
      console.log('[VIDEO_PREVIEW] Video readyState too low:', video.readyState);
      return false;
    }
    
    // Check if video has duration
    if (!video.duration || video.duration <= 0) {
      console.log('[VIDEO_PREVIEW] Video duration not available:', video.duration);
      return false;
    }
    
    // Check if video is not currently seeking
    if (video.seeking) {
      console.log('[VIDEO_PREVIEW] Video is already seeking');
      return false;
    }
    
    // Check if video has no errors
    if (video.error) {
      console.log('[VIDEO_PREVIEW] Video has error:', video.error);
      return false;
    }
    
    return true;
  }



  // Button hover effects
  onButtonHover(direction: 'forward' | 'back'): void {
    console.log(`[VIDEO_PREVIEW] Button hover: ${direction}`);
    // Add visual feedback for button hover
  }

  onButtonLeave(): void {
    console.log('[VIDEO_PREVIEW] Button leave');
    // Remove visual feedback
  }





  // Get current video time in seconds
  getCurrentVideoTimeSeconds(): number {
    if (this.videoPlayer?.nativeElement) {
      return this.videoPlayer.nativeElement.currentTime || 0;
    }
    return 0;
  }

  // Get video duration in seconds
  getVideoDurationSeconds(): number {
    if (this.videoPlayer?.nativeElement) {
      return this.videoPlayer.nativeElement.duration || 0;
    }
    return 0;
  }

  // Format time for display (MM:SS format)
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Utility methods
  getFormattedFileSize(): string {
    if (!this.previewMetadata?.size_bytes) return '';
    return this.fileService.formatFileSize(this.previewMetadata.size_bytes);
  }

  getFormattedDuration(): string {
    if (!this.mediaInfo?.duration) return '';
    return this.fileService.formatDuration(this.mediaInfo.duration);
  }

  getFormattedDimensions(): string {
    if (!this.mediaInfo?.width || !this.mediaInfo?.height) return '';
    return `${this.mediaInfo.width} × ${this.mediaInfo.height}`;
  }

  getConnectionSpeedText(): string {
    switch (this.connectionSpeed) {
      case 'slow': return 'Slow Connection';
      case 'medium': return 'Medium Connection';
      case 'fast': return 'Fast Connection';
      default: return 'Unknown Connection';
    }
  }

  retry(): void {
    this.error = false;
    this.videoError = false;
    this.initializeVideoPreview();
  }



  downloadFile(): void {
    const downloadUrl = this.fileService.getStreamUrl(this.fileId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = this.previewMetadata?.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
