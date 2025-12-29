/**
 * LoyaltyProgram.tsx
 *
 * DTC Feature 6.1: Loyalty Points / Rewards
 * Points earning, redemption, tiered multipliers, and rewards dashboard
 *
 * Components:
 * 1. PointsBalance - Current points balance display
 * 2. PointsHistory - Transaction history of points
 * 3. EarnPointsCard - Ways to earn points display
 * 4. RedeemPoints - Points redemption at checkout
 * 5. TierProgress - Progress toward next loyalty tier
 * 6. TierBenefits - Benefits breakdown by tier
 * 7. PointsExpirationWarning - Expiring points notification
 */

import { useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LoyaltyTier = 'basic' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierConfig {
  name: string;
  tier: LoyaltyTier;
  minSpend: number;
  multiplier: number;
  color: string;
  icon: string;
  benefits: string[];
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  date: Date;
  orderId?: string;
  expiresAt?: Date;
}

export interface LoyaltyAccount {
  userId: string;
  currentTier: LoyaltyTier;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  lifetimeSpend: number;
  pointsExpiringDate?: Date;
  pointsExpiringSoon?: number;
  tierExpirationDate?: Date;
  transactions: PointsTransaction[];
}

export interface EarnOpportunity {
  id: string;
  action: string;
  points: number;
  description: string;
  icon: string;
  isCompleted?: boolean;
  ctaLabel?: string;
  ctaLink?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const TIER_CONFIG: Record<LoyaltyTier, LoyaltyTierConfig> = {
  basic: {
    name: 'Basic',
    tier: 'basic',
    minSpend: 0,
    multiplier: 1,
    color: 'gray',
    icon: '⭐',
    benefits: ['1 point per $1 spent', 'Birthday bonus (100 pts)', 'Member-only offers'],
  },
  silver: {
    name: 'Silver',
    tier: 'silver',
    minSpend: 500,
    multiplier: 1.25,
    color: 'slate',
    icon: '🥈',
    benefits: [
      '1.25x points on all purchases',
      'Early access to sales',
      'Free standard shipping',
      'Birthday bonus (150 pts)',
    ],
  },
  gold: {
    name: 'Gold',
    tier: 'gold',
    minSpend: 1000,
    multiplier: 1.5,
    color: 'amber',
    icon: '🥇',
    benefits: [
      '1.5x points on all purchases',
      'Early access to new products',
      'Free express shipping',
      'Birthday bonus (200 pts)',
      'Exclusive member events',
    ],
  },
  platinum: {
    name: 'Platinum',
    tier: 'platinum',
    minSpend: 2500,
    multiplier: 2,
    color: 'violet',
    icon: '💎',
    benefits: [
      '2x points on all purchases',
      'Priority customer support',
      'Free overnight shipping',
      'Birthday bonus (300 pts)',
      'VIP access to limited drops',
      'Complimentary gift wrapping',
    ],
  },
};

const POINTS_TO_DOLLAR = 100; // 100 points = $5

const DEFAULT_EARN_OPPORTUNITIES: EarnOpportunity[] = [
  {
    id: 'purchase',
    action: 'Make a Purchase',
    points: 1,
    description: 'Earn 1 point for every $1 spent',
    icon: '🛍️',
  },
  {
    id: 'review',
    action: 'Write a Review',
    points: 50,
    description: 'Share your thoughts on a product',
    icon: '✍️',
    ctaLabel: 'Write Review',
    ctaLink: '/orders',
  },
  {
    id: 'refer',
    action: 'Refer a Friend',
    points: 200,
    description: 'Get points when they make their first purchase',
    icon: '👥',
    ctaLabel: 'Get Referral Link',
    ctaLink: '/account/referrals',
  },
  {
    id: 'birthday',
    action: 'Birthday Bonus',
    points: 100,
    description: 'Celebrate with bonus points on your birthday',
    icon: '🎂',
  },
  {
    id: 'first-purchase',
    action: 'First Purchase Bonus',
    points: 100,
    description: 'Welcome bonus on your first order',
    icon: '🎉',
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

function getTierColor(tier: LoyaltyTier): string {
  const colors = {
    basic: 'gray',
    silver: 'slate',
    gold: 'amber',
    platinum: 'violet',
  };
  return colors[tier];
}

function getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
  const tiers: LoyaltyTier[] = ['basic', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function pointsToDollars(points: number): number {
  return Math.floor(points / POINTS_TO_DOLLAR) * 5;
}

// ============================================================================
// Components
// ============================================================================

/**
 * PointsBalance - Current points balance display with tier badge
 */
export function PointsBalance({
  account,
  showTier = true,
  size = 'default',
  className = '',
}: {
  account: LoyaltyAccount;
  showTier?: boolean;
  size?: 'compact' | 'default' | 'large';
  className?: string;
}) {
  const tierConfig = TIER_CONFIG[account.currentTier];
  const dollarValue = pointsToDollars(account.availablePoints);

  const sizeClasses = {
    compact: {
      container: 'p-3',
      points: 'text-xl',
      label: 'text-xs',
    },
    default: {
      container: 'p-4',
      points: 'text-3xl',
      label: 'text-sm',
    },
    large: {
      container: 'p-6',
      points: 'text-5xl',
      label: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={`bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-2xl ${sizes.container} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-gray-400 ${sizes.label}`}>Available Points</p>
          <p className={`font-bold ${sizes.points}`}>
            {account.availablePoints.toLocaleString()}
          </p>
          <p className={`text-gray-400 ${sizes.label}`}>
            Worth ${dollarValue} in rewards
          </p>
        </div>

        {showTier && (
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${getTierColor(account.currentTier)}-500/20 text-${getTierColor(account.currentTier)}-300`}
            >
              <span>{tierConfig.icon}</span>
              <span className="font-semibold">{tierConfig.name}</span>
            </div>
            <p className={`text-gray-400 mt-1 ${sizes.label}`}>
              {tierConfig.multiplier}x points
            </p>
          </div>
        )}
      </div>

      {account.pointsExpiringSoon && account.pointsExpiringSoon > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <PointsExpirationWarning
            points={account.pointsExpiringSoon}
            expirationDate={account.pointsExpiringDate!}
            compact
          />
        </div>
      )}
    </div>
  );
}

/**
 * PointsHistory - Transaction history of points
 */
export function PointsHistory({
  transactions,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = '',
}: {
  transactions: PointsTransaction[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Points Activity Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start earning points by making a purchase or completing activities.
        </p>
      </div>
    );
  }

  const getTransactionIcon = (type: PointsTransaction['type']) => {
    const icons = {
      earned: '➕',
      redeemed: '🎁',
      expired: '⏰',
      bonus: '🎉',
    };
    return icons[type];
  };

  const getTransactionColor = (type: PointsTransaction['type']) => {
    const colors = {
      earned: 'text-green-600 dark:text-green-400',
      redeemed: 'text-blue-600 dark:text-blue-400',
      expired: 'text-gray-400',
      bonus: 'text-purple-600 dark:text-purple-400',
    };
    return colors[type];
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Points History
      </h3>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.date.toLocaleDateString()}
                  {transaction.orderId && ` • Order #${transaction.orderId}`}
                </p>
              </div>
            </div>

            <span
              className={`font-semibold ${getTransactionColor(transaction.type)}`}
            >
              {transaction.type === 'redeemed' || transaction.type === 'expired'
                ? '-'
                : '+'}
              {transaction.points.toLocaleString()} pts
            </span>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * EarnPointsCard - Ways to earn points display
 */
export function EarnPointsCard({
  opportunities = DEFAULT_EARN_OPPORTUNITIES,
  onAction,
  className = '',
}: {
  opportunities?: EarnOpportunity[];
  onAction?: (opportunityId: string) => void;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ways to Earn Points
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className={`p-4 flex items-center justify-between ${
              opportunity.isCompleted ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{opportunity.icon}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {opportunity.action}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {opportunity.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                +{opportunity.points} pts
              </span>

              {opportunity.ctaLabel && !opportunity.isCompleted && (
                <button
                  onClick={() => onAction?.(opportunity.id)}
                  className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800"
                >
                  {opportunity.ctaLabel}
                </button>
              )}

              {opportunity.isCompleted && (
                <span className="text-green-600 dark:text-green-400 text-sm">
                  ✓ Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RedeemPoints - Points redemption at checkout
 */
export function RedeemPoints({
  availablePoints,
  orderTotal,
  onRedeem,
  onRemove,
  appliedPoints = 0,
  minRedemption = 100,
  className = '',
}: {
  availablePoints: number;
  orderTotal: number;
  onRedeem?: (points: number) => void;
  onRemove?: () => void;
  appliedPoints?: number;
  minRedemption?: number;
  className?: string;
}) {
  const [customPoints, setCustomPoints] = useState<string>('');

  const maxRedeemable = Math.min(
    availablePoints,
    Math.floor(orderTotal / 5) * POINTS_TO_DOLLAR
  );
  const dollarValue = pointsToDollars(availablePoints);
  const hasEnoughPoints = availablePoints >= minRedemption;

  const presetAmounts = useMemo(() => {
    const amounts = [];
    let points = minRedemption;
    while (points <= maxRedeemable && amounts.length < 4) {
      amounts.push(points);
      points = points * 2;
    }
    if (maxRedeemable > minRedemption && !amounts.includes(maxRedeemable)) {
      amounts.push(maxRedeemable);
    }
    return amounts;
  }, [maxRedeemable, minRedemption]);

  const handleRedeem = (points: number) => {
    if (points >= minRedemption && points <= maxRedeemable) {
      onRedeem?.(points);
      setCustomPoints('');
    }
  };

  if (appliedPoints > 0) {
    const appliedValue = pointsToDollars(appliedPoints);
    return (
      <div
        className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                {appliedPoints.toLocaleString()} points applied
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                -${appliedValue.toFixed(2)} discount
              </p>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  if (!hasEnoughPoints) {
    return (
      <div
        className={`p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {availablePoints.toLocaleString()} points
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need {minRedemption} points minimum to redeem (${pointsToDollars(minRedemption)} value)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Use Your Points
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {availablePoints.toLocaleString()} pts available (${dollarValue} value)
            </p>
          </div>
        </div>
      </div>

      {/* Preset amounts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presetAmounts.map((points) => (
          <button
            key={points}
            onClick={() => handleRedeem(points)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
          >
            {points} pts (${pointsToDollars(points)})
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex gap-2">
        <input
          type="number"
          value={customPoints}
          onChange={(e) => setCustomPoints(e.target.value)}
          placeholder="Custom amount"
          min={minRedemption}
          max={maxRedeemable}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
        />
        <button
          onClick={() => handleRedeem(parseInt(customPoints) || 0)}
          disabled={!customPoints || parseInt(customPoints) < minRedemption}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Apply
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {POINTS_TO_DOLLAR} points = $5 off • Min {minRedemption} points
      </p>
    </div>
  );
}

/**
 * TierProgress - Progress toward next loyalty tier
 */
export function TierProgress({
  currentTier,
  lifetimeSpend,
  className = '',
}: {
  currentTier: LoyaltyTier;
  lifetimeSpend: number;
  className?: string;
}) {
  const currentTierConfig = TIER_CONFIG[currentTier];
  const nextTier = getNextTier(currentTier);
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;

  if (!nextTierConfig) {
    return (
      <div
        className={`p-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl ${className}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{currentTierConfig.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{currentTierConfig.name} Member</h3>
            <p className="text-white/80">You've reached the highest tier!</p>
          </div>
        </div>
        <p className="text-sm text-white/70 mt-2">
          Enjoy all the exclusive benefits of being a {currentTierConfig.name} member.
        </p>
      </div>
    );
  }

  const progressToNext = lifetimeSpend - currentTierConfig.minSpend;
  const requiredForNext = nextTierConfig.minSpend - currentTierConfig.minSpend;
  const progressPercent = Math.min(100, (progressToNext / requiredForNext) * 100);
  const amountToNext = nextTierConfig.minSpend - lifetimeSpend;

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentTierConfig.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentTierConfig.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${lifetimeSpend.toLocaleString()} lifetime spend
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {nextTierConfig.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${amountToNext.toLocaleString()} to go
            </p>
          </div>
          <span className="text-2xl">{nextTierConfig.icon}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          {progressPercent.toFixed(0)}% to {nextTierConfig.name}
        </p>
      </div>

      {/* Next tier benefits preview */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Unlock with {nextTierConfig.name}:
        </p>
        <ul className="space-y-1">
          {nextTierConfig.benefits.slice(0, 3).map((benefit, index) => (
            <li
              key={index}
              className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
            >
              <span className="text-green-500">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * TierBenefits - Benefits breakdown by tier
 */
export function TierBenefits({
  currentTier,
  onLearnMore,
  className = '',
}: {
  currentTier?: LoyaltyTier;
  onLearnMore?: () => void;
  className?: string;
}) {
  const tiers: LoyaltyTier[] = ['basic', 'silver', 'gold', 'platinum'];

  return (
    <div className={className}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Membership Tiers
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const config = TIER_CONFIG[tier];
          const isCurrentTier = currentTier === tier;

          return (
            <div
              key={tier}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isCurrentTier
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full">
                    Your Tier
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-4xl">{config.icon}</span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                  {config.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {config.minSpend === 0
                    ? 'Free to join'
                    : `$${config.minSpend}+ annual spend`}
                </p>
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center mb-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {config.multiplier}x
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  points multiplier
                </p>
              </div>

              <ul className="space-y-2">
                {config.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {onLearnMore && (
        <div className="text-center mt-6">
          <button
            onClick={onLearnMore}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Learn more about membership benefits →
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * PointsExpirationWarning - Expiring points notification
 */
export function PointsExpirationWarning({
  points,
  expirationDate,
  onShopNow,
  compact = false,
  className = '',
}: {
  points: number;
  expirationDate: Date;
  onShopNow?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const daysUntilExpiry = Math.ceil(
    (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const dollarValue = pointsToDollars(points);
  const isUrgent = daysUntilExpiry <= 7;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${
          isUrgent
            ? 'text-red-600 dark:text-red-400'
            : 'text-yellow-600 dark:text-yellow-400'
        } ${className}`}
      >
        <span>⚠️</span>
        <span>
          {points.toLocaleString()} pts (${dollarValue}) expire in {daysUntilExpiry} days
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-4 ${
        isUrgent
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      } border rounded-xl ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h4
            className={`font-semibold ${
              isUrgent
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}
          >
            Points Expiring Soon!
          </h4>
          <p
            className={`text-sm ${
              isUrgent
                ? 'text-red-700 dark:text-red-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}
          >
            You have {points.toLocaleString()} points (${dollarValue} value) expiring on{' '}
            {expirationDate.toLocaleDateString()}
          </p>

          {onShopNow && (
            <button
              onClick={onShopNow}
              className={`mt-3 px-4 py-2 font-medium rounded-lg ${
                isUrgent
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              Use Points Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * LoyaltyDashboard - Complete loyalty overview component
 */
export function LoyaltyDashboard({
  account,
  onRedeem,
  onViewHistory,
  onEarnAction,
  className = '',
}: {
  account: LoyaltyAccount;
  onRedeem?: () => void;
  onViewHistory?: () => void;
  onEarnAction?: (actionId: string) => void;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Points Balance */}
      <PointsBalance account={account} size="large" />

      {/* Expiration Warning */}
      {account.pointsExpiringSoon && account.pointsExpiringSoon > 0 && (
        <PointsExpirationWarning
          points={account.pointsExpiringSoon}
          expirationDate={account.pointsExpiringDate!}
          onShopNow={onRedeem}
        />
      )}

      {/* Tier Progress */}
      <TierProgress
        currentTier={account.currentTier}
        lifetimeSpend={account.lifetimeSpend}
      />

      {/* Ways to Earn */}
      <EarnPointsCard onAction={onEarnAction} />

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </button>
          )}
        </div>
        <PointsHistory transactions={account.transactions.slice(0, 5)} />
      </div>
    </div>
  );
}

export default {
  PointsBalance,
  PointsHistory,
  EarnPointsCard,
  RedeemPoints,
  TierProgress,
  TierBenefits,
  PointsExpirationWarning,
  LoyaltyDashboard,
  TIER_CONFIG,
};
