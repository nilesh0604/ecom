import { Badge } from '@/components/ui';

/**
 * InventoryStatus - Displays comprehensive product availability states
 *
 * Features:
 * - In Stock / Low Stock / Out of Stock / Preorder / Backorder states
 * - Estimated ship date for preorder/backorder
 * - Split shipment policy notices
 * - Visual indicators and badges
 */

export type AvailabilityState =
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'preorder'
  | 'backorder'
  | 'discontinued';

export interface InventoryStatusProps {
  state: AvailabilityState;
  quantity?: number;
  lowStockThreshold?: number;
  estimatedShipDate?: Date | string;
  preorderReleaseDate?: Date | string;
  backorderLeadDays?: number;
  showQuantity?: boolean;
  className?: string;
}

/**
 * Formats a date for display
 */
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Returns the estimated ship date based on lead days
 */
const getEstimatedDate = (leadDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + leadDays);
  return formatDate(date);
};

const InventoryStatus = ({
  state,
  quantity = 0,
  lowStockThreshold = 5,
  estimatedShipDate,
  preorderReleaseDate,
  backorderLeadDays = 14,
  showQuantity = true,
  className = '',
}: InventoryStatusProps) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'in-stock':
        return {
          badge: { text: 'In Stock', variant: 'success' as const },
          message: showQuantity && quantity > lowStockThreshold ? `${quantity} available` : null,
          icon: (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };

      case 'low-stock':
        return {
          badge: { text: `Only ${quantity} left`, variant: 'warning' as const },
          message: 'Order soon - selling fast!',
          icon: (
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
        };

      case 'out-of-stock':
        return {
          badge: { text: 'Out of Stock', variant: 'error' as const },
          message: 'Check back soon or sign up for notifications',
          icon: (
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
        };

      case 'preorder':
        return {
          badge: { text: 'Pre-Order', variant: 'info' as const },
          message: preorderReleaseDate
            ? `Ships on ${formatDate(preorderReleaseDate)}`
            : estimatedShipDate
              ? `Ships on ${formatDate(estimatedShipDate)}`
              : 'Coming soon',
          icon: (
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };

      case 'backorder':
        return {
          badge: { text: 'Backorder', variant: 'warning' as const },
          message: `Ships by ${
            estimatedShipDate ? formatDate(estimatedShipDate) : getEstimatedDate(backorderLeadDays)
          }`,
          icon: (
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ),
        };

      case 'discontinued':
        return {
          badge: { text: 'Discontinued', variant: 'default' as const },
          message: 'This product is no longer available',
          icon: (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          ),
        };

      default:
        return {
          badge: { text: 'Unknown', variant: 'default' as const },
          message: null,
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <Badge variant={config.badge.variant}>{config.badge.text}</Badge>
      </div>
      {config.message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{config.message}</p>
      )}
    </div>
  );
};

/**
 * PreorderBanner - Prominent banner for preorder products
 */
export interface PreorderBannerProps {
  releaseDate: Date | string;
  depositAmount?: number;
  fullPrice: number;
  features?: string[];
  className?: string;
}

export const PreorderBanner = ({
  releaseDate,
  depositAmount,
  fullPrice,
  features = [],
  className = '',
}: PreorderBannerProps) => {
  const hasDeposit = depositAmount !== undefined && depositAmount > 0;
  const remainingAmount = hasDeposit ? fullPrice - depositAmount : fullPrice;

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Pre-Order Now</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Available {formatDate(releaseDate)}
          </p>

          {hasDeposit && (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Deposit today:</span> ${depositAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Pay on release:</span> ${remainingAmount.toFixed(2)}
              </p>
            </div>
          )}

          {features.length > 0 && (
            <ul className="mt-3 space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * BackorderNotice - Inline notice for backorder items
 */
export interface BackorderNoticeProps {
  estimatedShipDate: Date | string;
  canSplitShipment?: boolean;
  onSplitShipmentChange?: (split: boolean) => void;
  className?: string;
}

export const BackorderNotice = ({
  estimatedShipDate,
  canSplitShipment = false,
  onSplitShipmentChange,
  className = '',
}: BackorderNoticeProps) => {
  return (
    <div
      className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div className="flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">Backordered:</span> This item is currently on backorder
            and will ship by {formatDate(estimatedShipDate)}.
          </p>

          {canSplitShipment && onSplitShipmentChange && (
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => onSplitShipmentChange(e.target.checked)}
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Ship available items now (may incur additional shipping)
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * CartItemAvailability - Compact availability indicator for cart items
 */
export interface CartItemAvailabilityProps {
  state: AvailabilityState;
  estimatedShipDate?: Date | string;
  className?: string;
}

export const CartItemAvailability = ({
  state,
  estimatedShipDate,
  className = '',
}: CartItemAvailabilityProps) => {
  const getConfig = () => {
    switch (state) {
      case 'in-stock':
        return {
          text: 'In Stock',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
      case 'low-stock':
        return {
          text: 'Low Stock',
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        };
      case 'preorder':
        return {
          text: estimatedShipDate ? `Ships ${formatDate(estimatedShipDate)}` : 'Pre-Order',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        };
      case 'backorder':
        return {
          text: estimatedShipDate ? `Ships ${formatDate(estimatedShipDate)}` : 'Backorder',
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        };
      case 'out-of-stock':
        return {
          text: 'Out of Stock',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
        };
      default:
        return {
          text: 'Unavailable',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${config.color} ${config.bgColor} ${className}`}
    >
      {config.text}
    </span>
  );
};

/**
 * SplitShipmentPolicy - Checkout notice for mixed availability orders
 */
export interface SplitShipmentPolicyProps {
  hasBackorderItems: boolean;
  hasPreorderItems: boolean;
  earliestShipDate?: Date | string;
  latestShipDate?: Date | string;
  splitShipmentEnabled: boolean;
  onSplitChange: (split: boolean) => void;
  additionalShippingCost?: number;
  className?: string;
}

export const SplitShipmentPolicy = ({
  hasBackorderItems,
  hasPreorderItems,
  earliestShipDate,
  latestShipDate,
  splitShipmentEnabled,
  onSplitChange,
  additionalShippingCost = 5.99,
  className = '',
}: SplitShipmentPolicyProps) => {
  const itemTypes = [hasBackorderItems && 'backordered', hasPreorderItems && 'pre-order']
    .filter(Boolean)
    .join(' and ');

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}
    >
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Options</h4>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Your order contains {itemTypes} items. Choose how you'd like to receive your order:
      </p>

      <div className="space-y-3">
        {/* Single shipment option */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
          <input
            type="radio"
            name="shipment-option"
            checked={!splitShipmentEnabled}
            onChange={() => onSplitChange(false)}
            className="mt-1 w-4 h-4 text-black border-gray-300 focus:ring-black"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Ship together (Free)</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Wait for all items - Ships by{' '}
              {latestShipDate ? formatDate(latestShipDate) : 'TBD'}
            </p>
          </div>
        </label>

        {/* Split shipment option */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
          <input
            type="radio"
            name="shipment-option"
            checked={splitShipmentEnabled}
            onChange={() => onSplitChange(true)}
            className="mt-1 w-4 h-4 text-black border-gray-300 focus:ring-black"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              Ship as items become available (+${additionalShippingCost.toFixed(2)})
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              First shipment by{' '}
              {earliestShipDate ? formatDate(earliestShipDate) : 'within 1-2 business days'}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default InventoryStatus;
