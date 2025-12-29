/**
 * Trade-In Routes
 * 
 * DTC Feature 6.4: Trade-In Program
 * Route definitions for trade-in endpoints
 */

import { Router } from 'express';
import * as tradeinController from '../controllers/tradein.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get trade-in products
router.get('/products', tradeinController.getProducts);
router.get('/products/:productId', tradeinController.getProduct);

// Get condition questions
router.get('/questions', tradeinController.getQuestions);

// Get quick estimate
router.get('/quick-estimate', tradeinController.getQuickEstimate);

// Calculate estimate
router.post('/estimate', tradeinController.getEstimate);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Trade-in requests
router.post('/requests', authenticate, tradeinController.createRequest);
router.get('/requests', authenticate, tradeinController.getUserRequests);
router.get('/requests/:requestId', authenticate, tradeinController.getRequest);
router.patch(
  '/requests/:requestId/ship',
  authenticate,
  tradeinController.markShipped
);

// ============================================================================
// Admin Routes
// ============================================================================

router.get(
  '/admin/requests',
  authenticate,
  requireAdmin,
  tradeinController.adminGetRequests
);

router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  tradeinController.adminGetStats
);

router.patch(
  '/admin/requests/:requestId/approve',
  authenticate,
  requireAdmin,
  tradeinController.adminApprove
);

router.patch(
  '/admin/requests/:requestId/receive',
  authenticate,
  requireAdmin,
  tradeinController.adminReceive
);

router.patch(
  '/admin/requests/:requestId/inspect',
  authenticate,
  requireAdmin,
  tradeinController.adminInspect
);

router.patch(
  '/admin/requests/:requestId/complete',
  authenticate,
  requireAdmin,
  tradeinController.adminComplete
);

router.patch(
  '/admin/requests/:requestId/reject',
  authenticate,
  requireAdmin,
  tradeinController.adminReject
);

router.post(
  '/admin/products',
  authenticate,
  requireAdmin,
  tradeinController.adminCreateProduct
);

router.patch(
  '/admin/products/:productId',
  authenticate,
  requireAdmin,
  tradeinController.adminUpdateProduct
);

export default router;
