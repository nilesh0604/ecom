import { Button } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import {
    selectCartItems,
    selectCartSavings,
    selectCartSubtotal,
    selectCartTotal,
} from '@/store/selectors/cartSelectors';
import { formatCurrency } from '@/utils';
import type { GiftOptionsFormData, PaymentFormData, ShippingFormData } from './checkoutSchemas';
import { GIFT_WRAPPING_OPTIONS } from './checkoutSchemas';

interface OrderSummaryProps {
  shippingData: ShippingFormData;
  paymentData: PaymentFormData;
  giftData?: GiftOptionsFormData;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * OrderSummary Component
 *
 * Step 3 of checkout - review order before placing.
 *
 * Features:
 * - Read-only display of cart items
 * - Shipping address summary
 * - Payment method summary (masked card number)
 * - Cost breakdown (subtotal, shipping, tax, total)
 * - Final "Place Order" button
 */
const OrderSummary = ({
  shippingData,
  paymentData,
  giftData,
  onConfirm,
  isSubmitting = false,
}: OrderSummaryProps) => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);
  const savings = useAppSelector(selectCartSavings);

  // Mock shipping cost (free over $50)
  const shippingCost = subtotal >= 50 ? 0 : 9.99;

  // Gift wrapping cost
  const giftWrappingOption = GIFT_WRAPPING_OPTIONS.find(
    (opt) => opt.id === giftData?.giftWrapping
  );
  const giftWrappingCost = giftWrappingOption?.price || 0;

  // Mock tax rate (8%)
  const taxRate = 0.08;
  const tax = total * taxRate;

  // Final total (including gift wrapping)
  const orderTotal = total + shippingCost + tax + giftWrappingCost;

  // Mask card number (show last 4 digits)
  const maskedCard = `•••• •••• •••• ${paymentData.cardNumber.slice(-4)}`;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Review Your Order
      </h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Order Items */}
        <div>
          <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
            Order Items ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div>
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
              Shipping Address
            </h3>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <p className="font-medium">
                {shippingData.firstName} {shippingData.lastName}
              </p>
              <p>{shippingData.address}</p>
              <p>
                {shippingData.city}, {shippingData.state} {shippingData.zipCode}
              </p>
              <p>{shippingData.country}</p>
              <p className="mt-2">{shippingData.email}</p>
              <p>{shippingData.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
              Payment Method
            </h3>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <svg
                className="h-8 w-10 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2" />
                <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {maskedCard}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Expires {paymentData.expiryDate}
                </p>
              </div>
            </div>
          </div>

          {/* Gift Options (only show if isGift is true) */}
          {giftData?.isGift && (
            <div>
              <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
                Gift Options
              </h3>
              <div className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
                <div className="space-y-2">
                  {giftWrappingOption && giftWrappingOption.id !== 'none' && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{giftWrappingOption.name}</span>
                    </div>
                  )}
                  {giftData.giftReceipt && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Gift receipt included (prices hidden)</span>
                    </div>
                  )}
                  {giftData.giftMessage && (
                    <div className="mt-3 rounded-md bg-white p-3 dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Gift Message:</p>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{giftData.giftMessage}"</p>
                    </div>
                  )}
                  {giftData.recipientEmail && (
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {giftData.recipientName ? `${giftData.recipientName} (${giftData.recipientEmail})` : giftData.recipientEmail} will be notified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div>
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
              Order Total
            </h3>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                {giftWrappingCost > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Gift Wrapping</span>
                    <span>{formatCurrency(giftWrappingCost)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          size="lg"
          onClick={onConfirm}
          isLoading={isSubmitting}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;
