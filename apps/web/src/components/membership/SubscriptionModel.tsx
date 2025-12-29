/**
 * SubscriptionModel.tsx
 * 
 * DTC Feature 5.2: Subscription Model (Harry's Model)
 * Subscribe & save with flexible scheduling, management portal, and starter kits
 * 
 * Components:
 * 1. SubscribeAndSave - Product page subscription option
 * 2. FrequencySelector - Delivery frequency picker
 * 3. SubscriptionBadge - Cart/checkout subscription indicator
 * 4. SubscriptionManagement - Account portal for managing subscriptions
 * 5. UpcomingDelivery - Next delivery preview card
 * 6. StarterKitCard - Trial set/bundle promotion
 * 7. SmartReorderReminder - Reorder nudge component
 */

import { useCallback, useState } from 'react';
import { z } from 'zod';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SubscriptionFrequency {
  weeks: number;
  label: string;
  discount?: number;
}

export interface SubscriptionProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  frequency: SubscriptionFrequency;
}

export interface Subscription {
  id: string;
  status: 'active' | 'paused' | 'cancelled';
  products: SubscriptionProduct[];
  nextDeliveryDate: Date;
  frequency: SubscriptionFrequency;
  paymentMethod: {
    type: 'card';
    last4: string;
    brand: string;
  };
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date;
}

export interface StarterKit {
  id: string;
  name: string;
  description: string;
  image: string;
  regularPrice: number;
  kitPrice: number;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  convertToSubscription: boolean;
  subscriptionDiscount?: number;
}

export interface UpcomingDeliveryData {
  subscription: Subscription;
  canSkip: boolean;
  canAddItems: boolean;
  skipDeadline?: Date;
}

// ============================================================================
// Validation Schemas
// ============================================================================

// Schema for subscription form data (available for form implementations)
export const addToSubscriptionSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  frequencyWeeks: z.number().min(1).max(12),
});

export type AddToSubscriptionFormData = z.infer<typeof addToSubscriptionSchema>;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FREQUENCIES: SubscriptionFrequency[] = [
  { weeks: 2, label: 'Every 2 weeks', discount: 15 },
  { weeks: 4, label: 'Every 4 weeks', discount: 10 },
  { weeks: 6, label: 'Every 6 weeks', discount: 10 },
  { weeks: 8, label: 'Every 8 weeks', discount: 10 },
];

// ============================================================================
// Components
// ============================================================================

/**
 * SubscribeAndSave - Product page subscription option toggle
 */
