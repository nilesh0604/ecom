import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import config from '../config';
import { prisma } from '../config/database';
import { CreatePaymentIntentDto } from '../types';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// Initialize Stripe (only if key is provided)
const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: '2023-10-16' as any })
  : null;

export class PaymentsService {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentDto, userId?: number) {
    if (!stripe) {
      throw new AppError('Payment service not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || 'usd',
      metadata: {
        userId: userId?.toString() || '',
        orderId: data.orderId || '',
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Confirm payment and link to order
   */
  async confirmPayment(paymentIntentId: string, orderId: string) {
    if (!stripe) {
      throw new AppError('Payment service not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: this.mapStripeStatus(paymentIntent.status),
        method: paymentIntent.payment_method_types[0] || 'card',
        provider: 'stripe',
        metadata: paymentIntent.metadata,
      },
    });

    logger.info(`Payment confirmed: ${paymentIntentId} for order ${orderId}`);

    return payment;
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    return payment;
  }

  /**
   * Process refund
   */
  async refundPayment(paymentId: string, amount?: number) {
    if (!stripe) {
      throw new AppError('Payment service not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    logger.info(`Payment refunded: ${paymentId}, amount: ${refund.amount / 100}`);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(payload: Buffer, signature: string) {
    if (!stripe || !config.stripe.webhookSecret) {
      throw new AppError('Webhook not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      throw new AppError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PROCESSING' },
      });

      logger.info(`Payment succeeded: ${paymentIntent.id}`);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      logger.warn(`Payment failed: ${paymentIntent.id}`);
    }
  }

  /**
   * Map Stripe status to our PaymentStatus enum
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: PaymentStatus.REQUIRES_PAYMENT_METHOD,
      requires_confirmation: PaymentStatus.REQUIRES_CONFIRMATION,
      processing: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.SUCCEEDED,
      canceled: PaymentStatus.CANCELED,
    };

    return statusMap[stripeStatus] || PaymentStatus.PROCESSING;
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
