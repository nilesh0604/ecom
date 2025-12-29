import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { wishlistService } from '../services/wishlist.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Get user's wishlist
 */
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const items = await wishlistService.getWishlist(userId);

  ApiResponse.success(res, {
    items,
    count: items.length,
  });
});

/**
 * Add item to wishlist
 */
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  const item = await wishlistService.addToWishlist(userId, productId);

  ApiResponse.created(res, item, 'Product added to wishlist');
});

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = parseInt(req.params.productId, 10);

  await wishlistService.removeFromWishlist(userId, productId);

  ApiResponse.success(res, null, 'Product removed from wishlist');
});

/**
 * Check if product is in wishlist
 */
export const checkWishlistStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = parseInt(req.params.productId, 10);

  const isInWishlist = await wishlistService.isInWishlist(userId, productId);

  ApiResponse.success(res, { isInWishlist });
});

/**
 * Clear wishlist
 */
export const clearWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  await wishlistService.clearWishlist(userId);

  ApiResponse.success(res, null, 'Wishlist cleared');
});

/**
 * Get wishlist count
 */
export const getWishlistCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const count = await wishlistService.getWishlistCount(userId);

  ApiResponse.success(res, { count });
});
