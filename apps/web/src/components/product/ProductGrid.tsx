import type { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

/**
 * ProductGrid - Responsive grid container for product cards
 * 
 * Responsive breakpoints:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px+): 2 columns
 * - Desktop (1024px+): 3 columns
 * - Large Desktop (1280px+): 4 columns
 * 
 * Features:
 * - Displays loading skeletons while fetching
 * - Shows empty state when no products
 * - Shows error state when fetch fails
 * - Maintains consistent spacing and layout
 */

interface ProductGridProps {
  /** Array of products to display */
  products: Product[];
  /** Loading state - shows skeletons when true */
  isLoading: boolean;
  /** Error message to display */
  error?: string | null;
  /** Number of skeleton cards to show while loading */
  skeletonCount?: number;
}

const ProductGrid = ({
  products,
  isLoading,
  error,
  skeletonCount = 8,
}: ProductGridProps) => {
  // Loading State - Show skeletons
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-label="Loading products"
        aria-busy="true"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4"
        role="alert"
        aria-live="polite"
      >
        <div className="w-16 h-16 mb-4 text-red-500">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load products
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4"
        role="status"
        aria-live="polite"
        data-testid="empty-products"
      >
        <div className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  // Products Grid
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
      aria-label={`${products.length} products`}
      data-testid="product-grid"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
