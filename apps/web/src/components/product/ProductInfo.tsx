import { Badge } from '@/components/ui';

/**
 * ProductInfo - Displays product title, description, brand, and stock status
 * 
 * Features:
 * - SKU display
 * - Stock status indicator (In Stock, Low Stock, Out of Stock)
 * - Brand and category info
 * - Full description
 */

interface ProductInfoProps {
  title: string;
  description: string;
  brand: string;
  category: string;
  stock: number;
  sku?: string;
  rating: number;
  reviewCount: number;
}

const ProductInfo = ({
  title,
  description,
  brand,
  category,
  stock,
  sku,
  rating,
  reviewCount,
}: ProductInfoProps) => {
  // Convert string values to numbers (backend returns Decimal as strings)
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Determine stock status
  const getStockStatus = () => {
    if (isOutOfStock) {
      return { text: 'Out of Stock', variant: 'error' as const };
    }
    if (isLowStock) {
      return { text: `Only ${stock} left`, variant: 'warning' as const };
    }
    return { text: 'In Stock', variant: 'success' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-4">
      {/* Brand & Category */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="uppercase tracking-wide font-medium">{brand}</span>
        <span>•</span>
        <span className="capitalize">{category}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Rating & Reviews Summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" aria-label={`Rating: ${numericRating} out of 5 stars`}>
          {/* Star icons */}
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(numericRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            {numericRating.toFixed(1)}
          </span>
        </div>
        <span className="text-gray-400">•</span>
        <button
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
          onClick={() => {
            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </button>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <Badge variant={stockStatus.variant} ariaLabel={stockStatus.text}>
          {stockStatus.text}
        </Badge>
        {sku && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            SKU: {sku}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
