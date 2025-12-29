/**
 * Loyalty Service
 * 
 * DTC Feature 6.1: Loyalty Points / Rewards
 * Handles points earning, redemption, tier management, and expiration
 */

import { LoyaltyTier, PointsTransactionType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Constants
// ============================================================================

const TIER_CONFIG = {
  BASIC: { minSpend: 0, multiplier: 1.0, birthdayBonus: 100 },
  SILVER: { minSpend: 500, multiplier: 1.25, birthdayBonus: 150 },
  GOLD: { minSpend: 1000, multiplier: 1.5, birthdayBonus: 200 },
  PLATINUM: { minSpend: 2500, multiplier: 2.0, birthdayBonus: 300 },
};

const POINTS_PER_DOLLAR = 1;
const POINTS_TO_DOLLAR_VALUE = 100; // 100 points = $5
const DOLLAR_VALUE_PER_REDEMPTION = 5;
const MIN_REDEMPTION_POINTS = 100;
const POINTS_EXPIRATION_MONTHS = 12;

const EARN_ACTIONS = {
  PURCHASE: { points: POINTS_PER_DOLLAR, description: 'Purchase' },
  REVIEW: { points: 50, description: 'Product review' },
  REFERRAL: { points: 200, description: 'Successful referral' },
  BIRTHDAY: { points: 100, description: 'Birthday bonus' },
  FIRST_PURCHASE: { points: 100, description: 'First purchase bonus' },
  SIGNUP: { points: 50, description: 'Welcome bonus' },
};

// ============================================================================
// Account Management
// ============================================================================

export async function getOrCreateLoyaltyAccount(userId: number) {
  let account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: {
        userId,
        currentTier: 'BASIC',
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        lifetimeSpend: 0,
      },
      include: {
        transactions: true,
      },
    });

    // Award signup bonus
    await earnPoints(userId, 'SIGNUP');
  }

  return account;
}

export async function getLoyaltyAccount(userId: number) {
  return prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          birthday: true,
        },
      },
    },
  });
}

export async function getPointsHistory(
  userId: number,
  page: number = 1,
  limit: number = 20
) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
  });

  if (!account) {
    return { transactions: [], total: 0, hasMore: false };
  }

  const [transactions, total] = await Promise.all([
    prisma.pointsTransaction.findMany({
      where: { loyaltyAccountId: account.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pointsTransaction.count({
      where: { loyaltyAccountId: account.id },
    }),
  ]);

  return {
    transactions,
    total,
    hasMore: page * limit < total,
  };
}

// ============================================================================
// Points Earning
// ============================================================================

export async function earnPoints(
  userId: number,
  action: keyof typeof EARN_ACTIONS,
  metadata?: { orderId?: string; amount?: number }
) {
  const account = await getOrCreateLoyaltyAccount(userId);
  const tierConfig = TIER_CONFIG[account.currentTier];

  let basePoints: number;
  let description: string;

  if (action === 'PURCHASE' && metadata?.amount) {
    basePoints = Math.floor(metadata.amount * POINTS_PER_DOLLAR);
    description = `${EARN_ACTIONS.PURCHASE.description} - Order #${metadata.orderId}`;
  } else if (action === 'BIRTHDAY') {
    basePoints = TIER_CONFIG[account.currentTier].birthdayBonus;
    description = `${EARN_ACTIONS.BIRTHDAY.description} (${account.currentTier} tier)`;
  } else {
    basePoints = EARN_ACTIONS[action].points;
    description = EARN_ACTIONS[action].description;
  }

  // Apply tier multiplier
  const earnedPoints = Math.floor(basePoints * tierConfig.multiplier);
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + POINTS_EXPIRATION_MONTHS);

  // Create transaction
  const transaction = await prisma.pointsTransaction.create({
    data: {
      loyaltyAccountId: account.id,
      type: action === 'BIRTHDAY' ? 'BONUS' : 'EARNED',
      points: earnedPoints,
      description,
      orderId: metadata?.orderId,
      expiresAt,
    },
  });

  // Update account
  const updatedAccount = await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      totalPoints: { increment: earnedPoints },
      availablePoints: { increment: earnedPoints },
      lifetimePoints: { increment: earnedPoints },
      lifetimeSpend: action === 'PURCHASE' && metadata?.amount
        ? { increment: metadata.amount }
        : undefined,
    },
  });

  // Check for tier upgrade
  await evaluateTierStatus(userId);

  return { transaction, account: updatedAccount, earnedPoints };
}

