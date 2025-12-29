/**
 * Limited Drops Service
 * 
 * DTC Feature 6.3: Limited Drops/Releases (SNKRS Model)
 * Handles product drops, draws/lotteries, early access, countdowns
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

export type DropType = 'STANDARD' | 'DRAW' | 'MEMBER_EXCLUSIVE' | 'EARLY_ACCESS';
export type DropStatus = 'UPCOMING' | 'LIVE' | 'ENDED' | 'SOLD_OUT';
export type EntryStatus = 'PENDING' | 'SELECTED' | 'NOT_SELECTED' | 'PURCHASED';

export interface DropProduct {
  productId: number;
  quantity: number;
  maxPerCustomer: number;
}

export interface DropCreateInput {
  name: string;
  description: string;
  type: DropType;
  products: DropProduct[];
  startTime: Date;
  endTime?: Date;
  earlyAccessStart?: Date;
  memberOnly: boolean;
  notifySubscribers: boolean;
  heroImage: string;
  teaser?: string;
}

export interface DrawEntry {
  userId: number;
  dropId: string;
  productId: number;
  sizeVariantId?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const EARLY_ACCESS_HOURS = 24; // Members get 24hr early access
export const DRAW_WINDOW_HOURS = 48; // Draws are open for 48 hours

// ============================================================================
// Drop Management
// ============================================================================

/**
 * Create a new product drop
 */
