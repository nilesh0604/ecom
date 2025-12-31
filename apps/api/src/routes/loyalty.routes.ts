/**
 * Loyalty Routes
 * 
 * DTC Feature 6.1: Loyalty Points / Rewards
 */

import { Router } from 'express';
import * as loyaltyController from '../controllers/loyalty.controller';
import { authenticate, authorize('admin') } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get tier information
router.get('/tiers', loyaltyController.getTiers);

// Get earn opportunities
router.get('/earn-opportunities', loyaltyController.getEarnOpportunities);

// Calculate redemption value
router.get('/calculate-redemption', loyaltyController.calculateRedemption);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Get user's loyalty account
router.get('/account', authenticate, loyaltyController.getAccount);

// Get points history
router.get('/history', authenticate, loyaltyController.getHistory);

// Redeem points
router.post('/redeem', authenticate, loyaltyController.redeemPoints);

// ============================================================================
// Admin Routes
// ============================================================================

// Adjust user points
router.post(
  '/admin/adjust',
  authenticate,
  authorize('admin'),
  loyaltyController.adminAdjustPoints
);

// Process expired points
router.post(
  '/admin/process-expirations',
  authenticate,
  authorize('admin'),
  loyaltyController.adminProcessExpirations
);

// Award birthday bonus
router.post(
  '/admin/award-birthday',
  authenticate,
  authorize('admin'),
  loyaltyController.adminAwardBirthday
);

export default router;
