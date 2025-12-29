/**
 * MembershipProgram.tsx
 * 
 * DTC Feature 5.1: Membership Program (Nike Model)
 * Free membership with exclusive benefits, member pricing, and rewards
 * 
 * Components:
 * 1. MembershipBanner - Hero CTA to join membership
 * 2. MemberBenefits - Benefits showcase grid
 * 3. MemberPriceDisplay - Side-by-side regular/member pricing
 * 4. MemberBadge - Visual indicator for member-exclusive items
 * 5. BirthdayReward - Birthday reward claim component
 * 6. EarlyAccessBanner - Early access countdown for members
 * 7. MembershipSignupForm - Quick signup form
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MemberBenefit {
  icon: string;
  title: string;
  description: string;
  value?: string;
}

export interface MemberPricing {
  regularPrice: number;
  memberPrice: number;
  currency?: string;
  savingsPercentage?: number;
}

export interface BirthdayRewardData {
  rewardAmount: number;
  expiresAt: Date;
  isRedeemed: boolean;
  code?: string;
}

export interface EarlyAccessData {
  productName: string;
  productImage?: string;
  accessDate: Date;
  publicReleaseDate: Date;
  isMember: boolean;
}

export interface MembershipTier {
  name: string;
  discount: number;
  earlyAccessHours: number;
  freeShippingThreshold: number;
  birthdayReward: number;
  exclusiveProducts: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const membershipSignupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthday: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
  marketingOptIn: z.boolean(),
});

type MembershipSignupFormData = z.infer<typeof membershipSignupSchema>;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_BENEFITS: MemberBenefit[] = [
  {
    icon: '🎁',
    title: 'Birthday Reward',
    description: 'Get a special reward on your birthday',
    value: '$10',
  },
  {
    icon: '🏷️',
    title: 'Member Pricing',
    description: 'Exclusive discounts on all products',
    value: '10% off',
  },
  {
    icon: '🚀',
    title: 'Early Access',
    description: 'Shop new releases before anyone else',
    value: '48 hours',
  },
  {
    icon: '📦',
    title: 'Free Shipping',
    description: 'Free standard shipping on orders',
    value: '$50+',
  },
  {
    icon: '🎯',
    title: 'Exclusives',
    description: 'Member-only products and colors',
    value: '',
  },
  {
    icon: '📧',
    title: 'Member Events',
    description: 'Invites to exclusive events and content',
    value: '',
  },
];

// ============================================================================
// Components
// ============================================================================

/**
 * MembershipBanner - Hero CTA to join the free membership program
 */
