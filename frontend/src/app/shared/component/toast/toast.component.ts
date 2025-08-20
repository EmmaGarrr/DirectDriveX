import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastConfig } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() config!: ToastConfig;
  @Input() toastId!: string;
  @Output() close = new EventEmitter<void>();

  isVisible = false;
  progress = 100;
  private progressInterval: any;
  private startTime: number = 0;
  private isClosing = false;
  private isProgressComplete = false; // Track if progress has completed
  private lastProgressUpdate = 0; // Track last progress update time
  
  // Hover pause functionality
  isPaused = false; // Made public for template access
  private pauseStartTime = 0;
  private totalPausedTime = 0;
  private pausedProgress = 0;

  ngOnInit(): void {
    // Trigger entrance animation
    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    // Start progress bar if duration is set and not already completed
    if (this.config.duration && this.config.duration > 0 && !this.isProgressComplete) {
      this.startProgressBar();
    }
  }

  ngOnDestroy(): void {
    this.cleanupProgress();
  }

  // Hover event handlers
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.pauseProgress();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.resumeProgress();
  }

  onClose(): void {
    // Prevent multiple close calls
    if (this.isClosing) {
      return;
    }
    
    this.isClosing = true;
    this.isProgressComplete = true;
    
    // Clean up interval immediately
    this.cleanupProgress();
    
    // Start exit animation
    this.isVisible = false;
    
    // Emit close event after animation completes
    setTimeout(() => {
      this.close.emit();
    }, 300); // Wait for exit animation
  }

  private pauseProgress(): void {
    if (this.isPaused || this.isClosing || this.isProgressComplete) {
      return;
    }

    this.isPaused = true;
    this.pauseStartTime = Date.now();
    this.pausedProgress = this.progress;
    
    // Stop the progress interval
    this.cleanupProgress();
  }

  private resumeProgress(): void {
    if (!this.isPaused || this.isClosing || this.isProgressComplete) {
      return;
    }

    this.isPaused = false;
    
    // Calculate total paused time
    const pauseEndTime = Date.now();
    const pauseDuration = pauseEndTime - this.pauseStartTime;
    this.totalPausedTime += pauseDuration;
    
    // Restart progress bar with adjusted timing
    this.startProgressBar();
  }

  private startProgressBar(): void {
    const duration = this.config.duration || 2000; // Increased default duration
    this.startTime = Date.now() - this.totalPausedTime; // Adjust for paused time
    this.lastProgressUpdate = Date.now();

    this.progressInterval = setInterval(() => {
      if (this.isClosing || this.isProgressComplete || this.isPaused) {
        if (this.isPaused) {
          this.cleanupProgress();
        }
        return;
      }

      const currentTime = Date.now();
      const elapsed = currentTime - this.startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      const newProgress = Math.max(0, (remaining / duration) * 100);
      
      if (Math.abs(newProgress - this.progress) >= 0.1 || newProgress === 0) {
        this.progress = newProgress;
        this.lastProgressUpdate = currentTime;
      }

      if (this.progress <= 0) {
        this.isProgressComplete = true;
        this.cleanupProgress();
        this.onClose();
      }
    }, 16);
  }

  private cleanupProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }

  getToastClass(): string {
    return `toast toast-${this.config.type}`;
  }
}