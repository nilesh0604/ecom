/**
 * Limited Drops Routes
 * 
 * DTC Feature 6.3: Limited Drops/Releases
 * Route definitions for drops and draws
 */

import { Router } from 'express';
import * as dropsController from '../controllers/drops.controller';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

// Get all drops
router.get('/', dropsController.getDrops);

// Get drop calendar
router.get('/calendar', dropsController.getDropCalendar);

// Get drop details
router.get('/:dropId', dropsController.getDrop);

// Get countdown
router.get('/:dropId/countdown', dropsController.getCountdown);

// Check access (optional auth for member check)
router.get('/:dropId/access', optionalAuth, dropsController.checkAccess);

// ============================================================================
// Authenticated Routes - Draws
// ============================================================================

// Enter a draw
router.post('/:dropId/enter', authenticate, dropsController.enterDraw);

// Get user's entries
router.get('/user/entries', authenticate, dropsController.getUserEntries);

// Get draw result
router.get('/:dropId/result', authenticate, dropsController.getDrawResult);

// ============================================================================
// Authenticated Routes - Notifications
// ============================================================================

// Subscribe to notifications
router.post('/:dropId/notify', authenticate, dropsController.subscribeToNotification);

// Unsubscribe from notifications
router.delete('/:dropId/notify', authenticate, dropsController.unsubscribeFromNotification);

// ============================================================================
// Admin Routes
// ============================================================================

// Create drop
router.post('/', authenticate, requireAdmin, dropsController.createDrop);

// Update drop status
router.patch('/:dropId/status', authenticate, requireAdmin, dropsController.updateDropStatus);

// Run draw
router.post('/:dropId/run-draw', authenticate, requireAdmin, dropsController.runDraw);

// Send notifications
router.post('/:dropId/send-notifications', authenticate, requireAdmin, dropsController.sendNotifications);

// Get stats
router.get('/admin/stats', authenticate, requireAdmin, dropsController.getStats);

export default router;
