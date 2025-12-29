/**
 * ArticleList Component
 * Grid or list of blog articles with filtering
 * DTC Feature: Content Studio / "The Journal" (5.6)
 */

import React, { useEffect, useState } from 'react';
import { ArticleCard, ArticleCardProps } from './ArticleCard';

export interface ArticleListProps {
  articles: ArticleCardProps[];
  layout?: 'grid' | 'list' | 'masonry';
  columns?: 2 | 3 | 4;
  showFilters?: boolean;
  showSearch?: boolean;
  categories?: Array<{ id: string; name: string; slug: string }>;
  contentTypes?: Array<'ARTICLE' | 'GUIDE' | 'STORY' | 'NEWS' | 'LOOKBOOK'>;
  selectedCategory?: string;
  selectedContentType?: string;
  onCategoryChange?: (categorySlug: string | null) => void;
  onContentTypeChange?: (contentType: string | null) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const contentTypeLabels: Record<string, string> = {
  ARTICLE: 'Articles',
  GUIDE: 'Guides',
  STORY: 'Stories',
  NEWS: 'News',
  LOOKBOOK: 'Lookbooks',
};

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  layout = 'grid',
  columns = 3,
  showFilters = true,
  showSearch = true,
  categories = [],
  contentTypes = ['ARTICLE', 'GUIDE', 'STORY', 'NEWS', 'LOOKBOOK'],
  selectedCategory,
  selectedContentType,
  onCategoryChange,
  onContentTypeChange,
  onSearch,
  loading = false,
  emptyMessage = 'No articles found',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={className}>
      {/* Filters */}
      {(showFilters || showSearch) && (
        <div className="mb-8 space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}

          {/* Filter Tabs */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {/* Content Type Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onContentTypeChange?.(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedContentType
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => onContentTypeChange?.(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedContentType === type
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {contentTypeLabels[type]}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              {categories.length > 0 && (
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange?.(e.target.value || null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={`grid ${gridClasses[columns]} gap-6`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {/* Grid Layout */}
      {!loading && articles.length > 0 && layout === 'grid' && (
        <div className={`grid ${gridClasses[columns]} gap-6`}>
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} variant="default" />
          ))}
        </div>
      )}

      {/* List Layout */}
      {!loading && articles.length > 0 && layout === 'list' && (
        <div className="space-y-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} variant="horizontal" />
          ))}
        </div>
      )}

      {/* Masonry Layout */}
      {!loading && articles.length > 0 && layout === 'masonry' && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="break-inside-avoid">
              <ArticleCard {...article} variant="default" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
