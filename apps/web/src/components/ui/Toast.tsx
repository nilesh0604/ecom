import { useAppDispatch } from '@/store/hooks';
import { removeToast, type Toast as ToastType, type ToastType as ToastVariant } from '@/store/slices/uiSlice';
import { useCallback, useEffect } from 'react';

/**
 * Toast - Individual toast notification component
 * 
 * Features:
 * - Auto-dismiss after duration
 * - Manual dismiss with close button
 * - Accessible with role="alert"
 * - Different visual styles for each type
 * - Slide-in animation
 */

interface ToastProps {
  toast: ToastType;
}

const toastStyles: Record<ToastVariant, { bg: string; icon: string; iconColor: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
};

const textStyles: Record<ToastVariant, string> = {
  success: 'text-green-800 dark:text-green-200',
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-yellow-800 dark:text-yellow-200',
  info: 'text-blue-800 dark:text-blue-200',
};

const Toast = ({ toast }: ToastProps) => {
  const dispatch = useAppDispatch();
  const { id, type, message, duration = 4000 } = toast;
  const styles = toastStyles[type];
  const textColor = textStyles[type];

  const handleDismiss = useCallback(() => {
    dispatch(removeToast(id));
  }, [dispatch, id]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        animate-slide-in-right
        ${styles.bg}
      `}
    >
      {/* Icon */}
      <svg
        className={`w-5 h-5 flex-shrink-0 ${styles.iconColor}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={styles.icon}
        />
      </svg>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${textColor}`}>
        {message}
      </p>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className={`
          flex-shrink-0 rounded-lg p-1 
          hover:bg-black/5 dark:hover:bg-white/10
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
          ${textColor}
        `}
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
