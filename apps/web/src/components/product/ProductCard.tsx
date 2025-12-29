import { Badge, PriceDisplay } from '@/components/ui';
import type { Product } from '@/types';
import { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * ProductCard - Individual product preview card for grid display
 *
 * Uses React.memo for performance optimization to prevent unnecessary re-renders
 * when parent component (ProductGrid) re-renders but the product data hasn't changed.
 *
 * Interview Discussion Points:
 * - React.memo does shallow comparison of props by default
 * - Custom areEqual function for deep comparison when needed
 * - When to use: lists, expensive renders, stable data
 * - When NOT to use: frequently changing props, simple components
 *
 * Used in:
 * - Product listing page grid
 * - Search results
 * - Related products sections
 *
 * Features:
 * - Responsive image with lazy loading
 * - Price display with discount
 * - Stock status indicator
 * - Hover effects for better UX
 * - Accessible with proper alt text and focus states
 *
 * @see https://react.dev/reference/react/memo
 */

interface ProductCardProps {
  product: Product;
}

/**
 * Custom comparison function for React.memo
 *
 * Returns true if props are equal (skip re-render)
 * Returns false if props are different (re-render needed)
 *
 * Interview tip: Explain why shallow comparison isn't always enough
 */
function arePropsEqual(
  prevProps: ProductCardProps,
  nextProps: ProductCardProps
): boolean {
  // Compare by product ID - if same product, skip re-render
  // This is more efficient than deep comparison
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.stock === nextProps.product.stock &&
         prevProps.product.discountPercentage === nextProps.product.discountPercentage;
}

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    title,
    thumbnail,
    price,
    discountPercentage,
    rating,
    stock,
    brand,
  } = product;

  // Convert string values to numbers (backend returns Decimal as strings)
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericDiscount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const hasSignificantDiscount = numericDiscount >= 10;

  return (
    <article
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
      aria-label={`${title} by ${brand}`}
      data-testid="product-card"
    >
      {/* Product Image with Link */}
      <Link
        to={`/products/${id}`}
        className="block relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700"
        aria-label={`View details for ${title}`}
      >
        <img
          src={thumbnail}
          alt={`${title} - ${brand}`}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-50' : ''
          }`}
        />

        {/* Badges Container */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Discount Badge */}
          {hasSignificantDiscount && !isOutOfStock && (
            <Badge variant="sale" ariaLabel={`${Math.round(numericDiscount)}% off`}>
              -{Math.round(numericDiscount)}%
            </Badge>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <Badge variant="error" ariaLabel="Out of stock">
              Out of Stock
            </Badge>
          )}

          {/* Low Stock Badge */}
          {isLowStock && (
            <Badge variant="warning" ariaLabel={`Only ${stock} left`}>
              Only {stock} left
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          {brand}
        </p>

        {/* Title */}
        <Link to={`/products/${id}`}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2" aria-label={`Rating: ${numericRating} out of 5 stars`}>
          <svg
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {numericRating.toFixed(1)}
          </span>
        </div>

        {/* Price */}
        <div className="mt-3">
          <PriceDisplay
            price={numericPrice}
            discountPercentage={numericDiscount}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}, arePropsEqual);

export default ProductCard;
