import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Input Component
 *
 * Reusable form input with label, error state, and icon support.
 * Works seamlessly with React Hook Form via forwardRef.
 *
 * Features:
 * - Label with required indicator
 * - Error and helper text display
 * - Left/right icon slots
 * - Dark mode support
 * - Accessible (aria-invalid, aria-describedby)
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    const baseInputClasses =
      'block w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 dark:text-white dark:placeholder-gray-500';

    const stateClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:focus:border-indigo-400';

    const bgClasses = disabled
      ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-800'
      : 'bg-white dark:bg-gray-900';

    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`${baseInputClasses} ${stateClasses} ${bgClasses} ${iconPadding}`}
            data-testid={props['data-testid'] || `${props.name || inputId}-input`}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !hasError && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
