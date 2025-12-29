import type { Product } from '@/types';
import { apiClient } from '@/utils';

/**
 * Wishlist Service - Handles user wishlist operations
 * 
 * Requires authentication - all endpoints need a valid auth token.
 * 
 * Usage in components:
 * import { wishlistService } from '@/services/wishlistService';
 * 
 * const wishlist = await wishlistService.getWishlist();
 * await wishlistService.addItem(productId);
 */

export interface WishlistItem {
  id: string;
  productId: number;
  product: Product;
  addedAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

export interface WishlistCountResponse {
  count: number;
}

export interface WishlistCheckResponse {
  inWishlist: boolean;
}

export const wishlistService = {
  /**
   * Get user's wishlist
   * 
   * @returns Wishlist with all saved products
   * 
   * Example:
   * const { items, total } = await wishlistService.getWishlist();
   * console.log(`${total} items in wishlist`);
   */
  getWishlist: () =>
    apiClient.get<WishlistResponse>('/wishlist'),

  /**
   * Get wishlist item count
   * 
   * Lightweight endpoint for displaying count in header/nav
   * without fetching all items.
   * 
   * @returns Count of items in wishlist
   * 
   * Example:
   * const { count } = await wishlistService.getCount();
   * // Display badge: "❤️ 5"
   */
  getCount: () =>
    apiClient.get<WishlistCountResponse>('/wishlist/count'),

  /**
   * Check if product is in wishlist
   * 
   * @param productId - Product ID to check
   * @returns Whether product is in wishlist
   * 
   * Example:
   * const { inWishlist } = await wishlistService.checkStatus(123);
   * // Show filled/empty heart icon
   */
  checkStatus: (productId: number) =>
    apiClient.get<WishlistCheckResponse>(`/wishlist/check/${productId}`),

  /**
   * Add product to wishlist
   * 
   * @param productId - Product ID to add
   * @returns Updated wishlist
   * 
   * Example:
   * await wishlistService.addItem(123);
   */
  addItem: (productId: number) =>
    apiClient.post<WishlistResponse>('/wishlist', { productId }),

  /**
   * Remove product from wishlist
   * 
   * @param productId - Product ID to remove
   * @returns Updated wishlist
   * 
   * Example:
   * await wishlistService.removeItem(123);
   */
  removeItem: (productId: number) =>
    apiClient.delete<WishlistResponse>(`/wishlist/${productId}`),

  /**
   * Clear entire wishlist
   * 
   * Removes all items from wishlist.
   * 
   * @returns Empty wishlist
   * 
   * Example:
   * await wishlistService.clearWishlist();
   */
  clearWishlist: () =>
    apiClient.delete<WishlistResponse>('/wishlist'),

  /**
   * Toggle product in wishlist
   * 
   * Convenience method: adds if not in wishlist, removes if already added.
   * 
   * @param productId - Product ID to toggle
   * @returns Updated wishlist and whether item is now in wishlist
   * 
   * Example:
   * const { inWishlist } = await wishlistService.toggleItem(123);
   */
  toggleItem: async (productId: number): Promise<{ inWishlist: boolean; wishlist: WishlistResponse }> => {
    const { inWishlist } = await wishlistService.checkStatus(productId);
    
    if (inWishlist) {
      const wishlist = await wishlistService.removeItem(productId);
      return { inWishlist: false, wishlist };
    } else {
      const wishlist = await wishlistService.addItem(productId);
      return { inWishlist: true, wishlist };
    }
  },
};
