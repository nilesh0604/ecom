/**
 * JournalHero Component
 * Hero section for "The Journal" blog landing page
 * DTC Feature: Content Studio (5.6)
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface FeaturedArticle {
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
}

export interface JournalHeroProps {
  mainArticle?: FeaturedArticle;
  secondaryArticles?: FeaturedArticle[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const contentTypeColors: Record<string, string> = {
  ARTICLE: 'bg-blue-600',
  GUIDE: 'bg-green-600',
  STORY: 'bg-purple-600',
  NEWS: 'bg-red-600',
  LOOKBOOK: 'bg-pink-600',
};

export const JournalHero: React.FC<JournalHeroProps> = ({
  mainArticle,
  secondaryArticles = [],
  title = 'The Journal',
  subtitle = 'Stories, guides, and inspiration from our world',
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

  return (
    <section className={className}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Featured Grid */}
      {mainArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Article */}
          <Link
            to={`/journal/${mainArticle.slug}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            {/* Image */}
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
              {mainArticle.featuredImageUrl ? (
                <img
                  src={mainArticle.featuredImageUrl}
                  alt={mainArticle.title}
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
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs font-medium text-white rounded ${contentTypeColors[mainArticle.contentType]}`}>
                  {mainArticle.contentType}
                </span>
                {mainArticle.category && (
                  <span className="text-white/70 text-sm">{mainArticle.category.name}</span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {mainArticle.title}
              </h2>
              {mainArticle.excerpt && (
                <p className="text-white/70 mb-4 line-clamp-2">{mainArticle.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-white/60 text-sm">
                {mainArticle.author && (
                  <span>{mainArticle.author.firstName} {mainArticle.author.lastName}</span>
                )}
                {mainArticle.publishedAt && <span>{formatDate(mainArticle.publishedAt)}</span>}
                {mainArticle.readTime && <span>{mainArticle.readTime} min read</span>}
              </div>
            </div>
          </Link>

          {/* Secondary Articles */}
          <div className="grid grid-cols-1 gap-6">
            {secondaryArticles.slice(0, 2).map((article) => (
              <Link
                key={article.id}
                to={`/journal/${article.slug}`}
                className="group relative overflow-hidden rounded-xl"
              >
                {/* Image */}
                <div className="aspect-[16/9]">
                  {article.featuredImageUrl ? (
                    <img
                      src={article.featuredImageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800" />
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${contentTypeColors[article.contentType]}`}>
                      {article.contentType}
                    </span>
                    {article.category && (
                      <span className="text-white/70 text-xs">{article.category.name}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/60 text-xs mt-2">
                    {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                    {article.readTime && <span>{article.readTime} min</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No featured content fallback */}
      {!mainArticle && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
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
          <p className="text-gray-500">No featured articles yet</p>
        </div>
      )}
    </section>
  );
};

export default JournalHero;
