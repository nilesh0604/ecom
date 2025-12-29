/**
 * ArticleCard Component
 * Card preview for blog articles
 * DTC Feature: Content Studio / "The Journal" (5.6)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImageUrl?: string;
  contentType: 'ARTICLE' | 'GUIDE' | 'STORY' | 'NEWS' | 'LOOKBOOK';
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    firstName: string;
    lastName: string;
    image?: string;
  };
  publishedAt?: string;
  readTime?: number;
  tags?: string[];
  featured?: boolean;
  variant?: 'default' | 'horizontal' | 'featured' | 'minimal';
  className?: string;
}

const contentTypeLabels: Record<string, string> = {
  ARTICLE: 'Article',
  GUIDE: 'Guide',
  STORY: 'Story',
  NEWS: 'News',
  LOOKBOOK: 'Lookbook',
};

const contentTypeColors: Record<string, string> = {
  ARTICLE: 'bg-blue-100 text-blue-800',
  GUIDE: 'bg-green-100 text-green-800',
  STORY: 'bg-purple-100 text-purple-800',
  NEWS: 'bg-red-100 text-red-800',
  LOOKBOOK: 'bg-pink-100 text-pink-800',
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  slug,
  excerpt,
  featuredImageUrl,
  contentType,
  category,
  author,
  publishedAt,
  readTime,
  tags,
  featured,
  variant = 'default',
  className = '',
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Featured variant - large hero-style card
  if (variant === 'featured') {
    return (
      <Link
        to={`/journal/${slug}`}
        className={`group block relative overflow-hidden rounded-2xl ${className}`}
      >
        {/* Image */}
        <div className="aspect-[16/9] overflow-hidden">
          {featuredImageUrl ? (
            <img
              src={featuredImageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4">
            {featured && (
              <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                Featured
              </span>
            )}
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${contentTypeColors[contentType]}`}>
              {contentTypeLabels[contentType]}
            </span>
            {category && (
              <span className="text-white/80 text-sm">{category.name}</span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
            {title}
          </h2>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-white/70 text-lg mb-4 line-clamp-2">{excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-white/60 text-sm">
            {author && (
              <div className="flex items-center gap-2">
                {author.image ? (
                  <img
                    src={author.image}
                    alt={`${author.firstName} ${author.lastName}`}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {author.firstName[0]}
                    </span>
                  </div>
                )}
                <span>{author.firstName} {author.lastName}</span>
              </div>
            )}
            {publishedAt && <span>{formatDate(publishedAt)}</span>}
            {readTime && <span>{readTime} min read</span>}
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal variant - list style
  if (variant === 'horizontal') {
    return (
      <Link
        to={`/journal/${slug}`}
        className={`group flex gap-6 ${className}`}
      >
        {/* Image */}
        <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden">
          {featuredImageUrl ? (
            <img
              src={featuredImageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${contentTypeColors[contentType]}`}>
              {contentTypeLabels[contentType]}
            </span>
            {category && (
              <span className="text-gray-500 text-sm">{category.name}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            {publishedAt && <span>{formatDate(publishedAt)}</span>}
            {readTime && <span>{readTime} min read</span>}
          </div>
        </div>
      </Link>
    );
  }

  // Minimal variant - text only
  if (variant === 'minimal') {
    return (
      <Link
        to={`/journal/${slug}`}
        className={`group block ${className}`}
      >
        <span className={`text-xs font-medium ${contentTypeColors[contentType]} px-2 py-0.5 rounded`}>
          {contentTypeLabels[contentType]}
        </span>
        <h3 className="mt-2 text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-gray-500 text-sm">
          {formatDate(publishedAt)} {readTime && `· ${readTime} min`}
        </p>
      </Link>
    );
  }

  // Default variant - vertical card
  return (
    <Link
      to={`/journal/${slug}`}
      className={`group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        {featuredImageUrl ? (
          <img
            src={featuredImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${contentTypeColors[contentType]}`}>
            {contentTypeLabels[contentType]}
          </span>
          {category && (
            <span className="text-gray-500 text-sm">{category.name}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{excerpt}</p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {author && (
            <div className="flex items-center gap-2">
              {author.image ? (
                <img
                  src={author.image}
                  alt={`${author.firstName} ${author.lastName}`}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {author.firstName[0]}
                  </span>
                </div>
              )}
              <span className="text-gray-600 text-sm">
                {author.firstName} {author.lastName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            {publishedAt && <span>{formatDate(publishedAt)}</span>}
            {readTime && (
              <>
                <span>·</span>
                <span>{readTime} min</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
