/**
 * Trade-In Routes
 * 
 * DTC Feature 6.4: Trade-In Program
 * Route definitions for trade-in endpoints
 */

import { Router } from 'express';
import * as tradeinController from '../controllers/tradein.controller';
import { authenticate, authorize('admin') } from '../middleware/auth.middleware';

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
  authorize('admin'),
  tradeinController.adminGetRequests
);

router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  tradeinController.adminGetStats
);

router.patch(
  '/admin/requests/:requestId/approve',
  authenticate,
  authorize('admin'),
  tradeinController.adminApprove
);

router.patch(
  '/admin/requests/:requestId/receive',
  authenticate,
  authorize('admin'),
  tradeinController.adminReceive
);

router.patch(
  '/admin/requests/:requestId/inspect',
  authenticate,
  authorize('admin'),
  tradeinController.adminInspect
);

router.patch(
  '/admin/requests/:requestId/complete',
  authenticate,
  authorize('admin'),
  tradeinController.adminComplete
);

router.patch(
  '/admin/requests/:requestId/reject',
  authenticate,
  authorize('admin'),
  tradeinController.adminReject
);

router.post(
  '/admin/products',
  authenticate,
  authorize('admin'),
  tradeinController.adminCreateProduct
);

router.patch(
  '/admin/products/:productId',
  authenticate,
  authorize('admin'),
  tradeinController.adminUpdateProduct
);

export default router;
