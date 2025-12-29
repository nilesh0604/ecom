import { Badge, Button } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Exchanges - Size/variant exchanges, exchange tracking, instant exchange
 *
 * Features:
 * - Size/variant exchange selection
 * - Exchange reason input
 * - Exchange status tracking
 * - Instant exchange policy option
 */

// ============================================================================
// Types & Schemas
// ============================================================================

export type ExchangeStatus =
  | 'requested'
  | 'approved'
  | 'shipped'
  | 'received'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  sku?: string;
}

export interface ExchangeOption {
  id: string;
  name: string;
  variant: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  sku: string;
  available: boolean;
  priceDifference?: number;
}

export interface ExchangeRequest {
  id: string;
  orderId: string;
  originalItem: OrderItem;
  newItem: OrderItem;
  reason: string;
  status: ExchangeStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  returnTrackingNumber?: string;
  newShipmentTrackingNumber?: string;
  instantExchange?: boolean;
  priceDifference?: number;
}

const exchangeFormSchema = z.object({
  newVariantId: z.string().min(1, 'Please select a new variant'),
  reason: z.enum(['too_small', 'too_large', 'wrong_color', 'changed_mind', 'defective', 'other']),
  otherReason: z.string().optional(),
  instantExchange: z.boolean(),
});

type ExchangeFormData = z.infer<typeof exchangeFormSchema>;

// ============================================================================
// Exchange Request Form
// ============================================================================

export interface ExchangeRequestFormProps {
  orderItem: OrderItem;
  exchangeOptions: ExchangeOption[];
  onSubmit: (data: ExchangeFormData) => Promise<void>;
  instantExchangeEnabled?: boolean;
  className?: string;
}