export async function createDrop(input: DropCreateInput) {
  const { products, ...dropData } = input;

  const drop = await prisma.productDrop.create({
    data: {
      ...dropData,
      status: 'UPCOMING',
      products: {
        create: products.map((p) => ({
          productId: p.productId,
          allocatedQuantity: p.quantity,
          remainingQuantity: p.quantity,
          maxPerCustomer: p.maxPerCustomer,
        })),
      },
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  return drop;
}

/**
 * Get all drops (with filtering)
 */
export async function getDrops(options?: {
  status?: DropStatus;
  type?: DropType;
  upcoming?: boolean;
  limit?: number;
}) {
  const where: any = {};

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.upcoming) {
    where.startTime = { gt: new Date() };
  }

  return prisma.productDrop.findMany({
    where,
    include: {
      products: {
        include: {
          product: true,
        },
      },
      _count: {
        select: {
          entries: true,
          notifications: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
    take: options?.limit,
  });
}

/**
 * Get drop by ID
 */
export async function getDrop(dropId: string) {
  return prisma.productDrop.findUnique({
    where: { id: dropId },
    include: {
      products: {
        include: {
          product: true,
        },
      },
      _count: {
        select: {
          entries: true,
          notifications: true,
        },
      },
    },
  });
}

/**
 * Get upcoming drops calendar
 */
export async function getDropCalendar(daysAhead: number = 30) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.productDrop.findMany({
    where: {
      startTime: {
        gte: now,
        lte: futureDate,
      },
    },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
}

/**
 * Update drop status (called by scheduler or manually)
 */
export async function updateDropStatus(dropId: string) {
  const drop = await prisma.productDrop.findUnique({
    where: { id: dropId },
    include: {
      products: true,
    },
  });

  if (!drop) {
    throw new Error('Drop not found');
  }

  const now = new Date();
  let newStatus: DropStatus = drop.status as DropStatus;

  // Check if sold out
  const allSoldOut = drop.products.every((p) => p.remainingQuantity === 0);
  if (allSoldOut) {
    newStatus = 'SOLD_OUT';
  } else if (drop.endTime && now > drop.endTime) {
    newStatus = 'ENDED';
  } else if (now >= drop.startTime) {
    newStatus = 'LIVE';
  } else {
    newStatus = 'UPCOMING';
  }

  if (newStatus !== drop.status) {
    return prisma.productDrop.update({
      where: { id: dropId },
      data: { status: newStatus },
    });
  }

  return drop;
}

// ============================================================================
// Drop Access Control
// ============================================================================

/**
 * Check if user has access to drop
 */
export async function checkDropAccess(
  dropId: string,
  userId?: number
): Promise<{
  hasAccess: boolean;
  reason?: string;
  accessType?: 'REGULAR' | 'EARLY_ACCESS' | 'MEMBER_EXCLUSIVE';
}> {
  const drop = await prisma.productDrop.findUnique({
    where: { id: dropId },
  });

  if (!drop) {
    return { hasAccess: false, reason: 'Drop not found' };
  }

  const now = new Date();

  // Check if drop is over
  if (drop.status === 'ENDED' || drop.status === 'SOLD_OUT') {
    return { hasAccess: false, reason: 'Drop has ended' };
  }

  // Check member-only drops
  if (drop.memberOnly && !userId) {
    return { hasAccess: false, reason: 'Members only' };
  }

  // Check early access
  if (drop.earlyAccessStart && now >= drop.earlyAccessStart && now < drop.startTime) {
    // In early access window - check if user is a member
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { loyaltyAccount: true },
      });

      // Members get early access
      if (user?.loyaltyAccount) {
        return { hasAccess: true, accessType: 'EARLY_ACCESS' };
      }
    }
    return { hasAccess: false, reason: 'Early access for members only' };
  }

  // Regular access - check if drop is live
  if (now >= drop.startTime) {
    return { hasAccess: true, accessType: 'REGULAR' };
  }

  return { hasAccess: false, reason: 'Drop has not started' };
}

// ============================================================================
// Draw/Lottery System
// ============================================================================

/**
 * Enter a draw
 */
export async function enterDraw(entry: DrawEntry) {
  const { userId, dropId, productId, sizeVariantId } = entry;

  // Check if drop is a draw type
  const drop = await prisma.productDrop.findUnique({
    where: { id: dropId },
  });

  if (!drop) {
    throw new Error('Drop not found');
  }

  if (drop.type !== 'DRAW') {
    throw new Error('This drop does not use the draw system');
  }

  // Check if already entered
  const existingEntry = await prisma.drawEntry.findFirst({
    where: {
      userId,
      dropId,
      productId,
    },
  });

  if (existingEntry) {
    throw new Error('Already entered this draw');
  }

  // Create entry
  const drawEntry = await prisma.drawEntry.create({
    data: {
      userId,
      dropId,
      productId,
      sizeVariantId,
      status: 'PENDING',
      entryCode: generateEntryCode(),
    },
  });

  return drawEntry;
}

/**
 * Get user's draw entries
 */
export async function getUserDrawEntries(userId: number) {
  return prisma.drawEntry.findMany({
    where: { userId },
    include: {
      drop: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Run draw selection for a drop
 */
export async function runDrawSelection(dropId: string) {
  const drop = await prisma.productDrop.findUnique({
    where: { id: dropId },
    include: {
      products: true,
      entries: {
        where: { status: 'PENDING' },
      },
    },
  });

  if (!drop) {
    throw new Error('Drop not found');
  }

  if (drop.type !== 'DRAW') {
    throw new Error('This is not a draw drop');
  }

  const results = {
    selected: 0,
    notSelected: 0,
  };

  // Group entries by product
  const entriesByProduct = new Map<number, typeof drop.entries>();
  for (const entry of drop.entries) {
    const existing = entriesByProduct.get(entry.productId) || [];
    existing.push(entry);
    entriesByProduct.set(entry.productId, existing);
  }

  // Run selection for each product
  for (const dropProduct of drop.products) {
    const productEntries = entriesByProduct.get(dropProduct.productId) || [];
    const availableQuantity = dropProduct.remainingQuantity;

    // Shuffle entries randomly
    const shuffled = productEntries.sort(() => Math.random() - 0.5);

    // Select winners
    const winners = shuffled.slice(0, availableQuantity);
    const losers = shuffled.slice(availableQuantity);

    // Update winners
    for (const winner of winners) {
      await prisma.drawEntry.update({
        where: { id: winner.id },
        data: {
          status: 'SELECTED',
          selectedAt: new Date(),
        },
      });
      results.selected++;
    }

    // Update losers
    for (const loser of losers) {
      await prisma.drawEntry.update({
        where: { id: loser.id },
        data: { status: 'NOT_SELECTED' },
      });
      results.notSelected++;
    }
  }

  // Update drop status
  await prisma.productDrop.update({
    where: { id: dropId },
    data: { drawCompleted: true, drawCompletedAt: new Date() },
  });

  return results;
}

/**
 * Get draw result for user
 */
export async function getDrawResult(userId: number, dropId: string) {
  const entry = await prisma.drawEntry.findFirst({
    where: { userId, dropId },
    include: {
      drop: true,
      product: true,
    },
  });

  if (!entry) {
    return null;
  }

  return {
    entered: true,
    status: entry.status,
    selected: entry.status === 'SELECTED',
    product: entry.product,
    purchaseDeadline:
      entry.status === 'SELECTED'
        ? new Date(entry.selectedAt!.getTime() + 24 * 60 * 60 * 1000)
        : null,
  };
}

// ============================================================================
// Notifications
// ============================================================================

/**
 * Subscribe to drop notifications
 */
export async function subscribeToDropNotification(userId: number, dropId: string) {
  // Check if already subscribed
  const existing = await prisma.dropNotification.findFirst({
    where: { userId, dropId },
  });

  if (existing) {
    return existing;
  }

  return prisma.dropNotification.create({
    data: {
      userId,
      dropId,
    },
  });
}

/**
 * Unsubscribe from drop notifications
 */
export async function unsubscribeFromDropNotification(
  userId: number,
  dropId: string
) {
  return prisma.dropNotification.deleteMany({
    where: { userId, dropId },
  });
}

/**
 * Get users to notify for a drop
 */
export async function getDropNotificationSubscribers(dropId: string) {
  return prisma.dropNotification.findMany({
    where: { dropId, notified: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      },
    },
  });
}

/**
 * Mark notifications as sent
 */
export async function markNotificationsSent(dropId: string) {
  return prisma.dropNotification.updateMany({
    where: { dropId },
    data: { notified: true, notifiedAt: new Date() },
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique entry code for draws
 */
function generateEntryCode(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Calculate countdown to drop
 */
export function calculateCountdown(startTime: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
} {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isLive: false };
}

/**
 * Get drop statistics
 */
export async function getDropStats() {
  const [total, upcoming, live, draws, totalEntries] = await Promise.all([
    prisma.productDrop.count(),
    prisma.productDrop.count({ where: { status: 'UPCOMING' } }),
    prisma.productDrop.count({ where: { status: 'LIVE' } }),
    prisma.productDrop.count({ where: { type: 'DRAW' } }),
    prisma.drawEntry.count(),
  ]);

  return {
    total,
    upcoming,
    live,
    draws,
    totalEntries,
  };
}
