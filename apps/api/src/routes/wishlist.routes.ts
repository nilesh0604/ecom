import { Router } from 'express';
import { z } from 'zod';
import * as wishlistController from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';

const router = Router();

// Validation schemas
const addToWishlistSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
});

const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive('Invalid product ID'),
});

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Get wishlist count
router.get('/count', wishlistController.getWishlistCount);

// Check if product is in wishlist
router.get(
  '/check/:productId',
  validateParams(productIdParamSchema),
  wishlistController.checkWishlistStatus
);

// Add item to wishlist
router.post(
  '/',
  validateBody(addToWishlistSchema),
  wishlistController.addToWishlist
);

// Remove item from wishlist
router.delete(
  '/:productId',
  validateParams(productIdParamSchema),
  wishlistController.removeFromWishlist
);

// Clear entire wishlist
router.delete('/', wishlistController.clearWishlist);

export default router;
