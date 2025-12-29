/**
 * Referral Controller
 * 
 * DTC Feature 6.2: Referral Program
 * REST API endpoints for referral program
 */

import { NextFunction, Request, Response } from 'express';
import * as referralService from '../services/referral.service';

// ============================================================================
// Account Endpoints
// ============================================================================

/**
 * GET /api/referrals/account
 * Get current user's referral account
 */
export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const account = await referralService.getOrCreateReferralAccount(userId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      data: {
        ...account,
        referralLink: referralService.generateReferralLink(
          account.referralCode,
          baseUrl
        ),
        rewards: {
          referrer: referralService.REFERRER_REWARD,
          referee: referralService.REFEREE_REWARD,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/referrals/stats
 * Get referral stats
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const stats = await referralService.getReferralStats(userId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Referral account not found',
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/referrals/history
 * Get referral history
 */
export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const account = await referralService.getReferralAccount(userId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Referral account not found',
      });
    }

    res.json({
      success: true,
      data: account.referrals,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Invite Endpoints
// ============================================================================

/**
 * POST /api/referrals/invite
 * Send referral invites by email
 */
export async function sendInvites(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'emails array is required',
      });
    }

    // TODO: Integrate with email service
    const results = await referralService.sendReferralInvites(userId, emails);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    res.json({
      success: true,
      message: `Sent ${successful} invite(s), ${failed} failed`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/referrals/resend/:referralId
 * Resend invite for a specific referral
 */
export async function resendInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const referralId = parseInt(req.params.referralId);

    // TODO: Integrate with email service
    const referral = await referralService.resendReferralInvite(referralId);

    res.json({
      success: true,
      message: `Invite resent to ${referral.refereeEmail}`,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Validation Endpoints
// ============================================================================

/**
 * GET /api/referrals/validate/:code
 * Validate a referral code
 */
export async function validateCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { code } = req.params;
    const result = await referralService.validateReferralCode(code);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        referrerName: result.referrerName,
        discount: result.refereeReward,
        message: `You'll get $${result.refereeReward} off your first order!`,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/referrals/apply
 * Apply referral code (for new users during signup)
 */
export async function applyCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        message: 'code and email are required',
      });
    }

    const validation = await referralService.validateReferralCode(code);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const referral = await referralService.createReferral(code, email);

    res.json({
      success: true,
      message: 'Referral code applied successfully',
      data: {
        referralId: referral.id,
        discount: referralService.REFEREE_REWARD,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Leaderboard Endpoints
// ============================================================================

/**
 * GET /api/referrals/leaderboard
 * Get referral leaderboard
 */
export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const period = (req.query.period as 'week' | 'month' | 'all-time') || 'month';
    const limit = parseInt(req.query.limit as string) || 10;

    const leaderboard = await referralService.getReferralLeaderboard(period, limit);

    // Mark current user if authenticated
    const userId = req.user?.id;
    const leaderboardWithUser = leaderboard.map((entry) => ({
      ...entry,
      isCurrentUser: userId === entry.userId,
    }));

    res.json({
      success: true,
      data: leaderboardWithUser,
      period,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Webhook Endpoints (for internal use)
// ============================================================================

/**
 * POST /api/referrals/webhook/signup
 * Called when a referred user signs up
 */
export async function handleSignup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, userId } = req.body;

    const referral = await referralService.markRefereeSignedUp(email, userId);

    if (!referral) {
      return res.json({
        success: true,
        message: 'No referral found for this email',
        referred: false,
      });
    }

    res.json({
      success: true,
      message: 'Referral status updated to signed_up',
      referred: true,
      referralId: referral.id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/referrals/webhook/purchase
 * Called when a referred user makes first purchase
 */
export async function handlePurchase(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, orderId } = req.body;

    const discount = await referralService.applyReferralToOrder(userId, orderId);

    res.json({
      success: true,
      discount,
      message: discount > 0 ? 'Referral discount applied' : 'No referral discount',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * POST /api/referrals/admin/process-reward/:referralId
 * Process reward for a referral
 */
export async function adminProcessReward(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const referralId = parseInt(req.params.referralId);

    const referral = await referralService.processReferralReward(referralId);

    res.json({
      success: true,
      message: 'Referral reward processed',
      data: referral,
    });
  } catch (error) {
    next(error);
  }
}