export function MembershipBanner({
  title = 'Join for Free',
  subtitle = 'Become a member for exclusive benefits, member-only pricing, and early access to new releases.',
  ctaText = 'Join Now — It\'s Free',
  onJoinClick,
  backgroundImage,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onJoinClick?: () => void;
  backgroundImage?: string;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      
      <div className="relative z-10 px-8 py-16 md:px-16 md:py-24">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white/20 rounded-full">
            Membership
          </span>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            {subtitle}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>10% Member Discount</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Early Access</span>
            </div>
          </div>
          
          <button
            onClick={onJoinClick}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {ctaText}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * MemberBenefits - Grid showcase of membership benefits
 */
export function MemberBenefits({
  benefits = DEFAULT_BENEFITS,
  title = 'Member Benefits',
  columns = 3,
  className = '',
}: {
  benefits?: MemberBenefit[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {title}
        </h3>
      )}
      
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{benefit.icon}</div>
            
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {benefit.title}
              </h4>
              {benefit.value && (
                <span className="px-2 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 rounded">
                  {benefit.value}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * MemberPriceDisplay - Shows regular and member pricing side-by-side
 */
export function MemberPriceDisplay({
  pricing,
  isMember = false,
  showSignInPrompt = true,
  onSignInClick,
  size = 'default',
  className = '',
}: {
  pricing: MemberPricing;
  isMember?: boolean;
  showSignInPrompt?: boolean;
  onSignInClick?: () => void;
  size?: 'small' | 'default' | 'large';
  className?: string;
}) {
  const { regularPrice, memberPrice, currency = '$' } = pricing;
  const savingsPercentage = pricing.savingsPercentage ?? Math.round((1 - memberPrice / regularPrice) * 100);

  const sizeClasses = {
    small: {
      regular: 'text-sm',
      member: 'text-lg',
      badge: 'text-xs px-1.5 py-0.5',
    },
    default: {
      regular: 'text-base',
      member: 'text-2xl',
      badge: 'text-xs px-2 py-1',
    },
    large: {
      regular: 'text-lg',
      member: 'text-3xl',
      badge: 'text-sm px-2 py-1',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Member Price */}
      <div className="flex items-center gap-2">
        <span className={`font-bold text-gray-900 dark:text-white ${sizes.member}`}>
          {currency}{memberPrice.toFixed(2)}
        </span>
        
        <span className={`font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded ${sizes.badge}`}>
          Member
        </span>
        
        {savingsPercentage > 0 && (
          <span className={`font-medium text-green-600 dark:text-green-400 ${sizes.badge}`}>
            Save {savingsPercentage}%
          </span>
        )}
      </div>
      
      {/* Regular Price */}
      <div className="flex items-center gap-2">
        <span className={`text-gray-500 line-through ${sizes.regular}`}>
          {currency}{regularPrice.toFixed(2)}
        </span>
        <span className={`text-gray-500 ${sizes.regular}`}>
          Regular
        </span>
      </div>
      
      {/* Sign in prompt for non-members */}
      {!isMember && showSignInPrompt && (
        <button
          onClick={onSignInClick}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline text-left mt-1"
        >
          Sign in for member price →
        </button>
      )}
    </div>
  );
}

/**
 * MemberBadge - Visual indicator for member-exclusive items
 */
export function MemberBadge({
  type = 'exclusive',
  size = 'default',
  className = '',
}: {
  type?: 'exclusive' | 'early-access' | 'member-price';
  size?: 'small' | 'default' | 'large';
  className?: string;
}) {
  const labels = {
    'exclusive': 'Member Exclusive',
    'early-access': 'Early Access',
    'member-price': 'Member Price',
  };

  const icons = {
    'exclusive': '⭐',
    'early-access': '🚀',
    'member-price': '🏷️',
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full ${sizeClasses[size]} ${className}`}
    >
      <span>{icons[type]}</span>
      <span>{labels[type]}</span>
    </span>
  );
}

/**
 * BirthdayReward - Birthday reward claim component
 */
export function BirthdayReward({
  reward,
  onClaim,
  onApplyToCart,
  className = '',
}: {
  reward: BirthdayRewardData;
  onClaim?: () => void;
  onApplyToCart?: (code: string) => void;
  className?: string;
}) {
  const { rewardAmount, expiresAt, isRedeemed, code } = reward;
  const isExpired = new Date() > expiresAt;
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (isExpired) {
    return (
      <div className={`p-6 bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2 block">🎂</span>
          <p>Your birthday reward has expired.</p>
          <p className="text-sm mt-2">Don't worry, you'll get a new one next year!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800 ${className}`}>
      <div className="text-center">
        <span className="text-5xl mb-4 block">🎂</span>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Happy Birthday!
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Here's a special gift just for you
        </p>
        
        <div className="inline-block px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            ${rewardAmount}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">reward</span>
        </div>
        
        {!isRedeemed && !code && (
          <div>
            <button
              onClick={onClaim}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Claim Your Reward
            </button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Expires in {daysUntilExpiry} days
            </p>
          </div>
        )}
        
        {code && (
          <div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your code</p>
              <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                {code}
              </p>
            </div>
            
            <button
              onClick={() => onApplyToCart?.(code)}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * EarlyAccessBanner - Countdown banner for member early access
 */
export function EarlyAccessBanner({
  data,
  onNotifyMe,
  className = '',
}: {
  data: EarlyAccessData;
  onNotifyMe?: () => void;
  className?: string;
}) {
  const { productName, productImage, accessDate, publicReleaseDate, isMember } = data;
  const now = new Date();
  
  const isEarlyAccessActive = now >= accessDate && now < publicReleaseDate;
  const isEarlyAccessUpcoming = now < accessDate;
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const targetDate = isMember ? accessDate : publicReleaseDate;
    return Math.max(0, targetDate.getTime() - now.getTime());
  });

  // Calculate time components
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // Update countdown
  useState(() => {
    const interval = setInterval(() => {
      const targetDate = isMember ? accessDate : publicReleaseDate;
      setTimeLeft(Math.max(0, targetDate.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  });

  if (isEarlyAccessActive && isMember) {
    return (
      <div className={`p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl ${className}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">
              Early Access Active!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Shop {productName} before everyone else
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {productImage && (
        <div className="absolute inset-0">
          <img src={productImage} alt="" className="w-full h-full object-cover opacity-20" />
        </div>
      )}
      
      <div className="relative z-10 p-6 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MemberBadge type="early-access" size="small" />
              {isMember && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                  You're a member!
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-1">{productName}</h3>
            
            <p className="text-white/80 text-sm">
              {isMember 
                ? `Member early access starts ${accessDate.toLocaleDateString()}`
                : `Public release ${publicReleaseDate.toLocaleDateString()}`
              }
            </p>
          </div>
          
          {/* Countdown */}
          {isEarlyAccessUpcoming && (
            <div className="flex gap-3">
              {[
                { value: days, label: 'Days' },
                { value: hours, label: 'Hrs' },
                { value: minutes, label: 'Min' },
                { value: seconds, label: 'Sec' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-lg backdrop-blur">
                    <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-xs text-white/70 mt-1">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!isMember && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 mb-3">
              Members get 48-hour early access. Join for free!
            </p>
            <button
              onClick={onNotifyMe}
              className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Become a Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MembershipSignupForm - Quick signup form for membership
 */
export function MembershipSignupForm({
  onSubmit,
  onClose,
  isLoading = false,
  className = '',
}: {
  onSubmit?: (data: MembershipSignupFormData) => void | Promise<void>;
  onClose?: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipSignupFormData>({
    resolver: zodResolver(membershipSignupSchema),
    defaultValues: {
      marketingOptIn: true,
    },
  });

  const handleFormSubmit = (data: MembershipSignupFormData) => {
    onSubmit?.(data);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Join for Free
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Unlock exclusive member benefits
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              {...register('firstName')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              {...register('lastName')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birthday <span className="text-gray-500">(optional, for birthday rewards)</span>
          </label>
          <input
            type="date"
            {...register('birthday')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('agreeToTerms')}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
          )}
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('marketingOptIn')}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Send me exclusive offers, new arrivals, and member-only content
            </span>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Joining...
            </span>
          ) : (
            'Join for Free'
          )}
        </button>
      </form>
      
      {/* Benefits preview */}
      <div className="px-6 pb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            What you'll get:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              10% off everything
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              $10 birthday reward
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              48hr early access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Free shipping $50+
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default {
  MembershipBanner,
  MemberBenefits,
  MemberPriceDisplay,
  MemberBadge,
  BirthdayReward,
  EarlyAccessBanner,
  MembershipSignupForm,
};
