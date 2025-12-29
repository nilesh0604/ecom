import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '@/types';

/**
 * useFetch - Custom hook for data fetching with loading, error, and abort support
 * 
 * Why this hook:
 * - Standardizes data fetching patterns across the app
 * - Handles loading and error states automatically
 * - Cancels stale requests using AbortController (prevents race conditions)
 * - Provides refetch capability for manual data refresh
 * - Type-safe with generics for response data
 * 
 * @param fetcher - Async function that returns data (should accept AbortSignal)
 * @param options - Configuration options
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * Example usage:
 * const { data, isLoading, error, refetch } = useFetch(
 *   (signal) => productService.getAll(0, 10, signal),
 *   { enabled: true }
 * );
 */

interface UseFetchOptions {
  /** Whether to execute the fetch immediately (default: true) */
  enabled?: boolean;
  /** Dependencies that trigger refetch when changed */
  deps?: unknown[];
}

interface UseFetchResult<T> {
  /** The fetched data (null if not loaded yet or error occurred) */
  data: T | null;
  /** True while the request is in flight */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually trigger a refetch */
  refetch: () => Promise<void>;
}

function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { enabled = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  // Use ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef<boolean>(true);
  // Store the current AbortController to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute the fetch operation
   * - Creates new AbortController for this request
   * - Cancels any in-flight requests from previous calls
   * - Handles success and error states
   */
  const fetchData = useCallback(async () => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher(abortController.signal);
      
      // Only update state if component is still mounted and request wasn't aborted
      if (isMountedRef.current && !abortController.signal.aborted) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      // Don't update state if request was aborted (user navigated away or new request started)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        // Type guard for ApiError
        const apiError: ApiError = isApiError(err)
          ? err
          : {
              message: err instanceof Error ? err.message : 'An unknown error occurred',
              status: 0,
              code: 'UNKNOWN_ERROR',
            };
        
        setError(apiError);
        setData(null);
      }
    } finally {
      if (isMountedRef.current && !abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetcher]);

  /**
   * Effect to execute fetch when enabled or dependencies change
   * Cleanup function cancels in-flight request when component unmounts
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      fetchData();
    }

    // Cleanup: abort request and mark as unmounted
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Type guard to check if an error is an ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    'code' in error
  );
}

export default useFetch;
