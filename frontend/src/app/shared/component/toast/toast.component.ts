import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
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

  private startProgressBar(): void {
    const duration = this.config.duration || 3000;
    this.startTime = Date.now();
    this.lastProgressUpdate = this.startTime;

    // Update progress every 16ms (60fps) for smooth animation
    this.progressInterval = setInterval(() => {
      if (this.isClosing || this.isProgressComplete) {
        this.cleanupProgress();
        return;
      }

      const currentTime = Date.now();
      const elapsed = currentTime - this.startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      // Calculate progress percentage
      const newProgress = Math.max(0, (remaining / duration) * 100);
      
      // Only update if progress has actually changed (prevents unnecessary updates)
      if (Math.abs(newProgress - this.progress) >= 0.1 || newProgress === 0) {
        this.progress = newProgress;
        this.lastProgressUpdate = currentTime;
      }

      // When progress reaches 0, mark as complete and close
      if (this.progress <= 0) {
        this.isProgressComplete = true;
        this.cleanupProgress();
        this.onClose();
      }
    }, 16); // 60fps for smooth animation
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