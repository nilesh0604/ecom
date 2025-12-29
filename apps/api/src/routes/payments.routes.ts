import { Router, raw } from 'express';
import * as paymentsController from '../controllers/payments.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { paymentLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createPaymentIntentSchema } from '../validators';

const router = Router();

// Webhook route (must use raw body parser for signature verification)
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  paymentsController.handleWebhook
);

// Create payment intent (requires authentication)
router.post(
  '/create-intent',
  authenticate,
  paymentLimiter,
  validateBody(createPaymentIntentSchema),
  paymentsController.createPaymentIntent
);

// Get payment by order ID
router.get(
  '/order/:orderId',
  authenticate,
  paymentsController.getPaymentByOrderId
);

// Admin routes
router.post(
  '/:paymentId/refund',
  authenticate,
  authorize('ADMIN'),
  paymentsController.refundPayment
);

export default router;
