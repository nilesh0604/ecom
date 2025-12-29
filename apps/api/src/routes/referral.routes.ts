/**
 * Referral Routes
 * 
 * DTC Feature 6.2: Referral Program
 */

import { Router } from 'express';
import * as referralController from '../controllers/referral.controller';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Validate referral code
router.get('/validate/:code', referralController.validateCode);

// Apply referral code (during signup)
router.post('/apply', referralController.applyCode);

// Get leaderboard (optionally authenticated to mark current user)
router.get('/leaderboard', optionalAuth, referralController.getLeaderboard);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Get user's referral account
router.get('/account', authenticate, referralController.getAccount);

// Get referral stats
router.get('/stats', authenticate, referralController.getStats);

// Get referral history
router.get('/history', authenticate, referralController.getHistory);

// Send invites
router.post('/invite', authenticate, referralController.sendInvites);

// Resend invite
router.post('/resend/:referralId', authenticate, referralController.resendInvite);

// ============================================================================
// Internal Webhook Routes
// ============================================================================

// Handle signup event
router.post('/webhook/signup', referralController.handleSignup);

// Handle purchase event
router.post('/webhook/purchase', referralController.handlePurchase);

// ============================================================================
// Admin Routes
// ============================================================================

// Process reward
router.post(
  '/admin/process-reward/:referralId',
  authenticate,
  requireAdmin,
  referralController.adminProcessReward
);

export default router;
