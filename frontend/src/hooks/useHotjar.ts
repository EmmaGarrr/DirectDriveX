import { useCallback } from 'react';
import { HotjarService } from '@/lib/hotjar';
import { HotjarTracking, FileUploadTrackingData, FileDownloadTrackingData } from '@/lib/hotjarTracking';

export function useHotjar() {
  const hotjarService = HotjarService.getInstance();
  const hotjarTracking = HotjarTracking.getInstance();

  const identifyUser = useCallback((userId: string, userData?: any) => {
    hotjarService.identifyUser(userId, userData);
  }, []);

  const trackEvent = useCallback((eventName: string, data?: any) => {
    hotjarService.trackEvent(eventName, data);
  }, []);

  const trackUploadStarted = useCallback((data: FileUploadTrackingData) => {
    hotjarTracking.trackUploadStarted(data);
  }, []);

  const trackUploadProgress = useCallback((fileId: string, progress: number) => {
    hotjarTracking.trackUploadProgress(fileId, progress);
  }, []);

  const trackUploadCompleted = useCallback((data: FileUploadTrackingData, duration: number) => {
    hotjarTracking.trackUploadCompleted(data, duration);
  }, []);

  const trackUploadFailed = useCallback((data: FileUploadTrackingData, error: string, duration: number) => {
    hotjarTracking.trackUploadFailed(data, error, duration);
  }, []);

  const trackFileDownloaded = useCallback((data: FileDownloadTrackingData) => {
    hotjarTracking.trackFileDownloaded(data);
  }, []);

  const trackFilePreviewed = useCallback((data: FileDownloadTrackingData) => {
    hotjarTracking.trackFilePreviewed(data);
  }, []);

  const trackLogin = useCallback((method: 'email' | 'google', success: boolean, error?: string) => {
    hotjarTracking.trackLogin(method, success, error);
  }, []);

  const trackRegistration = useCallback((method: 'email' | 'google', success: boolean, error?: string) => {
    hotjarTracking.trackRegistration(method, success, error);
  }, []);

  const trackLogout = useCallback(() => {
    hotjarTracking.trackLogout();
  }, []);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    hotjarTracking.trackFeatureUsage(feature, action);
  }, []);

  const trackError = useCallback((errorType: string, errorDetails: string) => {
    hotjarTracking.trackError(errorType, errorDetails);
  }, []);

  const trackAdminAction = useCallback((action: string, target: string, success: boolean) => {
    hotjarTracking.trackAdminAction(action, target, success);
  }, []);

  const trackDashboardView = useCallback((dashboardType: string) => {
    hotjarTracking.trackDashboardView(dashboardType);
  }, []);

  return {
    identifyUser,
    trackEvent,
    trackUploadStarted,
    trackUploadProgress,
    trackUploadCompleted,
    trackUploadFailed,
    trackFileDownloaded,
    trackFilePreviewed,
    trackLogin,
    trackRegistration,
    trackLogout,
    trackFeatureUsage,
    trackError,
    trackAdminAction,
    trackDashboardView
  };
}