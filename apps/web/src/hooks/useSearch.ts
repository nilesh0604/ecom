import { useCallback, useState, useTransition } from 'react';

/**
 * useSearch - Custom hook with useTransition for non-blocking search
 *
 * Demonstrates React 18's useTransition for interview purposes.
 * Keeps the UI responsive while filtering large datasets.
 *
 * Interview Discussion Points:
 * - useTransition marks updates as non-urgent
 * - isPending indicates transition in progress
 * - User input remains responsive during filtering
 * - Alternative to useDeferredValue for explicit control
 *
 * When to use useTransition:
 * - Filtering large lists
 * - Complex state updates that could freeze UI
 * - When you need isPending for loading indicators
 *
 * When NOT to use:
 * - Simple state updates
 * - When you need immediate feedback
 * - For data fetching (use Suspense instead)
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const { 
 *     searchQuery, 
 *     filteredResults, 
 *     isPending, 
 *     handleSearch 
 *   } = useSearch(products, (product, query) =>
 *     product.title.toLowerCase().includes(query.toLowerCase())
 *   );
 *
 *   return (
 *     <>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => handleSearch(e.target.value)}
 *       />
 *       {isPending && <span>Filtering...</span>}
 *       <ProductGrid products={filteredResults} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see https://react.dev/reference/react/useTransition
 */

interface UseSearchResult<T> {
  /** Current search query (immediate) */
  searchQuery: string;
  /** Filtered results (may be stale during transition) */
  filteredResults: T[];
  /** True while filtering is in progress */
  isPending: boolean;
  /** Update search query and filter results */
  handleSearch: (query: string) => void;
  /** Clear search and reset results */
  clearSearch: () => void;
}

/**
 * Hook for non-blocking search with useTransition
 *
 * @param items - Array of items to filter
 * @param filterFn - Function to determine if item matches query
 * @param initialQuery - Optional initial search query
 * @returns Search state and handlers
 */
function useSearch<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  initialQuery = ''
): UseSearchResult<T> {
  // Immediate state for input (keeps typing responsive)
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Deferred state for filtered results (can lag behind)
  const [filteredResults, setFilteredResults] = useState<T[]>(items);

  // useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition();

  /**
   * Handle search input change
   *
   * Key insight: We update searchQuery immediately (urgent),
   * but filter results in a transition (non-urgent).
   * This keeps the input responsive even with 10,000+ items.
   */
  const handleSearch = useCallback(
    (query: string) => {
      // Urgent: Update input immediately
      setSearchQuery(query);

      // Non-urgent: Filter in background
      startTransition(() => {
        if (!query.trim()) {
          setFilteredResults(items);
        } else {
          const results = items.filter((item) => filterFn(item, query));
          setFilteredResults(results);
        }
      });
    },
    [items, filterFn]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    startTransition(() => {
      setFilteredResults(items);
    });
  }, [items]);

  return {
    searchQuery,
    filteredResults,
    isPending,
    handleSearch,
    clearSearch,
  };
}

export default useSearch;
export type { UseSearchResult };
