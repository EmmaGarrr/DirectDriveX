'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { HotjarService } from '@/lib/hotjar';
import { HotjarTracking } from '@/lib/hotjarTracking';

interface HotjarProviderProps {
  children: React.ReactNode;
}

function HotjarTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hotjarService = HotjarService.getInstance();
    const hotjarTracking = HotjarTracking.getInstance();

    // Track page views when route changes
    const pageName = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    hotjarService.trackPageView(pageName);
    hotjarTracking.trackPageView(pathname);

    // Track state changes
    hotjarService.stateChange(pathname);
  }, [pathname, searchParams]);

  return null;
}

export function HotjarProvider({ children }: HotjarProviderProps) {
  useEffect(() => {
    const hotjarService = HotjarService.getInstance();

    // Initialize Hotjar on client-side
    hotjarService.initialize();
  }, []);

  // Track user authentication state changes
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('access_token');
        const userInfo = localStorage.getItem('user_info');

        if (token && userInfo) {
          const user = JSON.parse(userInfo);
          const hotjarService = HotjarService.getInstance();

          hotjarService.identifyUser(user.id || user.email || 'anonymous', {
            email: user.email,
            userId: user.id,
            role: user.is_admin ? 'admin' : 'user',
            subscriptionTier: 'free', // Default for now
            storageUsed: user.storage_used_bytes || 0
          });

          // Track login event
          hotjarService.trackEvent('user_logged_in', {
            userId: user.id,
            role: user.is_admin ? 'admin' : 'user'
          });
        }
      } catch (error) {
        console.warn('Error checking auth state for Hotjar:', error);
      }
    };

    // Check auth state initially and on storage changes
    checkAuthState();

    const handleStorageChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <HotjarTracker />
      </Suspense>
      {children}
    </>
  );
}