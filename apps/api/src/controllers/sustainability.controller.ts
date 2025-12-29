/**
 * Sustainability Controller
 * 
 * DTC Feature 5.7: Sustainability Features
 * REST API endpoints for sustainability features
 */

import { NextFunction, Request, Response } from 'express';
import * as sustainabilityService from '../services/sustainability.service';

// ============================================================================
// Carbon Offset Endpoints
// ============================================================================

/**
 * GET /api/sustainability/projects
 * Get all carbon offset projects
 */
export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projects = sustainabilityService.getCarbonProjects();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/projects/:projectId
 * Get specific carbon project
 */
export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const project = sustainabilityService.getCarbonProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/sustainability/projects/:projectId/calculate
 * Calculate offset price
 */
export async function calculateOffset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const { tonsCO2 } = req.body;

    if (!tonsCO2 || tonsCO2 <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid tonsCO2 is required',
      });
    }

    const result = sustainabilityService.calculateOffsetPrice(projectId, tonsCO2);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
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

/**
 * POST /api/sustainability/offsets
 * Purchase carbon offset
 */
export async function purchaseOffset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { projectId, tonsCO2, orderId } = req.body;

    if (!projectId || !tonsCO2) {
      return res.status(400).json({
        success: false,
        message: 'projectId and tonsCO2 are required',
      });
    }

    const offset = await sustainabilityService.purchaseCarbonOffset(
      userId,
      projectId,
      tonsCO2,
      orderId
    );

    res.status(201).json({
      success: true,
      message: 'Carbon offset purchased successfully',
      data: offset,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/offsets
 * Get user's carbon offset history
 */
export async function getUserOffsets(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const offsets = await sustainabilityService.getUserCarbonOffsets(userId);

    res.json({
      success: true,
      data: offsets,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Impact Tracking Endpoints
// ============================================================================

/**
 * GET /api/sustainability/impact
 * Get user's impact dashboard
 */
export async function getImpact(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const impact = await sustainabilityService.getUserImpactDashboard(userId);

    res.json({
      success: true,
      data: impact,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/stats
 * Get global sustainability stats (public)
 */
export async function getGlobalStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await sustainabilityService.getGlobalStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Milestones Endpoints
// ============================================================================

/**
 * GET /api/sustainability/milestones
 * Get all available milestones
 */
export async function getMilestones(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const milestones = sustainabilityService.getAllMilestones();

    res.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/milestones/user
 * Get user's achieved milestones
 */
export async function getUserMilestones(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const milestones = await sustainabilityService.getUserMilestones(userId);

    res.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Repair Program Endpoints
// ============================================================================

/**
 * POST /api/sustainability/repairs
 * Create repair request
 */
export async function createRepairRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { productName, purchaseDate, issueDescription, preferredContactMethod, contactInfo } =
      req.body;

    if (!productName || !issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'productName and issueDescription are required',
      });
    }

    const repair = await sustainabilityService.createRepairRequest({
      userId,
      productName,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      issueDescription,
      preferredContactMethod: preferredContactMethod || 'EMAIL',
      contactInfo: contactInfo || req.user!.email,
    });

    res.status(201).json({
      success: true,
      message: 'Repair request created',
      data: repair,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/repairs
 * Get user's repair requests
 */
export async function getUserRepairs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const repairs = await sustainabilityService.getUserRepairRequests(userId);

    res.json({
      success: true,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/repairs/:requestId
 * Get specific repair request
 */
export async function getRepair(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const repair = await sustainabilityService.getRepairRequest(requestId);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found',
      });
    }

    // Ensure user owns this request or is admin
    if (repair.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Pledge Endpoints
// ============================================================================

/**
 * POST /api/sustainability/pledge
 * Take sustainability pledge
 */
export async function takePledge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    await sustainabilityService.takePledge(userId);

    res.json({
      success: true,
      message: 'Thank you for taking the sustainability pledge!',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/pledge
 * Check if user has taken pledge
 */
export async function getPledgeStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const hasPledge = await sustainabilityService.hasTakenPledge(userId);

    res.json({
      success: true,
      data: { hasTakenPledge: hasPledge },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Product Sustainability Endpoints
// ============================================================================

/**
 * GET /api/sustainability/products/:productId
 * Get product sustainability info
 */
export async function getProductSustainability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const info = await sustainabilityService.getProductSustainability(productId);

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Product sustainability info not found',
      });
    }

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sustainability/products
 * Get sustainable products
 */
export async function getSustainableProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const minLevel = (req.query.minLevel as string) || 'GOOD';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const products = await sustainabilityService.getSustainableProducts(
      minLevel,
      limit
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
 * POST /api/sustainability/estimate-footprint
 * Estimate order carbon footprint
 */
export async function estimateFootprint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { shippingDistance, productWeight, packagingType } = req.body;

    if (!shippingDistance || !productWeight) {
      return res.status(400).json({
        success: false,
        message: 'shippingDistance and productWeight are required',
      });
    }

    const footprint = sustainabilityService.estimateOrderCarbonFootprint(
      shippingDistance,
      productWeight,
      packagingType
    );

    res.json({
      success: true,
      data: {
        estimatedCO2Kg: footprint,
        offsetCost: (footprint / 1000) * 12, // $12 per ton average
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * GET /api/sustainability/admin/repairs
 * Get all repair requests (admin)
 */
export async function adminGetRepairs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, page, limit } = req.query;

    const result = await sustainabilityService.getAllRepairRequests({
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
 * PATCH /api/sustainability/admin/repairs/:requestId
 * Update repair request status
 */
export async function adminUpdateRepair(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { status, estimatedCost, diagnosis, repairNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    const validStatuses = [
      'SUBMITTED',
      'REVIEWING',
      'APPROVED',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const repair = await sustainabilityService.updateRepairStatus(
      requestId,
      status,
      {
        estimatedCost,
        diagnosis,
        repairNotes,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      }
    );

    res.json({
      success: true,
      message: 'Repair request updated',
      data: repair,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/sustainability/admin/products/:productId
 * Set product sustainability info (admin)
 */
export async function adminSetProductSustainability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const {
      sustainabilityLevel,
      carbonFootprint,
      recyclablePercentage,
      ecoAttributes,
      sustainabilityDescription,
    } = req.body;

    if (!sustainabilityLevel) {
      return res.status(400).json({
        success: false,
        message: 'sustainabilityLevel is required',
      });
    }

    const info = await sustainabilityService.setProductSustainability(productId, {
      sustainabilityLevel,
      carbonFootprint,
      recyclablePercentage,
      ecoAttributes,
      sustainabilityDescription,
    });

    res.json({
      success: true,
      message: 'Product sustainability info updated',
      data: info,
    });
  } catch (error) {
    next(error);
  }
}