export async function earnPurchasePoints(
  userId: number,
  orderId: string,
  orderTotal: number
) {
  return earnPoints(userId, 'PURCHASE', { orderId, amount: orderTotal });
}

export async function earnReviewPoints(userId: number) {
  return earnPoints(userId, 'REVIEW');
}

export async function earnReferralPoints(userId: number) {
  return earnPoints(userId, 'REFERRAL');
}

export async function awardBirthdayBonus(userId: number) {
  // Check if already awarded this year
  const account = await getLoyaltyAccount(userId);
  if (!account) return null;

  const currentYear = new Date().getFullYear();
  const existingBonus = await prisma.pointsTransaction.findFirst({
    where: {
      loyaltyAccountId: account.id,
      type: 'BONUS',
      description: { contains: 'Birthday' },
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
  });

  if (existingBonus) {
    return null; // Already awarded this year
  }

  return earnPoints(userId, 'BIRTHDAY');
}

// ============================================================================
// Points Redemption
// ============================================================================

export async function redeemPoints(
  userId: number,
  points: number,
  orderId?: string
) {
  const account = await getLoyaltyAccount(userId);
  if (!account) {
    throw new Error('Loyalty account not found');
  }

  if (points < MIN_REDEMPTION_POINTS) {
    throw new Error(`Minimum redemption is ${MIN_REDEMPTION_POINTS} points`);
  }

  if (points > account.availablePoints) {
    throw new Error('Insufficient points');
  }

  // Calculate dollar value
  const dollarValue = Math.floor(points / POINTS_TO_DOLLAR_VALUE) * DOLLAR_VALUE_PER_REDEMPTION;

  // Create transaction
  const transaction = await prisma.pointsTransaction.create({
    data: {
      loyaltyAccountId: account.id,
      type: 'REDEEMED',
      points: -points,
      description: `Redeemed for $${dollarValue} discount${orderId ? ` - Order #${orderId}` : ''}`,
      orderId,
    },
  });

  // Update account
  const updatedAccount = await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      availablePoints: { decrement: points },
    },
  });

  return { transaction, account: updatedAccount, dollarValue };
}

export function calculateRedemptionValue(points: number) {
  const redeemableUnits = Math.floor(points / POINTS_TO_DOLLAR_VALUE);
  return redeemableUnits * DOLLAR_VALUE_PER_REDEMPTION;
}

// ============================================================================
// Tier Management
// ============================================================================

export async function evaluateTierStatus(userId: number) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
  });

  if (!account) return null;

  const lifetimeSpend = Number(account.lifetimeSpend);
  let newTier: LoyaltyTier = 'BASIC';

  if (lifetimeSpend >= TIER_CONFIG.PLATINUM.minSpend) {
    newTier = 'PLATINUM';
  } else if (lifetimeSpend >= TIER_CONFIG.GOLD.minSpend) {
    newTier = 'GOLD';
  } else if (lifetimeSpend >= TIER_CONFIG.SILVER.minSpend) {
    newTier = 'SILVER';
  }

  if (newTier !== account.currentTier) {
    // Tier changed - update and set expiration (1 year from now)
    const tierExpiration = new Date();
    tierExpiration.setFullYear(tierExpiration.getFullYear() + 1);

    return prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        currentTier: newTier,
        tierExpirationDate: tierExpiration,
      },
    });
  }

  return account;
}

export function getTierBenefits(tier: LoyaltyTier) {
  const benefits = {
    BASIC: [
      '1 point per $1 spent',
      'Birthday bonus (100 pts)',
      'Member-only offers',
    ],
    SILVER: [
      '1.25x points on all purchases',
      'Early access to sales',
      'Free standard shipping',
      'Birthday bonus (150 pts)',
    ],
    GOLD: [
      '1.5x points on all purchases',
      'Early access to new products',
      'Free express shipping',
      'Birthday bonus (200 pts)',
      'Exclusive member events',
    ],
    PLATINUM: [
      '2x points on all purchases',
      'Priority customer support',
      'Free overnight shipping',
      'Birthday bonus (300 pts)',
      'VIP access to limited drops',
      'Complimentary gift wrapping',
    ],
  };

  return benefits[tier];
}

