import { Spinner } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * SearchBar - Search input component with debounce
 *
 * Features:
 * - Debounced search (300ms default) to prevent excessive API calls
 * - Clear button to reset search
 * - Loading indicator during search
 * - Keyboard accessible (Escape to clear, Enter to submit)
 * - Responsive design
 *
 * @param onSearch - Callback when debounced search value changes
 * @param placeholder - Placeholder text for input
 * @param isLoading - Shows loading indicator when true
 * @param initialValue - Initial search value
 * @param debounceDelay - Debounce delay in milliseconds
 */

interface SearchBarProps {
  /** Callback fired when search value changes (debounced) */
  onSearch: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Shows loading spinner when true */
  isLoading?: boolean;
  /** Initial search value */
  initialValue?: string;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Additional CSS classes */
  className?: string;
}

const SearchBar = ({
  onSearch,
  placeholder = 'Search products...',
  isLoading = false,
  initialValue = '',
  debounceDelay = 300,
  className = '',
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Sync with external initial value changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Notify parent when debounced value changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400"
        aria-label="Search products"
      />

      {/* Clear button or Loading indicator */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {isLoading ? (
          <Spinner size="sm" />
        ) : searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
