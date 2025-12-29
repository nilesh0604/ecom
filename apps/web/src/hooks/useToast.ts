import { useAppDispatch } from '@/store/hooks';
import { addToast, clearToasts, removeToast, type ToastType } from '@/store/slices/uiSlice';
import { useCallback } from 'react';

/**
 * useToast - Hook for triggering toast notifications
 * 
 * Features:
 * - Simple API for showing toasts
 * - Convenience methods for each type
 * - Returns functions for manual toast management
 * 
 * Usage:
 * const toast = useToast();
 * toast.success('Item added to cart!');
 * toast.error('Something went wrong');
 */

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

interface UseToastReturn {
  show: (options: ToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const useToast = (): UseToastReturn => {
  const dispatch = useAppDispatch();

  const show = useCallback(
    ({ message, type, duration = 4000 }: ToastOptions): string => {
      const id = generateId();
      dispatch(addToast({ id, message, type, duration }));
      return id;
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'success', duration });
    },
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'error', duration });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'warning', duration });
    },
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'info', duration });
    },
    [show]
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  const dismissAll = useCallback(() => {
    dispatch(clearToasts());
  }, [dispatch]);

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
};

export default useToast;
