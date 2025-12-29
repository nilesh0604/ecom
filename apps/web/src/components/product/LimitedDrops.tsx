/**
 * LimitedDrops.tsx
 * 
 * DTC Feature 6.3: Limited Drops / Releases (SNKRS Model)
 * Drop calendar, countdown timers, lottery/draw entries, and access tiers
 * 
 * Components:
 * 1. DropCalendar - Upcoming releases calendar view
 * 2. DropCard - Individual drop preview card
 * 3. CountdownTimer - Countdown to drop time
 * 4. DrawEntry - Lottery/draw entry form
 * 5. DrawResult - Draw result notification
 * 6. AccessTierBanner - Member access tier indicator
 * 7. DropNotificationButton - "Notify Me" for specific drops
 */

import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type DropType = 'standard' | 'draw' | 'member-exclusive' | 'early-access';

export type DropStatus = 
  | 'upcoming' 
  | 'notify-open' 
  | 'early-access-live' 
  | 'live' 
  | 'draw-open' 
  | 'draw-closed' 
  | 'sold-out' 
  | 'ended';

export interface DropProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  sizes?: string[];
  colorway?: string;
  sku?: string;
}

export interface Drop {
  id: string;
  name: string;
  description: string;
  heroImage: string;
  thumbnailImage?: string;
  products: DropProduct[];
  dropType: DropType;
  status: DropStatus;
  dropDate: Date;
  earlyAccessDate?: Date;
  drawEndDate?: Date;
  isMemberOnly?: boolean;
  notifyCount?: number;
}

export interface DrawEntryData {
  dropId: string;
  productId: string;
  size: string;
  email: string;
  phoneNumber?: string;
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface DrawResultData {
  dropId: string;
  status: 'pending' | 'won' | 'lost';
  message?: string;
  purchaseDeadline?: Date;
  checkoutUrl?: string;
}

export interface AccessTier {
  name: string;
  level: number;
  earlyAccessHours: number;
  hasDrawPriority: boolean;
  hasExclusiveAccess: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DROP_TYPE_LABELS: Record<DropType, string> = {
  'standard': 'First Come, First Served',
  'draw': 'Draw / Lottery',
  'member-exclusive': 'Member Exclusive',
  'early-access': 'Early Access',
};

const DROP_TYPE_COLORS: Record<DropType, string> = {
  'standard': 'bg-blue-500',
  'draw': 'bg-purple-500',
  'member-exclusive': 'bg-amber-500',
  'early-access': 'bg-green-500',
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * useCountdown - Hook for countdown timer logic
 */
export function useCountdown(targetDate: Date) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - Date.now();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
}

// ============================================================================
// Components
// ============================================================================

/**
 * DropCalendar - Upcoming releases calendar view
 */
export function DropCalendar({
  drops,
  onDropClick,
  onNotify,
  viewMode = 'grid',
  className = '',
}: {
  drops: Drop[];
  onDropClick?: (dropId: string) => void;
  onNotify?: (dropId: string) => void;
  viewMode?: 'grid' | 'list' | 'calendar';
  className?: string;
}) {
  const [filter, setFilter] = useState<DropType | 'all'>('all');
  
  const filteredDrops = drops.filter(
    (drop) => filter === 'all' || drop.dropType === filter
  );

  const sortedDrops = [...filteredDrops].sort(
    (a, b) => a.dropDate.getTime() - b.dropDate.getTime()
  );

  return (
    <section className={`py-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upcoming Drops
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Don't miss out on limited releases
          </p>
        </div>
        
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Drops
          </button>
          {Object.entries(DROP_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setFilter(type as DropType)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Drops grid/list */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedDrops.map((drop) => (
            <DropListItem
              key={drop.id}
              drop={drop}
              onClick={() => onDropClick?.(drop.id)}
              onNotify={() => onNotify?.(drop.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDrops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              onClick={() => onDropClick?.(drop.id)}
              onNotify={() => onNotify?.(drop.id)}
            />
          ))}
        </div>
      )}

      {sortedDrops.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No upcoming drops in this category.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * DropCard - Individual drop preview card
 */
export function DropCard({
  drop,
  onClick,
  onNotify,
  showCountdown = true,
  className = '',
}: {
  drop: Drop;
  onClick?: () => void;
  onNotify?: () => void;
  showCountdown?: boolean;
  className?: string;
}) {
  const timeLeft = useCountdown(drop.dropDate);
  const isLive = drop.status === 'live' || drop.status === 'early-access-live';

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={drop.heroImage}
          alt={drop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${DROP_TYPE_COLORS[drop.dropType]}`}>
            {DROP_TYPE_LABELS[drop.dropType]}
          </span>
          {drop.isMemberOnly && (
            <span className="px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
              Members Only
            </span>
          )}
        </div>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </span>
          </div>
        )}

