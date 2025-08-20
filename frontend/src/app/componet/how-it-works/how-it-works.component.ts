import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HowItWorksComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Navigate to upload page
   */
  navigateToUpload(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to home page
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Handle CTA button clicks
   */
  onTryItNow(): void {
    this.navigateToUpload();
  }

  onStartUploading(): void {
    this.navigateToUpload();
  }

  onSeePricing(): void {
    // For now, scroll to pricing section or navigate to pricing page
    this.scrollToSection('pricing');
  }

  /**
   * Track analytics events
   */
  trackEvent(eventName: string, properties?: any): void {
    // This can be integrated with your analytics service
    console.log('Event tracked:', eventName, properties);
  }
}
