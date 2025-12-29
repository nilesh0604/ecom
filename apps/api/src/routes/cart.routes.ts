import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { addToCartSchema, updateCartItemSchema } from '../validators';

const router = Router();

// All cart routes support both authenticated and guest users
router.get('/', optionalAuth, cartController.getCart);

router.post(
  '/items',
  optionalAuth,
  validateBody(addToCartSchema),
  cartController.addToCart
);

router.put(
  '/items/:itemId',
  optionalAuth,
  validateBody(updateCartItemSchema),
  cartController.updateCartItem
);

router.delete('/items/:itemId', optionalAuth, cartController.removeFromCart);

router.delete('/', optionalAuth, cartController.clearCart);

// Merge cart requires authentication
router.post('/merge', authenticate, cartController.mergeCart);

export default router;
