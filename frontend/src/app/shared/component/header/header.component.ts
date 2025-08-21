import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
  isSticky = false;
  displayName = 'User';
  isScrollAnimation = false;
  lastScrollY = 0;
  isMobileMenuOpen = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.updateUserDisplay();
    });

    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateUserDisplay();
    });

    // Check initial authentication state
    this.checkAuthState();
    
    // Listen to router events to update auth state
    this.router.events.subscribe(() => {
      this.checkAuthState();
    });
    
    // Ensure scroll animation is disabled on mobile devices on initialization
    this.initializeScrollAnimation();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY;
    
    // Add sticky class when scrolled down
    this.isSticky = scrollY > 50;
    
    // Only trigger scroll animation on desktop (screens wider than 1024px)
    if (window.innerWidth > 1024) {
      // Check if user scrolled down from near the top
      if (scrollY > 10 && this.lastScrollY <= 10) {
        // User scrolled down from the top - trigger animation
        this.isScrollAnimation = true;
        
        // Remove animation class after animation completes
        setTimeout(() => {
          this.isScrollAnimation = false;
        }, 600); // Match animation duration
      }
    } else {
      // On mobile devices, ensure scroll animation is disabled
      this.isScrollAnimation = false;
    }
    
    // Update last scroll position
    this.lastScrollY = scrollY;
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    // Close mobile menu on window resize to desktop
    if (window.innerWidth >= 1024) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private updateUserDisplay(): void {
    if (this.isLoggedIn && this.currentUser) {
      this.displayName = this.getDisplayName(this.currentUser);
    } else {
      this.displayName = 'User';
    }
  }

  private initializeScrollAnimation(): void {
    // Disable scroll animation on mobile devices
    if (window.innerWidth <= 1024) {
      this.isScrollAnimation = false;
    }
  }

  private checkAuthState(): void {
    // Use the auth service to check authentication
    this.isLoggedIn = this.authService.isAuthenticated();
    
    if (this.isLoggedIn) {
      // Get current user from auth service
      this.currentUser = this.authService.getCurrentUser();
      if (!this.currentUser) {
        // If no user data, try to load it
        this.authService.loadUserProfile().subscribe({
          next: (user) => {
            this.currentUser = user;
            this.updateUserDisplay();
          },
          error: (error) => {
            console.error('Failed to load user data:', error);
            // If loading fails, logout
            this.authService.logout();
          }
        });
      } else {
        this.updateUserDisplay();
      }
    } else {
      this.currentUser = null;
      this.displayName = 'User';
    }
  }

  private getDisplayName(user: any): string {
    let fullName = '';
    
    // Try to get username first, then first name, then email, then fallback
    if (user?.username) {
      fullName = user.username;
    } else if (user?.first_name) {
      fullName = user.first_name;
    } else if (user?.email) {
      // Extract username from email (part before @)
      const emailParts = user.email.split('@');
      fullName = emailParts[0];
    } else {
      return 'User';
    }
    
    // Return shortened version (first 8 characters max)
    return fullName.length > 8 ? fullName.substring(0, 8) + '...' : fullName;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  logout(): void {
    console.log('[HEADER] Logout initiated by user');
    this.authService.logout();
    
    // Clear local state immediately
    this.isLoggedIn = false;
    this.currentUser = null;
    this.displayName = 'User';
    this.isMobileMenuOpen = false;
    
    // Navigate to home page after logout
    this.router.navigate(['/']);
  }
}