export function SubscribeAndSave({
  productPrice,
  frequencies = DEFAULT_FREQUENCIES,
  selectedFrequency,
  onFrequencyChange,
  isSubscription = false,
  onToggleSubscription,
  className = '',
}: {
  productPrice: number;
  frequencies?: SubscriptionFrequency[];
  selectedFrequency?: SubscriptionFrequency;
  onFrequencyChange?: (frequency: SubscriptionFrequency) => void;
  isSubscription?: boolean;
  onToggleSubscription?: (isSubscription: boolean) => void;
  className?: string;
}) {
  const [internalFrequency, setInternalFrequency] = useState(
    selectedFrequency || frequencies[1]
  );

  const currentFrequency = selectedFrequency || internalFrequency;
  const discountAmount = currentFrequency.discount || 0;
  const subscriptionPrice = productPrice * (1 - discountAmount / 100);

  const handleFrequencyChange = (freq: SubscriptionFrequency) => {
    setInternalFrequency(freq);
    onFrequencyChange?.(freq);
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {/* One-time purchase option */}
      <label
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
          !isSubscription
            ? 'bg-gray-50 dark:bg-gray-800'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="purchase-type"
            checked={!isSubscription}
            onChange={() => onToggleSubscription?.(false)}
            className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              One-time purchase
            </span>
          </div>
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          ${productPrice.toFixed(2)}
        </span>
      </label>

      {/* Subscribe & Save option */}
      <div
        className={`border-t border-gray-200 dark:border-gray-700 ${
          isSubscription ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
        }`}
      >
        <label className="flex items-center justify-between p-4 cursor-pointer">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="purchase-type"
              checked={isSubscription}
              onChange={() => onToggleSubscription?.(true)}
              className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  Subscribe & Save
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                  Save {discountAmount}%
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Free shipping • Skip or cancel anytime
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900 dark:text-white">
              ${subscriptionPrice.toFixed(2)}
            </span>
            <p className="text-sm text-gray-500 line-through">
              ${productPrice.toFixed(2)}
            </p>
          </div>
        </label>

        {/* Frequency selector (shown when subscription is selected) */}
        {isSubscription && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery frequency
            </label>
            <FrequencySelector
              frequencies={frequencies}
              selected={currentFrequency}
              onChange={handleFrequencyChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * FrequencySelector - Delivery frequency picker
 */
export function FrequencySelector({
  frequencies = DEFAULT_FREQUENCIES,
  selected,
  onChange,
  layout = 'dropdown',
  className = '',
}: {
  frequencies?: SubscriptionFrequency[];
  selected?: SubscriptionFrequency;
  onChange?: (frequency: SubscriptionFrequency) => void;
  layout?: 'dropdown' | 'buttons' | 'radio';
  className?: string;
}) {
  const [internalSelected, setInternalSelected] = useState(selected || frequencies[1]);
  const currentSelected = selected || internalSelected;

  const handleChange = (freq: SubscriptionFrequency) => {
    setInternalSelected(freq);
    onChange?.(freq);
  };

  if (layout === 'dropdown') {
    return (
      <select
        value={currentSelected.weeks}
        onChange={(e) => {
          const freq = frequencies.find((f) => f.weeks === Number(e.target.value));
          if (freq) handleChange(freq);
        }}
        className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
      >
        {frequencies.map((freq) => (
          <option key={freq.weeks} value={freq.weeks}>
            {freq.label}
            {freq.discount && ` (Save ${freq.discount}%)`}
          </option>
        ))}
      </select>
    );
  }

  if (layout === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {frequencies.map((freq) => (
          <button
            key={freq.weeks}
            onClick={() => handleChange(freq)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentSelected.weeks === freq.weeks
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {freq.weeks} weeks
          </button>
        ))}
      </div>
    );
  }

  // Radio layout
  return (
    <div className={`space-y-2 ${className}`}>
      {frequencies.map((freq) => (
        <label
          key={freq.weeks}
          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
            currentSelected.weeks === freq.weeks
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="frequency"
              checked={currentSelected.weeks === freq.weeks}
              onChange={() => handleChange(freq)}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {freq.label}
            </span>
          </div>
          {freq.discount && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Save {freq.discount}%
            </span>
          )}
        </label>
      ))}
    </div>
  );
}

/**
 * SubscriptionBadge - Cart/checkout subscription indicator
 */
export function SubscriptionBadge({
  frequency,
  showIcon = true,
  size = 'default',
  className = '',
}: {
  frequency: SubscriptionFrequency;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}) {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      )}
      <span>{frequency.label}</span>
      {frequency.discount && (
        <span className="text-green-600 dark:text-green-400">
          -{frequency.discount}%
        </span>
      )}
    </span>
  );
}

/**
 * SubscriptionManagement - Account portal for managing subscriptions
 */
