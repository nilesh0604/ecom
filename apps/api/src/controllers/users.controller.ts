import { Request, Response } from 'express';
import { usersService } from '../services/users.service';
import { AuthRequest, CreateAddressDto, UpdatePreferencesDto, UpdateUserDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const profile = await usersService.getProfile(userId);

  ApiResponse.success(res, profile);
});

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const updateData: UpdateUserDto = req.body;

  // Handle avatar upload if present
  if (req.file) {
    updateData.image = req.file.path;
  }

  const user = await usersService.updateProfile(userId, updateData);

  ApiResponse.success(res, user, 'Profile updated successfully');
});

/**
 * Get user addresses
 * GET /api/v1/users/addresses
 */
export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const addresses = await usersService.getAddresses(userId);

  ApiResponse.success(res, addresses);
});

/**
 * Add new address
 * POST /api/v1/users/addresses
 */
export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressData: CreateAddressDto = req.body;

  const address = await usersService.addAddress(userId, addressData);

  ApiResponse.created(res, address, 'Address added successfully');
});

/**
 * Update address
 * PUT /api/v1/users/addresses/:id
 */
export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = parseInt(req.params.id);
  const addressData = req.body;

  const address = await usersService.updateAddress(userId, addressId, addressData);

  ApiResponse.success(res, address, 'Address updated successfully');
});

/**
 * Delete address
 * DELETE /api/v1/users/addresses/:id
 */
export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = parseInt(req.params.id);

  await usersService.deleteAddress(userId, addressId);

  ApiResponse.success(res, null, 'Address deleted successfully');
});

/**
 * Set default address
 * PUT /api/v1/users/addresses/:id/default
 */
export const setDefaultAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = parseInt(req.params.id);

  await usersService.setDefaultAddress(userId, addressId);

  ApiResponse.success(res, null, 'Default address set successfully');
});

/**
 * Get user preferences
 * GET /api/v1/users/preferences
 */
export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const preferences = await usersService.getPreferences(userId);

  ApiResponse.success(res, preferences);
});

/**
 * Update user preferences
 * PUT /api/v1/users/preferences
 */
export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const preferencesData: UpdatePreferencesDto = req.body;

  const preferences = await usersService.updatePreferences(userId, preferencesData);

  ApiResponse.success(res, preferences, 'Preferences updated successfully');
});

/**
 * Get user wishlist
 * GET /api/v1/users/wishlist
 */
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { skip = '0', limit = '10' } = req.query;

  const result = await usersService.getWishlist(
    userId,
    parseInt(skip as string),
    parseInt(limit as string)
  );

  ApiResponse.paginated(
    res,
    result.items,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Add to wishlist
 * POST /api/v1/users/wishlist
 */
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  await usersService.addToWishlist(userId, productId);

  ApiResponse.success(res, null, 'Added to wishlist');
});

/**
 * Remove from wishlist
 * DELETE /api/v1/users/wishlist/:productId
 */
export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = parseInt(req.params.productId);

  await usersService.removeFromWishlist(userId, productId);

  ApiResponse.success(res, null, 'Removed from wishlist');
});

/**
 * Check if product is in wishlist
 * GET /api/v1/users/wishlist/:productId
 */
export const isInWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = parseInt(req.params.productId);

  const inWishlist = await usersService.isInWishlist(userId, productId);

  ApiResponse.success(res, { inWishlist });
});

/**
 * Get all users (admin)
 * GET /api/v1/users/admin/all
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { skip = '0', limit = '10', search } = req.query;

  const result = await usersService.getAllUsers(
    parseInt(skip as string),
    parseInt(limit as string),
    search as string
  );

  ApiResponse.paginated(
    res,
    result.users,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Update user status (admin)
 * PATCH /api/v1/users/admin/:id/status
 */
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { isActive } = req.body;

  const user = await usersService.updateUserStatus(userId, isActive);

  ApiResponse.success(res, user, 'User status updated successfully');
});
