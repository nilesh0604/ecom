/**
 * Trade-In Controller
 * 
 * DTC Feature 6.4: Trade-In Program
 * REST API endpoints for trade-in program
 */

import { NextFunction, Request, Response } from 'express';
import * as tradeinService from '../services/tradein.service';

// ============================================================================
// Product Endpoints
// ============================================================================

/**
 * GET /api/trade-in/products
 * Get all trade-in eligible products
 */
export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category } = req.query;
    const products = await tradeinService.getTradeInProducts(
      category as string | undefined
    );

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trade-in/products/:productId
 * Get specific trade-in product
 */
export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const product = await tradeinService.getTradeInProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Estimation Endpoints
// ============================================================================

/**
 * GET /api/trade-in/questions
 * Get condition assessment questions
 */
export async function getQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const questions = tradeinService.getConditionQuestions();

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/trade-in/estimate
 * Calculate trade-in estimate
 */
export async function getEstimate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, conditionAnswers } = req.body;

    if (!productId || !conditionAnswers) {
      return res.status(400).json({
        success: false,
        message: 'productId and conditionAnswers are required',
      });
    }

    const product = await tradeinService.getTradeInProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const estimate = tradeinService.calculateEstimate(
      Number(product.maxValue),
      conditionAnswers
    );

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + tradeinService.ESTIMATE_VALIDITY_DAYS
    );

    res.json({
      success: true,
      data: {
        product,
        ...estimate,
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trade-in/quick-estimate
 * Quick estimate based on condition only
 */
export async function getQuickEstimate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.query.productId as string);
    const condition = req.query.condition as string;

    if (!productId || !condition) {
      return res.status(400).json({
        success: false,
        message: 'productId and condition are required',
      });
    }

    const validConditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
    if (!validConditions.includes(condition.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid condition. Must be EXCELLENT, GOOD, FAIR, or POOR',
      });
    }

    const estimate = await tradeinService.getQuickEstimate(
      productId,
      condition.toUpperCase() as any
    );

    res.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Trade-In Request Endpoints
// ============================================================================

/**
 * POST /api/trade-in/requests
 * Create a new trade-in request
 */
export async function createRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { productId, conditionAnswers, shippingName, shippingEmail, shippingAddress } =
      req.body;

    if (!productId || !conditionAnswers) {
      return res.status(400).json({
        success: false,
        message: 'productId and conditionAnswers are required',
      });
    }

    const result = await tradeinService.createTradeInRequest({
      userId,
      productId,
      conditionAnswers,
      shippingName,
      shippingEmail,
      shippingAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Trade-in request created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trade-in/requests
 * Get user's trade-in requests
 */
export async function getUserRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const requests = await tradeinService.getUserTradeInRequests(userId);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trade-in/requests/:requestId
 * Get specific trade-in request
 */
export async function getRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const request = await tradeinService.getTradeInRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Trade-in request not found',
      });
    }

    // Ensure user owns this request or is admin
    if (request.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/requests/:requestId/ship
 * User marks request as shipped
 */
export async function markShipped(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { trackingNumber } = req.body;

    const request = await tradeinService.getTradeInRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Trade-in request not found',
      });
    }

    if (request.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Can only mark approved requests as shipped',
      });
    }

    const updated = await tradeinService.markAsShipped(requestId, trackingNumber);

    res.json({
      success: true,
      message: 'Trade-in marked as shipped',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * GET /api/trade-in/admin/requests
 * Get all trade-in requests (admin)
 */
export async function adminGetRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, page, limit } = req.query;

    const result = await tradeinService.getAllTradeInRequests({
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trade-in/admin/stats
 * Get trade-in stats (admin)
 */
export async function adminGetStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await tradeinService.getTradeInStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/requests/:requestId/approve
 * Approve trade-in request
 */
export async function adminApprove(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { shippingLabel } = req.body;

    if (!shippingLabel) {
      return res.status(400).json({
        success: false,
        message: 'shippingLabel is required',
      });
    }

    const request = await tradeinService.approveTradeIn(requestId, shippingLabel);

    res.json({
      success: true,
      message: 'Trade-in approved',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/requests/:requestId/receive
 * Mark trade-in as received
 */
export async function adminReceive(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const request = await tradeinService.markAsReceived(requestId);

    res.json({
      success: true,
      message: 'Trade-in marked as received',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/requests/:requestId/inspect
 * Complete inspection
 */
export async function adminInspect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { finalValue, notes } = req.body;

    if (finalValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'finalValue is required',
      });
    }

    const request = await tradeinService.completeInspection(
      requestId,
      finalValue,
      notes
    );

    res.json({
      success: true,
      message: 'Inspection completed',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/requests/:requestId/complete
 * Complete trade-in and apply credit
 */
export async function adminComplete(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const request = await tradeinService.completeTradeIn(requestId);

    res.json({
      success: true,
      message: 'Trade-in completed, credit applied',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/requests/:requestId/reject
 * Reject trade-in request
 */
export async function adminReject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'reason is required',
      });
    }

    const request = await tradeinService.rejectTradeIn(requestId, reason);

    res.json({
      success: true,
      message: 'Trade-in rejected',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/trade-in/admin/products
 * Create trade-in product
 */
export async function adminCreateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, image, category, baseValue, maxValue } = req.body;

    if (!name || !image || !category || !baseValue || !maxValue) {
      return res.status(400).json({
        success: false,
        message: 'name, image, category, baseValue, and maxValue are required',
      });
    }

    const product = await tradeinService.createTradeInProduct({
      name,
      image,
      category,
      baseValue,
      maxValue,
    });

    res.status(201).json({
      success: true,
      message: 'Trade-in product created',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/trade-in/admin/products/:productId
 * Update trade-in product
 */
export async function adminUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const product = await tradeinService.updateTradeInProduct(productId, req.body);

    res.json({
      success: true,
      message: 'Trade-in product updated',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
