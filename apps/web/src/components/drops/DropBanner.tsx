/**
 * DropBanner Component
 * Full-width banner for promoting drops
 * DTC Feature: Drops & Limited Editions (6.4)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface DropBannerProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  dropDate?: string;
  cta?: {
    label: string;
    href: string;
  };
  accessType?: 'PUBLIC' | 'EARLY_ACCESS' | 'VIP';
  theme?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const DropBanner: React.FC<DropBannerProps> = ({
  title,
  subtitle,
  description,
  image,
  dropDate,
  cta,
  accessType = 'PUBLIC',
  theme = 'dark',
  size = 'medium',
  className = '',
}) => {
  const isDark = theme === 'dark';

  const sizeClasses = {
    small: 'py-8 md:py-12',
    medium: 'py-12 md:py-20',
    large: 'py-20 md:py-32',
  };

  const formatDropDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAccessLabel = () => {
    const labels: Record<string, string> = {
      EARLY_ACCESS: 'Early Access for Members',
      VIP: 'VIP Exclusive',
      PUBLIC: 'Public Release',
    };
    return labels[accessType];
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-r from-black/80 via-black/60 to-transparent'
            : 'bg-gradient-to-r from-white/90 via-white/70 to-transparent'
        }`}
      />

      {/* Content */}
      <div className={`relative z-10 px-8 md:px-16 ${sizeClasses[size]}`}>
        <div className="max-w-xl">
          {/* Access Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              isDark
                ? accessType === 'VIP'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/20 text-white'
                : accessType === 'VIP'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-900/10 text-gray-900'
            }`}
          >
            {accessType === 'VIP' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {getAccessLabel()}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={`text-sm md:text-base font-medium mb-2 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}
            >
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h2
            className={`text-3xl md:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              className={`text-lg mb-6 ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}
            >
              {description}
            </p>
          )}

          {/* Drop Date */}
          {dropDate && (
            <div
              className={`flex items-center gap-2 mb-6 ${
                isDark ? 'text-white/90' : 'text-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{formatDropDate(dropDate)}</span>
            </div>
          )}

          {/* CTA */}
          {cta && (
            <Link
              to={cta.href}
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors ${
                isDark
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {cta.label}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropBanner;
