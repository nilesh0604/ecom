/**
 * ReferralProgram.tsx
 *
 * DTC Feature 6.2: Referral Program
 * Unique referral links, tracking dashboard, two-sided rewards, and sharing tools
 *
 * Components:
 * 1. ReferralCodeCard - Display and copy referral code
 * 2. ReferralShareButtons - Social sharing options
 * 3. ReferralStats - Referral metrics dashboard
 * 4. ReferralHistory - List of referred friends
 * 5. ReferralRewardsBanner - Promo banner for referral program
 * 6. ReferralSignupBanner - CTA for referred users
 * 7. ReferralLeaderboard - Gamified referral ranking
 */

import { useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ReferralStatus = 'pending' | 'signed_up' | 'purchased' | 'rewarded';

export interface ReferralReward {
  referrer: {
    type: 'credit' | 'points' | 'discount' | 'product';
    value: number;
    description: string;
  };
  referee: {
    type: 'credit' | 'points' | 'discount' | 'product';
    value: number;
    description: string;
  };
}

export interface Referral {
  id: string;
  refereeEmail: string;
  refereeName?: string;
  status: ReferralStatus;
  signedUpAt?: Date;
  purchasedAt?: Date;
  rewardedAt?: Date;
  rewardAmount?: number;
  createdAt: Date;
}

export interface ReferralAccount {
  userId: string;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  referrals: Referral[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  referrals: number;
  isCurrentUser?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_REWARDS: ReferralReward = {
  referrer: {
    type: 'credit',
    value: 20,
    description: 'Get $20 credit',
  },
  referee: {
    type: 'discount',
    value: 20,
    description: '20% off first order',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

function getStatusConfig(status: ReferralStatus) {
  const configs = {
    pending: {
      label: 'Pending',
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      icon: '⏳',
    },
    signed_up: {
      label: 'Signed Up',
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      icon: '✉️',
    },
    purchased: {
      label: 'Purchased',
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      icon: '🛒',
    },
    rewarded: {
      label: 'Rewarded',
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      icon: '🎁',
    },
  };
  return configs[status];
}

// ============================================================================
// Components
// ============================================================================

/**
 * ReferralCodeCard - Display and copy referral code/link
 */
export function ReferralCodeCard({
  code,
  link,
  onCopy,
  className = '',
}: {
  code: string;
  link: string;
  onCopy?: (type: 'code' | 'link') => void;
  className?: string;
}) {
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);

  const handleCopy = async (type: 'code' | 'link', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedType(type);
      onCopy?.(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Referral Code
      </h3>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
          Share this code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-lg font-bold text-gray-900 dark:text-white tracking-wider">
            {code}
          </div>
          <button
            onClick={() => handleCopy('code', code)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              copiedType === 'code'
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copiedType === 'code' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div>
        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
          Or share your link
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white border-0 truncate"
          />
          <button
            onClick={() => handleCopy('link', link)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              copiedType === 'link'
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {copiedType === 'link' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ReferralShareButtons - Social sharing options
 */
export function ReferralShareButtons({
  link,
  code,
  message,
  onShare,
  className = '',
}: {
  link: string;
  code: string;
  message?: string;
  onShare?: (platform: string) => void;
  className?: string;
}) {
  const defaultMessage = `Use my referral code ${code} to get 20% off your first order!`;
  const shareMessage = message || defaultMessage;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedLink = encodeURIComponent(link);

  const platforms = [
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=Check out this store!&body=${encodedMessage}%20${encodedLink}`,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedMessage}%20${encodedLink}`,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`,
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      icon: '🐦',
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '💬',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `sms:?body=${encodedMessage}%20${encodedLink}`,
    },
  ];

  const handleShare = (platform: typeof platforms[0]) => {
    onShare?.(platform.id);
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Share via
      </h4>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleShare(platform)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${platform.color}`}
          >
            <span>{platform.icon}</span>
            <span>{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ReferralStats - Referral metrics dashboard
 */
export function ReferralStats({
  account,
  rewards = DEFAULT_REWARDS,
  className = '',
}: {
  account: ReferralAccount;
  rewards?: ReferralReward;
  className?: string;
}) {
  const stats = [
    {
      label: 'Friends Invited',
      value: account.totalReferrals,
      icon: '👥',
    },
    {
      label: 'Successful Referrals',
      value: account.successfulReferrals,
      icon: '✅',
    },
    {
      label: 'Pending Rewards',
      value: `$${account.pendingRewards}`,
      icon: '⏳',
    },
    {
      label: 'Total Earned',
      value: `$${account.totalEarned}`,
      icon: '💰',
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
          >
            <span className="text-2xl mb-2 block">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Reward Info */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">You get</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {rewards.referrer.description}
            </p>
          </div>
          <div className="text-2xl">🤝</div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">They get</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {rewards.referee.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ReferralHistory - List of referred friends
 */
export function ReferralHistory({
  referrals,
  onResendInvite,
  className = '',
}: {
  referrals: Referral[];
  onResendInvite?: (referralId: string) => void;
  className?: string;
}) {
  if (referrals.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Referrals Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your referral link to start earning rewards!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Referrals
      </h3>

      <div className="space-y-3">
        {referrals.map((referral) => {
          const statusConfig = getStatusConfig(referral.status);

          return (
            <div
              key={referral.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
                  {referral.refereeName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {referral.refereeName || referral.refereeEmail}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Invited {referral.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                >
                  <span>{statusConfig.icon}</span>
                  {statusConfig.label}
                </span>

                {referral.status === 'pending' && onResendInvite && (
                  <button
                    onClick={() => onResendInvite(referral.id)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Resend
                  </button>
                )}

                {referral.rewardAmount && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    +${referral.rewardAmount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ReferralRewardsBanner - Promotional banner for referral program
 */
export function ReferralRewardsBanner({
  rewards = DEFAULT_REWARDS,
  onGetStarted,
  variant = 'default',
  className = '',
}: {
  rewards?: ReferralReward;
  onGetStarted?: () => void;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <p className="font-medium">
            Give {rewards.referee.description}, get {rewards.referrer.description}
          </p>
        </div>
        <button
          onClick={onGetStarted}
          className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100"
        >
          Refer Friends
        </button>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`p-8 md:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl text-white text-center ${className}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Share the Love, Earn Rewards
        </h2>
        <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
          Invite your friends to join and you'll both earn rewards.{' '}
          {rewards.referrer.description} for you, {rewards.referee.description} for them!
        </p>

        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
              📤
            </div>
            <p className="font-semibold">Share Link</p>
          </div>
          <div className="text-white/50 text-2xl">→</div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
              👥
            </div>
            <p className="font-semibold">Friends Sign Up</p>
          </div>
          <div className="text-white/50 text-2xl">→</div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
              🎁
            </div>
            <p className="font-semibold">Both Earn</p>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl hover:bg-gray-100 shadow-lg"
        >
          Start Referring →
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🎁</span>
          <div>
            <h3 className="text-xl font-bold mb-1">Refer a Friend</h3>
            <p className="text-white/90">
              Give {rewards.referee.description}, get {rewards.referrer.description}
            </p>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 w-full md:w-auto"
        >
          Get Your Link
        </button>
      </div>
    </div>
  );
}

/**
 * ReferralSignupBanner - CTA for referred users (shows on checkout/signup)
 */
export function ReferralSignupBanner({
  referrerName,
  reward = DEFAULT_REWARDS.referee,
  code,
  onApply,
  className = '',
}: {
  referrerName?: string;
  reward?: ReferralReward['referee'];
  code: string;
  onApply?: (code: string) => void;
  className?: string;
}) {
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = () => {
    setIsApplied(true);
    onApply?.(code);
  };

  if (isApplied) {
    return (
      <div
        className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Referral code applied!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {reward.description} has been applied to your order.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {referrerName ? `${referrerName} sent you a gift!` : "You've been referred!"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {reward.description} with code: <strong>{code}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/**
 * ReferralLeaderboard - Gamified referral ranking
 */
export function ReferralLeaderboard({
  entries,
  currentUserRank,
  period = 'month',
  onChangePeriod,
  className = '',
}: {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  period?: 'week' | 'month' | 'all-time';
  onChangePeriod?: (period: 'week' | 'month' | 'all-time') => void;
  className?: string;
}) {
  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all-time', label: 'All Time' },
  ] as const;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🏆 Referral Leaderboard
          </h3>
          {onChangePeriod && (
            <div className="flex gap-1">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onChangePeriod(p.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    period === p.value
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-4 ${
              entry.isCurrentUser
                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl w-10 text-center ${
                  entry.rank <= 3 ? '' : 'text-sm text-gray-500 dark:text-gray-400'
                }`}
              >
                {getRankBadge(entry.rank)}
              </span>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {entry.name[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                      (You)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {entry.referrals}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                referrals
              </p>
            </div>
          </div>
        ))}
      </div>

      {currentUserRank && currentUserRank > 10 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Your rank: <span className="font-semibold">#{currentUserRank}</span>
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ReferralInviteForm - Email invite form
 */
export function ReferralInviteForm({
  onInvite,
  isLoading = false,
  className = '',
}: {
  onInvite?: (emails: string[]) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailList = emails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(', ')}`);
      return;
    }

    if (emailList.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    onInvite?.(emailList);
    setEmails('');
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Invite by Email
      </h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter email addresses (separated by comma or new line)"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !emails.trim()}
          className="mt-3 w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Invites'}
        </button>
      </form>
    </div>
  );
}

/**
 * ReferralDashboard - Complete referral program dashboard
 */
export function ReferralDashboard({
  account,
  onShare,
  onInvite,
  onResendInvite,
  className = '',
}: {
  account: ReferralAccount;
  onShare?: (platform: string) => void;
  onInvite?: (emails: string[]) => void;
  onResendInvite?: (referralId: string) => void;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats */}
      <ReferralStats account={account} />

      {/* Code & Link */}
      <ReferralCodeCard code={account.referralCode} link={account.referralLink} />

      {/* Share Buttons */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <ReferralShareButtons
          link={account.referralLink}
          code={account.referralCode}
          onShare={onShare}
        />
      </div>

      {/* Invite by Email */}
      <ReferralInviteForm onInvite={onInvite} />

      {/* Referral History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <ReferralHistory
          referrals={account.referrals}
          onResendInvite={onResendInvite}
        />
      </div>
    </div>
  );
}

export default {
  ReferralCodeCard,
  ReferralShareButtons,
  ReferralStats,
  ReferralHistory,
  ReferralRewardsBanner,
  ReferralSignupBanner,
  ReferralLeaderboard,
  ReferralInviteForm,
  ReferralDashboard,
};
