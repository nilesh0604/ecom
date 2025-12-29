import type { ReactNode } from 'react';

/**
 * Badge - Reusable status indicator component
 * 
 * Used for:
 * - Product labels (Sale, New, Out of Stock)
 * - Order status indicators
 * - Category tags
 * - Any small status indicator
 * 
 * Accessibility:
 * - Uses semantic styling with aria-label for screen readers
 * - High contrast colors for visibility
 */

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'sale';

interface BadgeProps {
  /** Content to display in the badge */
  children: ReactNode;
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label (defaults to children if string) */
  ariaLabel?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sale: 'bg-rose-500 text-white dark:bg-rose-600',
};

const Badge = ({
  children,
  variant = 'default',
  className = '',
  ariaLabel,
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
    </span>
  );
};

export default Badge;
