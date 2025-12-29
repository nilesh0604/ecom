import type { PaymentIntent, PaymentStatus } from '@/types';
import { paymentClient } from '@/utils';

/**
 * Payment Service - Handles payment processing operations
 * 
 * Manages payment intents and payment flow for checkout.
 * Uses a separate payment API client for security isolation.
 * 
 * Payment Flow:
 * 1. Create payment intent with amount and currency
 * 2. Collect payment details from user (card, etc.)
 * 3. Confirm the payment intent
 * 4. Check status for confirmation
 * 
 * @module services/paymentService
 * 
 * @example
 * ```tsx
 * // In checkout component
 * const intent = await paymentService.createIntent(9999, 'usd');
 * // After collecting card details...
 * await paymentService.confirmIntent(intent.id, { paymentMethodId });
 * ```
 */
export const paymentService = {
  /**
   * Create a payment intent
   * 
   * Initializes a payment session with the payment provider.
   * Returns a client secret for client-side payment confirmation.
   * 
   * @param {number} amount - Amount in smallest currency unit (cents for USD)
   * @param {string} [currency='usd'] - Three-letter ISO currency code
   * @param {Record<string, unknown>} [metadata] - Additional data to attach to payment
   * @returns {Promise<PaymentIntent>} Created payment intent with client secret
   * 
   * @example
   * ```tsx
   * // Charge $99.99 USD
   * const intent = await paymentService.createIntent(9999, 'usd', {
   *   orderId: 'ORD-123',
   *   customerId: 'user-456'
   * });
   * ```
   */
  createIntent: (
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, unknown>
  ) =>
    paymentClient.post<PaymentIntent>('/payments/create-intent', {
      amount,
      currency,
      metadata,
    }),

  /**
   * Get payment by order ID
   * 
   * Retrieves payment details for a specific order.
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<PaymentIntent>} Payment details for the order
   * 
   * @example
   * ```tsx
   * const payment = await paymentService.getByOrderId('ORD-123');
   * console.log(`Payment status: ${payment.status}`);
   * ```
   */
  getByOrderId: (orderId: string) =>
    paymentClient.get<PaymentIntent>(`/payments/order/${orderId}`),

  /**
   * Refund a payment (admin only)
   * 
   * Initiates a refund for a completed payment.
   * 
   * @param {string} paymentId - Payment ID to refund
   * @param {number} [amount] - Partial refund amount (full refund if not specified)
   * @param {string} [reason] - Reason for refund
   * @returns {Promise<PaymentIntent>} Updated payment with refund status
   * 
   * @example
   * ```tsx
   * // Full refund
   * await paymentService.refund('pay_123');
   * 
   * // Partial refund of $50
   * await paymentService.refund('pay_123', 5000, 'Customer request');
   * ```
   */
  refund: (paymentId: string, amount?: number, reason?: string) =>
    paymentClient.post<PaymentIntent>(`/payments/${paymentId}/refund`, {
      amount,
      reason,
    }),

  /**
   * Get payment status (legacy - for backward compatibility)
   * 
   * Check the current status of a payment intent.
   * Useful for polling or webhook handling.
   * 
   * @param {string} intentId - Payment intent ID
   * @returns {Promise<{status: PaymentStatus}>} Current payment status
   * 
   * @example
   * ```tsx
   * const { status } = await paymentService.getStatus(intentId);
   * // status: 'pending' | 'processing' | 'succeeded' | 'failed'
   * ```
   */
  getStatus: (intentId: string) =>
    paymentClient.get<{ status: PaymentStatus }>(`/payments/intents/${intentId}/status`),
};
