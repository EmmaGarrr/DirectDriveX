class AnalyticsService {
  private isEnabled = false;

  constructor() {
    // Only enable on client side after hydration
    if (typeof window !== 'undefined') {
      this.isEnabled = true;
    }
  }

  trackDownloadPageView(fileId: string): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('[ANALYTICS] Download page viewed:', fileId);
      // Add actual analytics implementation here
    }
  }

  trackPreviewMetadataLoaded(fileId: string, previewAvailable: boolean, previewType: string): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('[ANALYTICS] Preview metadata loaded:', fileId, previewAvailable, previewType);
    }
  }

  trackPreviewToggled(fileId: string, previewShown: boolean, previewType: string): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('[ANALYTICS] Preview toggled:', fileId, previewShown, previewType);
    }
  }

  trackDownloadInitiated(fileId: string, previewAvailable: boolean, previewType: string): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('[ANALYTICS] Download initiated:', fileId, previewAvailable, previewType);
    }
  }

  trackVideoControl(fileId: string, action: string, timestamp?: number): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('[ANALYTICS] Video control:', fileId, action, timestamp);
    }
  }

  trackPreviewError(fileId: string, errorType: string, errorMessage: string): void {
    if (this.isEnabled && typeof window !== 'undefined') {
      console.error('[ANALYTICS] Preview error:', fileId, errorType, errorMessage);
    }
  }
}

export const analyticsService = new AnalyticsService();