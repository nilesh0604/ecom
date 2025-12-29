/**
 * LoyaltyDashboard Component
 * Main dashboard for loyalty program overview
 * DTC Feature: Loyalty Program (6.2)
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface LoyaltyTier {
  name: string;
  minPoints: number;
  icon?: string;
  benefits: string[];
}

interface PointsTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'BONUS';
  points: number;
  description: string;
  createdAt: string;
}

interface AvailableReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image?: string;
  category: string;
}

export interface LoyaltyDashboardProps {
  userName?: string;
  currentPoints: number;
  lifetimePoints: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier?: number;
  recentTransactions?: PointsTransaction[];
  availableRewards?: AvailableReward[];
  pointsExpiringSoon?: {
    points: number;
    expiresAt: string;
  };
  onRedeemReward?: (rewardId: string) => void;
  className?: string;
}

const tierColors: Record<string, { bg: string; text: string; accent: string }> = {
  Bronze: { bg: 'bg-amber-100', text: 'text-amber-800', accent: 'border-amber-400' },
  Silver: { bg: 'bg-gray-100', text: 'text-gray-700', accent: 'border-gray-400' },
  Gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', accent: 'border-yellow-500' },
  Platinum: { bg: 'bg-indigo-100', text: 'text-indigo-800', accent: 'border-indigo-500' },
  Diamond: { bg: 'bg-cyan-100', text: 'text-cyan-800', accent: 'border-cyan-500' },
};

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({
  userName,
  currentPoints,
  lifetimePoints,
  currentTier,
  nextTier,
  pointsToNextTier,
  recentTransactions = [],
  availableRewards = [],
  pointsExpiringSoon,
  onRedeemReward,
  className = '',
}) => {
  const tierStyle = tierColors[currentTier.name] || tierColors.Bronze;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const progressPercent = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <div className={`rounded-2xl overflow-hidden border-2 ${tierStyle.accent}`}>
        <div className={`${tierStyle.bg} p-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* User Info */}
            <div>
              <p className="text-gray-600 mb-1">
                {userName ? `Welcome back, ${userName}!` : 'Welcome!'}
              </p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${tierStyle.bg} ${tierStyle.text}`}>
                  {currentTier.icon || '⭐'} {currentTier.name}
                </span>
              </div>
            </div>

            {/* Points Display */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Points</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatNumber(currentPoints)}
              </p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && pointsToNextTier && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress to {nextTier.name}</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(pointsToNextTier)} points to go
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Points Expiring Warning */}
        {pointsExpiringSoon && pointsExpiringSoon.points > 0 && (
          <div className="bg-red-50 border-t border-red-200 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                {formatNumber(pointsExpiringSoon.points)} points expiring on{' '}
                {formatDate(pointsExpiringSoon.expiresAt)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Lifetime Points</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(lifetimePoints)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Current Tier</p>
          <p className="text-2xl font-bold text-gray-900">{currentTier.name}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Rewards Available</p>
          <p className="text-2xl font-bold text-gray-900">{availableRewards.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Points This Month</p>
          <p className="text-2xl font-bold text-gray-900">
            +{formatNumber(
              recentTransactions
                .filter((t) => t.type === 'EARNED' || t.type === 'BONUS')
                .reduce((sum, t) => sum + t.points, 0)
            )}
          </p>
        </div>
      </div>

      {/* Current Tier Benefits */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Your {currentTier.name} Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentTier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <Link to="/account/loyalty/history" className="text-blue-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <span
                    className={`font-bold ${
                      transaction.type === 'EARNED' || transaction.type === 'BONUS'
                        ? 'text-green-600'
                        : transaction.type === 'EXPIRED'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {transaction.type === 'EARNED' || transaction.type === 'BONUS' ? '+' : '-'}
                    {formatNumber(transaction.points)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Rewards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Redeem Rewards</h3>
            <Link to="/account/loyalty/rewards" className="text-blue-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {availableRewards.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No rewards available</p>
          ) : (
            <div className="space-y-3">
              {availableRewards.slice(0, 3).map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                >
                  {reward.image && (
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{reward.name}</p>
                    <p className="text-sm text-gray-500">{formatNumber(reward.pointsCost)} points</p>
                  </div>
                  <button
                    onClick={() => onRedeemReward?.(reward.id)}
                    disabled={currentPoints < reward.pointsCost}
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ways to Earn */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-bold mb-4">Ways to Earn Points</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🛍️', label: 'Shop', points: '1 point per $1' },
            { icon: '⭐', label: 'Review', points: '+50 points' },
            { icon: '🎂', label: 'Birthday', points: '+100 points' },
            { icon: '👥', label: 'Refer', points: '+200 points' },
          ].map((way) => (
            <div key={way.label} className="text-center">
              <span className="text-3xl">{way.icon}</span>
              <p className="font-medium mt-2">{way.label}</p>
              <p className="text-sm text-white/70">{way.points}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
