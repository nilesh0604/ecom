import { Button } from '@/components/ui';

/**
 * AddToCartButton - Primary CTA button for adding products to cart
 * 
 * Features:
 * - Loading state during add operation
 * - Disabled when out of stock
 * - Success feedback after adding
 * - Quantity indicator if already in cart
 */

interface AddToCartButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  isOutOfStock?: boolean;
  isInCart?: boolean;
  cartQuantity?: number;
  className?: string;
}

const AddToCartButton = ({
  onClick,
  isLoading = false,
  isOutOfStock = false,
  isInCart = false,
  cartQuantity = 0,
  className = '',
}: AddToCartButtonProps) => {
  // Determine button text and variant
  const getButtonContent = () => {
    if (isOutOfStock) {
      return { text: 'Out of Stock', variant: 'secondary' as const };
    }
    if (isInCart) {
      return { text: `In Cart (${cartQuantity})`, variant: 'secondary' as const };
    }
    return { text: 'Add to Cart', variant: 'primary' as const };
  };

  const { text, variant } = getButtonContent();

  return (
    <Button
      variant={variant}
      size="lg"
      fullWidth
      onClick={onClick}
      isLoading={isLoading}
      disabled={isOutOfStock}
      className={className}
      aria-label={isOutOfStock ? 'Product is out of stock' : `Add to cart${isInCart ? ` (currently ${cartQuantity} in cart)` : ''}`}
      data-testid="add-to-cart-button"
    >
      {!isLoading && (
        <svg
          className="w-5 h-5 mr-2 -ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )}
      {text}
    </Button>
  );
};

export default AddToCartButton;
