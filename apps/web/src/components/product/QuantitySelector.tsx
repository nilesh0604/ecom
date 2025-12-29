import { useId } from 'react';

/**
 * QuantitySelector - Stepper input for adjusting quantity
 * 
 * Features:
 * - Increment/decrement buttons
 * - Min/max constraints
 * - Keyboard accessible
 * - Loading state support
 */

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    button: 'w-7 h-7',
    input: 'w-10 h-7 text-sm',
    icon: 'w-3 h-3',
  },
  md: {
    button: 'w-9 h-9',
    input: 'w-14 h-9 text-base',
    icon: 'w-4 h-4',
  },
  lg: {
    button: 'w-11 h-11',
    input: 'w-16 h-11 text-lg',
    icon: 'w-5 h-5',
  },
};

const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
}: QuantitySelectorProps) => {
  const id = useId();
  const classes = sizeClasses[size];

  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  const canDecrement = quantity > min && !disabled;
  const canIncrement = quantity < max && !disabled;

  return (
    <div className="inline-flex items-center" role="group" aria-labelledby={`${id}-label`} data-testid="quantity-selector">
      <span id={`${id}-label`} className="sr-only">
        Quantity selector
      </span>

      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={`${classes.button} flex items-center justify-center rounded-l-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
        data-testid="quantity-decrease"
      >
        <svg className={classes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Quantity Input */}
      <input
        type="number"
        id={id}
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
        className={`${classes.input} text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        data-testid="quantity-input"
      />

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={`${classes.button} flex items-center justify-center rounded-r-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
        data-testid="quantity-increase"
      >
        <svg className={classes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
