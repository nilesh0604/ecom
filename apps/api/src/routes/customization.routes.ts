/**
 * Product Customization Routes
 * 
 * DTC Feature: Product Customization
 * Route definitions for customization endpoints
 */

import { Router } from 'express';
import * as customizationController from '../controllers/customization.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get product customizations
router.get('/products/:productId', customizationController.getProductCustomizations);

// Get engraving fonts
router.get('/fonts', customizationController.getEngravingFonts);

// Get customization limits
router.get('/limits', customizationController.getCustomizationLimits);

// Get customization pricing
router.get('/pricing', customizationController.getCustomizationPricing);

// Validate customization
router.post('/validate', customizationController.validateCustomization);

// Validate engraving text
router.post('/validate-engraving', customizationController.validateEngraving);

// Validate monogram text
router.post('/validate-monogram', customizationController.validateMonogram);

// Calculate customization price
router.post('/calculate-price', customizationController.calculatePrice);

// Generate preview
router.post('/preview', customizationController.generatePreview);

// ============================================================================
// Admin Routes
// ============================================================================

router.post(
  '/admin/products/:productId',
  authenticate,
  authorize('admin'),
  customizationController.adminCreateCustomization
);

router.post(
  '/admin/options',
  authenticate,
  authorize('admin'),
  customizationController.adminAddOption
);

router.patch(
  '/admin/options/:optionId',
  authenticate,
  authorize('admin'),
  customizationController.adminUpdateOption
);

router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  customizationController.adminGetStats
);

export default router;
