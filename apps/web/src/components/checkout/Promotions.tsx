import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  value: number;
  description: string;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount?: number;
  excludedCategories?: string[];
  excludedProducts?: string[];
  isActive: boolean;
}

export interface AppliedPromotion {
  code: string;
  discount: number;
  description: string;
}

// ============================================================================
// PROMO CODE INPUT COMPONENT
// ============================================================================

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<AppliedPromotion | null>;
  onRemove?: () => void;
  appliedPromo?: AppliedPromotion | null;
  disabled?: boolean;
}

/**
 * PromoCodeInput Component
 *
 * Input field for applying promo/coupon codes at checkout.
 *
 * Features:
 * - Code validation
 * - Loading state
 * - Error handling
 * - Applied promo display
 * - Remove applied promo
 */
export const PromoCodeInput = ({
  onApply,
  onRemove,
  appliedPromo,
  disabled = false,
}: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result) {
        setCode('');
        setIsExpanded(false);
      } else {
        setError('Invalid promo code');
      }
    } catch {
      setError('Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedPromo) {
    return (
      <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 5.707a1 1 0 00-1.414-1.414l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L8.414 9H13a1 1 0 100-2H8.414l1.293-1.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                {appliedPromo.code}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {appliedPromo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-green-700 dark:text-green-300">
              -${appliedPromo.discount.toFixed(2)}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Remove promo code"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Have a promo code?
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              disabled={disabled || loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 uppercase placeholder:normal-case dark:border-gray-600 dark:bg-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={disabled || loading || !code.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setCode('');
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AVAILABLE PROMOTIONS DISPLAY
// ============================================================================

interface AvailablePromotionsProps {
  promotions: Promotion[];
  onApply?: (code: string) => void;
  className?: string;
}

/**
 * AvailablePromotions Component
 *
 * Displays available promotions to the user.
 */
export const AvailablePromotions = ({
  promotions,
  onApply,
  className = '',
}: AvailablePromotionsProps) => {
  if (promotions.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Available Offers
      </h3>
      <div className="space-y-2">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="flex items-center justify-between rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-800">
                {promo.type === 'percentage' && (
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">%</span>
                )}
                {promo.type === 'fixed' && (
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">$</span>
                )}
                {promo.type === 'free_shipping' && (
                  <svg
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                )}
                {promo.type === 'bogo' && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2=1</span>
                )}
              </div>
              <div>
                <p className="font-medium text-indigo-900 dark:text-indigo-100">
                  {promo.description}
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Code: <span className="font-mono font-semibold">{promo.code}</span>
                  {promo.minPurchase && ` • Min. $${promo.minPurchase}`}
                </p>
              </div>
            </div>
            {onApply && (
              <button
                type="button"
                onClick={() => onApply(promo.code)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PROMOTION BANNER COMPONENT
// ============================================================================

interface PromotionBannerProps {
  message: string;
  code?: string;
  backgroundColor?: string;
  onDismiss?: () => void;
}

/**
 * PromotionBanner Component
 *
 * Site-wide promotion banner display.
 */
export const PromotionBanner = ({
  message,
  code,
  backgroundColor = 'bg-indigo-600',
  onDismiss,
}: PromotionBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isDismissed) return null;

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`${backgroundColor} px-4 py-3 text-white`}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
        <p className="text-center text-sm font-medium">
          {message}
          {code && (
            <>
              {' '}
              Use code{' '}
              <button
                type="button"
                onClick={handleCopy}
                className="rounded bg-white/20 px-2 py-0.5 font-mono font-bold transition-colors hover:bg-white/30"
              >
                {copied ? '✓ Copied!' : code}
              </button>
            </>
          )}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/80 hover:text-white"
            aria-label="Dismiss banner"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MOCK PROMO VALIDATOR
// ============================================================================

const MOCK_PROMOTIONS: Record<string, Promotion> = {
  SAVE20: {
    id: '1',
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    description: '20% off your order',
    minPurchase: 50,
    maxDiscount: 100,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
  },
  FLAT10: {
    id: '2',
    code: 'FLAT10',
    type: 'fixed',
    value: 10,
    description: '$10 off your order',
    minPurchase: 30,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
  },
  FREESHIP: {
    id: '3',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    description: 'Free shipping on your order',
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
  },
  WELCOME15: {
    id: '4',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    description: '15% off for new customers',
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    usageLimit: 1,
    isActive: true,
  },
};

/**
 * validatePromoCode
 *
 * Mock function to validate promo codes.
 * In production, this would be an API call.
 */
export const validatePromoCode = async (
  code: string,
  subtotal: number
): Promise<AppliedPromotion | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const promo = MOCK_PROMOTIONS[code.toUpperCase()];

  if (!promo || !promo.isActive) {
    return null;
  }

  // Check minimum purchase
  if (promo.minPurchase && subtotal < promo.minPurchase) {
    return null;
  }

  // Calculate discount
  let discount = 0;

  switch (promo.type) {
    case 'percentage':
      discount = subtotal * (promo.value / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
      break;
    case 'fixed':
      discount = promo.value;
      break;
    case 'free_shipping':
      discount = 9.99; // Mock shipping cost
      break;
    default:
      discount = 0;
  }

  return {
    code: promo.code,
    discount,
    description: promo.description,
  };
};

/**
 * getAvailablePromotions
 *
 * Returns list of available promotions.
 */
export const getAvailablePromotions = (): Promotion[] => {
  return Object.values(MOCK_PROMOTIONS).filter((p) => p.isActive);
};

export default {
  PromoCodeInput,
  AvailablePromotions,
  PromotionBanner,
  validatePromoCode,
  getAvailablePromotions,
};
