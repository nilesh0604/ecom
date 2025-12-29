import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { AuthRequest, CartItemDto, UpdateCartItemDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Get cart
 * GET /api/v1/cart
 */
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);

  const cart = await cartService.getCart(userId, sessionId);

  ApiResponse.success(res, cart);
});

/**
 * Add item to cart
 * POST /api/v1/cart/items
 */
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);
  const data: CartItemDto = req.body;

  const cart = await cartService.addToCart(userId, sessionId, data);

  ApiResponse.success(res, cart, 'Item added to cart');
});

/**
 * Update cart item
 * PUT /api/v1/cart/items/:itemId
 */
export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);
  const itemId = parseInt(req.params.itemId);
  const data: UpdateCartItemDto = req.body;

  const cart = await cartService.updateCartItem(userId, sessionId, itemId, data);

  ApiResponse.success(res, cart, 'Cart updated');
});

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/:itemId
 */
export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);
  const itemId = parseInt(req.params.itemId);

  const cart = await cartService.removeFromCart(userId, sessionId, itemId);

  ApiResponse.success(res, cart, 'Item removed from cart');
});

/**
 * Clear cart
 * DELETE /api/v1/cart
 */
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);

  await cartService.clearCart(userId, sessionId);

  ApiResponse.success(res, null, 'Cart cleared');
});

/**
 * Merge guest cart into user cart
 * POST /api/v1/cart/merge
 */
export const mergeCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const sessionId = req.cookies.sessionId || (req.headers['x-session-id'] as string);

  if (!sessionId) {
    return ApiResponse.badRequest(res, 'Session ID is required');
  }

  const cart = await cartService.mergeGuestCart(userId, sessionId);

  ApiResponse.success(res, cart, 'Cart merged successfully');
});