        {/* Countdown overlay */}
        {showCountdown && !timeLeft.isExpired && !isLive && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-center gap-3 text-white">
              {[
                { value: timeLeft.days, label: 'D' },
                { value: timeLeft.hours, label: 'H' },
                { value: timeLeft.minutes, label: 'M' },
                { value: timeLeft.seconds, label: 'S' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {drop.dropDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {drop.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
          {drop.description}
        </p>

        {/* Product count and price range */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {drop.products.length} product{drop.products.length !== 1 ? 's' : ''}
          </span>
          {drop.products.length > 0 && (
            <span className="font-semibold text-gray-900 dark:text-white">
              ${Math.min(...drop.products.map((p) => p.price)).toFixed(2)}
              {drop.products.length > 1 && '+'}
            </span>
          )}
        </div>

        {/* Notify button */}
        {drop.status === 'upcoming' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNotify?.();
            }}
            className="w-full mt-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Notify Me
          </button>
        )}

        {isLive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="w-full mt-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Shop Now
          </button>
        )}

        {drop.status === 'draw-open' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="w-full mt-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Enter Draw
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * DropListItem - Compact list view for drops
 */
function DropListItem({
  drop,
  onClick,
  onNotify,
}: {
  drop: Drop;
  onClick?: () => void;
  onNotify?: () => void;
}) {
  const timeLeft = useCountdown(drop.dropDate);
  const isLive = drop.status === 'live' || drop.status === 'early-access-live';

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <img
        src={drop.thumbnailImage || drop.heroImage}
        alt={drop.name}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 text-white text-xs font-semibold rounded ${DROP_TYPE_COLORS[drop.dropType]}`}>
            {DROP_TYPE_LABELS[drop.dropType]}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              LIVE
            </span>
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {drop.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {drop.dropDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Countdown or action */}
      <div className="flex-shrink-0 text-right">
        {!timeLeft.isExpired && !isLive && (
          <div className="text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
        )}
        
        {drop.status === 'upcoming' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNotify?.();
            }}
            className="mt-1 px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Notify Me
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * CountdownTimer - Standalone countdown display
 */
export function CountdownTimer({
  targetDate,
  onComplete,
  size = 'default',
  variant = 'default',
  showLabels = true,
  className = '',
}: {
  targetDate: Date;
  onComplete?: () => void;
  size?: 'small' | 'default' | 'large';
  variant?: 'default' | 'minimal' | 'hero';
  showLabels?: boolean;
  className?: string;
}) {
  const timeLeft = useCountdown(targetDate);

  useEffect(() => {
    if (timeLeft.isExpired) {
      onComplete?.();
    }
  }, [timeLeft.isExpired, onComplete]);

  if (timeLeft.isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
          🎉 DROP IS LIVE!
        </span>
      </div>
    );
  }

  const sizeClasses = {
    small: { box: 'w-12 h-12', number: 'text-lg', label: 'text-xs' },
    default: { box: 'w-16 h-16', number: 'text-2xl', label: 'text-xs' },
    large: { box: 'w-20 h-20', number: 'text-3xl', label: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`font-mono font-bold text-gray-900 dark:text-white ${className}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`flex justify-center gap-4 md:gap-6 ${className}`}>
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Minutes' },
          { value: timeLeft.seconds, label: 'Seconds' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-black/20 backdrop-blur rounded-xl">
              <span className="text-4xl md:text-5xl font-bold text-white">
                {value.toString().padStart(2, '0')}
              </span>
            </div>
            {showLabels && (
              <span className="text-sm text-white/70 mt-2 block">{label}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div
            className={`${sizes.box} flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg`}
          >
            <span className={`${sizes.number} font-bold text-gray-900 dark:text-white`}>
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          {showLabels && (
            <span className={`${sizes.label} text-gray-500 dark:text-gray-400 mt-1 block`}>
              {label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * DrawEntry - Lottery/draw entry form
 */
export function DrawEntry({
  drop,
  product,
  onSubmit,
  isSubmitting = false,
  userEmail,
  className = '',
}: {
  drop: Drop;
  product: DropProduct;
  onSubmit?: (data: DrawEntryData) => void | Promise<void>;
  isSubmitting?: boolean;
  userEmail?: string;
  className?: string;
}) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [email, setEmail] = useState(userEmail || '');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize || !email || !agreed) return;

    onSubmit?.({
      dropId: drop.id,
      productId: product.id,
      size: selectedSize,
      email,
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 ${className}`}>
      <div className="flex gap-4 mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{drop.name}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          {product.colorway && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.colorway}</p>
          )}
          <p className="font-semibold text-gray-900 dark:text-white mt-1">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Size selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-4 border rounded-lg font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email for Draw Results
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Terms agreement */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I understand that entering this draw does not guarantee a purchase. If selected, I
            agree to complete the purchase within the specified time window.
          </span>
        </label>

        {/* Draw info */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-6">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            How the Draw Works
          </h4>
          <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
            <li>• Entry window closes at {drop.drawEndDate?.toLocaleString()}</li>
            <li>• Winners are selected randomly and notified by email</li>
            <li>• Winners have 24 hours to complete their purchase</li>
            <li>• One entry per person, per size</li>
          </ul>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!selectedSize || !email || !agreed || isSubmitting}
          className="w-full py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting Entry...
            </span>
          ) : (
            'Enter Draw'
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * DrawResult - Draw result notification component
 */
export function DrawResult({
  result,
  productName,
  productImage,
  onCheckout,
  onViewDrops,
  className = '',
}: {
  result: DrawResultData;
  productName: string;
  productImage: string;
  onCheckout?: () => void;
  onViewDrops?: () => void;
  className?: string;
}) {
  const timeLeft = result.purchaseDeadline ? useCountdown(result.purchaseDeadline) : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Result banner */}
      <div
        className={`p-6 text-center ${
          result.status === 'won'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : result.status === 'lost'
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
        }`}
      >
        <div className="text-5xl mb-3">
          {result.status === 'won' ? '🎉' : result.status === 'lost' ? '😔' : '⏳'}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {result.status === 'won'
            ? 'Congratulations! You Won!'
            : result.status === 'lost'
            ? 'Better Luck Next Time'
            : 'Draw Entry Received'}
        </h2>
        <p className="opacity-90">
          {result.status === 'won'
            ? 'You have been selected to purchase this item'
            : result.status === 'lost'
            ? 'You were not selected in this draw'
            : 'Your entry has been submitted. Results coming soon.'}
        </p>
      </div>

      {/* Product info */}
      <div className="p-6">
        <div className="flex gap-4 items-center mb-6">
          <img
            src={productImage}
            alt={productName}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{productName}</h3>
            {result.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.message}</p>
            )}
          </div>
        </div>

        {/* Won - show checkout */}
        {result.status === 'won' && result.purchaseDeadline && (
          <>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⏰ Complete your purchase before the deadline
              </p>
              {timeLeft && !timeLeft.isExpired && (
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                  {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s remaining
                </p>
              )}
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Purchase
            </button>
          </>
        )}

        {/* Lost - show other drops */}
        {result.status === 'lost' && (
          <button
            onClick={onViewDrops}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            View Other Drops
          </button>
        )}

        {/* Pending */}
        {result.status === 'pending' && (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>We'll notify you by email when results are ready.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AccessTierBanner - Member access tier indicator
 */
export function AccessTierBanner({
  tier,
  drop,
  onUpgrade,
  className = '',
}: {
  tier: AccessTier;
  drop: Drop;
  onUpgrade?: () => void;
  className?: string;
}) {
  const hasEarlyAccess = drop.earlyAccessDate && tier.earlyAccessHours > 0;
  const hasExclusiveAccess = drop.isMemberOnly && tier.hasExclusiveAccess;

  if (!hasEarlyAccess && !hasExclusiveAccess) return null;

  return (
    <div
      className={`p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-700 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {tier.name} Member
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {hasEarlyAccess && (
                <>You get {tier.earlyAccessHours}-hour early access</>
              )}
              {hasEarlyAccess && hasExclusiveAccess && ' + '}
              {hasExclusiveAccess && <>exclusive access to this drop</>}
            </p>
          </div>
        </div>
        
        {onUpgrade && tier.level < 3 && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Upgrade Tier
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * DropNotificationButton - "Notify Me" button for specific drops
 */
export function DropNotificationButton({
  dropId,
  isNotified = false,
  notifyCount,
  onNotify,
  onUnnotify,
  size = 'default',
  className = '',
}: {
  dropId: string;
  isNotified?: boolean;
  notifyCount?: number;
  onNotify?: (dropId: string) => void;
  onUnnotify?: (dropId: string) => void;
  size?: 'small' | 'default' | 'large';
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  const handleClick = () => {
    if (isNotified) {
      onUnnotify?.(dropId);
    } else {
      onNotify?.(dropId);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 font-medium rounded-lg transition-all ${sizeClasses[size]} ${
        isNotified
          ? isHovered
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
      } ${className}`}
    >
      {isNotified ? (
        <>
          {isHovered ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove Notification
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.343 2 9 3.343 9 5v.268C6.107 6.264 4 9.126 4 12.5V17l-2 2v1h20v-1l-2-2v-4.5c0-3.374-2.107-6.236-5-7.232V5c0-1.657-1.343-3-3-3zm0 20a2 2 0 002-2h-4a2 2 0 002 2z" />
              </svg>
              Notification Set
            </>
          )}
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Notify Me
        </>
      )}

      {notifyCount !== undefined && notifyCount > 0 && (
        <span className="text-xs opacity-70">({notifyCount.toLocaleString()})</span>
      )}
    </button>
  );
}

export default {
  DropCalendar,
  DropCard,
  CountdownTimer,
  DrawEntry,
  DrawResult,
  AccessTierBanner,
  DropNotificationButton,
  useCountdown,
};