export function SubscriptionManagement({
  subscriptions,
  onPause,
  onResume,
  onCancel,
  onSkipDelivery,
  onChangeFrequency,
  onUpdatePayment,
  onUpdateAddress,
  className = '',
}: {
  subscriptions: Subscription[];
  onPause?: (subscriptionId: string) => void;
  onResume?: (subscriptionId: string) => void;
  onCancel?: (subscriptionId: string) => void;
  onSkipDelivery?: (subscriptionId: string) => void;
  onChangeFrequency?: (subscriptionId: string, frequency: SubscriptionFrequency) => void;
  onUpdatePayment?: (subscriptionId: string) => void;
  onUpdateAddress?: (subscriptionId: string) => void;
  className?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  if (subscriptions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Active Subscriptions
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Subscribe to your favorite products and save on every delivery.
        </p>
        <a
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Subscriptions
      </h2>

      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-500'
                    : subscription.status === 'paused'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Subscription #{subscription.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subscription.frequency.label} • Started{' '}
                  {subscription.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : subscription.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {subscription.status}
              </span>

              <button
                onClick={() =>
                  setExpandedId(expandedId === subscription.id ? null : subscription.id)
                }
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    expandedId === subscription.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Products preview */}
          <div className="p-4 flex items-center gap-4 overflow-x-auto">
            {subscription.products.map((product) => (
              <div key={product.id} className="flex-shrink-0 flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qty: {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Next delivery */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Next delivery:{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscription.nextDeliveryDate.toLocaleDateString()}
                </span>
              </span>
            </div>

            <span className="font-semibold text-gray-900 dark:text-white">
              ${subscription.total.toFixed(2)}
            </span>
          </div>

          {/* Expanded details */}
          {expandedId === subscription.id && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {/* Actions */}
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {subscription.status === 'active' && (
                  <>
                    <button
                      onClick={() => onSkipDelivery?.(subscription.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Skip Next
                    </button>
                    <button
                      onClick={() => onPause?.(subscription.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Pause
                    </button>
                  </>
                )}
                {subscription.status === 'paused' && (
                  <button
                    onClick={() => onResume?.(subscription.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={() => onUpdatePayment?.(subscription.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Update Payment
                </button>
                <button
                  onClick={() => onUpdateAddress?.(subscription.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Update Address
                </button>
              </div>

              {/* Details grid */}
              <div className="p-4 grid md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700">
                {/* Payment method */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Payment Method
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {subscription.paymentMethod.brand} ending in{' '}
                    {subscription.paymentMethod.last4}
                  </p>
                </div>

                {/* Shipping address */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {subscription.shippingAddress.name}
                    <br />
                    {subscription.shippingAddress.line1}
                    {subscription.shippingAddress.line2 && (
                      <>
                        <br />
                        {subscription.shippingAddress.line2}
                      </>
                    )}
                    <br />
                    {subscription.shippingAddress.city}, {subscription.shippingAddress.state}{' '}
                    {subscription.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Frequency change */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Change Delivery Frequency
                </h4>
                <FrequencySelector
                  selected={subscription.frequency}
                  onChange={(freq) => onChangeFrequency?.(subscription.id, freq)}
                  layout="buttons"
                />
              </div>

              {/* Cancel subscription */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {showCancelConfirm === subscription.id ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 mb-3">
                      Are you sure you want to cancel this subscription? This action cannot be
                      undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          onCancel?.(subscription.id);
                          setShowCancelConfirm(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                      >
                        Yes, Cancel
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(subscription.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * UpcomingDelivery - Next delivery preview card
 */
export function UpcomingDelivery({
  data,
  onSkip,
  onAddItems,
  onReschedule,
  className = '',
}: {
  data: UpcomingDeliveryData;
  onSkip?: () => void;
  onAddItems?: () => void;
  onReschedule?: () => void;
  className?: string;
}) {
  const { subscription, canSkip, canAddItems, skipDeadline } = data;
  const daysUntilDelivery = Math.ceil(
    (subscription.nextDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const canStillSkip = skipDeadline ? new Date() < skipDeadline : true;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Next delivery in</p>
            <p className="text-2xl font-bold">
              {daysUntilDelivery} day{daysUntilDelivery !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">
              {subscription.nextDeliveryDate.toLocaleDateString()}
            </p>
            <p className="font-semibold">${subscription.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          What's arriving
        </h4>
        <div className="space-y-3">
          {subscription.products.map((product) => (
            <div key={product.id} className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {product.quantity} • ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex flex-wrap gap-2">
        {canAddItems && (
          <button
            onClick={onAddItems}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700"
          >
            Add One-Time Items
          </button>
        )}
        {canSkip && canStillSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Skip
          </button>
        )}
        <button
          onClick={onReschedule}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          Reschedule
        </button>
      </div>

      {skipDeadline && canSkip && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Skip by {skipDeadline.toLocaleDateString()} to avoid being charged
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * StarterKitCard - Trial set/bundle promotion
 */
export function StarterKitCard({
  kit,
  onAddToCart,
  onLearnMore,
  className = '',
}: {
  kit: StarterKit;
  onAddToCart?: () => void;
  onLearnMore?: () => void;
  className?: string;
}) {
  const savings = kit.regularPrice - kit.kitPrice;
  const savingsPercentage = Math.round((savings / kit.regularPrice) * 100);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="relative">
        <img
          src={kit.image}
          alt={kit.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-rose-500 text-white text-sm font-semibold rounded-full">
            Save {savingsPercentage}%
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {kit.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {kit.description}
        </p>

        {/* What's included */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            Includes
          </p>
          <ul className="space-y-1">
            {kit.products.map((product) => (
              <li
                key={product.id}
                className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
              >
                <span className="text-green-500">✓</span>
                {product.quantity > 1 ? `${product.quantity}x ` : ''}
                {product.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${kit.kitPrice.toFixed(2)}
          </span>
          <span className="text-gray-500 line-through">
            ${kit.regularPrice.toFixed(2)}
          </span>
        </div>

        {kit.convertToSubscription && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              🔄 Converts to subscription after first order.{' '}
              {kit.subscriptionDiscount && `Save ${kit.subscriptionDiscount}% on refills.`}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onAddToCart}
            className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={onLearnMore}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SmartReorderReminder - Reorder nudge component
 */
export function SmartReorderReminder({
  productName,
  productImage,
  lastOrderDate,
  estimatedRunoutDate,
  onReorder,
  onSubscribe,
  onDismiss,
  className = '',
}: {
  productName: string;
  productImage?: string;
  lastOrderDate: Date;
  estimatedRunoutDate: Date;
  onReorder?: () => void;
  onSubscribe?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  const daysUntilRunout = Math.ceil(
    (estimatedRunoutDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const isUrgent = daysUntilRunout <= 7;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border ${
        isUrgent
          ? 'border-orange-300 dark:border-orange-700'
          : 'border-gray-200 dark:border-gray-700'
      } overflow-hidden ${className}`}
    >
      <div className="p-4 flex items-start gap-4">
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isUrgent ? '⚠️ Running low!' : '📦 Time to reorder?'}
              </p>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {productName}
              </h4>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last ordered {lastOrderDate.toLocaleDateString()}
            {daysUntilRunout > 0 && (
              <>
                {' '}
                • Est. {daysUntilRunout} day{daysUntilRunout !== 1 ? 's' : ''} left
              </>
            )}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onReorder}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              Reorder Now
            </button>
            {onSubscribe && (
              <button
                onClick={onSubscribe}
                className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                Subscribe & Never Run Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing subscription state
 */
export function useSubscriptionToggle(initialPrice: number) {
  const [isSubscription, setIsSubscription] = useState(false);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(DEFAULT_FREQUENCIES[1]);

  const subscriptionPrice = initialPrice * (1 - (frequency.discount || 0) / 100);
  const currentPrice = isSubscription ? subscriptionPrice : initialPrice;
  const savings = initialPrice - subscriptionPrice;

  const toggleSubscription = useCallback((value: boolean) => {
    setIsSubscription(value);
  }, []);

  const changeFrequency = useCallback((freq: SubscriptionFrequency) => {
    setFrequency(freq);
  }, []);

  return {
    isSubscription,
    frequency,
    currentPrice,
    savings,
    savingsPercentage: frequency.discount || 0,
    toggleSubscription,
    changeFrequency,
  };
}

export default {
  SubscribeAndSave,
  FrequencySelector,
  SubscriptionBadge,
  SubscriptionManagement,
  UpcomingDelivery,
  StarterKitCard,
  SmartReorderReminder,
  useSubscriptionToggle,
};
