// use-toast.ts - UI toast hook for NextJS
import { toast } from 'sonner';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const DEFAULT_DURATION = 3000;
  
  const showToast = ({ 
    title, 
    description, 
    variant = 'default',
    duration = DEFAULT_DURATION 
  }: ToastProps) => {
    switch (variant) {
      case 'destructive':
        toast.error(title, {
          description,
          duration
        });
        break;
      case 'success':
        toast.success(title, {
          description,
          duration
        });
        break;
      case 'warning':
        toast.warning(title, {
          description,
          duration
        });
        break;
      default:
        toast(title, {
          description,
          duration
        });
    }
  };

  return {
    toast: showToast,
    dismiss: toast.dismiss
  };
}
