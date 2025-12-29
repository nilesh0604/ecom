import { useEffect, useState } from 'react';

/**
 * useDebounce - Custom hook for debouncing values
 *
 * Why debounce:
 * - Prevents excessive API calls during rapid user input (e.g., typing in search)
 * - Improves performance by reducing unnecessary re-renders
 * - Better UX by waiting for user to stop typing before processing
 *
 * How it works:
 * - Returns the debounced value after the specified delay
 * - Resets the timer on every value change
 * - Cleans up timeout on unmount to prevent memory leaks
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * Example usage:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This only runs 300ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes or component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
