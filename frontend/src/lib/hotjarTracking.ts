import { HotjarService } from './hotjar';

export interface FileUploadTrackingData {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadMethod: 'direct' | 'google_drive' | 'drag_drop';
  estimatedDuration?: number;
}

export interface FileDownloadTrackingData {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  previewType: string;
  downloadMethod: 'direct' | 'preview';
}

export class HotjarTracking {
  private static instance: HotjarTracking;

  private constructor() {}

  static getInstance(): HotjarTracking {
    if (!HotjarTracking.instance) {
      HotjarTracking.instance = new HotjarTracking();
    }
    return HotjarTracking.instance;
  }

  // Authentication Events
  trackLogin(method: 'email' | 'google', success: boolean, error?: string): void {
    const hotjarService = HotjarService.getInstance();

    if (success) {
      hotjarService.trackEvent('login_successful', { method });
    } else {
      hotjarService.trackEvent('login_failed', { method, error });
    }
  }

  trackRegistration(method: 'email' | 'google', success: boolean, error?: string): void {
    const hotjarService = HotjarService.getInstance();

    if (success) {
      hotjarService.trackEvent('registration_successful', { method });
    } else {
      hotjarService.trackEvent('registration_failed', { method, error });
    }
  }

  trackLogout(): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('logout');
  }

  // File Upload Events
  trackUploadStarted(data: FileUploadTrackingData): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('upload_started', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      uploadMethod: data.uploadMethod,
      fileSizeCategory: this.getFileSizeCategory(data.fileSize)
    });
  }

  trackUploadProgress(fileId: string, progress: number): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('upload_progress', {
      fileId,
      progress,
      progressCategory: this.getProgressCategory(progress)
    });
  }

  trackUploadCompleted(data: FileUploadTrackingData, duration: number): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('upload_completed', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      uploadMethod: data.uploadMethod,
      duration,
      durationCategory: this.getDurationCategory(duration),
      fileSizeCategory: this.getFileSizeCategory(data.fileSize)
    });
  }

  trackUploadFailed(data: FileUploadTrackingData, error: string, duration: number): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('upload_failed', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      uploadMethod: data.uploadMethod,
      error,
      duration,
      errorCategory: this.getErrorCategory(error)
    });
  }

  // File Download/Preview Events
  trackFileDownloaded(data: FileDownloadTrackingData): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('file_downloaded', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      previewType: data.previewType,
      downloadMethod: data.downloadMethod,
      fileSizeCategory: this.getFileSizeCategory(data.fileSize)
    });
  }

  trackFilePreviewed(data: FileDownloadTrackingData): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('file_previewed', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      previewType: data.previewType,
      fileSizeCategory: this.getFileSizeCategory(data.fileSize)
    });
  }

  // User Interaction Events
  trackPageView(page: string): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('page_view', { page });
  }

  trackFeatureUsage(feature: string, action: string): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('feature_used', { feature, action });
  }

  trackError(errorType: string, errorDetails: string): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('error_occurred', {
      errorType,
      errorDetails,
      timestamp: Date.now()
    });
  }

  // Admin Events
  trackAdminAction(action: string, target: string, success: boolean): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('admin_action', {
      action,
      target,
      success
    });
  }

  trackDashboardView(dashboardType: string): void {
    const hotjarService = HotjarService.getInstance();
    hotjarService.trackEvent('dashboard_viewed', { dashboardType });
  }

  // Helper methods for categorization
  private getFileSizeCategory(bytes: number): string {
    if (bytes < 1024 * 1024) return '< 1MB';
    if (bytes < 10 * 1024 * 1024) return '1-10MB';
    if (bytes < 100 * 1024 * 1024) return '10-100MB';
    if (bytes < 1024 * 1024 * 1024) return '100MB-1GB';
    if (bytes < 5 * 1024 * 1024 * 1024) return '1-5GB';
    return '> 5GB';
  }

  private getProgressCategory(progress: number): string {
    if (progress < 25) return '0-25%';
    if (progress < 50) return '25-50%';
    if (progress < 75) return '50-75%';
    if (progress < 100) return '75-99%';
    return '100%';
  }

  private getDurationCategory(duration: number): string {
    if (duration < 5000) return '< 5s';
    if (duration < 15000) return '5-15s';
    if (duration < 30000) return '15-30s';
    if (duration < 60000) return '30-60s';
    if (duration < 300000) return '1-5min';
    return '> 5min';
  }

  private getErrorCategory(error: string): string {
    const errorLower = error.toLowerCase();
    if (errorLower.includes('network') || errorLower.includes('connection')) return 'network';
    if (errorLower.includes('size') || errorLower.includes('quota')) return 'size_limit';
    if (errorLower.includes('permission') || errorLower.includes('auth')) return 'authentication';
    if (errorLower.includes('format') || errorLower.includes('type')) return 'file_format';
    return 'unknown';
  }
}