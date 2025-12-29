import type { CartItem } from '@/types';
import { apiClient } from '@/utils';

/**
 * Cart Service - Handles shopping cart API operations
 * 
 * Supports both authenticated and guest users:
 * - Authenticated: Cart persists across devices/sessions
 * - Guest: Uses session-based cart (optional, can merge after login)
 * 
 * Usage in components:
 * import { cartService } from '@/services/cartService';
 * 
 * const cart = await cartService.getCart();
 * await cartService.addItem(productId, quantity);
 */

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  id: string;
  userId?: number;
  items: CartItem[];
  total: number;
  discountedTotal?: number;
  totalProducts: number;
  totalQuantity: number;
}

export const cartService = {
  /**
   * Get current user's cart
   * 
   * Works for both authenticated and guest users.
   * Returns empty cart if no items.
   * 
   * @returns Current cart with all items and totals
   * 
   * Example:
   * const cart = await cartService.getCart();
   * console.log(`${cart.totalQuantity} items in cart`);
   */
  getCart: () =>
    apiClient.get<CartResponse>('/cart'),

  /**
   * Add item to cart
   * 
   * If item already exists, quantity is added to existing.
   * 
   * @param productId - Product ID to add
   * @param quantity - Quantity to add (default: 1)
   * @returns Updated cart
   * 
   * Example:
   * const cart = await cartService.addItem(123, 2);
   */
  addItem: (productId: number, quantity: number = 1) =>
    apiClient.post<CartResponse>('/cart/items', { productId, quantity }),

  /**
   * Update cart item quantity
   * 
   * @param itemId - Cart item ID (not product ID)
   * @param quantity - New quantity (0 removes the item)
   * @returns Updated cart
   * 
   * Example:
   * const cart = await cartService.updateItem('item-123', 5);
   */
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put<CartResponse>(`/cart/items/${itemId}`, { quantity }),

  /**
   * Remove item from cart
   * 
   * @param itemId - Cart item ID to remove
   * @returns Updated cart
   * 
   * Example:
   * const cart = await cartService.removeItem('item-123');
   */
  removeItem: (itemId: string) =>
    apiClient.delete<CartResponse>(`/cart/items/${itemId}`),

  /**
   * Clear entire cart
   * 
   * Removes all items from cart.
   * 
   * @returns Empty cart
   * 
   * Example:
   * await cartService.clearCart();
   */
  clearCart: () =>
    apiClient.delete<CartResponse>('/cart'),

  /**
   * Merge guest cart with user cart after login
   * 
   * Call this after user logs in to preserve their guest cart items.
   * Items from guest cart will be added to user's existing cart.
   * 
   * @param guestCartId - Optional guest cart ID (from session/localStorage)
   * @returns Merged cart
   * 
   * Example:
   * // After login
   * const guestCartId = localStorage.getItem('guestCartId');
   * if (guestCartId) {
   *   await cartService.mergeCart(guestCartId);
   *   localStorage.removeItem('guestCartId');
   * }
   */
  mergeCart: (guestCartId?: string) =>
    apiClient.post<CartResponse>('/cart/merge', { guestCartId }),
};
