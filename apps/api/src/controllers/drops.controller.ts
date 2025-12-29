/**
 * Limited Drops Controller
 * 
 * DTC Feature 6.3: Limited Drops/Releases
 * REST API endpoints for product drops and draws
 */

import { NextFunction, Request, Response } from 'express';
import * as dropsService from '../services/drops.service';

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * GET /api/drops
 * Get all drops
 */
export async function getDrops(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, type, upcoming, limit } = req.query;

    const drops = await dropsService.getDrops({
      status: status as any,
      type: type as any,
      upcoming: upcoming === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: drops,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/calendar
 * Get drop calendar
 */
export async function getDropCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const daysAhead = req.query.days
      ? parseInt(req.query.days as string)
      : 30;

    const calendar = await dropsService.getDropCalendar(daysAhead);

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/:dropId
 * Get drop details
 */
export async function getDrop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const drop = await dropsService.getDrop(dropId);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found',
      });
    }

    // Add countdown
    const countdown = dropsService.calculateCountdown(drop.startTime);

    res.json({
      success: true,
      data: {
        ...drop,
        countdown,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/:dropId/access
 * Check user access to drop
 */
export async function checkAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const userId = req.user?.id;

    const access = await dropsService.checkDropAccess(dropId, userId);

    res.json({
      success: true,
      data: access,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/:dropId/countdown
 * Get countdown to drop
 */
export async function getCountdown(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const drop = await dropsService.getDrop(dropId);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found',
      });
    }

    const countdown = dropsService.calculateCountdown(drop.startTime);

    res.json({
      success: true,
      data: countdown,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Draw Endpoints
// ============================================================================

/**
 * POST /api/drops/:dropId/enter
 * Enter a draw
 */
export async function enterDraw(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { dropId } = req.params;
    const { productId, sizeVariantId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    const entry = await dropsService.enterDraw({
      userId,
      dropId,
      productId,
      sizeVariantId,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully entered the draw',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/entries
 * Get user's draw entries
 */
export async function getUserEntries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const entries = await dropsService.getUserDrawEntries(userId);

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/:dropId/result
 * Get draw result for user
 */
export async function getDrawResult(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { dropId } = req.params;

    const result = await dropsService.getDrawResult(userId, dropId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No entry found for this draw',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Notification Endpoints
// ============================================================================

/**
 * POST /api/drops/:dropId/notify
 * Subscribe to drop notifications
 */
export async function subscribeToNotification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { dropId } = req.params;

    await dropsService.subscribeToDropNotification(userId, dropId);

    res.json({
      success: true,
      message: 'You will be notified when this drop goes live',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/drops/:dropId/notify
 * Unsubscribe from drop notifications
 */
export async function unsubscribeFromNotification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { dropId } = req.params;

    await dropsService.unsubscribeFromDropNotification(userId, dropId);

    res.json({
      success: true,
      message: 'Notification unsubscribed',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * POST /api/drops
 * Create a new drop
 */
export async function createDrop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      name,
      description,
      type,
      products,
      startTime,
      endTime,
      earlyAccessStart,
      memberOnly,
      notifySubscribers,
      heroImage,
      teaser,
    } = req.body;

    if (!name || !type || !products || !startTime || !heroImage) {
      return res.status(400).json({
        success: false,
        message: 'name, type, products, startTime, and heroImage are required',
      });
    }

    const drop = await dropsService.createDrop({
      name,
      description,
      type,
      products,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      earlyAccessStart: earlyAccessStart ? new Date(earlyAccessStart) : undefined,
      memberOnly: memberOnly || false,
      notifySubscribers: notifySubscribers || true,
      heroImage,
      teaser,
    });

    res.status(201).json({
      success: true,
      message: 'Drop created',
      data: drop,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/drops/:dropId/status
 * Update drop status
 */
export async function updateDropStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const drop = await dropsService.updateDropStatus(dropId);

    res.json({
      success: true,
      data: drop,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/drops/:dropId/run-draw
 * Run draw selection
 */
export async function runDraw(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const results = await dropsService.runDrawSelection(dropId);

    res.json({
      success: true,
      message: `Draw completed. ${results.selected} winners selected.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/drops/:dropId/send-notifications
 * Send notifications to subscribers
 */
export async function sendNotifications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { dropId } = req.params;
    const subscribers = await dropsService.getDropNotificationSubscribers(dropId);

    // In a real implementation, send emails here
    await dropsService.markNotificationsSent(dropId);

    res.json({
      success: true,
      message: `Notifications sent to ${subscribers.length} subscribers`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/drops/admin/stats
 * Get drop statistics
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await dropsService.getDropStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
