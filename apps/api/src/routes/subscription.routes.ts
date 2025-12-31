/**
 * Subscription Routes
 * 
 * DTC Feature 5.2: Subscription Model
 * Route definitions for subscription endpoints
 */

import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authenticate, authorize('admin') } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get subscription frequencies
router.get('/frequencies', subscriptionController.getFrequencies);

// Calculate subscription savings
router.post('/calculate-savings', subscriptionController.calculateSavings);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Create subscription
router.post('/', authenticate, subscriptionController.createSubscription);

// Get user's subscriptions
router.get('/', authenticate, subscriptionController.getUserSubscriptions);

// Get subscription details
router.get('/:subscriptionId', authenticate, subscriptionController.getSubscription);

// Update subscription
router.patch('/:subscriptionId', authenticate, subscriptionController.updateSubscription);

// Pause subscription
router.post(
  '/:subscriptionId/pause',
  authenticate,
  subscriptionController.pauseSubscription
);

// Resume subscription
router.post(
  '/:subscriptionId/resume',
  authenticate,
  subscriptionController.resumeSubscription
);

// Skip next delivery
router.post(
  '/:subscriptionId/skip',
  authenticate,
  subscriptionController.skipDelivery
);

// Cancel subscription
router.delete(
  '/:subscriptionId',
  authenticate,
  subscriptionController.cancelSubscription
);

// ============================================================================
// Admin Routes
// ============================================================================

router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  subscriptionController.getStats
);

router.post(
  '/admin/process',
  authenticate,
  authorize('admin'),
  subscriptionController.processDueSubscriptions
);

export default router;
