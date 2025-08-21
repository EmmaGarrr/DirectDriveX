import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      this.loading = false;
      if (user) {
        this.loadDashboardData();
      }
    });

    // Load initial user data if authenticated
    if (this.authService.isAuthenticated()) {
      this.authService.loadUserProfile().subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          this.error = 'Failed to load dashboard data';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  private loadDashboardData(): void {
    // Load user-specific dashboard data
    // This will be implemented in Phase 3
    console.log('Loading dashboard data for user:', this.user?.email);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
