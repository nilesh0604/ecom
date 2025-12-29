import { useCallback, useMemo, useState } from 'react';

/**
 * FilterSidebar - Faceted search sidebar for filtering products
 *
 * Features:
 * - Category filter with checkboxes
 * - Price range filter with min/max inputs
 * - Collapsible sections for mobile
 * - Clear filters button
 * - Responsive design (drawer on mobile)
 *
 * @param categories - List of available categories
 * @param selectedCategories - Currently selected category IDs
 * @param priceRange - Current price range filter
 * @param onCategoryChange - Callback when categories change
 * @param onPriceChange - Callback when price range changes
 * @param onClearFilters - Callback to clear all filters
 */

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface FilterSidebarProps {
  /** List of available categories */
  categories: string[];
  /** Currently selected categories */
  selectedCategories: string[];
  /** Current price range filter */
  priceRange: PriceRange;
  /** Callback when categories change */
  onCategoryChange: (categories: string[]) => void;
  /** Callback when price range changes */
  onPriceChange: (range: PriceRange) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether the sidebar is loading data */
  isLoading?: boolean;
  /** Whether the sidebar is open (mobile) */
  isOpen?: boolean;
  /** Callback to close the sidebar (mobile) */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const FilterSidebar = ({
  categories,
  selectedCategories,
  priceRange,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
  isLoading = false,
  isOpen = true,
  onClose,
  className = '',
}: FilterSidebarProps) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [localMin, setLocalMin] = useState<string>(priceRange.min?.toString() ?? '');
  const [localMax, setLocalMax] = useState<string>(priceRange.max?.toString() ?? '');

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedCategories.length > 0 || priceRange.min !== null || priceRange.max !== null;
  }, [selectedCategories, priceRange]);

  // Handle category toggle
  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];
      onCategoryChange(newCategories);
    },
    [selectedCategories, onCategoryChange]
  );

  // Handle price input changes
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMin(e.target.value);
  }, []);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMax(e.target.value);
  }, []);

  // Apply price filter on blur or enter
  const applyPriceFilter = useCallback(() => {
    const min = localMin ? parseFloat(localMin) : null;
    const max = localMax ? parseFloat(localMax) : null;

    // Validate: min should not be greater than max
    if (min !== null && max !== null && min > max) {
      return;
    }

    onPriceChange({ min, max });
  }, [localMin, localMax, onPriceChange]);

  const handlePriceKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        applyPriceFilter();
      }
    },
    [applyPriceFilter]
  );

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const sidebarContent = (
    <div className={`bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
              aria-label="Close filters"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full p-4 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          aria-expanded={isCategoryOpen}
        >
          <span className="font-medium">Categories</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCategoryOpen && (
          <div className="px-4 pb-4 space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No categories available</p>
            ) : (
              categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {formatCategoryName(category)}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full p-4 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          aria-expanded={isPriceOpen}
        >
          <span className="font-medium">Price Range</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isPriceOpen && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="price-min" className="sr-only">
                  Minimum price
                </label>
                <input
                  id="price-min"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={localMin}
                  onChange={handleMinChange}
                  onBlur={applyPriceFilter}
                  onKeyDown={handlePriceKeyDown}
                  className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <div className="flex-1">
                <label htmlFor="price-max" className="sr-only">
                  Maximum price
                </label>
                <input
                  id="price-max"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={localMax}
                  onChange={handleMaxChange}
                  onBlur={applyPriceFilter}
                  onKeyDown={handlePriceKeyDown}
                  className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="mt-3 w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: Render as overlay
  if (onClose) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:transform-none ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
          aria-label="Filters"
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: Render inline
  return (
    <aside className="hidden md:block" aria-label="Filters">
      {sidebarContent}
    </aside>
  );
};

export default FilterSidebar;
