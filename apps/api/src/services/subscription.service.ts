/**
 * Subscription Service
 * 
 * DTC Feature 5.2: Subscription Model (Harry's Model)
 * Handles subscription creation, management, and billing
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// ============================================================================
// Types
// ============================================================================

export type SubscriptionStatus = 
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'PAST_DUE'
  | 'PENDING';

export type SubscriptionFrequency = 
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY';

export interface SubscriptionItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
}

export interface SubscriptionCreateInput {
  userId: number;
  items: SubscriptionItem[];
  frequency: SubscriptionFrequency;
  startDate?: Date;
  shippingAddressId: number;
  paymentMethodId: string;
}

export interface SubscriptionUpdateInput {
  frequency?: SubscriptionFrequency;
  items?: SubscriptionItem[];
  shippingAddressId?: number;
  nextBillingDate?: Date;
}

// ============================================================================
// Constants
// ============================================================================

export const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
};

export const SUBSCRIPTION_DISCOUNT_PERCENT = 15; // 15% off for subscribers

// ============================================================================
// Subscription CRUD
// ============================================================================

/**
 * Create a new subscription
 */
export async function createSubscription(input: SubscriptionCreateInput) {
  const { userId, items, frequency, startDate, shippingAddressId, paymentMethodId } = input;

  // Calculate subscription total
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = (subtotal * SUBSCRIPTION_DISCOUNT_PERCENT) / 100;
  const total = subtotal - discount;

  // Calculate next billing date
  const nextBillingDate = startDate || new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + FREQUENCY_DAYS[frequency]);

  // Create Stripe subscription if payment method exists
  let stripeSubscriptionId: string | null = null;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (user?.stripeCustomerId && paymentMethodId) {
    try {
      // Create Stripe price for the subscription amount
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(total * 100),
        currency: 'usd',
        recurring: {
          interval: frequency === 'WEEKLY' ? 'week' : 'month',
          interval_count: frequency === 'BIWEEKLY' ? 2 : 
                          frequency === 'BIMONTHLY' ? 2 :
                          frequency === 'QUARTERLY' ? 3 : 1,
        },
        product_data: {
          name: 'Subscription Box',
        },
      });

      const stripeSubscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: stripePrice.id }],
        default_payment_method: paymentMethodId,
        metadata: {
          userId: userId.toString(),
        },
      });

      stripeSubscriptionId = stripeSubscription.id;
    } catch (error) {
      console.error('Stripe subscription creation failed:', error);
    }
  }

  // Create subscription in database
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      status: 'ACTIVE',
      frequency,
      nextBillingDate,
      shippingAddressId,
      paymentMethodId,
      stripeSubscriptionId,
      subtotal,
      discount,
      total,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
  });

  return subscription;
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(userId: number) {
  return prisma.subscription.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  return prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: SubscriptionUpdateInput
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Calculate new next billing date if frequency changed
  let nextBillingDate = updates.nextBillingDate;
  if (updates.frequency && updates.frequency !== subscription.frequency) {
    nextBillingDate = new Date();
    nextBillingDate.setDate(
      nextBillingDate.getDate() + FREQUENCY_DAYS[updates.frequency]
    );
  }

  // Update items if provided
  if (updates.items) {
    // Delete existing items
    await prisma.subscriptionItem.deleteMany({
      where: { subscriptionId },
    });

    // Calculate new totals
    const subtotal = updates.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = (subtotal * SUBSCRIPTION_DISCOUNT_PERCENT) / 100;
    const total = subtotal - discount;

    // Create new items and update subscription
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        frequency: updates.frequency,
        nextBillingDate,
        shippingAddressId: updates.shippingAddressId,
        subtotal,
        discount,
        total,
        items: {
          create: updates.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      frequency: updates.frequency,
      nextBillingDate,
      shippingAddressId: updates.shippingAddressId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
  });
}

// ============================================================================
// Subscription Lifecycle
// ============================================================================

/**
 * Pause subscription
 */
export async function pauseSubscription(
  subscriptionId: string,
  resumeDate?: Date
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Pause in Stripe if exists
  if (subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: {
          behavior: 'void',
          resumes_at: resumeDate ? Math.floor(resumeDate.getTime() / 1000) : undefined,
        },
      });
    } catch (error) {
      console.error('Stripe pause failed:', error);
    }
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'PAUSED',
      pausedAt: new Date(),
      resumeDate,
    },
  });
}

