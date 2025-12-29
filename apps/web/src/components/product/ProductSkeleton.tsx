/**
 * ProductSkeleton - Loading placeholder for ProductCard
 * 
 * Why skeleton loaders:
 * - Provides visual feedback that content is loading
 * - Maintains layout stability (prevents content jump)
 * - Better UX than a spinner for grid layouts
 * - Matches the exact dimensions of ProductCard for smooth transition
 * 
 * Accessibility:
 * - aria-busy indicates loading state to screen readers
 * - aria-label describes what's loading
 */

const ProductSkeleton = () => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse"
      aria-busy="true"
      aria-label="Loading product"
      role="article"
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content Placeholder */}
      <div className="p-4">
        {/* Brand Placeholder */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />

        {/* Title Placeholder - 2 lines */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 mb-3">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8" />
        </div>

        {/* Price Placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
