import { useCallback, useEffect } from 'react';

/**
 * Route Prefetching Utility
 * 
 * Purpose:
 * - Preload route components before user navigates
 * - Reduces perceived latency during navigation
 * - Improves user experience for predictable navigation paths
 * 
 * Interview Discussion Points:
 * - Prefetch strategies: on hover, on viewport, eager loading
 * - Resource hints: <link rel="prefetch">, <link rel="preload">
 * - Trade-offs: bandwidth usage vs speed, mobile considerations
 * - When to use: High-probability navigation, fast networks
 * 
 * @example
 * ```tsx
 * // In your route config
 * const routes = {
 *   home: {
 *     path: '/',
 *     component: lazy(() => import('@/pages/Home')),
 *   },
 *   products: {
 *     path: '/products',
 *     component: lazy(() => import('@/pages/Products')),
 *     prefetch: () => import('@/pages/Products'),
 *   },
 * };
 * 
 * // In a component
 * const { prefetchRoute } = useRoutePrefetch();
 * 
 * <Link
 *   to="/products"
 *   onMouseEnter={() => prefetchRoute('products')}
 * >
 *   Products
 * </Link>
 * ```
 */

// Route prefetch registry - stores import functions for lazy routes
type PrefetchFn = () => Promise<unknown>;
const prefetchRegistry = new Map<string, PrefetchFn>();
const prefetchedRoutes = new Set<string>();

/**
 * Register a route for prefetching
 * Call this when defining lazy routes
 */
export function registerPrefetch(routeName: string, importFn: PrefetchFn) {
  prefetchRegistry.set(routeName, importFn);
}

/**
 * Prefetch a registered route
 * Does nothing if already prefetched
 */
export async function prefetchRoute(routeName: string): Promise<void> {
  if (prefetchedRoutes.has(routeName)) return;

  const importFn = prefetchRegistry.get(routeName);
  if (importFn) {
    try {
      await importFn();
      prefetchedRoutes.add(routeName);
    } catch (error) {
      console.warn(`Failed to prefetch route: ${routeName}`, error);
    }
  }
}

/**
 * Clear prefetch cache (useful for testing or memory management)
 */
export function clearPrefetchCache() {
  prefetchedRoutes.clear();
}

// =============================================================================
// HOOK: useRoutePrefetch
// =============================================================================

interface UseRoutePrefetchOptions {
  /** Routes to prefetch eagerly on mount */
  eagerPrefetch?: string[];
  /** Delay before prefetching on hover (ms) */
  hoverDelay?: number;
}

interface UseRoutePrefetchResult {
  /** Prefetch a specific route */
  prefetchRoute: (routeName: string) => Promise<void>;
  /** Props to spread on Link elements for hover prefetch */
  getPrefetchProps: (routeName: string) => {
    onMouseEnter: () => void;
    onFocus: () => void;
  };
  /** Check if a route is prefetched */
  isPrefetched: (routeName: string) => boolean;
}

/**
 * Hook for route prefetching
 */
export function useRoutePrefetch(
  options: UseRoutePrefetchOptions = {}
): UseRoutePrefetchResult {
  const { eagerPrefetch = [], hoverDelay = 100 } = options;

  // Eager prefetch on mount
  useEffect(() => {
    eagerPrefetch.forEach((route) => {
      prefetchRoute(route);
    });
  }, [eagerPrefetch]);

  // Prefetch with optional delay (for hover)
  const prefetchWithDelay = useCallback(
    (routeName: string) => {
      const timeoutId = setTimeout(() => {
        prefetchRoute(routeName);
      }, hoverDelay);

      return () => clearTimeout(timeoutId);
    },
    [hoverDelay]
  );

  // Get props for Link elements
  const getPrefetchProps = useCallback(
    (routeName: string) => ({
      onMouseEnter: () => prefetchWithDelay(routeName),
      onFocus: () => prefetchWithDelay(routeName),
    }),
    [prefetchWithDelay]
  );

  const isPrefetched = useCallback((routeName: string) => prefetchedRoutes.has(routeName), []);

  return {
    prefetchRoute,
    getPrefetchProps,
    isPrefetched,
  };
}

// =============================================================================
// HOOK: useViewportPrefetch
// =============================================================================

/**
 * Hook that prefetches routes when elements enter viewport
 * Uses Intersection Observer for efficient detection
 * 
 * @example
 * ```tsx
 * const ref = useViewportPrefetch('products');
 * 
 * <div ref={ref}>
 *   <Link to="/products">Products</Link>
 * </div>
 * ```
 */
export function useViewportPrefetch(routeName: string) {
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            prefetchRoute(routeName);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      observer.observe(node);

      return () => observer.disconnect();
    },
    [routeName]
  );

  return ref;
}

// =============================================================================
// HELPER: prefetchOnHover
// =============================================================================

/**
 * Create event handlers for hover prefetch
 * Simpler alternative to useRoutePrefetch hook
 * 
 * @example
 * ```tsx
 * import { Link } from 'react-router-dom';
 * 
 * <Link to="/products" {...prefetchOnHover('products')}>
 *   Products
 * </Link>
 * ```
 */
export function prefetchOnHover(routeName: string, delay = 100) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    onMouseEnter: () => {
      timeoutId = setTimeout(() => prefetchRoute(routeName), delay);
    },
    onMouseLeave: () => {
      if (timeoutId) clearTimeout(timeoutId);
    },
    onFocus: () => {
      prefetchRoute(routeName);
    },
  };
}

export default {
  useRoutePrefetch,
  useViewportPrefetch,
  prefetchRoute,
  registerPrefetch,
  clearPrefetchCache,
  prefetchOnHover,
};
