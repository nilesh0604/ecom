/**
 * ReferralDashboard Component
 * Main dashboard for referral program
 * DTC Feature: Referral Program (6.3)
 */

import React, { useState } from 'react';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

interface Referral {
  id: string;
  email: string;
  status: 'PENDING' | 'SIGNED_UP' | 'COMPLETED' | 'EXPIRED';
  reward?: {
    type: 'CREDIT' | 'DISCOUNT' | 'POINTS';
    value: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface ReferralDashboardProps {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
  recentReferrals?: Referral[];
  rewards: {
    referrer: { type: string; value: number; description: string };
    referee: { type: string; value: number; description: string };
  };
  onCopyCode?: () => void;
  onCopyLink?: () => void;
  onShare?: (platform: 'email' | 'facebook' | 'twitter' | 'whatsapp') => void;
  onSendInvite?: (email: string) => void;
  className?: string;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  referralCode,
  referralLink,
  stats,
  recentReferrals = [],
  rewards,
  onCopyCode,
  onCopyLink,
  onShare,
  onSendInvite,
  className = '',
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onCopyCode?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onCopyLink?.();
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      onSendInvite?.(inviteEmail);
      setInviteEmail('');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SIGNED_UP: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold mb-2">Share & Earn</h1>
          <p className="text-white/80 mb-6">
            Give your friends {rewards.referee.description} and get {rewards.referrer.description} for every successful referral!
          </p>

          {/* Referral Code */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Your Referral Code</p>
                <p className="text-2xl font-bold font-mono tracking-wider">{referralCode}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copiedCode ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalReferrals}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completedReferrals}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReferrals}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalEarnings)}</p>
        </div>
      </div>

      {/* Share & Invite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Link */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Link</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              {copiedLink ? '✓' : 'Copy'}
            </button>
          </div>

          {/* Social Share */}
          <p className="text-sm text-gray-500 mb-3">Or share via:</p>
          <div className="flex gap-3">
            <button
              onClick={() => onShare?.('email')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              onClick={() => onShare?.('facebook')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
            <button
              onClick={() => onShare?.('twitter')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </button>
            <button
              onClick={() => onShare?.('whatsapp')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Email Invite */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Send Email Invite</h3>
          <form onSubmit={handleSendInvite}>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@email.com"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send Invite
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500 mt-3">
            We'll send them a personalized invitation with your referral code.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: 1, icon: '📤', title: 'Share Your Link', description: 'Send your unique referral link to friends and family' },
            { step: 2, icon: '🛍️', title: 'Friend Makes Purchase', description: 'They sign up and make their first purchase using your code' },
            { step: 3, icon: '🎁', title: 'Both Get Rewarded', description: `You get ${rewards.referrer.description}, they get ${rewards.referee.description}` },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                {item.icon}
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Referrals</h3>
        {recentReferrals.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">👥</span>
            <p className="text-gray-500">No referrals yet. Share your code to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReferrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {referral.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited {formatDate(referral.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {referral.reward && referral.status === 'COMPLETED' && (
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(referral.reward.value)}
                    </span>
                  )}
                  {getStatusBadge(referral.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;
