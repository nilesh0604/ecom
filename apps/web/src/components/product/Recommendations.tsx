/**
 * Recommendations.tsx
 * 
 * DTC Feature 5.4: Recommendations / Cross-Sell
 * "Complete the Look", "Frequently Bought Together", and upsell components
 * 
 * Components:
 * 1. CompleteTheLook - Outfit/bundle suggestions on product page
 * 2. FrequentlyBoughtTogether - Multi-product bundle suggestion
 * 3. PostAddToCartModal - Recommendations after adding to cart
 * 4. CheckoutUpsells - Last-minute add-ons during checkout
 * 5. OrderConfirmationCrossSell - Post-purchase recommendations
 * 6. RecentlyViewed - Recently viewed products carousel
 */

import { useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
}

export interface BundleSuggestion {
  id: string;
  title: string;
  products: RecommendedProduct[];
  bundlePrice: number;
  regularPrice: number;
  savings: number;
}

export interface CrossSellConfig {
  title?: string;
  subtitle?: string;
  maxProducts?: number;
  showPrices?: boolean;
  showRatings?: boolean;
}

// ============================================================================
// Components
// ============================================================================

/**
 * CompleteTheLook - Outfit/bundle suggestions on product page
 */
export function CompleteTheLook({
  mainProduct,
  complementaryProducts,
  onAddToCart,
  onViewProduct: _onViewProduct,
  title = 'Complete the Look',
  className = '',
}: {
  mainProduct: RecommendedProduct;
  complementaryProducts: RecommendedProduct[];
  onAddToCart?: (productIds: string[]) => void;
  onViewProduct?: (productId: string) => void;
  title?: string;
  className?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set([mainProduct.id, ...complementaryProducts.map((p) => p.id)])
  );

  const allProducts = [mainProduct, ...complementaryProducts];
  const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const toggleProduct = (productId: string) => {
    if (productId === mainProduct.id) return; // Can't deselect main product
    
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  return (
    <section className={`py-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allProducts.map((product, index) => (
              <div
                key={product.id}
                className={`relative rounded-xl border-2 transition-all cursor-pointer ${
                  selectedIds.has(product.id)
                    ? 'border-indigo-500 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    selectedIds.has(product.id)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {selectedIds.has(product.id) && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Product number badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center z-10">
                  {index + 1}
                </div>

                {/* Main product badge */}
                {product.id === mainProduct.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                      Current
                    </span>
                  </div>
                )}

                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div className="lg:w-72">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Your Selection
            </h3>

            <div className="space-y-2 mb-4">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                    {product.name}
                  </span>
                  <span className="text-gray-900 dark:text-white ml-2">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onAddToCart?.(Array.from(selectedIds))}
              disabled={selectedProducts.length === 0}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Add {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''} to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * FrequentlyBoughtTogether - Multi-product bundle suggestion
 */
export function FrequentlyBoughtTogether({
  products,
  bundleDiscount = 0,
  onAddBundle,
  onAddSingle: _onAddSingle,
  title = 'Frequently Bought Together',
  className = '',
}: {
  products: RecommendedProduct[];
  bundleDiscount?: number;
  onAddBundle?: (productIds: string[]) => void;
  onAddSingle?: (productId: string) => void;
  title?: string;
  className?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(products.map((p) => p.id))
  );

  const regularTotal = products.reduce((sum, p) => sum + p.price, 0);
  const selectedTotal = products
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);
  const discountAmount = selectedTotal * (bundleDiscount / 100);
  const finalTotal = selectedTotal - discountAmount;

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  return (
    <section className={`py-8 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-4">
            {/* Product card */}
            <div
              className={`relative w-32 cursor-pointer ${
                !selectedIds.has(product.id) ? 'opacity-50' : ''
              }`}
              onClick={() => toggleProduct(product.id)}
            >
              {/* Checkbox */}
              <div
                className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 ${
                  selectedIds.has(product.id)
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                {selectedIds.has(product.id) && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-900 dark:text-white mt-2 text-center truncate">
                {product.name}
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Plus sign between products */}
            {index < products.length - 1 && (
              <div className="text-2xl text-gray-400 font-light">+</div>
            )}
          </div>
        ))}

        {/* Equals and total */}
        <div className="flex items-center gap-4">
          <div className="text-2xl text-gray-400 font-light">=</div>
          
          <div className="text-center">
            {bundleDiscount > 0 && selectedIds.size === products.length && (
              <p className="text-sm text-gray-500 line-through">
                ${regularTotal.toFixed(2)}
              </p>
            )}
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${finalTotal.toFixed(2)}
            </p>
            {bundleDiscount > 0 && selectedIds.size === products.length && (
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm font-medium rounded mt-1">
                Save {bundleDiscount}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => onAddBundle?.(Array.from(selectedIds))}
          disabled={selectedIds.size === 0}
          className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          Add Selected to Cart
        </button>
      </div>
    </section>
  );
}

/**
 * PostAddToCartModal - Recommendations after adding to cart
 */
export function PostAddToCartModal({
  addedProduct,
  recommendations,
  cartTotal,
  cartCount,
  onAddToCart,
  onViewCart,
  onContinueShopping,
  onClose,
  isOpen = false,
  className = '',
}: {
  addedProduct: RecommendedProduct;
  recommendations: RecommendedProduct[];
  cartTotal: number;
  cartCount: number;
  onAddToCart?: (productId: string) => void;
  onViewCart?: () => void;
  onContinueShopping?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header with success message */}
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Added to Cart!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {addedProduct.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            You Might Also Like
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => onAddToCart?.(product.id)}
                    className="w-full mt-2 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with cart summary and actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${cartTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onContinueShopping}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Continue Shopping
              </button>
              <button
                onClick={onViewCart}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CheckoutUpsells - Last-minute add-ons during checkout
 */
export function CheckoutUpsells({
  products,
  onAddToCart,
  title = 'Add These to Your Order',
  className = '',
}: {
  products: RecommendedProduct[];
  onAddToCart?: (productId: string) => void;
  title?: string;
  className?: string;
}) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (productId: string) => {
    setAddedIds((prev) => new Set([...prev, productId]));
    onAddToCart?.(productId);
  };

  if (products.length === 0) return null;

  return (
    <section className={`py-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {product.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {addedIds.has(product.id) ? (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdd(product.id)}
                    className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * OrderConfirmationCrossSell - Post-purchase recommendations
 */
export function OrderConfirmationCrossSell({
  orderedProducts: _orderedProducts,
  recommendations,
  onAddToCart,
  onViewProduct,
  title = 'Based on Your Purchase',
  className = '',
}: {
  orderedProducts: RecommendedProduct[];
  recommendations: RecommendedProduct[];
  onAddToCart?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
  title?: string;
  className?: string;
}) {
  return (
    <section className={`py-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customers who bought your items also loved these
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommendations.slice(0, 8).map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer"
            onClick={() => onViewProduct?.(product.id)}
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.rating.toFixed(1)}
                  {product.reviewCount && ` (${product.reviewCount})`}
                </span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product.id);
              }}
              className="w-full mt-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * RecentlyViewed - Recently viewed products carousel
 */
export function RecentlyViewed({
  products,
  onViewProduct,
  onAddToCart,
  onClearHistory,
  title = 'Recently Viewed',
  className = '',
}: {
  products: RecommendedProduct[];
  onViewProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onClearHistory?: () => void;
  title?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {onClearHistory && (
          <button
            onClick={onClearHistory}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-48 group cursor-pointer"
            onClick={() => onViewProduct?.(product.id)}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              
              {/* Quick add button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product.id);
                }}
                className="absolute bottom-2 left-2 right-2 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-900 dark:text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Quick Add
              </button>
            </div>
            
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {product.name}
            </h3>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mt-1">
              ${product.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * ProductCarousel - Generic horizontal scrolling product carousel
 */
export function ProductCarousel({
  products,
  title,
  subtitle,
  onViewProduct,
  onAddToCart,
  onViewAll,
  showViewAll = true,
  className = '',
}: {
  products: RecommendedProduct[];
  title: string;
  subtitle?: string;
  onViewProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onViewAll?: () => void;
  showViewAll?: boolean;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64 group"
            >
              <div
                className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 mb-3 cursor-pointer relative"
                onClick={() => onViewProduct?.(product.id)}
              >
                {product.badge && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-rose-500 text-white text-xs font-semibold rounded z-10">
                    {product.badge}
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              
              <div onClick={() => onViewProduct?.(product.id)} className="cursor-pointer">
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {product.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= product.rating! ? 'fill-current' : 'fill-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onAddToCart?.(product.id)}
                disabled={product.inStock === false}
                className="w-full mt-3 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default {
  CompleteTheLook,
  FrequentlyBoughtTogether,
  PostAddToCartModal,
  CheckoutUpsells,
  OrderConfirmationCrossSell,
  RecentlyViewed,
  ProductCarousel,
};
