/**
 * Product Customization Controller
 * 
 * DTC Feature: Product Customization
 * REST API endpoints for product customization
 */

import { NextFunction, Request, Response } from 'express';
import * as customizationService from '../services/customization.service';

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * GET /api/customization/products/:productId
 * Get customization options for a product
 */
export async function getProductCustomizations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const customizations = await customizationService.getProductCustomizations(productId);

    res.json({
      success: true,
      data: customizations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/customization/fonts
 * Get engraving font options
 */
export async function getEngravingFonts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const fonts = customizationService.getEngravingFonts();

    res.json({
      success: true,
      data: fonts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/customization/limits
 * Get customization limits
 */
export async function getCustomizationLimits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      success: true,
      data: customizationService.CUSTOMIZATION_LIMITS,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/customization/pricing
 * Get customization pricing
 */
export async function getCustomizationPricing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      success: true,
      data: customizationService.CUSTOMIZATION_PRICING,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/validate
 * Validate customization configuration
 */
export async function validateCustomization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, customizations } = req.body;

    if (!productId || !customizations) {
      return res.status(400).json({
        success: false,
        message: 'productId and customizations are required',
      });
    }

    const result = await customizationService.validateCustomization(
      productId,
      customizations
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/validate-engraving
 * Validate engraving text
 */
export async function validateEngraving(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { text, maxChars, maxLines } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    const result = customizationService.validateEngravingText(text, {
      maxChars,
      maxLines,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/validate-monogram
 * Validate monogram text
 */
export async function validateMonogram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    const result = customizationService.validateMonogramText(text);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/calculate-price
 * Calculate customization price
 */
export async function calculatePrice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, customizations, engraving, monogram } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    const price = await customizationService.calculateCustomizationPrice(
      productId,
      customizations || [],
      { engraving, monogram }
    );

    res.json({
      success: true,
      data: {
        customizationPrice: price,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/preview
 * Generate customization preview
 */
export async function generatePreview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, customizations } = req.body;

    if (!productId || !customizations) {
      return res.status(400).json({
        success: false,
        message: 'productId and customizations are required',
      });
    }

    const preview = await customizationService.generateCustomizationPreview(
      productId,
      customizations
    );

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * POST /api/customization/admin/products/:productId
 * Create product customization type
 */
export async function adminCreateCustomization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = parseInt(req.params.productId);
    const { type, name, description, required, allowMultiple, sortOrder } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: 'type and name are required',
      });
    }

    const customization = await customizationService.createProductCustomization({
      productId,
      type,
      name,
      description,
      required: required || false,
      allowMultiple: allowMultiple || false,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Customization type created',
      data: customization,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/customization/admin/options
 * Add customization option
 */
export async function adminAddOption(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { customizationId, name, value, priceModifier, image, sortOrder } = req.body;

    if (!customizationId || !name || !value) {
      return res.status(400).json({
        success: false,
        message: 'customizationId, name, and value are required',
      });
    }

    const option = await customizationService.addCustomizationOption({
      customizationId,
      name,
      value,
      priceModifier: priceModifier || 0,
      image,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Option added',
      data: option,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/customization/admin/options/:optionId
 * Update customization option
 */
export async function adminUpdateOption(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { optionId } = req.params;
    const option = await customizationService.updateCustomizationOption(
      optionId,
      req.body
    );

    res.json({
      success: true,
      message: 'Option updated',
      data: option,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/customization/admin/stats
 * Get customization statistics
 */
export async function adminGetStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await customizationService.getCustomizationStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
