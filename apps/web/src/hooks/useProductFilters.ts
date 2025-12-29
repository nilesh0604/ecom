import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * useProductFilters - Custom hook for managing product filters with URL sync
 *
 * Features:
 * - Syncs filter state to URL query params for shareable links
 * - Restores filter state from URL on page load
 * - Handles search, category, price range, sort, and pagination
 * - Memoized for performance
 *
 * URL Params:
 * - q: search query
 * - category: comma-separated category slugs
 * - minPrice: minimum price
 * - maxPrice: maximum price
 * - sort: sort field and direction (e.g., "price-asc")
 * - page: current page number
 */

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface ProductFilters {
  search: string;
  categories: string[];
  priceRange: PriceRange;
  sort: string;
  page: number;
}

interface UseProductFiltersResult {
  /** Current filter state */
  filters: ProductFilters;
  /** Update search query */
  setSearch: (search: string) => void;
  /** Update selected categories */
  setCategories: (categories: string[]) => void;
  /** Update price range */
  setPriceRange: (range: PriceRange) => void;
  /** Update sort option */
  setSort: (sort: string) => void;
  /** Update current page */
  setPage: (page: number) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Check if any filters are active */
  hasActiveFilters: boolean;
}

const ITEMS_PER_PAGE = 12;

const parseNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

function useProductFilters(): UseProductFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters = useMemo<ProductFilters>(() => {
    const search = searchParams.get('q') ?? '';
    const categoryParam = searchParams.get('category');
    const categories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
    const minPrice = parseNumber(searchParams.get('minPrice'));
    const maxPrice = parseNumber(searchParams.get('maxPrice'));
    const sort = searchParams.get('sort') ?? '';
    const page = parseInt(searchParams.get('page') ?? '1', 10) || 1;

    return {
      search,
      categories,
      priceRange: { min: minPrice, max: maxPrice },
      sort,
      page,
    };
  }, [searchParams]);

  // Update URL params helper
  const updateParams = useCallback(
    (updates: Partial<ProductFilters>) => {
      const newParams = new URLSearchParams(searchParams);

      // Handle search
      if ('search' in updates) {
        if (updates.search) {
          newParams.set('q', updates.search);
        } else {
          newParams.delete('q');
        }
      }

      // Handle categories
      if ('categories' in updates) {
        if (updates.categories && updates.categories.length > 0) {
          newParams.set('category', updates.categories.join(','));
        } else {
          newParams.delete('category');
        }
      }

      // Handle price range
      if ('priceRange' in updates) {
        if (updates.priceRange?.min !== null && updates.priceRange?.min !== undefined) {
          newParams.set('minPrice', updates.priceRange.min.toString());
        } else {
          newParams.delete('minPrice');
        }
        if (updates.priceRange?.max !== null && updates.priceRange?.max !== undefined) {
          newParams.set('maxPrice', updates.priceRange.max.toString());
        } else {
          newParams.delete('maxPrice');
        }
      }

      // Handle sort
      if ('sort' in updates) {
        if (updates.sort) {
          newParams.set('sort', updates.sort);
        } else {
          newParams.delete('sort');
        }
      }

      // Handle page
      if ('page' in updates) {
        if (updates.page && updates.page > 1) {
          newParams.set('page', updates.page.toString());
        } else {
          newParams.delete('page');
        }
      }

      // Reset page to 1 when filters change (except when explicitly changing page)
      if (!('page' in updates)) {
        newParams.delete('page');
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setSearch = useCallback(
    (search: string) => updateParams({ search }),
    [updateParams]
  );

  const setCategories = useCallback(
    (categories: string[]) => updateParams({ categories }),
    [updateParams]
  );

  const setPriceRange = useCallback(
    (priceRange: PriceRange) => updateParams({ priceRange }),
    [updateParams]
  );

  const setSort = useCallback(
    (sort: string) => updateParams({ sort }),
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => updateParams({ page }),
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.categories.length > 0 ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null ||
      filters.sort !== ''
    );
  }, [filters]);

  return {
    filters,
    setSearch,
    setCategories,
    setPriceRange,
    setSort,
    setPage,
    clearFilters,
    hasActiveFilters,
  };
}

export default useProductFilters;
export { ITEMS_PER_PAGE };
