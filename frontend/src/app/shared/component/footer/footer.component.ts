import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: false
})
export class FooterComponent implements OnInit {
  
  // Newsletter subscription
  newsletterEmail: string = '';
  
  // Back to top functionality
  showBackToTop: boolean = false;
  
  // Current year for copyright
  currentYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Handle newsletter subscription
   */
  subscribeNewsletter(): void {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {
      // TODO: Implement newsletter subscription logic
      console.log('Newsletter subscription for:', this.newsletterEmail);
      
      // Show success message (you can integrate with your toast service)
      alert('Thank you for subscribing to our newsletter!');
      
      // Clear the form
      this.newsletterEmail = '';
    } else {
      alert('Please enter a valid email address.');
    }
  }

  /**
   * Scroll to top of the page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Listen for scroll events to show/hide back to top button
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.pageYOffset > 300;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle external link clicks (for social media, etc.)
   */
  openExternalLink(url: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    // Track external link clicks
    this.trackEvent('footer_external_link_click', { url });
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Track events for analytics
   */
  private trackEvent(eventName: string, properties?: any): void {
    // TODO: Integrate with your analytics service
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', eventName, properties);
    }
  }

  /**
   * Handle footer link clicks for internal navigation
   */
  onFooterLinkClick(linkType: string): void {
    this.trackEvent('footer_link_click', { linkType });
    
    // Handle different link types
    switch (linkType) {
      case 'privacy':
        // Navigate to privacy policy
        break;
      case 'terms':
        // Navigate to terms of service
        break;
      case 'support':
        // Navigate to support page
        break;
      default:
        // Default behavior
        break;
    }
  }
}
