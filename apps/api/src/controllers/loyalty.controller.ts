/**
 * Loyalty Controller
 * 
 * DTC Feature 6.1: Loyalty Points / Rewards
 * REST API endpoints for loyalty program
 */

import { NextFunction, Request, Response } from 'express';
import * as loyaltyService from '../services/loyalty.service';

// ============================================================================
// Account Endpoints
// ============================================================================

/**
 * GET /api/loyalty/account
 * Get current user's loyalty account
 */
export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const account = await loyaltyService.getOrCreateLoyaltyAccount(userId);

    const expiringPoints = await loyaltyService.getExpiringPoints(userId);
    const tierProgress = loyaltyService.getTierProgress(
      account.currentTier,
      Number(account.lifetimeSpend)
    );
    const tierBenefits = loyaltyService.getTierBenefits(account.currentTier);

    res.json({
      success: true,
      data: {
        ...account,
        pointsExpiringSoon: expiringPoints.points,
        pointsExpiringDate: expiringPoints.expirationDate,
        tierProgress,
        tierBenefits,
        redemptionValue: loyaltyService.calculateRedemptionValue(account.availablePoints),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/loyalty/history
 * Get points transaction history
 */
export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await loyaltyService.getPointsHistory(userId, page, limit);

    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Points Endpoints
// ============================================================================

/**
 * POST /api/loyalty/redeem
 * Redeem points for discount
 */
export async function redeemPoints(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { points, orderId } = req.body;

    if (!points || points < loyaltyService.MIN_REDEMPTION_POINTS) {
      return res.status(400).json({
        success: false,
        message: `Minimum redemption is ${loyaltyService.MIN_REDEMPTION_POINTS} points`,
      });
    }

    const result = await loyaltyService.redeemPoints(userId, points, orderId);

    res.json({
      success: true,
      message: `Successfully redeemed ${points} points for $${result.dollarValue} discount`,
      data: {
        transaction: result.transaction,
        dollarValue: result.dollarValue,
        remainingPoints: result.account.availablePoints,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/loyalty/calculate-redemption
 * Calculate redemption value for given points
 */
export async function calculateRedemption(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const points = parseInt(req.query.points as string) || 0;
    const dollarValue = loyaltyService.calculateRedemptionValue(points);

    res.json({
      success: true,
      data: {
        points,
        dollarValue,
        minimumRedemption: loyaltyService.MIN_REDEMPTION_POINTS,
        pointsPerDollar: loyaltyService.POINTS_TO_DOLLAR_VALUE / 5,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Tier Endpoints
// ============================================================================

/**
 * GET /api/loyalty/tiers
 * Get all tier information
 */
export async function getTiers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tiers = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM'] as const;

    const tierData = tiers.map((tier) => ({
      name: tier,
      ...loyaltyService.TIER_CONFIG[tier],
      benefits: loyaltyService.getTierBenefits(tier),
    }));

    res.json({
      success: true,
      data: tierData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/loyalty/earn-opportunities
 * Get ways to earn points
 */
export async function getEarnOpportunities(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const opportunities = Object.entries(loyaltyService.EARN_ACTIONS).map(
      ([action, config]) => ({
        id: action.toLowerCase(),
        action: config.description,
        points: config.points,
        description: getActionDescription(action),
      })
    );

    res.json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
}

function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    PURCHASE: 'Earn 1 point for every $1 spent',
    REVIEW: 'Share your thoughts on a product',
    REFERRAL: 'Get points when they make their first purchase',
    BIRTHDAY: 'Celebrate with bonus points on your birthday',
    FIRST_PURCHASE: 'Welcome bonus on your first order',
    SIGNUP: 'Join our loyalty program',
  };
  return descriptions[action] || '';
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * POST /api/loyalty/admin/adjust
 * Admin: Adjust user points
 */
export async function adminAdjustPoints(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.id;
    const { userId, points, reason } = req.body;

    if (!userId || points === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'userId, points, and reason are required',
      });
    }

    const result = await loyaltyService.adjustPoints(
      userId,
      points,
      reason,
      adminId
    );

    res.json({
      success: true,
      message: `Adjusted ${points} points for user ${userId}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/loyalty/admin/process-expirations
 * Admin: Process expired points (should be run as cron job)
 */
export async function adminProcessExpirations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await loyaltyService.processExpiredPoints();

    res.json({
      success: true,
      message: `Processed expirations for ${result.processedAccounts} accounts`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/loyalty/admin/award-birthday
 * Admin: Award birthday bonus to user
 */
export async function adminAwardBirthday(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const result = await loyaltyService.awardBirthdayBonus(userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Birthday bonus already awarded this year',
      });
    }

    res.json({
      success: true,
      message: 'Birthday bonus awarded',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
