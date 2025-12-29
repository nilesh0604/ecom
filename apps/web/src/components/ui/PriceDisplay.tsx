import { formatCurrency, calculateDiscountedPrice, formatDiscount } from '@/utils/formatCurrency';

/**
 * PriceDisplay - Component for displaying product prices with optional discount
 * 
 * Handles:
 * - Regular price display
 * - Discounted price with original price strikethrough
 * - Discount percentage badge
 * - Accessible price announcements for screen readers
 * 
 * Usage:
 * <PriceDisplay price={99.99} /> // Simple price
 * <PriceDisplay price={99.99} discountPercentage={15} showDiscount /> // With discount
 */

interface PriceDisplayProps {
  /** Original product price */
  price: number;
  /** Discount percentage (0-100) */
  discountPercentage?: number;
  /** Whether to show the discount badge */
  showDiscount?: boolean;
  /** Size variant for different contexts */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: {
    current: 'text-sm font-semibold',
    original: 'text-xs',
    discount: 'text-xs',
  },
  md: {
    current: 'text-lg font-bold',
    original: 'text-sm',
    discount: 'text-xs',
  },
  lg: {
    current: 'text-2xl font-bold',
    original: 'text-base',
    discount: 'text-sm',
  },
};

const PriceDisplay = ({
  price,
  discountPercentage = 0,
  showDiscount = false,
  size = 'md',
  className = '',
}: PriceDisplayProps) => {
  // Convert string values to numbers (backend returns Decimal as strings)
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericDiscount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
  
  const hasDiscount = numericDiscount > 0;
  const discountedPrice = hasDiscount
    ? calculateDiscountedPrice(numericPrice, numericDiscount)
    : numericPrice;

  const sizeClass = sizeClasses[size];

  // Screen reader text for accessibility
  const ariaLabel = hasDiscount
    ? `Price: ${formatCurrency(discountedPrice)}, was ${formatCurrency(numericPrice)}, ${Math.round(numericDiscount)}% off`
    : `Price: ${formatCurrency(numericPrice)}`;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} aria-label={ariaLabel}>
      {/* Current (possibly discounted) price */}
      <span className={`${sizeClass.current} text-gray-900 dark:text-white`}>
        {formatCurrency(discountedPrice)}
      </span>

      {/* Original price (strikethrough) - only shown if there's a discount */}
      {hasDiscount && (
        <span
          className={`${sizeClass.original} text-gray-500 dark:text-gray-400 line-through`}
          aria-hidden="true"
        >
          {formatCurrency(numericPrice)}
        </span>
      )}

      {/* Discount badge - only shown if requested and there's a discount */}
      {showDiscount && hasDiscount && (
        <span
          className={`${sizeClass.discount} bg-rose-500 text-white px-1.5 py-0.5 rounded font-medium`}
          aria-hidden="true"
        >
          {formatDiscount(numericDiscount)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
