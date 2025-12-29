/**
 * User-Generated Content (UGC) Service
 * 
 * DTC Feature 6.5: User-Generated Content
 * Handles photo/video reviews, social media integration, community gallery
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

export type UGCType = 'PHOTO' | 'VIDEO' | 'SOCIAL';
export type UGCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UGCSource = 'REVIEW' | 'GALLERY' | 'INSTAGRAM' | 'TIKTOK';

export interface UGCSubmission {
  userId: number;
  productId?: number;
  orderId?: number;
  type: UGCType;
  source: UGCSource;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  socialHandle?: string;
  socialPostUrl?: string;
}

export interface UGCModerationAction {
  contentId: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  moderatorId: number;
}

// ============================================================================
// Constants
// ============================================================================

export const MEDIA_LIMITS = {
  MAX_PHOTOS_PER_REVIEW: 5,
  MAX_VIDEO_LENGTH_SECONDS: 60,
  MAX_PHOTO_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 100,
};

export const ALLOWED_EXTENSIONS = {
  PHOTO: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
  VIDEO: ['mp4', 'mov', 'webm'],
};

// ============================================================================
// UGC Submission
// ============================================================================

/**
 * Submit user-generated content
 */
export async function submitUGC(submission: UGCSubmission) {
  const content = await prisma.userGeneratedContent.create({
    data: {
      userId: submission.userId,
      productId: submission.productId,
      orderId: submission.orderId,
      type: submission.type,
      source: submission.source,
      mediaUrl: submission.mediaUrl,
      thumbnailUrl: submission.thumbnailUrl,
      caption: submission.caption,
      socialHandle: submission.socialHandle,
      socialPostUrl: submission.socialPostUrl,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return content;
}

/**
 * Submit multiple photos for a review
 */
export async function submitReviewPhotos(
  userId: number,
  reviewId: string,
  productId: number,
  mediaUrls: string[]
) {
  if (mediaUrls.length > MEDIA_LIMITS.MAX_PHOTOS_PER_REVIEW) {
    throw new Error(
      `Maximum ${MEDIA_LIMITS.MAX_PHOTOS_PER_REVIEW} photos allowed per review`
    );
  }

  const submissions = await Promise.all(
    mediaUrls.map((url) =>
      prisma.userGeneratedContent.create({
        data: {
          userId,
          productId,
          reviewId,
          type: 'PHOTO',
          source: 'REVIEW',
          mediaUrl: url,
          status: 'PENDING',
        },
      })
    )
  );

  return submissions;
}

// ============================================================================
// UGC Retrieval
// ============================================================================

/**
 * Get UGC for a product
 */
export async function getProductUGC(
  productId: number,
  options?: {
    type?: UGCType;
    limit?: number;
    approvedOnly?: boolean;
  }
) {
  const where: any = {
    productId,
  };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.approvedOnly !== false) {
    where.status = 'APPROVED';
  }

  return prisma.userGeneratedContent.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
  });
}

/**
 * Get community gallery (all approved UGC)
 */
