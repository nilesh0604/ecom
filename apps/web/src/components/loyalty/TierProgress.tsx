/**
 * TierProgress Component
 * Visual tier progress and comparison
 * DTC Feature: Loyalty Program (6.2)
 */

import React from 'react';

interface Tier {
  id: string;
  name: string;
  minPoints: number;
  icon: string;
  color: string;
  benefits: string[];
  multiplier?: number;
}

export interface TierProgressProps {
  tiers: Tier[];
  currentPoints: number;
  currentTierId: string;
  lifetimePoints: number;
  layout?: 'horizontal' | 'vertical' | 'cards';
  showBenefits?: boolean;
  className?: string;
}

export const TierProgress: React.FC<TierProgressProps> = ({
  tiers,
  currentPoints,
  currentTierId,
  lifetimePoints,
  layout = 'horizontal',
  showBenefits = true,
  className = '',
}) => {
  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  const currentTierIndex = sortedTiers.findIndex((t) => t.id === currentTierId);
  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = sortedTiers[currentTierIndex + 1];

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getProgressPercent = (tierIndex: number) => {
    const tier = sortedTiers[tierIndex];
    const nextT = sortedTiers[tierIndex + 1];

    if (!nextT) return 100;
    if (lifetimePoints < tier.minPoints) return 0;
    if (lifetimePoints >= nextT.minPoints) return 100;

    return ((lifetimePoints - tier.minPoints) / (nextT.minPoints - tier.minPoints)) * 100;
  };

  // Horizontal Progress Bar Layout
  if (layout === 'horizontal') {
    const maxPoints = sortedTiers[sortedTiers.length - 1].minPoints;
    const progressPercent = Math.min(100, (lifetimePoints / maxPoints) * 100);

    return (
      <div className={className}>
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tier Markers */}
          <div className="relative">
            {sortedTiers.map((tier, index) => {
              const position = (tier.minPoints / maxPoints) * 100;
              const isAchieved = lifetimePoints >= tier.minPoints;
              const isCurrent = tier.id === currentTierId;

              return (
                <div
                  key={tier.id}
                  className="absolute -top-6 transform -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  {/* Marker */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 ${
                      isAchieved
                        ? 'bg-white border-current shadow-lg'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                    style={{ borderColor: isAchieved ? tier.color : undefined }}
                  >
                    {tier.icon}
                  </div>

                  {/* Label */}
                  <div className="text-center mt-2">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {tier.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatNumber(tier.minPoints)} pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            You have <span className="font-bold text-gray-900">{formatNumber(lifetimePoints)}</span> lifetime points
          </p>
          {nextTier && (
            <p className="text-sm text-gray-500 mt-1">
              {formatNumber(nextTier.minPoints - lifetimePoints)} more points to reach {nextTier.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Cards Layout
  if (layout === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sortedTiers.length} gap-4 ${className}`}>
        {sortedTiers.map((tier) => {
          const isAchieved = lifetimePoints >= tier.minPoints;
          const isCurrent = tier.id === currentTierId;

          return (
            <div
              key={tier.id}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isCurrent
                  ? 'border-current shadow-lg'
                  : isAchieved
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 opacity-60'
              }`}
              style={{ borderColor: isCurrent ? tier.color : undefined }}
            >
              {/* Current Badge */}
              {isCurrent && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: tier.color }}
                >
                  Current Tier
                </span>
              )}

              {/* Header */}
              <div className="text-center mb-4">
                <span className="text-4xl">{tier.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{tier.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatNumber(tier.minPoints)}+ lifetime points
                </p>
                {tier.multiplier && (
                  <p className="text-sm font-medium mt-1" style={{ color: tier.color }}>
                    {tier.multiplier}x points multiplier
                  </p>
                )}
              </div>

              {/* Benefits */}
              {showBenefits && (
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-2 text-sm ${
                        isAchieved ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isAchieved ? 'text-green-500' : 'text-gray-300'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {/* Progress */}
              {!isAchieved && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    {formatNumber(tier.minPoints - lifetimePoints)} points to unlock
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical Layout (default)
  return (
    <div className={`space-y-4 ${className}`}>
      {sortedTiers.map((tier, index) => {
        const isAchieved = lifetimePoints >= tier.minPoints;
        const isCurrent = tier.id === currentTierId;
        const progress = getProgressPercent(index);

        return (
          <div key={tier.id}>
            <div
              className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                isCurrent
                  ? 'border-current shadow-md'
                  : isAchieved
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
              }`}
              style={{ borderColor: isCurrent ? tier.color : undefined }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  isAchieved ? 'bg-white shadow' : 'bg-gray-100'
                }`}
              >
                {tier.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{tier.name}</h4>
                  {isCurrent && (
                    <span
                      className="px-2 py-0.5 text-xs font-medium text-white rounded"
                      style={{ backgroundColor: tier.color }}
                    >
                      Current
                    </span>
                  )}
                  {isAchieved && !isCurrent && (
                    <span className="text-green-600 text-sm">✓ Achieved</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatNumber(tier.minPoints)} lifetime points
                </p>

                {/* Progress to next tier */}
                {isCurrent && nextTier && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: tier.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNumber(nextTier.minPoints - lifetimePoints)} pts to {nextTier.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Multiplier */}
              {tier.multiplier && (
                <div className="text-right">
                  <span
                    className="text-lg font-bold"
                    style={{ color: isAchieved ? tier.color : '#9CA3AF' }}
                  >
                    {tier.multiplier}x
                  </span>
                  <p className="text-xs text-gray-500">multiplier</p>
                </div>
              )}
            </div>

            {/* Benefits Dropdown */}
            {showBenefits && isCurrent && (
              <div className="ml-16 mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Benefits:</p>
                <div className="grid grid-cols-2 gap-2">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TierProgress;