export function getTierProgress(currentTier: LoyaltyTier, lifetimeSpend: number) {
  const tiers: LoyaltyTier[] = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === tiers.length - 1) {
    return { nextTier: null, amountToNext: 0, progressPercent: 100 };
  }

  const nextTier = tiers[currentIndex + 1];
  const nextTierMinSpend = TIER_CONFIG[nextTier].minSpend;
  const currentTierMinSpend = TIER_CONFIG[currentTier].minSpend;

  const progressToNext = lifetimeSpend - currentTierMinSpend;
  const requiredForNext = nextTierMinSpend - currentTierMinSpend;
  const progressPercent = Math.min(100, (progressToNext / requiredForNext) * 100);
  const amountToNext = nextTierMinSpend - lifetimeSpend;

  return { nextTier, amountToNext, progressPercent };
}

// ============================================================================
// Points Expiration
// ============================================================================

export async function getExpiringPoints(userId: number, daysAhead: number = 30) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
  });

  if (!account) return { points: 0, expirationDate: null };

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysAhead);

  const expiringTransactions = await prisma.pointsTransaction.findMany({
    where: {
      loyaltyAccountId: account.id,
      type: 'EARNED',
      expiresAt: {
        lte: expirationDate,
        gt: new Date(),
      },
    },
  });

  const totalExpiring = expiringTransactions.reduce((sum, t) => sum + t.points, 0);
  const earliestExpiration = expiringTransactions.length > 0
    ? expiringTransactions.reduce((earliest, t) =>
        t.expiresAt && t.expiresAt < earliest ? t.expiresAt : earliest,
        expiringTransactions[0].expiresAt!
      )
    : null;

  return {
    points: totalExpiring,
    expirationDate: earliestExpiration,
  };
}

export async function processExpiredPoints() {
  // Find all expired transactions that haven't been processed
  const now = new Date();
  const expiredTransactions = await prisma.pointsTransaction.findMany({
    where: {
      type: 'EARNED',
      expiresAt: { lte: now },
    },
    include: {
      loyaltyAccount: true,
    },
  });

  // Group by account
  const accountExpiries = new Map<number, number>();
  for (const transaction of expiredTransactions) {
    const current = accountExpiries.get(transaction.loyaltyAccountId) || 0;
    accountExpiries.set(transaction.loyaltyAccountId, current + transaction.points);
  }

  // Create expiration transactions and update accounts
  for (const [accountId, expiredPoints] of accountExpiries) {
    await prisma.$transaction([
      prisma.pointsTransaction.create({
        data: {
          loyaltyAccountId: accountId,
          type: 'EXPIRED',
          points: -expiredPoints,
          description: 'Points expired',
        },
      }),
      prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: {
          availablePoints: { decrement: expiredPoints },
        },
      }),
    ]);
  }

  return { processedAccounts: accountExpiries.size };
}

// ============================================================================
// Admin Functions
// ============================================================================

export async function adjustPoints(
  userId: number,
  points: number,
  reason: string,
  adminId: number
) {
  const account = await getOrCreateLoyaltyAccount(userId);

  const transaction = await prisma.pointsTransaction.create({
    data: {
      loyaltyAccountId: account.id,
      type: 'ADJUSTMENT',
      points,
      description: `Admin adjustment: ${reason} (by admin #${adminId})`,
    },
  });

  const updatedAccount = await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      totalPoints: { increment: points },
      availablePoints: { increment: points },
      lifetimePoints: points > 0 ? { increment: points } : undefined,
    },
  });

  return { transaction, account: updatedAccount };
}

export { EARN_ACTIONS, MIN_REDEMPTION_POINTS, POINTS_TO_DOLLAR_VALUE, TIER_CONFIG };

