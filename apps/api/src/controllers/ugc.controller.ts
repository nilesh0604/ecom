/**
 * User-Generated Content (UGC) Controller
 * 
 * DTC Feature 6.5: User-Generated Content
 * REST API endpoints for UGC management
 */

import { NextFunction, Request, Response } from 'express';
import * as ugcService from '../services/ugc.service';

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * GET /api/ugc/products/:productId
 * Get UGC for a product
 */
export async function getProductUGC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const { type, limit } = req.query;

    const content = await ugcService.getProductUGC(productId, {
      type: type as any,
      limit: limit ? parseInt(limit as string) : undefined,
      approvedOnly: true,
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/gallery
 * Get community gallery
 */
export async function getCommunityGallery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type, source, page, limit, featured } = req.query;

    const result = await ugcService.getCommunityGallery({
      type: type as any,
      source: source as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      featured: featured === 'true',
    });

    res.json({
      success: true,
      data: result.content,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/social
 * Get social media feed
 */
export async function getSocialFeed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { platform, limit } = req.query;

    const feed = await ugcService.getSocialMediaFeed(
      platform as any,
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: feed,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/limits
 * Get media upload limits
 */
export async function getMediaLimits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      success: true,
      data: {
        limits: ugcService.MEDIA_LIMITS,
        allowedExtensions: ugcService.ALLOWED_EXTENSIONS,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Authenticated Endpoints
// ============================================================================

/**
 * POST /api/ugc
 * Submit UGC
 */
export async function submitUGC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const {
      productId,
      orderId,
      type,
      source,
      mediaUrl,
      thumbnailUrl,
      caption,
      socialHandle,
      socialPostUrl,
    } = req.body;

    if (!type || !source || !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'type, source, and mediaUrl are required',
      });
    }

    const content = await ugcService.submitUGC({
      userId,
      productId,
      orderId,
      type,
      source,
      mediaUrl,
      thumbnailUrl,
      caption,
      socialHandle,
      socialPostUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Content submitted for review',
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ugc/review-photos
 * Submit photos for a review
 */
export async function submitReviewPhotos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { reviewId, productId, mediaUrls } = req.body;

    if (!reviewId || !productId || !mediaUrls || !mediaUrls.length) {
      return res.status(400).json({
        success: false,
        message: 'reviewId, productId, and mediaUrls are required',
      });
    }

    const photos = await ugcService.submitReviewPhotos(
      userId,
      reviewId,
      productId,
      mediaUrls
    );

    res.status(201).json({
      success: true,
      message: 'Photos submitted for review',
      data: photos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/my-content
 * Get user's UGC submissions
 */
export async function getMyUGC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const content = await ugcService.getUserUGC(userId);

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/prompt-eligible
 * Get orders eligible for UGC prompt
 */
export async function getPromptEligibleOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const orders = await ugcService.getOrdersEligibleForUGCPrompt(userId);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * GET /api/ugc/admin/queue
 * Get moderation queue
 */
export async function getModerationQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type, source, page, limit } = req.query;

    const result = await ugcService.getModerationQueue({
      type: type as any,
      source: source as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.content,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ugc/admin/moderate/:contentId
 * Moderate content
 */
export async function moderateContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moderatorId = req.user!.id;
    const { contentId } = req.params;
    const { action, reason } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action must be APPROVE or REJECT',
      });
    }

    const content = await ugcService.moderateContent({
      contentId,
      action,
      reason,
      moderatorId,
    });

    res.json({
      success: true,
      message: `Content ${action.toLowerCase()}d`,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ugc/admin/bulk-moderate
 * Bulk moderate content
 */
export async function bulkModerate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moderatorId = req.user!.id;
    const { contentIds, action } = req.body;

    if (!contentIds || !contentIds.length || !action) {
      return res.status(400).json({
        success: false,
        message: 'contentIds and action are required',
      });
    }

    const result = await ugcService.bulkModerate(contentIds, action, moderatorId);

    res.json({
      success: true,
      message: `${result.count} items ${action.toLowerCase()}d`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/ugc/admin/:contentId/feature
 * Toggle featured status
 */
export async function toggleFeatured(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { contentId } = req.params;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'featured must be a boolean',
      });
    }

    const content = await ugcService.toggleFeatured(contentId, featured);

    res.json({
      success: true,
      message: featured ? 'Content featured' : 'Content unfeatured',
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ugc/admin/import-social
 * Import social media content
 */
export async function importSocialContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      platform,
      postUrl,
      mediaUrl,
      thumbnailUrl,
      caption,
      authorHandle,
      productId,
    } = req.body;

    if (!platform || !postUrl || !mediaUrl || !authorHandle) {
      return res.status(400).json({
        success: false,
        message: 'platform, postUrl, mediaUrl, and authorHandle are required',
      });
    }

    const content = await ugcService.importSocialContent({
      platform,
      postUrl,
      mediaUrl,
      thumbnailUrl,
      caption,
      authorHandle,
      productId,
    });

    res.status(201).json({
      success: true,
      message: 'Content imported',
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ugc/admin/stats
 * Get UGC statistics
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await ugcService.getUGCStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
