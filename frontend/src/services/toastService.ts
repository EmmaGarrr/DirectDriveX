import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export class ToastService {
  private readonly DEFAULT_DURATION = 2500; // Match Angular's 2500ms duration
  private activeToasts: Set<string | number> = new Set();

  success(message: string, duration: number = this.DEFAULT_DURATION): string | number {
    const toastId = toast.success(message, {
      duration,
      onDismiss: () => this.activeToasts.delete(toastId),
      onAutoClose: () => this.activeToasts.delete(toastId),
    });
    this.activeToasts.add(toastId);
    return toastId;
  }

  error(message: string, duration: number = this.DEFAULT_DURATION): string | number {
    const toastId = toast.error(message, {
      duration,
      onDismiss: () => this.activeToasts.delete(toastId),
      onAutoClose: () => this.activeToasts.delete(toastId),
    });
    this.activeToasts.add(toastId);
    return toastId;
  }

  warning(message: string, duration: number = this.DEFAULT_DURATION): string | number {
    const toastId = toast.warning(message, {
      duration,
      onDismiss: () => this.activeToasts.delete(toastId),
      onAutoClose: () => this.activeToasts.delete(toastId),
    });
    this.activeToasts.add(toastId);
    return toastId;
  }

  info(message: string, duration: number = this.DEFAULT_DURATION): string | number {
    const toastId = toast.info(message, {
      duration,
      onDismiss: () => this.activeToasts.delete(toastId),
      onAutoClose: () => this.activeToasts.delete(toastId),
    });
    this.activeToasts.add(toastId);
    return toastId;
  }

  /**
   * Wait for all active toasts to complete
   * This matches the Angular implementation's ensureToastCompletion method
   */
  async ensureToastCompletion(): Promise<void> {
    if (this.activeToasts.size === 0) {
      return Promise.resolve();
    }

    // Wait for all active toasts to complete
    // Since we can't directly await toast completion, we'll wait for the duration + buffer
    await new Promise(resolve => {
      setTimeout(resolve, this.DEFAULT_DURATION + 100);
    });

    // Clear the active toasts set
    this.activeToasts.clear();
  }

  /**
   * Dismiss all active toasts
   */
  dismissAll(): void {
    toast.dismiss();
    this.activeToasts.clear();
  }

  /**
   * Get the number of active toasts
   */
  getActiveToastCount(): number {
    return this.activeToasts.size;
  }
}

// Export singleton instance to match Angular service pattern
export const toastService = new ToastService();
