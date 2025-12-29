/**
 * Referral Service
 * 
 * DTC Feature 6.2: Referral Program
 * Handles referral code generation, tracking, and reward distribution
 */

import { PrismaClient, ReferralStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// ============================================================================
// Constants
// ============================================================================

const REFERRER_REWARD = 20; // $20 credit
const REFEREE_REWARD = 10; // $10 off first order
const REFERRAL_CODE_LENGTH = 8;
const REFERRAL_EXPIRY_DAYS = 30;

// ============================================================================
// Account Management
// ============================================================================

export async function getOrCreateReferralAccount(userId: number) {
  let account = await prisma.referralAccount.findUnique({
    where: { userId },
    include: {
      referrals: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!account) {
    const referralCode = await generateUniqueReferralCode();

    account = await prisma.referralAccount.create({
      data: {
        userId,
        referralCode,
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingRewards: 0,
        totalEarned: 0,
      },
      include: {
        referrals: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  return account;
}

export async function getReferralAccount(userId: number) {
  return prisma.referralAccount.findUnique({
    where: { userId },
    include: {
      referrals: {
        orderBy: { createdAt: 'desc' },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

// ============================================================================
// Referral Code Generation
// ============================================================================

function generateReferralCode(): string {
  return randomBytes(REFERRAL_CODE_LENGTH / 2)
    .toString('hex')
    .toUpperCase();
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let exists = true;

  while (exists) {
    code = generateReferralCode();
    const existing = await prisma.referralAccount.findUnique({
      where: { referralCode: code },
    });
    exists = !!existing;
  }

  return code!;
}

export function generateReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}?ref=${code}`;
}

// ============================================================================
// Referral Tracking
// ============================================================================

export async function createReferral(referralCode: string, refereeEmail: string) {
  const referralAccount = await prisma.referralAccount.findUnique({
    where: { referralCode },
  });

  if (!referralAccount) {
    throw new Error('Invalid referral code');
  }

  // Check if this email was already referred
  const existingReferral = await prisma.referral.findFirst({
    where: { refereeEmail },
  });

  if (existingReferral) {
    throw new Error('This email has already been referred');
  }

  // Create the referral
  const referral = await prisma.referral.create({
    data: {
      referralAccountId: referralAccount.id,
      refereeEmail,
      status: 'PENDING',
      referrerReward: REFERRER_REWARD,
      refereeReward: REFEREE_REWARD,
    },
  });

  // Update total referrals count
  await prisma.referralAccount.update({
    where: { id: referralAccount.id },
    data: {
      totalReferrals: { increment: 1 },
    },
  });

  return referral;
}

export async function getReferralByCode(referralCode: string) {
  return prisma.referralAccount.findUnique({
    where: { referralCode },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getReferralByEmail(email: string) {
  return prisma.referral.findFirst({
    where: { refereeEmail: email },
    include: {
      referralAccount: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

// ============================================================================
// Referral Status Updates
// ============================================================================

export async function markRefereeSignedUp(refereeEmail: string, refereeUserId: number) {
  const referral = await prisma.referral.findFirst({
    where: { refereeEmail },
  });

  if (!referral) {
    return null;
  }

  return prisma.referral.update({
    where: { id: referral.id },
    data: {
      refereeUserId,
      status: 'SIGNED_UP',
      signedUpAt: new Date(),
    },
  });
}

export async function markRefereePurchased(refereeUserId: number) {
  const referral = await prisma.referral.findFirst({
    where: { refereeUserId },
  });

  if (!referral || referral.status === 'PURCHASED' || referral.status === 'REWARDED') {
    return null;
  }

  // Update referral status
  const updatedReferral = await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'PURCHASED',
      purchasedAt: new Date(),
    },
  });

  // Update referral account with pending rewards
  await prisma.referralAccount.update({
    where: { id: referral.referralAccountId },
    data: {
      successfulReferrals: { increment: 1 },
      pendingRewards: { increment: REFERRER_REWARD },
    },
  });

  return updatedReferral;
}

export async function processReferralReward(referralId: number) {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });

  if (!referral || referral.status !== 'PURCHASED') {
    throw new Error('Invalid referral or not eligible for reward');
  }

  // Mark as rewarded
  const updatedReferral = await prisma.referral.update({
    where: { id: referralId },
    data: {
      status: 'REWARDED',
      rewardedAt: new Date(),
    },
  });

  // Move from pending to earned
  await prisma.referralAccount.update({
    where: { id: referral.referralAccountId },
    data: {
      pendingRewards: { decrement: REFERRER_REWARD },
      totalEarned: { increment: REFERRER_REWARD },
    },
  });

  return updatedReferral;
}

// ============================================================================
// Invite by Email
// ============================================================================

export async function sendReferralInvites(
  userId: number,
  emails: string[],
  sendEmailFn?: (email: string, referralCode: string, referrerName: string) => Promise<void>
) {
  const account = await getOrCreateReferralAccount(userId);
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const email of emails) {
    try {
      // Check if already referred
      const existingReferral = await prisma.referral.findFirst({
        where: { refereeEmail: email },
      });

      if (existingReferral) {
        results.push({ email, success: false, error: 'Already referred' });
        continue;
      }

      // Create referral
      await prisma.referral.create({
        data: {
          referralAccountId: account.id,
          refereeEmail: email,
          status: 'PENDING',
          referrerReward: REFERRER_REWARD,
          refereeReward: REFEREE_REWARD,
        },
      });

      // Update total referrals
      await prisma.referralAccount.update({
        where: { id: account.id },
        data: { totalReferrals: { increment: 1 } },
      });

      // Send email if function provided
      if (sendEmailFn) {
        await sendEmailFn(
          email,
          account.referralCode,
          `${account.user.firstName} ${account.user.lastName}`
        );
      }

      results.push({ email, success: true });
    } catch (error) {
      results.push({ email, success: false, error: 'Failed to send' });
    }
  }

  return results;
}

export async function resendReferralInvite(
  referralId: number,
  sendEmailFn?: (email: string, referralCode: string, referrerName: string) => Promise<void>
) {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referralAccount: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!referral || referral.status !== 'PENDING') {
    throw new Error('Invalid referral or not pending');
  }

  if (sendEmailFn) {
    await sendEmailFn(
      referral.refereeEmail,
      referral.referralAccount.referralCode,
      `${referral.referralAccount.user.firstName} ${referral.referralAccount.user.lastName}`
    );
  }

  return referral;
}

// ============================================================================
// Leaderboard
// ============================================================================

export async function getReferralLeaderboard(
  period: 'week' | 'month' | 'all-time' = 'month',
  limit: number = 10
) {
  let dateFilter: Date | undefined;

  if (period === 'week') {
    dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - 7);
  } else if (period === 'month') {
    dateFilter = new Date();
    dateFilter.setMonth(dateFilter.getMonth() - 1);
  }

  const accounts = await prisma.referralAccount.findMany({
    where: dateFilter
      ? {
          referrals: {
            some: {
              status: { in: ['PURCHASED', 'REWARDED'] },
              purchasedAt: { gte: dateFilter },
            },
          },
        }
      : {
          successfulReferrals: { gt: 0 },
        },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      _count: {
        select: {
          referrals: {
            where: dateFilter
              ? {
                  status: { in: ['PURCHASED', 'REWARDED'] },
                  purchasedAt: { gte: dateFilter },
                }
              : {
                  status: { in: ['PURCHASED', 'REWARDED'] },
                },
          },
        },
      },
    },
    orderBy: {
      successfulReferrals: 'desc',
    },
    take: limit,
  });

  return accounts.map((account, index) => ({
    rank: index + 1,
    name: `${account.user.firstName} ${account.user.lastName.charAt(0)}.`,
    avatar: account.user.image,
    referrals: period === 'all-time' 
      ? account.successfulReferrals 
      : account._count.referrals,
    userId: account.userId,
  }));
}

// ============================================================================
// Validation
// ============================================================================

export async function validateReferralCode(code: string) {
  const account = await prisma.referralAccount.findUnique({
    where: { referralCode: code },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!account) {
    return { valid: false, error: 'Invalid referral code' };
  }

  return {
    valid: true,
    referrerName: `${account.user.firstName} ${account.user.lastName}`,
    refereeReward: REFEREE_REWARD,
  };
}

export async function applyReferralToOrder(
  refereeUserId: number,
  orderId: string
): Promise<number> {
  const referral = await prisma.referral.findFirst({
    where: { refereeUserId },
  });

  if (!referral) {
    return 0;
  }

  // Check if this is first purchase
  const user = await prisma.user.findUnique({
    where: { id: refereeUserId },
    include: {
      orders: {
        where: { id: { not: orderId } },
      },
    },
  });

  if (user && user.orders.length === 0) {
    // First purchase - apply referee discount and mark as purchased
    await markRefereePurchased(refereeUserId);
    return Number(referral.refereeReward) || REFEREE_REWARD;
  }

  return 0;
}

// ============================================================================
// Stats
// ============================================================================

export async function getReferralStats(userId: number) {
  const account = await getReferralAccount(userId);

  if (!account) {
    return null;
  }

  const pendingCount = account.referrals.filter(r => r.status === 'PENDING').length;
  const signedUpCount = account.referrals.filter(r => r.status === 'SIGNED_UP').length;
  const purchasedCount = account.referrals.filter(r => 
    r.status === 'PURCHASED' || r.status === 'REWARDED'
  ).length;

  return {
    totalReferrals: account.totalReferrals,
    successfulReferrals: account.successfulReferrals,
    pendingRewards: Number(account.pendingRewards),
    totalEarned: Number(account.totalEarned),
    breakdown: {
      pending: pendingCount,
      signedUp: signedUpCount,
      purchased: purchasedCount,
    },
  };
}

export { REFEREE_REWARD, REFERRER_REWARD };

