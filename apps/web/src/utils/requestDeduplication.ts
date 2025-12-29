/**
 * Request Deduplication Utility
 * 
 * Purpose:
 * - Prevent duplicate API requests for the same resource
 * - Share response between concurrent identical requests
 * - Reduce server load and improve performance
 * 
 * Interview Discussion Points:
 * - Race conditions: Multiple components requesting same data
 * - Caching strategies: in-flight dedup vs response cache
 * - Memory management: WeakMap, TTL, cache invalidation
 * - vs React Query/SWR: These libraries handle this automatically
 * 
 * How it works:
 * 1. First request for a key creates a promise and stores it
 * 2. Subsequent requests for same key return the stored promise
 * 3. Once resolved, promise is removed from cache
 * 4. All callers get the same response
 * 
 * @example
 * ```typescript
 * const deduplicator = createRequestDeduplicator();
 * 
 * // These will only make ONE request
 * const [user1, user2] = await Promise.all([
 *   deduplicator.dedupe('user-1', () => fetch('/api/users/1')),
 *   deduplicator.dedupe('user-1', () => fetch('/api/users/1')),
 * ]);
 * ```
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

interface DeduplicatorOptions {
  /** Time in ms after which a pending request is considered stale (default: 30000) */
  staleTime?: number;
  /** Whether to log deduplication events (default: false in production) */
  debug?: boolean;
}

interface RequestDeduplicator {
  /** Deduplicate a request by key */
  dedupe: <T>(key: string, requestFn: () => Promise<T>) => Promise<T>;
  /** Clear a specific key from the cache */
  clear: (key: string) => void;
  /** Clear all pending requests */
  clearAll: () => void;
  /** Check if a request is pending for a key */
  isPending: (key: string) => boolean;
  /** Get count of pending requests */
  pendingCount: () => number;
}

/**
 * Create a request deduplicator instance
 */
export function createRequestDeduplicator(
  options: DeduplicatorOptions = {}
): RequestDeduplicator {
  const { 
    staleTime = 30000, 
    debug = import.meta.env.DEV 
  } = options;

  const pendingRequests = new Map<string, PendingRequest<unknown>>();

  const log = (...args: unknown[]) => {
    if (debug) {
      console.log('[RequestDeduplicator]', ...args);
    }
  };

  const dedupe = async <T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    // Check for existing pending request
    const existing = pendingRequests.get(key) as PendingRequest<T> | undefined;

    if (existing) {
      const age = Date.now() - existing.timestamp;
      
      // Check if existing request is stale
      if (age < staleTime) {
        log(`Reusing pending request for key: ${key}`);
        return existing.promise;
      } else {
        log(`Stale request for key: ${key}, making new request`);
        pendingRequests.delete(key);
      }
    }

    log(`New request for key: ${key}`);

    // Create new request
    const promise = requestFn()
      .then((result) => {
        log(`Request completed for key: ${key}`);
        pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        log(`Request failed for key: ${key}`, error);
        pendingRequests.delete(key);
        throw error;
      });

    pendingRequests.set(key, {
      promise: promise as Promise<unknown>,
      timestamp: Date.now(),
    });

    return promise;
  };

  const clear = (key: string) => {
    pendingRequests.delete(key);
    log(`Cleared key: ${key}`);
  };

  const clearAll = () => {
    pendingRequests.clear();
    log('Cleared all pending requests');
  };

  const isPending = (key: string): boolean => {
    return pendingRequests.has(key);
  };

  const pendingCount = (): number => {
    return pendingRequests.size;
  };

  return {
    dedupe,
    clear,
    clearAll,
    isPending,
    pendingCount,
  };
}

// =============================================================================
// ENHANCED API CLIENT WITH DEDUPLICATION
// =============================================================================

import { apiClient } from './apiClient';

const deduplicator = createRequestDeduplicator();

/**
 * Enhanced API client methods with automatic deduplication
 * 
 * @example
 * ```typescript
 * // These concurrent calls will only make ONE request
 * const [products1, products2] = await Promise.all([
 *   deduplicatedApi.get('/products'),
 *   deduplicatedApi.get('/products'),
 * ]);
 * ```
 */
export const deduplicatedApi = {
  /**
   * GET request with deduplication
   * Identical concurrent GET requests share the same response
   */
  get: <T>(endpoint: string): Promise<T> => {
    const key = `GET:${endpoint}`;
    return deduplicator.dedupe(key, () => apiClient.get<T>(endpoint));
  },

  /**
   * POST requests are NOT deduplicated by default
   * as they typically have side effects
   */
  post: <T>(endpoint: string, body?: unknown): Promise<T> => {
    return apiClient.post<T>(endpoint, body);
  },

  /**
   * Clear deduplication cache for an endpoint
   */
  invalidate: (endpoint: string) => {
    deduplicator.clear(`GET:${endpoint}`);
  },

  /**
   * Clear all deduplication cache
   */
  invalidateAll: () => {
    deduplicator.clearAll();
  },
};

// =============================================================================
// CACHE WITH TTL (Simple Response Cache)
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Default TTL in milliseconds (default: 5 minutes) */
  defaultTTL?: number;
  /** Maximum number of entries (default: 100) */
  maxEntries?: number;
}

/**
 * Simple in-memory cache with TTL
 * 
 * Interview Discussion Points:
 * - LRU eviction: Remove least recently used when full
 * - TTL: Time-based expiration
 * - Cache invalidation: "One of the two hard problems in CS"
 * - Stale-while-revalidate: Serve stale, refresh in background
 */
export function createCache<T>(options: CacheOptions = {}) {
  const { defaultTTL = 5 * 60 * 1000, maxEntries = 100 } = options;
  const cache = new Map<string, CacheEntry<T>>();

  const set = (key: string, data: T, ttl = defaultTTL) => {
    // Evict oldest entries if at capacity
    if (cache.size >= maxEntries) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  };

  const get = (key: string): T | undefined => {
    const entry = cache.get(key);
    
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return undefined;
    }

    return entry.data;
  };

  const has = (key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return false;
    }
    return true;
  };

  const invalidate = (key: string) => {
    cache.delete(key);
  };

  const invalidatePattern = (pattern: RegExp) => {
    for (const key of cache.keys()) {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    }
  };

  const clear = () => {
    cache.clear();
  };

  const size = () => cache.size;

  return {
    set,
    get,
    has,
    invalidate,
    invalidatePattern,
    clear,
    size,
  };
}

export default {
  createRequestDeduplicator,
  deduplicatedApi,
  createCache,
};
