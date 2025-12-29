import { Breadcrumbs } from '@/components/layout';
import {
    FilterSidebar,
    PaginationControls,
    ProductGrid,
    SearchBar,
    SortDropdown,
} from '@/components/product';
import { ITEMS_PER_PAGE, useFetch, useProductFilters } from '@/hooks';
import { productService } from '@/services/productService';
import type { PaginatedResponse, Product } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Products Page - Main product listing with search, filters, and pagination
 *
 * Features:
 * - Search products with debounced input
 * - Filter by category and price range
 * - Sort by price, rating, name
 * - All filters sync to URL for shareable links
 * - Responsive layout with mobile filter drawer
 * - Pagination with URL sync
 */

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    filters,
    setSearch,
    setCategories,
    setPriceRange,
    setSort,
    setPage,
    clearFilters,
    hasActiveFilters,
  } = useProductFilters();

  const skip = (filters.page - 1) * ITEMS_PER_PAGE;

  // Fetch categories for filter sidebar
  const categoriesFetcher = useCallback(
    (signal: AbortSignal) => productService.getCategories(signal),
    []
  );
  const { data: categoriesData, isLoading: categoriesLoading } = useFetch<string[]>(
    categoriesFetcher
  );
  const categories = categoriesData || [];

  // Fetch products based on filters
  const productsFetcher = useCallback(
    async (signal: AbortSignal) => {
      // If searching, use the search endpoint
      if (filters.search) {
        return productService.search(filters.search, skip, ITEMS_PER_PAGE, signal);
      }
      // If filtering by single category, use category endpoint
      if (filters.categories.length === 1) {
        return productService.getByCategory(
          filters.categories[0],
          skip,
          ITEMS_PER_PAGE,
          signal
        );
      }
      // Otherwise, fetch all products
      return productService.getAll(skip, ITEMS_PER_PAGE, signal);
    },
    [filters.search, filters.categories, skip]
  );

  const { data, isLoading, error } = useFetch<PaginatedResponse<Product>>(productsFetcher, {
    deps: [filters.search, filters.categories.join(','), skip],
  });

  // Apply client-side filters (price range, multiple categories, sorting)
  const filteredProducts = useMemo(() => {
    let result = data?.products || [];

    // Filter by multiple categories (if more than one selected)
    if (filters.categories.length > 1) {
      result = result.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Filter by price range (convert to number for comparison)
    if (filters.priceRange.min !== null) {
      result = result.filter((product) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        return price >= filters.priceRange.min!;
      });
    }
    if (filters.priceRange.max !== null) {
      result = result.filter((product) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        return price <= filters.priceRange.max!;
      });
    }

    // Sort products (convert to numbers for comparison)
    if (filters.sort) {
      const [field, direction] = filters.sort.split('-') as [
        'price' | 'rating' | 'title',
        'asc' | 'desc'
      ];
      result = [...result].sort((a, b) => {
        let comparison = 0;
        if (field === 'price') {
          const aPrice = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const bPrice = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          comparison = aPrice - bPrice;
        } else if (field === 'rating') {
          const aRating = typeof a.rating === 'string' ? parseFloat(a.rating) : a.rating;
          const bRating = typeof b.rating === 'string' ? parseFloat(b.rating) : b.rating;
          comparison = aRating - bRating;
        } else if (field === 'title') {
          comparison = a.title.localeCompare(b.title);
        }
        return direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data?.products, filters.categories, filters.priceRange, filters.sort]);

  // Calculate totals for pagination
  // Note: When using client-side filtering, the total might differ from API total
  const totalProducts = filters.priceRange.min !== null || filters.priceRange.max !== null
    ? filteredProducts.length
    : data?.total || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPage]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearch(query);
    },
    [setSearch]
  );

  const toggleFilters = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const closeFilters = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.priceRange.min !== null) count += 1;
    if (filters.priceRange.max !== null) count += 1;
    return count;
  }, [filters.categories, filters.priceRange]);

  return (
    <>
      <Helmet>
        <title>
          {filters.search ? `Search: ${filters.search} - eCom` : 'Products - eCom'}
        </title>
        <meta name="description" content="Browse our collection of quality products." />
      </Helmet>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <FilterSidebar
              categories={categories}
              selectedCategories={filters.categories}
              priceRange={filters.priceRange}
              onCategoryChange={setCategories}
              onPriceChange={setPriceRange}
              onClearFilters={clearFilters}
              isLoading={categoriesLoading}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <FilterSidebar
          categories={categories}
          selectedCategories={filters.categories}
          priceRange={filters.priceRange}
          onCategoryChange={setCategories}
          onPriceChange={setPriceRange}
          onClearFilters={clearFilters}
          isLoading={categoriesLoading}
          isOpen={isFilterOpen}
          onClose={closeFilters}
          className="lg:hidden"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
              {!isLoading && (
                <p className="text-gray-600 dark:text-gray-400">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearchChange}
                  isLoading={isLoading}
                  initialValue={filters.search}
                  placeholder="Search products..."
                />
              </div>

              {/* Sort and Filter Toggle */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={toggleFilters}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <SortDropdown value={filters.sort} onChange={setSort} />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                {filters.search && (
                  <FilterBadge
                    label={`Search: "${filters.search}"`}
                    onRemove={() => setSearch('')}
                  />
                )}
                {filters.categories.map((cat) => (
                  <FilterBadge
                    key={cat}
                    label={formatCategoryName(cat)}
                    onRemove={() =>
                      setCategories(filters.categories.filter((c) => c !== cat))
                    }
                  />
                ))}
                {filters.priceRange.min !== null && (
                  <FilterBadge
                    label={`Min: $${filters.priceRange.min}`}
                    onRemove={() =>
                      setPriceRange({ ...filters.priceRange, min: null })
                    }
                  />
                )}
                {filters.priceRange.max !== null && (
                  <FilterBadge
                    label={`Max: $${filters.priceRange.max}`}
                    onRemove={() =>
                      setPriceRange({ ...filters.priceRange, max: null })
                    }
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error?.message}
            skeletonCount={ITEMS_PER_PAGE}
          />

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <PaginationControls
              currentPage={filters.page}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Helper component for filter badges
interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const FilterBadge = ({ label, onRemove }: FilterBadgeProps) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
    {label}
    <button
      onClick={onRemove}
      className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
      aria-label={`Remove filter: ${label}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

// Helper function to format category names
const formatCategoryName = (category: string) =>
  category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default Products;
