/**
 * ArticleDetail Component
 * Full article view with shoppable products
 * DTC Feature: Content Studio / "The Journal" (5.6)
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface ShoppableProduct {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  slug?: string;
}

export interface ArticleDetailProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentType: 'ARTICLE' | 'GUIDE' | 'STORY' | 'NEWS' | 'LOOKBOOK';
  featuredImageUrl?: string;
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    firstName: string;
    lastName: string;
    image?: string;
    bio?: string;
  };
  publishedAt?: string;
  readTime?: number;
  tags?: string[];
  products?: ShoppableProduct[];
  relatedArticles?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImageUrl?: string;
    publishedAt?: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  className?: string;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  title,
  content,
  contentType,
  featuredImageUrl,
  category,
  author,
  publishedAt,
  readTime,
  tags,
  products,
  relatedArticles,
  className = '',
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const contentTypeLabels: Record<string, string> = {
    ARTICLE: 'Article',
    GUIDE: 'Guide',
    STORY: 'Story',
    NEWS: 'News',
    LOOKBOOK: 'Lookbook',
  };

  return (
    <article className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <header className="mb-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/journal" className="hover:text-gray-900">
            The Journal
          </Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/journal/category/${category.slug}`} className="hover:text-gray-900">
                {category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </nav>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
            {contentTypeLabels[contentType]}
          </span>
          {category && (
            <Link
              to={`/journal/category/${category.slug}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {category.name}
            </Link>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {title}
        </h1>

        {/* Author & Meta */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {author && (
            <div className="flex items-center gap-4">
              {author.image ? (
                <img
                  src={author.image}
                  alt={`${author.firstName} ${author.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {author.firstName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {author.firstName} {author.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(publishedAt)} {readTime && `· ${readTime} min read`}
                </p>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Share on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Copy link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {featuredImageUrl && (
        <figure className="mb-12">
          <img
            src={featuredImageUrl}
            alt={title}
            className="w-full rounded-2xl object-cover max-h-[600px]"
          />
        </figure>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/journal/tag/${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {author?.bio && (
            <div className="mt-12 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-4">
                {author.image ? (
                  <img
                    src={author.image}
                    alt={`${author.firstName} ${author.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-600">
                      {author.firstName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {author.firstName} {author.lastName}
                  </h4>
                  <p className="text-gray-600 mt-1">{author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Shoppable Products */}
        <aside className="lg:col-span-4">
          {products && products.length > 0 && (
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shop the Story
              </h3>
              <div className="space-y-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Quick Add All */}
              {products.length > 1 && (
                <button className="w-full mt-4 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Shop All Products ({products.length})
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((article) => (
              <Link
                key={article.id}
                to={`/journal/${article.slug}`}
                className="group"
              >
                {article.featuredImageUrl && (
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                    <img
                      src={article.featuredImageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  {formatDate(article.publishedAt)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ArticleDetail;
