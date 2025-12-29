/**
 * Subscription Controller
 * 
 * DTC Feature 5.2: Subscription Model
 * REST API endpoints for subscription management
 */

import { NextFunction, Request, Response } from 'express';
import * as subscriptionService from '../services/subscription.service';

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * GET /api/subscriptions/frequencies
 * Get available subscription frequencies
 */
export async function getFrequencies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const frequencies = subscriptionService.getFrequencyOptions();

    res.json({
      success: true,
      data: frequencies,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/calculate-savings
 * Calculate subscription savings
 */
export async function calculateSavings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { regularPrice, quantity } = req.body;

    if (!regularPrice) {
      return res.status(400).json({
        success: false,
        message: 'regularPrice is required',
      });
    }

    const savings = subscriptionService.calculateSubscriptionSavings(
      regularPrice,
      quantity
    );

    res.json({
      success: true,
      data: savings,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// User Subscription Endpoints
// ============================================================================

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export async function createSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const {
      items,
      frequency,
      startDate,
      shippingAddressId,
      paymentMethodId,
    } = req.body;

    if (!items || !items.length || !frequency || !shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: 'items, frequency, and shippingAddressId are required',
      });
    }

    const subscription = await subscriptionService.createSubscription({
      userId,
      items,
      frequency,
      startDate: startDate ? new Date(startDate) : undefined,
      shippingAddressId,
      paymentMethodId,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/subscriptions
 * Get user's subscriptions
 */
export async function getUserSubscriptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const subscriptions = await subscriptionService.getUserSubscriptions(userId);

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/subscriptions/:subscriptionId
 * Get subscription details
 */
export async function getSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;
    const subscription = await subscriptionService.getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Ensure user owns this subscription
    if (subscription.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/subscriptions/:subscriptionId
 * Update subscription
 */
export async function updateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;
    const { frequency, items, shippingAddressId, nextBillingDate } = req.body;

    // Verify ownership
    const existing = await subscriptionService.getSubscription(subscriptionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const subscription = await subscriptionService.updateSubscription(
      subscriptionId,
      {
        frequency,
        items,
        shippingAddressId,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : undefined,
      }
    );

    res.json({
      success: true,
      message: 'Subscription updated',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/:subscriptionId/pause
 * Pause subscription
 */
export async function pauseSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;
    const { resumeDate } = req.body;

    // Verify ownership
    const existing = await subscriptionService.getSubscription(subscriptionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (existing.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Can only pause active subscriptions',
      });
    }

    const subscription = await subscriptionService.pauseSubscription(
      subscriptionId,
      resumeDate ? new Date(resumeDate) : undefined
    );

    res.json({
      success: true,
      message: 'Subscription paused',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/:subscriptionId/resume
 * Resume subscription
 */
export async function resumeSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;

    // Verify ownership
    const existing = await subscriptionService.getSubscription(subscriptionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (existing.status !== 'PAUSED') {
      return res.status(400).json({
        success: false,
        message: 'Can only resume paused subscriptions',
      });
    }

    const subscription = await subscriptionService.resumeSubscription(subscriptionId);

    res.json({
      success: true,
      message: 'Subscription resumed',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/:subscriptionId/skip
 * Skip next delivery
 */
export async function skipDelivery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;

    // Verify ownership
    const existing = await subscriptionService.getSubscription(subscriptionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (existing.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Can only skip active subscriptions',
      });
    }

    const subscription = await subscriptionService.skipNextDelivery(subscriptionId);

    res.json({
      success: true,
      message: 'Next delivery skipped',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/subscriptions/:subscriptionId
 * Cancel subscription
 */
export async function cancelSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    // Verify ownership
    const existing = await subscriptionService.getSubscription(subscriptionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    if (existing.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (existing.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Subscription already cancelled',
      });
    }

    const subscription = await subscriptionService.cancelSubscription(
      subscriptionId,
      reason
    );

    res.json({
      success: true,
      message: 'Subscription cancelled',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * GET /api/subscriptions/admin/stats
 * Get subscription statistics
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await subscriptionService.getSubscriptionStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/admin/process
 * Process due subscriptions (manual trigger)
 */
export async function processDueSubscriptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const results = await subscriptionService.processDueSubscriptions();

    res.json({
      success: true,
      message: `Processed ${results.processed} subscriptions`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}