export async function getCommunityGallery(options?: {
  type?: UGCType;
  source?: UGCSource;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'APPROVED',
  };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.source) {
    where.source = options.source;
  }

  if (options?.featured) {
    where.featured = true;
  }

  const [content, total] = await Promise.all([
    prisma.userGeneratedContent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.userGeneratedContent.count({ where }),
  ]);

  return {
    content,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user's UGC submissions
 */
export async function getUserUGC(userId: number) {
  return prisma.userGeneratedContent.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// Social Media Integration
// ============================================================================

/**
 * Import content from social media (Instagram, TikTok)
 */
export async function importSocialContent(data: {
  platform: 'INSTAGRAM' | 'TIKTOK';
  postUrl: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  authorHandle: string;
  productId?: number;
}) {
  // Check if already imported
  const existing = await prisma.userGeneratedContent.findFirst({
    where: {
      socialPostUrl: data.postUrl,
    },
  });

  if (existing) {
    throw new Error('Content already imported');
  }

  return prisma.userGeneratedContent.create({
    data: {
      type: data.platform === 'TIKTOK' ? 'VIDEO' : 'PHOTO',
      source: data.platform,
      mediaUrl: data.mediaUrl,
      thumbnailUrl: data.thumbnailUrl,
      caption: data.caption,
      socialHandle: data.authorHandle,
      socialPostUrl: data.postUrl,
      productId: data.productId,
      status: 'PENDING',
    },
  });
}

/**
 * Get social media feed for display
 */
export async function getSocialMediaFeed(
  platform?: 'INSTAGRAM' | 'TIKTOK',
  limit: number = 12
) {
  const where: any = {
    status: 'APPROVED',
    source: { in: ['INSTAGRAM', 'TIKTOK'] },
  };

  if (platform) {
    where.source = platform;
  }

  return prisma.userGeneratedContent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// Moderation
// ============================================================================

/**
 * Get moderation queue
 */
export async function getModerationQueue(options?: {
  type?: UGCType;
  source?: UGCSource;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'PENDING',
  };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.source) {
    where.source = options.source;
  }

  const [content, total] = await Promise.all([
    prisma.userGeneratedContent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        product: true,
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.userGeneratedContent.count({ where }),
  ]);

  return {
    content,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Moderate content
 */
export async function moderateContent(action: UGCModerationAction) {
  const { contentId, action: moderationAction, reason, moderatorId } = action;

  const content = await prisma.userGeneratedContent.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  return prisma.userGeneratedContent.update({
    where: { id: contentId },
    data: {
      status: moderationAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      moderatedAt: new Date(),
      moderatorId,
      moderationReason: reason,
    },
  });
}

/**
 * Bulk moderate content
 */
export async function bulkModerate(
  contentIds: string[],
  action: 'APPROVE' | 'REJECT',
  moderatorId: number
) {
  return prisma.userGeneratedContent.updateMany({
    where: {
      id: { in: contentIds },
    },
    data: {
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      moderatedAt: new Date(),
      moderatorId,
    },
  });
}

/**
 * Feature/unfeature content
 */
export async function toggleFeatured(contentId: string, featured: boolean) {
  return prisma.userGeneratedContent.update({
    where: { id: contentId },
    data: { featured },
  });
}

// ============================================================================
// Prompts & Incentives
// ============================================================================

/**
 * Check if user should be prompted for UGC after purchase
 */
export async function shouldPromptForUGC(
  userId: number,
  orderId: number
): Promise<boolean> {
  // Check if order was delivered
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, createdAt: true },
  });

  if (!order || order.status !== 'DELIVERED') {
    return false;
  }

  // Check if enough time has passed (7 days)
  const daysSinceOrder = Math.floor(
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceOrder < 7) {
    return false;
  }

  // Check if user already submitted UGC for this order
  const existingUGC = await prisma.userGeneratedContent.findFirst({
    where: {
      userId,
      orderId,
    },
  });

  return !existingUGC;
}

/**
 * Get orders eligible for UGC prompt
 */
export async function getOrdersEligibleForUGCPrompt(userId: number) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get delivered orders from past 30 days
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: 'DELIVERED',
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Filter out orders with existing UGC
  const ordersWithoutUGC = [];
  for (const order of orders) {
    const hasUGC = await prisma.userGeneratedContent.findFirst({
      where: { orderId: order.id },
    });

    if (!hasUGC) {
      ordersWithoutUGC.push(order);
    }
  }

  return ordersWithoutUGC;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get UGC statistics
 */
export async function getUGCStats() {
  const [total, pending, approved, rejected, byType, bySource] =
    await Promise.all([
      prisma.userGeneratedContent.count(),
      prisma.userGeneratedContent.count({ where: { status: 'PENDING' } }),
      prisma.userGeneratedContent.count({ where: { status: 'APPROVED' } }),
      prisma.userGeneratedContent.count({ where: { status: 'REJECTED' } }),
      prisma.userGeneratedContent.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.userGeneratedContent.groupBy({
        by: ['source'],
        _count: true,
      }),
    ]);

  return {
    total,
    pending,
    approved,
    rejected,
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
    byType: byType.map((t) => ({ type: t.type, count: t._count })),
    bySource: bySource.map((s) => ({ source: s.source, count: s._count })),
  };
}
