/**
 * Sustainability Routes
 * 
 * DTC Feature 5.7: Sustainability Features
 * Route definitions for sustainability endpoints
 */

import { Router } from 'express';
import * as sustainabilityController from '../controllers/sustainability.controller';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Carbon offset projects
router.get('/projects', sustainabilityController.getProjects);
router.get('/projects/:projectId', sustainabilityController.getProject);
router.post('/projects/:projectId/calculate', sustainabilityController.calculateOffset);

// Global stats
router.get('/stats', sustainabilityController.getGlobalStats);

// Milestones info
router.get('/milestones', sustainabilityController.getMilestones);

// Sustainable products
router.get('/products', sustainabilityController.getSustainableProducts);
router.get('/products/:productId', sustainabilityController.getProductSustainability);

// Carbon footprint estimation
router.post('/estimate-footprint', sustainabilityController.estimateFootprint);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Carbon offsets
router.post('/offsets', authenticate, sustainabilityController.purchaseOffset);
router.get('/offsets', authenticate, sustainabilityController.getUserOffsets);

// Impact tracking
router.get('/impact', authenticate, sustainabilityController.getImpact);

// User milestones
router.get('/milestones/user', authenticate, sustainabilityController.getUserMilestones);

// Repair program
router.post('/repairs', authenticate, sustainabilityController.createRepairRequest);
router.get('/repairs', authenticate, sustainabilityController.getUserRepairs);
router.get('/repairs/:requestId', authenticate, sustainabilityController.getRepair);

// Sustainability pledge
router.post('/pledge', authenticate, sustainabilityController.takePledge);
router.get('/pledge', authenticate, sustainabilityController.getPledgeStatus);

// ============================================================================
// Admin Routes
// ============================================================================

router.get(
  '/admin/repairs',
  authenticate,
  authorize('admin'),
  sustainabilityController.adminGetRepairs
);

router.patch(
  '/admin/repairs/:requestId',
  authenticate,
  authorize('admin'),
  sustainabilityController.adminUpdateRepair
);

router.post(
  '/admin/products/:productId',
  authenticate,
  authorize('admin'),
  sustainabilityController.adminSetProductSustainability
);

export default router;
