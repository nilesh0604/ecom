import { QuantitySelector } from '@/components/product';
import type { CartItem as CartItemType } from '@/types';
import { calculateDiscountedPrice, formatCurrency } from '@/utils/formatCurrency';
import { Link } from 'react-router-dom';

/**
 * CartItem - Displays a single cart item with controls
 * 
 * Features:
 * - Product image and info
 * - Quantity adjustment
 * - Remove button
 * - Line total display
 * - Link to product detail
 */

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  maxQuantity?: number;
}

const CartItem = ({ item, onQuantityChange, onRemove, maxQuantity = 99 }: CartItemProps) => {
  const discountedPrice = calculateDiscountedPrice(item.price, item.discountPercentage);
  const lineTotal = discountedPrice * item.quantity;
  const hasDiscount = item.discountPercentage > 0;

  return (
    <article className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0" data-testid="cart-item">
      {/* Product Image */}
      <Link
        to={`/products/${item.id}`}
        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.id}`}
          className="text-sm sm:text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
        >
          {item.title}
        </Link>

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>

        {/* Controls Row */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          {/* Quantity Selector */}
          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
            max={maxQuantity}
            size="sm"
          />

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label={`Remove ${item.title} from cart`}
            data-testid="remove-item-button"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="flex-shrink-0 text-right">
        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          {formatCurrency(lineTotal)}
        </span>
      </div>
    </article>
  );
};

export default CartItem;
