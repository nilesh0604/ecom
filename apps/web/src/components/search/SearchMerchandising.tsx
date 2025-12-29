import { Badge, Button } from '@/components/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Search & Merchandising - Site search, merchandising rules, analytics
 *
 * Features:
 * - Instant search with suggestions
 * - Typo tolerance and synonyms
 * - Recent searches and trending
 * - Search analytics tracking
 * - Merchandising display components
 */

// ============================================================================
// Types
// ============================================================================

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'content';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  price?: number;
  badge?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  image: string;
  url: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  inStock: boolean;
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  clickedResult?: string;
  timestamp: Date;
}

// ============================================================================
// Instant Search Component
// ============================================================================

export interface InstantSearchProps {
  onSearch: (query: string) => Promise<SearchSuggestion[]>;
  onSelect: (suggestion: SearchSuggestion) => void;
  onSubmit: (query: string) => void;
  onAnalytics?: (data: SearchAnalytics) => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
  className?: string;
}

export const InstantSearch = ({
  onSearch,
  onSelect,
  onSubmit,
  onAnalytics,
  placeholder = 'Search products...',
  recentSearches = [],
  trendingSearches = [],
  className = '',
}: InstantSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await onSearch(searchQuery);
          setSuggestions(results);
        } finally {
          setIsLoading(false);
        }
      }, 200);
    },
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedSearch]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    onSelect(suggestion);
    onAnalytics?.({
      query,
      resultsCount: suggestions.length,
      clickedResult: suggestion.id,
      timestamp: new Date(),
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query);
      onAnalytics?.({
        query,
        resultsCount: suggestions.length,
        timestamp: new Date(),
      });
      setIsOpen(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    onSubmit(term);
    setIsOpen(false);
  };

  const showDropdown = isOpen && (query.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {query && !isLoading && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[480px] overflow-auto">
          {/* No query - show recent/trending */}
          {!query && (
            <>
              {recentSearches.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSearch(term)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {trendingSearches.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Trending
                  </p>
                  <div className="space-y-2">
                    {trendingSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSearch(term)}
                        className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors text-left"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <span className="text-gray-900 dark:text-white">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Query - show suggestions */}
          {query && suggestions.length > 0 && (
            <ul role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => handleSelect(suggestion)}
                  className={`
                    flex items-center gap-4 p-4 cursor-pointer transition-colors
                    ${
                      index === activeIndex
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  {suggestion.image && (
                    <img
                      src={suggestion.image}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.title}
                      </span>
                      {suggestion.badge && (
                        <Badge variant="info" className="text-xs">
                          {suggestion.badge}
                        </Badge>
                      )}
                    </div>
                    {suggestion.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.subtitle}
                      </p>
                    )}
                  </div>

                  {suggestion.price !== undefined && (
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${suggestion.price.toFixed(2)}
                    </span>
                  )}

                  <span className="text-xs text-gray-400 uppercase">
                    {suggestion.type}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* No results */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No results for "{query}"
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Try searching for something else
              </p>
            </div>
          )}

          {/* View all results */}
          {query && suggestions.length > 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                fullWidth
                onClick={handleSubmit}
              >
                View all results for "{query}" →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Search Results Grid
// ============================================================================

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalCount: number;
  isLoading?: boolean;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export const SearchResults = ({
  results,
  query,
  totalCount,
  isLoading = false,
  onResultClick,
  className = '',
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <svg
          className="w-16 h-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          We couldn't find any products matching "{query}"
        </p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Try adjusting your search or browse our categories
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{results.length}</span> of{' '}
        <span className="font-medium">{totalCount}</span> results for "{query}"
      </p>

      {/* Results grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((result) => (
          <a
            key={result.id}
            href={result.url}
            onClick={(e) => {
              if (onResultClick) {
                e.preventDefault();
                onResultClick(result);
              }
            }}
            className="group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
              <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              {result.badges && result.badges.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {result.badges.map((badge, i) => (
                    <Badge key={i} variant="info">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Out of stock overlay */}
              {!result.inStock && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                  <Badge variant="error">Out of Stock</Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
                {result.title}
              </h3>

              {/* Rating */}
              {result.rating !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(result.rating!)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({result.reviewCount})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${result.price.toFixed(2)}
                </span>
                {result.originalPrice && result.originalPrice > result.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${result.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Merchandising Components
// ============================================================================

export interface FeaturedCollection {
  id: string;
  title: string;
  description?: string;
  image: string;
  url: string;
  badge?: string;
}

export interface FeaturedCollectionsProps {
  collections: FeaturedCollection[];
  title?: string;
  className?: string;
}

export const FeaturedCollections = ({
  collections,
  title = 'Shop by Collection',
  className = '',
}: FeaturedCollectionsProps) => {
  return (
    <section className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <a
            key={collection.id}
            href={collection.url}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden"
          >
            <img
              src={collection.image}
              alt={collection.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badge */}
            {collection.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant="warning">{collection.badge}</Badge>
              </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-bold mb-1">{collection.title}</h3>
              {collection.description && (
                <p className="text-sm text-white/80">{collection.description}</p>
              )}
              <span className="inline-flex items-center mt-3 text-sm font-medium group-hover:underline">
                Shop Now
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// Zero Results Help
// ============================================================================

export interface ZeroResultsHelpProps {
  query: string;
  suggestions?: string[];
  popularCategories?: { name: string; url: string }[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const ZeroResultsHelp = ({
  query: _query,
  suggestions = [],
  popularCategories = [],
  onSuggestionClick,
  className = '',
}: ZeroResultsHelpProps) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 ${className}`}>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Tips for better results
      </h3>

      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <li className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Check the spelling of your search term
        </li>
        <li className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Try using fewer or different keywords
        </li>
        <li className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Try a more general search term
        </li>
      </ul>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Did you mean:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:border-black dark:hover:border-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {popularCategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Popular categories:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category, i) => (
              <a
                key={i}
                href={category.url}
                className="px-3 py-1 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Search Analytics Display (Admin)
// ============================================================================

export interface SearchAnalyticsData {
  topSearches: { query: string; count: number }[];
  zeroResultQueries: { query: string; count: number }[];
  clickThroughRate: number;
  averageResultsPerQuery: number;
}

export interface SearchAnalyticsDisplayProps {
  data: SearchAnalyticsData;
  className?: string;
}

export const SearchAnalyticsDisplay = ({
  data,
  className = '',
}: SearchAnalyticsDisplayProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(data.clickThroughRate * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click-through Rate</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.averageResultsPerQuery.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Results/Query</p>
        </div>
      </div>

      {/* Top Searches */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Searches</h4>
        <ul className="space-y-2">
          {data.topSearches.slice(0, 5).map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.query}</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Zero Result Queries */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-3">
          Zero-Result Queries
        </h4>
        <ul className="space-y-2">
          {data.zeroResultQueries.slice(0, 5).map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-red-700 dark:text-red-300">{item.query}</span>
              <span className="font-medium text-red-900 dark:text-red-100">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
