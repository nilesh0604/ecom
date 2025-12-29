import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post(
  '/',
  validateBody(createOrderSchema),
  ordersController.createOrder
);

router.get('/', ordersController.getUserOrders);

router.get('/:id', ordersController.getOrderById);

router.post('/:id/cancel', ordersController.cancelOrder);

router.get('/:id/tracking', ordersController.getTrackingInfo);

// Admin routes
router.get(
  '/admin/all',
  authorize('ADMIN'),
  ordersController.getAllOrders
);

router.get(
  '/admin/stats',
  authorize('ADMIN'),
  ordersController.getOrderStats
);

router.patch(
  '/:id/status',
  authorize('ADMIN'),
  validateBody(updateOrderStatusSchema),
  ordersController.updateOrderStatus
);

export default router;
