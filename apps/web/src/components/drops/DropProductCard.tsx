/**
 * DropProductCard Component
 * Product card for limited edition/drop items
 * DTC Feature: Drops & Limited Editions (6.4)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface DropProductCardProps {
  id: number;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  stockQuantity?: number;
  maxPerCustomer?: number;
  dropEndsAt?: string;
  accessType?: 'PUBLIC' | 'EARLY_ACCESS' | 'VIP' | 'DRAW';
  isDrawEntry?: boolean;
  drawEntered?: boolean;
  drawWinner?: boolean;
  onAddToCart?: (quantity: number) => void;
  onEnterDraw?: () => void;
  onNotify?: () => void;
  soldOut?: boolean;
  className?: string;
}

export const DropProductCard: React.FC<DropProductCardProps> = ({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  images,
  stockQuantity,
  maxPerCustomer,
  dropEndsAt,
  accessType = 'PUBLIC',
  isDrawEntry = false,
  drawEntered = false,
  drawWinner,
  onAddToCart,
  onEnterDraw,
  onNotify,
  soldOut = false,
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(p);
  };

  const getTimeRemaining = () => {
    if (!dropEndsAt) return null;
    const now = new Date().getTime();
    const end = new Date(dropEndsAt).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const getAccessBadge = () => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      EARLY_ACCESS: { bg: 'bg-purple-500', text: 'text-white', label: 'Early Access' },
      VIP: { bg: 'bg-yellow-500', text: 'text-black', label: 'VIP Only' },
      DRAW: { bg: 'bg-blue-500', text: 'text-white', label: 'Raffle Entry' },
      PUBLIC: { bg: 'bg-gray-500', text: 'text-white', label: 'Public Drop' },
    };
    const badge = badges[accessType] || badges.PUBLIC;
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const allImages = images?.length ? images : [image];

  return (
    <div className={`group bg-white rounded-xl overflow-hidden border border-gray-200 ${className}`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/drops/product/${slug || id}`}>
          <img
            src={allImages[currentImageIndex]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {getAccessBadge()}
          {soldOut && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              SOLD OUT
            </span>
          )}
          {compareAtPrice && compareAtPrice > price && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              -{Math.round((1 - price / compareAtPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Stock Urgency */}
        {stockQuantity !== undefined && stockQuantity > 0 && stockQuantity <= 10 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-red-600/90 text-white text-center py-2 rounded-lg text-sm font-medium">
              Only {stockQuantity} left!
            </div>
          </div>
        )}

        {/* Image Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Time Remaining */}
        {dropEndsAt && !soldOut && (
          <div className="flex items-center gap-1 text-red-600 text-sm font-medium mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeRemaining()}
          </div>
        )}

        {/* Title */}
        <Link to={`/drops/product/${slug || id}`}>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-gray-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Draw Entry Status */}
        {isDrawEntry && (
          <div className="mb-4">
            {drawWinner === true && (
              <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center">
                <p className="font-bold">🎉 You Won!</p>
                <p className="text-sm">Complete your purchase below</p>
              </div>
            )}
            {drawWinner === false && (
              <div className="p-3 bg-gray-100 text-gray-600 rounded-lg text-center">
                <p className="font-medium">Not selected this time</p>
                <p className="text-sm">Better luck next drop!</p>
              </div>
            )}
            {drawEntered && drawWinner === undefined && (
              <div className="p-3 bg-blue-100 text-blue-800 rounded-lg text-center">
                <p className="font-medium">Entry Confirmed ✓</p>
                <p className="text-sm">You'll be notified if selected</p>
              </div>
            )}
          </div>
        )}

        {/* Quantity Selector (for non-draw items) */}
        {!isDrawEntry && !soldOut && maxPerCustomer && maxPerCustomer > 1 && (
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600">Qty:</label>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-3 py-1 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxPerCustomer, quantity + 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-500">Max {maxPerCustomer}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Draw Entry */}
          {isDrawEntry && !drawEntered && !soldOut && onEnterDraw && (
            <button
              onClick={onEnterDraw}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enter Raffle
            </button>
          )}

          {/* Add to Cart (for winners or non-draw items) */}
          {(!isDrawEntry || drawWinner) && !soldOut && onAddToCart && (
            <button
              onClick={() => onAddToCart(quantity)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add to Cart
            </button>
          )}

          {/* Sold Out - Notify */}
          {soldOut && onNotify && (
            <button
              onClick={onNotify}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              Notify If Restocked
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropProductCard;
