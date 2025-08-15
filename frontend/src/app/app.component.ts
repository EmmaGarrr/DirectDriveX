import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView();
    });
  }

  private trackPageView() {
    // Track page view with Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('pageview');
    }
  }

  // Method to track custom events
  trackEvent(eventName: string, properties?: any) {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', eventName, properties);
    }
  }
}