export const ExchangeRequestForm = ({
  orderItem,
  exchangeOptions,
  onSubmit,
  instantExchangeEnabled = true,
  className = '',
}: ExchangeRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ExchangeOption | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ExchangeFormData>({
    resolver: zodResolver(exchangeFormSchema),
    defaultValues: {
      instantExchange: false,
    },
  });

  const reason = watch('reason');

  const handleFormSubmit = async (data: ExchangeFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonLabels: Record<string, string> = {
    too_small: 'Too small',
    too_large: 'Too large',
    wrong_color: 'Wrong color',
    changed_mind: 'Changed my mind',
    defective: 'Defective/damaged',
    other: 'Other reason',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      {/* Original Item Display */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Exchanging
        </h4>
        <div className="flex gap-4">
          <img
            src={orderItem.image}
            alt={orderItem.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{orderItem.name}</p>
            {orderItem.variant && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Object.entries(orderItem.variant)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' • ')}
              </p>
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              ${orderItem.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Exchange Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reason for exchange
        </label>
        <select
          {...register('reason')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        >
          <option value="">Select a reason</option>
          {Object.entries(reasonLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
        )}
      </div>

      {/* Other reason input */}
      {reason === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please describe
          </label>
          <textarea
            {...register('otherReason')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            placeholder="Tell us more about why you're exchanging..."
          />
        </div>
      )}

      {/* New Variant Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select new variant
        </label>
        <Controller
          name="newVariantId"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exchangeOptions.map((option) => (
                <label
                  key={option.id}
                  className={`
                    relative flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
                    ${
                      !option.available
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        : field.value === option.id
                          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800/50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    {...field}
                    value={option.id}
                    disabled={!option.available}
                    onChange={() => {
                      field.onChange(option.id);
                      setSelectedOption(option);
                    }}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{option.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.entries(option.variant)
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' • ')}
                    </p>
                    {!option.available && (
                      <Badge variant="error" className="mt-1">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  {option.priceDifference !== undefined && option.priceDifference !== 0 && (
                    <span
                      className={`text-sm font-medium ${
                        option.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {option.priceDifference > 0 ? '+' : ''}${option.priceDifference.toFixed(2)}
                    </span>
                  )}

                  {field.value === option.id && (
                    <svg
                      className="w-5 h-5 text-black dark:text-white absolute top-3 right-3"
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
                  )}
                </label>
              ))}
            </div>
          )}
        />
        {errors.newVariantId && (
          <p className="mt-1 text-sm text-red-500">{errors.newVariantId.message}</p>
        )}
      </div>

      {/* Instant Exchange Option */}
      {instantExchangeEnabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('instantExchange')}
              className="mt-1 w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Instant Exchange
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Get your new item shipped immediately. We'll charge you for the new item now and
                refund the original once we receive your return.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Price Difference Notice */}
      {selectedOption?.priceDifference !== undefined && selectedOption.priceDifference !== 0 && (
        <div
          className={`p-4 rounded-lg ${
            selectedOption.priceDifference > 0
              ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}
        >
          <p
            className={`text-sm ${
              selectedOption.priceDifference > 0
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-green-800 dark:text-green-200'
            }`}
          >
            {selectedOption.priceDifference > 0 ? (
              <>
                You'll pay an additional{' '}
                <span className="font-bold">${selectedOption.priceDifference.toFixed(2)}</span>{' '}
                for this exchange.
              </>
            ) : (
              <>
                You'll receive a refund of{' '}
                <span className="font-bold">
                  ${Math.abs(selectedOption.priceDifference).toFixed(2)}
                </span>{' '}
                for this exchange.
              </>
            )}
          </p>
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        Request Exchange
      </Button>
    </form>
  );
};

// ============================================================================
// Exchange Status Tracker
// ============================================================================

export interface ExchangeStatusTrackerProps {
  exchange: ExchangeRequest;
  className?: string;
}

export const ExchangeStatusTracker = ({
  exchange,
  className = '',
}: ExchangeStatusTrackerProps) => {
  const steps: { status: ExchangeStatus; label: string }[] = [
    { status: 'requested', label: 'Requested' },
    { status: 'approved', label: 'Approved' },
    { status: 'shipped', label: 'Return Shipped' },
    { status: 'received', label: 'Return Received' },
    { status: 'processing', label: 'Processing' },
    { status: 'completed', label: 'Completed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === exchange.status);
  const isCancelled = exchange.status === 'cancelled';

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Exchange Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Exchange #{exchange.id}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Requested {formatDate(exchange.createdAt)}
          </p>
        </div>
        {isCancelled ? (
          <Badge variant="error">Cancelled</Badge>
        ) : exchange.instantExchange ? (
          <Badge variant="info">Instant Exchange</Badge>
        ) : null}
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Original Item
          </p>
          <div className="flex gap-3">
            <img
              src={exchange.originalItem.image}
              alt={exchange.originalItem.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {exchange.originalItem.name}
              </p>
              {exchange.originalItem.variant && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Object.entries(exchange.originalItem.variant)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' • ')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">New Item</p>
          <div className="flex gap-3">
            <img
              src={exchange.newItem.image}
              alt={exchange.newItem.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {exchange.newItem.name}
              </p>
              {exchange.newItem.variant && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Object.entries(exchange.newItem.variant)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' • ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {!isCancelled && (
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                      ${
                        isCompleted
                          ? 'bg-black dark:bg-white border-black dark:border-white'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white dark:text-black"
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
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs text-center ${
                      isCurrent
                        ? 'font-medium text-black dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking Numbers */}
      {(exchange.returnTrackingNumber || exchange.newShipmentTrackingNumber) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {exchange.returnTrackingNumber && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Return Tracking
              </p>
              <a
                href={`https://track.example.com/${exchange.returnTrackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
              >
                {exchange.returnTrackingNumber}
              </a>
            </div>
          )}
          {exchange.newShipmentTrackingNumber && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                New Item Tracking
              </p>
              <a
                href={`https://track.example.com/${exchange.newShipmentTrackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
              >
                {exchange.newShipmentTrackingNumber}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Exchange History List
// ============================================================================

export interface ExchangeHistoryProps {
  exchanges: ExchangeRequest[];
  onViewDetails?: (exchangeId: string) => void;
  className?: string;
}

export const ExchangeHistory = ({
  exchanges,
  onViewDetails,
  className = '',
}: ExchangeHistoryProps) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: ExchangeStatus) => {
    const variants: Record<ExchangeStatus, 'warning' | 'info' | 'success' | 'error' | 'default'> =
      {
        requested: 'warning',
        approved: 'info',
        shipped: 'info',
        received: 'info',
        processing: 'warning',
        completed: 'success',
        cancelled: 'error',
      };
    return variants[status];
  };

  if (exchanges.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="w-12 h-12 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <p className="mt-4 text-gray-500 dark:text-gray-400">No exchanges found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {exchanges.map((exchange) => (
        <div
          key={exchange.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Exchange #{exchange.id}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{exchange.orderId} • {formatDate(exchange.createdAt)}
              </p>
            </div>
            <Badge variant={getStatusBadge(exchange.status)}>
              {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Original */}
            <div className="flex items-center gap-2 flex-1">
              <img
                src={exchange.originalItem.image}
                alt={exchange.originalItem.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {exchange.originalItem.name}
                </p>
                {exchange.originalItem.variant?.size && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Size: {exchange.originalItem.variant.size}
                  </p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>

            {/* New */}
            <div className="flex items-center gap-2 flex-1">
              <img
                src={exchange.newItem.image}
                alt={exchange.newItem.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {exchange.newItem.name}
                </p>
                {exchange.newItem.variant?.size && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Size: {exchange.newItem.variant.size}
                  </p>
                )}
              </div>
            </div>
          </div>

          {onViewDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(exchange.id)}
              >
                View Details →
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Exchange Eligibility Check
// ============================================================================

export interface ExchangeEligibilityProps {
  isEligible: boolean;
  daysRemaining?: number;
  reason?: string;
  policyUrl?: string;
  className?: string;
}

export const ExchangeEligibility = ({
  isEligible,
  daysRemaining,
  reason,
  policyUrl,
  className = '',
}: ExchangeEligibilityProps) => {
  if (isEligible) {
    return (
      <div
        className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
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
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Eligible for Exchange
            </p>
            {daysRemaining !== undefined && (
              <p className="text-sm text-green-700 dark:text-green-300">
                {daysRemaining} days remaining in exchange window
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
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
        <div>
          <p className="font-medium text-red-800 dark:text-red-200">Not Eligible for Exchange</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {reason || 'This item is no longer eligible for exchange.'}
          </p>
          {policyUrl && (
            <a
              href={policyUrl}
              className="inline-block mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              View exchange policy →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
