/**
 * RewardsGrid Component
 * Display available rewards for redemption
 * DTC Feature: Loyalty Program (6.2)
 */

import React, { useState } from 'react';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image?: string;
  category: string;
  type: 'DISCOUNT' | 'PRODUCT' | 'SHIPPING' | 'EXPERIENCE' | 'EXCLUSIVE';
  value?: number;
  valueType?: 'PERCENTAGE' | 'FIXED';
  stock?: number;
  expiresAt?: string;
  featured?: boolean;
}

export interface RewardsGridProps {
  rewards: Reward[];
  currentPoints: number;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string | null) => void;
  onRedeem?: (rewardId: string) => void;
  onViewDetails?: (rewardId: string) => void;
  loading?: boolean;
  className?: string;
}

const rewardTypeIcons: Record<string, string> = {
  DISCOUNT: '💰',
  PRODUCT: '🎁',
  SHIPPING: '📦',
  EXPERIENCE: '✨',
  EXCLUSIVE: '👑',
};

export const RewardsGrid: React.FC<RewardsGridProps> = ({
  rewards,
  currentPoints,
  categories = [],
  selectedCategory,
  onCategoryChange,
  onRedeem,
  onViewDetails,
  loading = false,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'featured'>('all');

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatValue = (reward: Reward) => {
    if (!reward.value) return '';
    if (reward.valueType === 'PERCENTAGE') return `${reward.value}% off`;
    return `$${reward.value} off`;
  };

  const filteredRewards = rewards.filter((reward) => {
    if (selectedCategory && reward.category !== selectedCategory) return false;
    if (filter === 'available' && currentPoints < reward.pointsCost) return false;
    if (filter === 'featured' && !reward.featured) return false;
    return true;
  });

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'available', 'featured'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as 'all' | 'available' | 'featured')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange?.(e.target.value || null)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRewards.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🎁</span>
          <p className="text-gray-500">No rewards match your criteria</p>
          {filter === 'available' && (
            <p className="text-sm text-gray-400 mt-2">
              Keep earning points to unlock more rewards!
            </p>
          )}
        </div>
      )}

      {/* Rewards Grid */}
      {!loading && filteredRewards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const canAfford = currentPoints >= reward.pointsCost;
            const lowStock = reward.stock !== undefined && reward.stock > 0 && reward.stock <= 5;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                  reward.featured
                    ? 'border-yellow-400 shadow-md'
                    : canAfford
                      ? 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {reward.image ? (
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {rewardTypeIcons[reward.type] || '🎁'}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {reward.featured && (
                      <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                        ⭐ Featured
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded">
                      {reward.category}
                    </span>
                  </div>

                  {/* Low Stock */}
                  {lowStock && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        Only {reward.stock} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{reward.name}</h3>
                    <span className="text-2xl">{rewardTypeIcons[reward.type]}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {reward.description}
                  </p>

                  {formatValue(reward) && (
                    <p className="text-green-600 font-medium mb-3">
                      {formatValue(reward)}
                    </p>
                  )}

                  {/* Points Cost */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(reward.pointsCost)} pts
                    </span>
                    {!canAfford && (
                      <span className="text-sm text-red-600">
                        Need {formatNumber(reward.pointsCost - currentPoints)} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRedeem?.(reward.id)}
                      disabled={!canAfford || reward.stock === 0}
                      className={`flex-1 py-2 font-medium rounded-lg transition-colors ${
                        canAfford && reward.stock !== 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {reward.stock === 0 ? 'Sold Out' : 'Redeem'}
                    </button>
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(reward.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardsGrid;
