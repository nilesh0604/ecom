import { type ReactNode } from 'react';

/**
 * Alert - Inline contextual feedback component
 * 
 * Features:
 * - Four variants: success, error, warning, info
 * - Optional title and icon
 * - Supports custom children for complex content
 * - Accessible with role="alert"
 */

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const alertStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

const Alert = ({
  variant = 'info',
  title,
  children,
  icon = true,
  className = '',
  onDismiss,
}: AlertProps) => {
  const styles = alertStyles[variant];

  return (
    <div
      role="alert"
      className={`
        flex gap-3 p-4 rounded-lg border
        ${styles.bg} ${styles.border}
        ${className}
      `}
    >
      {/* Icon */}
      {icon && (
        <svg
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.text}`}
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
      )}

      {/* Content */}
      <div className="flex-1">
        {title && (
          <h4 className={`font-medium mb-1 ${styles.text}`}>
            {title}
          </h4>
        )}
        <div className={`text-sm ${styles.text}`}>
          {children}
        </div>
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`
            flex-shrink-0 rounded-lg p-1
            hover:bg-black/5 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
            ${styles.text}
          `}
          aria-label="Dismiss alert"
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
      )}
    </div>
  );
};

export default Alert;
