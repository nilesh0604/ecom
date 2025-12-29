import { useCallback, useEffect, useState } from 'react';

/**
 * Infinite Scroll Hook
 * 
 * Purpose:
 * - Load data incrementally as user scrolls
 * - Improves perceived performance for large datasets
 * - Reduces initial load time
 * 
 * Interview Discussion Points:
 * - vs Pagination: Better UX for browsing, harder to jump to specific pages
 * - Intersection Observer: Modern API, more performant than scroll events
 * - Virtualization: Can combine with virtual scrolling for best performance
 * - SEO considerations: Need to handle for crawlers (SSR or hybrid)
 * 
 * @example
 * ```tsx
 * const { items, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
 *   fetchItems: async (page) => {
 *     const response = await fetch(`/api/products?page=${page}`);
 *     const data = await response.json();
 *     return { items: data.products, hasMore: data.hasMore };
 *   },
 * });
 * 
 * return (
 *   <div>
 *     {items.map(item => <ProductCard key={item.id} product={item} />)}
 *     <div ref={loadMoreRef}>
 *       {isLoading && <Spinner />}
 *     </div>
 *   </div>
 * );
 * ```
 */

interface UseInfiniteScrollOptions<T> {
  /** Function to fetch items for a given page */
  fetchItems: (page: number, signal: AbortSignal) => Promise<{ items: T[]; hasMore: boolean }>;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Root margin for intersection observer (default: '100px') */
  rootMargin?: string;
  /** Threshold for intersection observer (default: 0.1) */
  threshold?: number;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies that should reset the list */
  resetDeps?: unknown[];
}

interface UseInfiniteScrollResult<T> {
  /** All loaded items */
  items: T[];
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Ref to attach to the load more trigger element */
  loadMoreRef: (node: HTMLElement | null) => void;
  /** Current page number */
  page: number;
  /** Manually trigger load more */
  loadMore: () => void;
  /** Reset to initial state */
  reset: () => void;
}

export function useInfiniteScroll<T>({
  fetchItems,
  initialPage = 1,
  rootMargin = '100px',
  threshold = 0.1,
  fetchOnMount = true,
  resetDeps = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLElement | null>(null);

  // Reset when dependencies change
  useEffect(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchItems(page, controller.signal);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, page, isLoading, hasMore]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Intersection Observer setup
  useEffect(() => {
    if (!loadMoreNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(loadMoreNode);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreNode, hasMore, isLoading, loadMore, rootMargin, threshold]);

  // Fetch on mount
  useEffect(() => {
    if (fetchOnMount && items.length === 0 && hasMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount]);

  // Ref callback for the load more element
  const loadMoreRef = useCallback((node: HTMLElement | null) => {
    setLoadMoreNode(node);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMoreRef,
    page,
    loadMore,
    reset,
  };
}

export default useInfiniteScroll;