/**
 * Resume subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Resume in Stripe if exists
  if (subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: '',
      });
    } catch (error) {
      console.error('Stripe resume failed:', error);
    }
  }

  // Calculate new next billing date
  const nextBillingDate = new Date();
  nextBillingDate.setDate(
    nextBillingDate.getDate() + FREQUENCY_DAYS[subscription.frequency as SubscriptionFrequency]
  );

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      pausedAt: null,
      resumeDate: null,
      nextBillingDate,
    },
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Cancel in Stripe if exists
  if (subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error('Stripe cancel failed:', error);
    }
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });
}

/**
 * Skip next delivery
 */
export async function skipNextDelivery(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Calculate new next billing date (skip one cycle)
  const nextBillingDate = new Date(subscription.nextBillingDate);
  nextBillingDate.setDate(
    nextBillingDate.getDate() +
      FREQUENCY_DAYS[subscription.frequency as SubscriptionFrequency]
  );

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      nextBillingDate,
      skippedCount: { increment: 1 },
    },
  });
}

// ============================================================================
// Subscription Processing
// ============================================================================

/**
 * Process due subscriptions (called by cron job)
 */
export async function processDueSubscriptions() {
  const now = new Date();

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: { lte: now },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
      shippingAddress: true,
    },
  });

  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const subscription of dueSubscriptions) {
    try {
      await processSubscriptionRenewal(subscription.id);
      results.processed++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Subscription ${subscription.id}: ${(error as Error).message}`
      );
    }
  }

  return results;
}

/**
 * Process subscription renewal - create order
 */
async function processSubscriptionRenewal(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
      shippingAddress: true,
    },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Check product availability
  for (const item of subscription.items) {
    if (!item.product.inStock || item.product.stockQuantity < item.quantity) {
      // Handle out of stock - skip this item or notify user
      console.warn(`Product ${item.productId} out of stock for subscription ${subscriptionId}`);
    }
  }

  // Create order from subscription
  const order = await prisma.order.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      status: 'PENDING',
      subtotal: subscription.subtotal,
      discount: subscription.discount,
      tax: 0, // Calculate tax based on address
      total: subscription.total,
      shippingAddress: {
        create: {
          fullName: subscription.shippingAddress?.fullName || '',
          addressLine1: subscription.shippingAddress?.addressLine1 || '',
          addressLine2: subscription.shippingAddress?.addressLine2,
          city: subscription.shippingAddress?.city || '',
          state: subscription.shippingAddress?.state || '',
          postalCode: subscription.shippingAddress?.postalCode || '',
          country: subscription.shippingAddress?.country || 'US',
          phone: subscription.shippingAddress?.phone,
        },
      },
      items: {
        create: subscription.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // Update subscription next billing date
  const nextBillingDate = new Date();
  nextBillingDate.setDate(
    nextBillingDate.getDate() +
      FREQUENCY_DAYS[subscription.frequency as SubscriptionFrequency]
  );

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      nextBillingDate,
      lastBilledAt: new Date(),
      orderCount: { increment: 1 },
    },
  });

  return order;
}

// ============================================================================
// Subscription Helpers
// ============================================================================

/**
 * Get subscription frequencies with labels
 */
export function getFrequencyOptions() {
  return [
    { value: 'WEEKLY', label: 'Every week', days: 7 },
    { value: 'BIWEEKLY', label: 'Every 2 weeks', days: 14 },
    { value: 'MONTHLY', label: 'Every month', days: 30 },
    { value: 'BIMONTHLY', label: 'Every 2 months', days: 60 },
    { value: 'QUARTERLY', label: 'Every 3 months', days: 90 },
  ];
}

/**
 * Calculate subscription savings
 */
export function calculateSubscriptionSavings(
  regularPrice: number,
  quantity: number = 1
) {
  const subscriptionPrice =
    regularPrice * (1 - SUBSCRIPTION_DISCOUNT_PERCENT / 100);
  const savingsPerOrder = (regularPrice - subscriptionPrice) * quantity;
  const annualSavings = savingsPerOrder * 12; // Assuming monthly

  return {
    regularPrice,
    subscriptionPrice: Number(subscriptionPrice.toFixed(2)),
    discountPercent: SUBSCRIPTION_DISCOUNT_PERCENT,
    savingsPerOrder: Number(savingsPerOrder.toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
  };
}

/**
 * Get subscription stats for admin
 */
export async function getSubscriptionStats() {
  const [active, paused, cancelled, total, revenue] = await Promise.all([
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'PAUSED' } }),
    prisma.subscription.count({ where: { status: 'CANCELLED' } }),
    prisma.subscription.count(),
    prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { total: true },
    }),
  ]);

  return {
    active,
    paused,
    cancelled,
    total,
    monthlyRecurringRevenue: revenue._sum.total || 0,
    churnRate: total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0,
  };
}
