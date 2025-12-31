/**
 * User-Generated Content (UGC) Routes
 * 
 * DTC Feature 6.5: User-Generated Content
 * Route definitions for UGC endpoints
 */

import { Router } from 'express';
import * as ugcController from '../controllers/ugc.controller';
import { authenticate, authorize('admin') } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get UGC for a product
router.get('/products/:productId', ugcController.getProductUGC);

// Get community gallery
router.get('/gallery', ugcController.getCommunityGallery);

// Get social media feed
router.get('/social', ugcController.getSocialFeed);

// Get media limits
router.get('/limits', ugcController.getMediaLimits);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Submit UGC
router.post('/', authenticate, ugcController.submitUGC);

// Submit review photos
router.post('/review-photos', authenticate, ugcController.submitReviewPhotos);

// Get user's UGC
router.get('/my-content', authenticate, ugcController.getMyUGC);

// Get orders eligible for UGC prompt
router.get('/prompt-eligible', authenticate, ugcController.getPromptEligibleOrders);

// ============================================================================
// Admin Routes
// ============================================================================

// Get moderation queue
router.get('/admin/queue', authenticate, authorize('admin'), ugcController.getModerationQueue);

// Moderate content
router.post(
  '/admin/moderate/:contentId',
  authenticate,
  authorize('admin'),
  ugcController.moderateContent
);

// Bulk moderate
router.post('/admin/bulk-moderate', authenticate, authorize('admin'), ugcController.bulkModerate);

// Toggle featured
router.patch(
  '/admin/:contentId/feature',
  authenticate,
  authorize('admin'),
  ugcController.toggleFeatured
);

// Import social content
router.post('/admin/import-social', authenticate, authorize('admin'), ugcController.importSocialContent);

// Get stats
router.get('/admin/stats', authenticate, authorize('admin'), ugcController.getStats);

export default router;
