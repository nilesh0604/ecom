import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
    createAddressSchema,
    updatePreferencesSchema,
    updateUserSchema,
} from '../validators';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', usersController.getProfile);

router.put(
  '/profile',
  uploadAvatar,
  validateBody(updateUserSchema),
  usersController.updateProfile
);

// Address routes
router.get('/addresses', usersController.getAddresses);

router.post(
  '/addresses',
  validateBody(createAddressSchema),
  usersController.addAddress
);

router.put('/addresses/:id', usersController.updateAddress);

router.delete('/addresses/:id', usersController.deleteAddress);

router.put('/addresses/:id/default', usersController.setDefaultAddress);

// Preferences routes
router.get('/preferences', usersController.getPreferences);

router.put(
  '/preferences',
  validateBody(updatePreferencesSchema),
  usersController.updatePreferences
);

// Wishlist routes
router.get('/wishlist', usersController.getWishlist);

router.post('/wishlist', usersController.addToWishlist);

router.delete('/wishlist/:productId', usersController.removeFromWishlist);

router.get('/wishlist/:productId', usersController.isInWishlist);

// Admin routes
router.get(
  '/admin/all',
  authorize('ADMIN'),
  usersController.getAllUsers
);

router.patch(
  '/admin/:id/status',
  authorize('ADMIN'),
  usersController.updateUserStatus
);

export default router;
