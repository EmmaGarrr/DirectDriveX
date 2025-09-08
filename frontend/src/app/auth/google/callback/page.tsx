"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthService } from '@/services/googleAuthService';
import { toastService } from '@/services/toastService';
import { Loader2 } from 'lucide-react';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent double processing
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors
      if (error) {
        let errorMessage = 'Google authentication failed. Please try again.';
        
        if (error === 'access_denied') {
          errorMessage = 'Google authentication was cancelled.';
        } else if (errorDescription) {
          errorMessage = decodeURIComponent(errorDescription);
        }

        // Navigate to register page with error
        router.replace(`/register?error=${encodeURIComponent(errorMessage)}`);
        return;
      }

      // Handle successful OAuth code
      if (code) {
        try {
          const response = await googleAuthService.handleGoogleCallback(code);
          
          // Show success message
          await showToastAndWait('success', 'Google authentication successful! Welcome to DirectDrive.');
          
          // Navigate to dashboard or home page
          router.replace('/dashboard');
          
        } catch (error: any) {
          console.error('Google callback error:', error);
          
          // Navigate to register page with error
          const errorMessage = error.message || 'Google authentication failed. Please try again.';
          router.replace(`/register?error=${encodeURIComponent(errorMessage)}`);
        }
      } else {
        // No code or error, invalid callback
        router.replace('/register?error=' + encodeURIComponent('Invalid Google authentication response.'));
      }
    };

    processCallback();
  }, [searchParams, router]);

  // Helper method to show toast and wait for completion (matching Angular pattern)
  const showToastAndWait = async (type: 'success' | 'error' | 'warning' | 'info', message: string): Promise<void> => {
    const TOAST_DURATION = 2500;
    
    // Show toast with consistent duration
    switch (type) {
      case 'success':
        toastService.success(message, TOAST_DURATION);
        break;
      case 'error':
        toastService.error(message, TOAST_DURATION);
        break;
      case 'warning':
        toastService.warning(message, TOAST_DURATION);
        break;
      case 'info':
        toastService.info(message, TOAST_DURATION);
        break;
    }

    // Wait a moment for the toast to appear and start progress
    await delay(100);
    
    // Wait for toast completion
    await toastService.ensureToastCompletion();
  };

  // Helper method to create delays
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-bolt-blue" />
        <h2 className="text-xl font-semibold text-slate-900">
          Processing Google Authentication
        </h2>
        <p className="text-slate-600">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-bolt-blue" />
          <h2 className="text-xl font-semibold text-slate-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
