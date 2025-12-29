/**
 * Trade-In Service
 * 
 * DTC Feature 6.4: Trade-In Program (Apple Model)
 * Handles value estimation, condition assessment, and trade-in requests
 */

import { PrismaClient, TradeInCondition, TradeInStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Constants
// ============================================================================

const CONDITION_MULTIPLIERS: Record<TradeInCondition, number> = {
  EXCELLENT: 1.0,
  GOOD: 0.75,
  FAIR: 0.5,
  POOR: 0.25,
};

const ESTIMATE_VALIDITY_DAYS = 14;

const CONDITION_QUESTIONS = [
  {
    id: 'functionality',
    question: 'Is the item fully functional?',
    options: [
      { value: 'yes', label: 'Yes, works perfectly', deductionPercent: 0 },
      { value: 'minor', label: 'Minor issues', deductionPercent: 15 },
      { value: 'major', label: 'Major issues', deductionPercent: 40 },
      { value: 'broken', label: 'Not working', deductionPercent: 75 },
    ],
  },
  {
    id: 'cosmetic',
    question: 'What is the cosmetic condition?',
    options: [
      { value: 'excellent', label: 'Like new, no visible wear', deductionPercent: 0 },
      { value: 'good', label: 'Light scratches or scuffs', deductionPercent: 10 },
      { value: 'fair', label: 'Noticeable wear and tear', deductionPercent: 25 },
      { value: 'poor', label: 'Heavy wear or damage', deductionPercent: 50 },
    ],
  },
  {
    id: 'accessories',
    question: 'Do you have original accessories?',
    options: [
      { value: 'all', label: 'All original accessories', deductionPercent: 0 },
      { value: 'some', label: 'Some accessories', deductionPercent: 5 },
      { value: 'none', label: 'No accessories', deductionPercent: 10 },
    ],
  },
  {
    id: 'packaging',
    question: 'Do you have original packaging?',
    options: [
      { value: 'yes', label: 'Yes, original box', deductionPercent: 0 },
      { value: 'no', label: 'No original packaging', deductionPercent: 5 },
    ],
  },
];

// ============================================================================
// Trade-In Products
// ============================================================================

export async function getTradeInProducts(category?: string) {
  const where = {
    isActive: true,
    ...(category && { category }),
  };

  return prisma.tradeInProduct.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function getTradeInProduct(productId: number) {
  return prisma.tradeInProduct.findUnique({
    where: { id: productId },
  });
}

export async function createTradeInProduct(data: {
  name: string;
  image: string;
  category: string;
  baseValue: number;
  maxValue: number;
}) {
  return prisma.tradeInProduct.create({
    data,
  });
}

export async function updateTradeInProduct(
  productId: number,
  data: Partial<{
    name: string;
    image: string;
    category: string;
    baseValue: number;
    maxValue: number;
    isActive: boolean;
  }>
) {
  return prisma.tradeInProduct.update({
    where: { id: productId },
    data,
  });
}

// ============================================================================
// Value Estimation
// ============================================================================

export function getConditionQuestions() {
  return CONDITION_QUESTIONS;
}

export function calculateEstimate(
  maxValue: number,
  conditionAnswers: Record<string, string>
): {
  estimatedValue: number;
  condition: TradeInCondition;
  deductions: { reason: string; amount: number }[];
} {
  let totalDeductionPercent = 0;
  const deductions: { reason: string; amount: number }[] = [];

  for (const question of CONDITION_QUESTIONS) {
    const answer = conditionAnswers[question.id];
    if (answer) {
      const option = question.options.find((o) => o.value === answer);
      if (option && option.deductionPercent > 0) {
        const deductionAmount = Math.round((maxValue * option.deductionPercent) / 100);
        totalDeductionPercent += option.deductionPercent;
        deductions.push({
          reason: `${question.question}: ${option.label}`,
          amount: deductionAmount,
        });
      }
    }
  }

  // Determine condition based on total deduction
  let condition: TradeInCondition;
  if (totalDeductionPercent <= 10) {
    condition = 'EXCELLENT';
  } else if (totalDeductionPercent <= 30) {
    condition = 'GOOD';
  } else if (totalDeductionPercent <= 60) {
    condition = 'FAIR';
  } else {
    condition = 'POOR';
  }

  // Apply condition multiplier
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  const estimatedValue = Math.round(maxValue * conditionMultiplier);

  return { estimatedValue, condition, deductions };
}

export async function getQuickEstimate(
  productId: number,
  condition: TradeInCondition
) {
  const product = await getTradeInProduct(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const multiplier = CONDITION_MULTIPLIERS[condition];
  const estimatedValue = Math.round(Number(product.maxValue) * multiplier);

  return {
    product,
    condition,
    estimatedValue,
    multiplier,
  };
}

// ============================================================================
// Trade-In Requests
// ============================================================================

export async function createTradeInRequest(data: {
  userId: number;
  productId: number;
  conditionAnswers: Record<string, string>;
  shippingName?: string;
  shippingEmail?: string;
  shippingAddress?: string;
}) {
  const product = await getTradeInProduct(data.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const { estimatedValue, condition, deductions } = calculateEstimate(
    Number(product.maxValue),
    data.conditionAnswers
  );

  const estimateExpiresAt = new Date();
  estimateExpiresAt.setDate(estimateExpiresAt.getDate() + ESTIMATE_VALIDITY_DAYS);

  const request = await prisma.tradeInRequest.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      condition,
      estimatedValue,
      status: 'PENDING',
      conditionAnswers: data.conditionAnswers,
      shippingName: data.shippingName,
      shippingEmail: data.shippingEmail,
      shippingAddress: data.shippingAddress,
      estimateExpiresAt,
    },
    include: {
      product: true,
    },
  });

  return {
    request,
    deductions,
  };
}

export async function getTradeInRequest(requestId: string) {
  return prisma.tradeInRequest.findUnique({
    where: { id: requestId },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

export async function getUserTradeInRequests(userId: number) {
  return prisma.tradeInRequest.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateTradeInStatus(
  requestId: string,
  status: TradeInStatus,
  data?: {
    trackingNumber?: string;
    shippingLabel?: string;
    finalValue?: number;
    notes?: string;
  }
) {
  return prisma.tradeInRequest.update({
    where: { id: requestId },
    data: {
      status,
      ...data,
    },
    include: {
      product: true,
    },
  });
}

// ============================================================================
// Trade-In Workflow
// ============================================================================

export async function approveTradeIn(requestId: string, shippingLabel: string) {
  return updateTradeInStatus(requestId, 'APPROVED', { shippingLabel });
}

export async function markAsShipped(requestId: string, trackingNumber: string) {
  return updateTradeInStatus(requestId, 'SHIPPED', { trackingNumber });
}

export async function markAsReceived(requestId: string) {
  return updateTradeInStatus(requestId, 'RECEIVED');
}

export async function completeInspection(
  requestId: string,
  finalValue: number,
  notes?: string
) {
  const request = await getTradeInRequest(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  // If final value is significantly lower, may need approval
  const estimatedValue = Number(request.estimatedValue);
  const valueDifference = ((estimatedValue - finalValue) / estimatedValue) * 100;

  if (valueDifference > 20) {
    // More than 20% difference - needs review
    return updateTradeInStatus(requestId, 'INSPECTED', {
      finalValue,
      notes: `${notes || ''}\nValue adjusted: Original $${estimatedValue}, Final $${finalValue}`,
    });
  }

  return updateTradeInStatus(requestId, 'INSPECTED', { finalValue, notes });
}

export async function completeTradeIn(requestId: string) {
  const request = await getTradeInRequest(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'INSPECTED') {
    throw new Error('Trade-in must be inspected before completion');
  }

  const finalValue = request.finalValue || request.estimatedValue;

  // TODO: Apply store credit to user account
  // This would integrate with a credits/wallet system

  return updateTradeInStatus(requestId, 'COMPLETED', {
    finalValue: Number(finalValue),
  });
}

export async function rejectTradeIn(requestId: string, reason: string) {
  return updateTradeInStatus(requestId, 'REJECTED', {
    notes: `Rejected: ${reason}`,
  });
}

// ============================================================================
// Admin Functions
// ============================================================================

export async function getAllTradeInRequests(options: {
  status?: TradeInStatus;
  page?: number;
  limit?: number;
}) {
  const { status, page = 1, limit = 20 } = options;

  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.tradeInRequest.findMany({
      where,
      include: {
        product: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tradeInRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTradeInStats() {
  const [pending, approved, shipped, received, completed, rejected] =
    await Promise.all([
      prisma.tradeInRequest.count({ where: { status: 'PENDING' } }),
      prisma.tradeInRequest.count({ where: { status: 'APPROVED' } }),
      prisma.tradeInRequest.count({ where: { status: 'SHIPPED' } }),
      prisma.tradeInRequest.count({ where: { status: 'RECEIVED' } }),
      prisma.tradeInRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.tradeInRequest.count({ where: { status: 'REJECTED' } }),
    ]);

  const totalValue = await prisma.tradeInRequest.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { finalValue: true },
  });

  return {
    byStatus: {
      pending,
      approved,
      shipped,
      received,
      completed,
      rejected,
    },
    totalCompletedValue: totalValue._sum.finalValue || 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { CONDITION_MULTIPLIERS, CONDITION_QUESTIONS, ESTIMATE_VALIDITY_DAYS };

