export interface HotjarUserData {
  email?: string;
  userId?: string;
  role?: 'user' | 'admin';
  subscriptionTier?: string;
  storageUsed?: number;
}

export class HotjarService {
  private static instance: HotjarService;
  private initialized = false;

  private constructor() {}

  static getInstance(): HotjarService {
    if (!HotjarService.instance) {
      HotjarService.instance = new HotjarService();
    }
    return HotjarService.instance;
  }

  initialize(): void {
    if (typeof window === 'undefined' || this.initialized) {
      return;
    }

    const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
    const version = process.env.NEXT_PUBLIC_HOTJAR_VERSION || '6';

    if (!siteId) {
      console.warn('Hotjar Site ID not found in environment variables');
      return;
    }

    try {
      // Hotjar script injection - use a simpler approach
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`;

      // Add Hotjar functions to window before loading the script
      // @ts-ignore - Hotjar adds these properties to the window object
      window.hj = window.hj || function() { (window.hj.q = window.hj.q || []).push(arguments) };
      // @ts-ignore - Hotjar adds this property to the window object
      window._hjSettings = { hjid: parseInt(siteId), hjsv: parseInt(version) };

      document.head.appendChild(script);

      this.initialized = true;
      console.log('Hotjar initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hotjar:', error);
    }
  }

  identifyUser(userId: string, userData?: HotjarUserData): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // @ts-ignore - Hotjar adds this to window
      if (window.hj) {
        // @ts-ignore
        window.hj('identify', userId, {
          email: userData?.email,
          role: userData?.role,
          subscriptionTier: userData?.subscriptionTier,
          storageUsed: userData?.storageUsed
        });
      }
    } catch (error) {
      console.error('Failed to identify user in Hotjar:', error);
    }
  }

  trackEvent(eventName: string, data?: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // @ts-ignore - Hotjar adds this to window
      if (window.hj) {
        // @ts-ignore
        window.hj('event', eventName, data);
      }
    } catch (error) {
      console.error('Failed to track event in Hotjar:', error);
    }
  }

  trackPageView(pageName?: string): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // @ts-ignore - Hotjar adds this to window
      if (window.hj) {
        // @ts-ignore
        window.hj('vpv', pageName || window.location.pathname);
      }
    } catch (error) {
      console.error('Failed to track page view in Hotjar:', error);
    }
  }

  stateChange(stateName: string): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // @ts-ignore - Hotjar adds this to window
      if (window.hj) {
        // @ts-ignore
        window.hj('stateChange', stateName);
      }
    } catch (error) {
      console.error('Failed to track state change in Hotjar:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}