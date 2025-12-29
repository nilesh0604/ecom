/**
 * ReferralBanner Component
 * Promotional banner for referral program
 * DTC Feature: Referral Program (6.3)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface ReferralBannerProps {
  title?: string;
  subtitle?: string;
  referrerReward: string;
  refereeReward: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: 'full' | 'compact' | 'inline';
  theme?: 'gradient' | 'light' | 'dark';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({
  title = 'Give $10, Get $10',
  subtitle = 'Share the love with friends and family',
  referrerReward,
  refereeReward,
  ctaLabel = 'Start Sharing',
  ctaHref = '/account/referrals',
  variant = 'full',
  theme = 'gradient',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const themeStyles = {
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
    light: 'bg-purple-50 text-gray-900 border border-purple-200',
    dark: 'bg-gray-900 text-white',
  };

  // Compact variant - for headers/sidebars
  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-xl ${themeStyles[theme]} ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-bold">{title}</p>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'opacity-80'}`}>
                {subtitle}
              </p>
            </div>
          </div>
          <Link
            to={ctaHref}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'light'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white text-purple-600 hover:bg-gray-100'
            }`}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    );
  }

  // Inline variant - for product pages/checkout
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${themeStyles[theme]} ${className}`}>
        <span className="text-xl">💝</span>
        <p className={`flex-1 text-sm ${theme === 'light' ? 'text-gray-700' : ''}`}>
          <span className="font-medium">Refer a friend:</span> You get {referrerReward}, they get {refereeReward}
        </p>
        <Link
          to={ctaHref}
          className={`text-sm font-medium underline ${
            theme === 'light' ? 'text-purple-600' : ''
          }`}
        >
          Learn More
        </Link>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-black/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Full variant - hero/promotional
  return (
    <div className={`relative overflow-hidden rounded-2xl ${themeStyles[theme]} ${className}`}>
      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
          <pattern id="referral-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" />
          </pattern>
          <rect fill="url(#referral-pattern)" width="100%" height="100%" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative px-8 py-12 md:py-16 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white/20 text-4xl">
          🎁
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
        <p className={`text-lg mb-8 ${theme === 'light' ? 'text-gray-600' : 'opacity-90'}`}>
          {subtitle}
        </p>

        {/* Rewards Breakdown */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-white/10'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'opacity-70'}`}>You Get</p>
            <p className="text-2xl font-bold">{referrerReward}</p>
          </div>
          <div className="text-3xl">→</div>
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-white/10'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'opacity-70'}`}>Friend Gets</p>
            <p className="text-2xl font-bold">{refereeReward}</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={ctaHref}
          className={`inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-xl transition-transform hover:scale-105 ${
            theme === 'light'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white text-purple-600 hover:bg-gray-100'
          }`}
        >
          {ctaLabel}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        {/* Fine Print */}
        <p className={`mt-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'opacity-60'}`}>
          No limit on referrals. Terms apply.
        </p>
      </div>
    </div>
  );
};

export default ReferralBanner;
