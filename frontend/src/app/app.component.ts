import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { environment } from '../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-test';

  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.includes('/admin');
  }

  ngOnInit() {
    // Track initial page view
    this.trackPageView();
    
    // Track route changes for SPA navigation
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView();
    });
  }

  private trackPageView() {
    // Track page view with Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('pageview');
    }
    
    // Track page view with Hotjar
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('stateChange', window.location.pathname);
    }
  }

  // Method to track custom events
  trackEvent(eventName: string, properties?: any) {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', eventName, properties);
    }
  }

  // Method specifically for Hotjar events
  trackHotjarEvent(eventName: string, properties?: any) {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', eventName, properties);
    }
  }

  // Method to track both Vercel and Hotjar events
  trackBothEvents(eventName: string, properties?: any) {
    // Track with Vercel Analytics
    this.trackEvent(eventName, properties);
    
    // Track with Hotjar
    this.trackHotjarEvent(eventName, properties);
  }
}
