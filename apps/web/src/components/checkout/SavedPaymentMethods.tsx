import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

interface SavedPaymentMethodsProps {
  methods: SavedPaymentMethod[];
  selectedId: string | null;
  onSelect: (method: SavedPaymentMethod) => void;
  onAddNew: () => void;
  onDelete?: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
}

// ============================================================================
// MOCK DATA (for demo)
// ============================================================================

export const MOCK_SAVED_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'card',
    last4: '8210',
    brand: 'mastercard',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
  {
    id: 'pm_3',
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
  },
];

// ============================================================================
// SAVED PAYMENT METHODS COMPONENT
// ============================================================================

/**
 * SavedPaymentMethods Component
 *
 * Displays and manages saved payment methods for returning customers.
 *
 * Features:
 * - List saved cards and payment methods
 * - Select payment method for quick checkout
 * - Set default payment method
 * - Delete saved methods
 * - Add new payment method option
 */
const SavedPaymentMethods = ({
  methods,
  selectedId,
  onSelect,
  onAddNew,
  onDelete,
  onSetDefault,
}: SavedPaymentMethodsProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (methodId: string) => {
    setDeletingId(methodId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onDelete?.(methodId);
    setDeletingId(null);
  };

  const getCardIcon = (brand?: string) => {
    switch (brand) {
      case 'visa':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71" />
            <text
              x="24"
              y="20"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              VISA
            </text>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32">
            <rect width="48" height="32" rx="4" fill="#2D2D2D" />
            <circle cx="18" cy="16" r="10" fill="#EB001B" />
            <circle cx="30" cy="16" r="10" fill="#F79E1B" />
            <path
              d="M24 8.5a10 10 0 000 15 10 10 0 000-15z"
              fill="#FF5F00"
            />
          </svg>
        );
      case 'amex':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32">
            <rect width="48" height="32" rx="4" fill="#006FCF" />
            <text
              x="24"
              y="20"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              AMEX
            </text>
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect
              width="46"
              height="30"
              x="1"
              y="1"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-300 dark:text-gray-600"
            />
            <rect
              x="1"
              y="8"
              width="46"
              height="6"
              fill="currentColor"
              className="text-gray-200 dark:text-gray-700"
            />
          </svg>
        );
    }
  };

  const getPaymentIcon = (method: SavedPaymentMethod) => {
    if (method.type === 'card') {
      return getCardIcon(method.brand);
    }

    if (method.type === 'paypal') {
      return (
        <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#FFC439" />
          <text
            x="24"
            y="18"
            textAnchor="middle"
            fill="#003087"
            fontSize="8"
            fontWeight="bold"
          >
            PayPal
          </text>
        </svg>
      );
    }

    if (method.type === 'apple_pay') {
      return (
        <svg className="h-8 w-12" viewBox="0 0 48 32">
          <rect width="48" height="32" rx="4" fill="black" />
          <text
            x="24"
            y="18"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
          >
             Pay
          </text>
        </svg>
      );
    }

    if (method.type === 'google_pay') {
      return (
        <svg className="h-8 w-12" viewBox="0 0 48 32">
          <rect width="48" height="32" rx="4" fill="white" stroke="#e0e0e0" />
          <text
            x="24"
            y="18"
            textAnchor="middle"
            fill="#5f6368"
            fontSize="8"
            fontWeight="500"
          >
            G Pay
          </text>
        </svg>
      );
    }

    return null;
  };

  const getMethodDescription = (method: SavedPaymentMethod) => {
    if (method.type === 'card') {
      return `•••• ${method.last4}`;
    }
    if (method.type === 'paypal') {
      return method.email || 'PayPal';
    }
    if (method.type === 'apple_pay') {
      return 'Apple Pay';
    }
    if (method.type === 'google_pay') {
      return 'Google Pay';
    }
    return '';
  };

  const getExpiryText = (method: SavedPaymentMethod) => {
    if (method.type === 'card' && method.expiryMonth && method.expiryYear) {
      const month = method.expiryMonth.toString().padStart(2, '0');
      const year = method.expiryYear.toString().slice(-2);
      return `Expires ${month}/${year}`;
    }
    return '';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Saved Payment Methods
      </h3>

      <div className="space-y-2">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`
              relative flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all
              ${
                selectedId === method.id
                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}
            onClick={() => onSelect(method)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(method);
              }
            }}
          >
            {/* Radio indicator */}
            <div
              className={`
                flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                ${
                  selectedId === method.id
                    ? 'border-indigo-600 dark:border-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              {selectedId === method.id && (
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
              )}
            </div>

            {/* Payment icon */}
            <div className="shrink-0">{getPaymentIcon(method)}</div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {getMethodDescription(method)}
                </span>
                {method.isDefault && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    Default
                  </span>
                )}
              </div>
              {getExpiryText(method) && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getExpiryText(method)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {!method.isDefault && onSetDefault && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(method.id);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Set default
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(method.id);
                  }}
                  disabled={deletingId === method.id}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                  aria-label="Delete payment method"
                >
                  {deletingId === method.id ? (
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add new payment method */}
        <button
          type="button"
          onClick={onAddNew}
          className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="font-medium">Add new payment method</span>
        </button>
      </div>
    </div>
  );
};

export default SavedPaymentMethods;
