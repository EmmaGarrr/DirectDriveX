import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, EmbeddedViewRef, Type } from '@angular/core';
import { ToastComponent } from '../component/toast/toast.component';

export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showCloseButton?: boolean;
}

export interface Toast {
  id: string;
  config: ToastConfig;
  componentRef: ComponentRef<ToastComponent>;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private maxToasts = 5;
  private cleanupInterval: any;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    // Set up periodic cleanup to prevent memory leaks
    this.setupCleanupInterval();
  }

  success(message: string, duration: number = 2000): void {
    this.show({
      message,
      type: 'success',
      duration,
      showCloseButton: true
    });
  }

  error(message: string, duration: number = 2000): void {
    this.show({
      message,
      type: 'error',
      duration,
      showCloseButton: true
    });
  }

  warning(message: string, duration: number = 2000): void {
    this.show({
      message,
      type: 'warning',
      duration,
      showCloseButton: true
    });
  }

  info(message: string, duration: number = 2000): void {
    this.show({
      message,
      type: 'info',
      duration,
      showCloseButton: true
    });
  }

  private show(config: ToastConfig): void {
    // Create component using the new Angular 17+ approach
    const componentRef = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector
    });

    // Set input properties
    componentRef.instance.config = config;
    componentRef.instance.toastId = this.generateId();

    // Attach to DOM
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
    document.body.appendChild(domElem);

    // Add to toasts array with creation timestamp
    const toast: Toast = {
      id: componentRef.instance.toastId,
      config,
      componentRef,
      createdAt: Date.now()
    };

    this.toasts.push(toast);

    // Limit number of toasts
    if (this.toasts.length > this.maxToasts) {
      this.remove(this.toasts[0].id);
    }

    // Subscribe to close event
    componentRef.instance.close.subscribe(() => {
      this.remove(toast.id);
    });

    // Trigger change detection
    this.appRef.attachView(componentRef.hostView);
  }

  remove(toastId: string): void {
    const toastIndex = this.toasts.findIndex(t => t.id === toastId);
    if (toastIndex > -1) {
      const toast = this.toasts[toastIndex];
      
      // Safely remove from DOM
      try {
        this.appRef.detachView(toast.componentRef.hostView);
        toast.componentRef.destroy();
      } catch (error) {
        console.warn('Error destroying toast component:', error);
      }
      
      // Remove from array
      this.toasts.splice(toastIndex, 1);
    }
  }

  clearAll(): void {
    this.toasts.forEach(toast => {
      try {
        this.appRef.detachView(toast.componentRef.hostView);
        toast.componentRef.destroy();
      } catch (error) {
        console.warn('Error destroying toast component during clearAll:', error);
      }
    });
    this.toasts = [];
  }

  // Enhanced method to ensure toasts complete properly before navigation
  ensureToastCompletion(): Promise<void> {
    return new Promise((resolve) => {
      if (this.toasts.length === 0) {
        resolve();
        return;
      }

      // Wait for all toasts to complete or timeout after 5 seconds
      const timeout = setTimeout(() => {
        console.warn('Toast completion timeout - forcing cleanup');
        this.clearAll();
        resolve();
      }, 5000);

      // Check if all toasts are completed
      const checkCompletion = () => {
        if (this.toasts.length === 0) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };

      checkCompletion();
    });
  }

  private setupCleanupInterval(): void {
    // Clean up any orphaned toasts every 30 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxAge = 10000; // 10 seconds max age for toasts

      this.toasts = this.toasts.filter(toast => {
        const age = now - toast.createdAt;
        if (age > maxAge) {
          try {
            this.appRef.detachView(toast.componentRef.hostView);
            toast.componentRef.destroy();
          } catch (error) {
            console.warn('Error during cleanup interval:', error);
          }
          return false;
        }
        return true;
      });
    }, 30000);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Cleanup method for service destruction
  ngOnDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}
