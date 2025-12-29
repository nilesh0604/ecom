/**
 * ShoppableArticle Component
 * Inline shoppable content within articles
 * DTC Feature: Shoppable Content (5.6)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  slug?: string;
  inStock?: boolean;
}

export interface ShoppableArticleProps {
  products: Product[];
  layout?: 'inline' | 'carousel' | 'grid' | 'spotlight';
  title?: string;
  description?: string;
  onAddToCart?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
  className?: string;
}

export const ShoppableArticle: React.FC<ShoppableArticleProps> = ({
  products,
  layout = 'carousel',
  title = 'Shop the Look',
  description,
  onAddToCart,
  onQuickView,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Inline layout - minimal products in text flow
  if (layout === 'inline') {
    return (
      <div className={`my-8 ${className}`}>
        <div className="flex flex-wrap gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug || product.id}`}
              className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </span>
                <span className="block text-sm text-gray-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout - multi-column product cards
  if (layout === 'grid') {
    return (
      <div className={`my-12 p-8 bg-gray-50 rounded-2xl ${className}`}>
        {title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link to={`/products/${product.slug || product.id}`}>
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-white">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(product.id)}
                  disabled={!product.inStock}
                  className="w-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Spotlight layout - single featured product with details
  if (layout === 'spotlight') {
    const product = products[0];
    if (!product) return null;

    return (
      <div className={`my-12 ${className}`}>
        <div className="flex flex-col md:flex-row gap-8 p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white">
          {/* Image */}
          <div className="md:w-1/2">
            <div className="aspect-square rounded-xl overflow-hidden bg-white/10">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <span className="text-blue-400 text-sm font-medium mb-2">
              Featured Product
            </span>
            <h3 className="text-3xl font-bold mb-4">{product.name}</h3>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-white/50 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to={`/products/${product.slug || product.id}`}
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Details
              </Link>
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(product.id)}
                  disabled={!product.inStock}
                  className="px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carousel layout (default)
  return (
    <div className={`my-12 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {products.length > 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveIndex(Math.min(products.length - 3, activeIndex + 1))}
                disabled={activeIndex >= products.length - 3}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(-${activeIndex * (100 / 3)}%)` }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-full md:w-1/3 group">
              <Link to={`/products/${product.slug || product.id}`}>
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex gap-2 mt-3">
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(product.id)}
                    disabled={!product.inStock}
                    className="flex-1 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
                {onQuickView && (
                  <button
                    onClick={() => onQuickView(product.id)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:border-gray-400 transition-colors"
                  >
                    Quick View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShoppableArticle;
