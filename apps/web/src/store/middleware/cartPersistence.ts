import type { Middleware } from '@reduxjs/toolkit';
import { z } from 'zod';
import type { RootState } from '../store';

/**
 * Cart Persistence Middleware
 * 
 * Persists cart state to localStorage on every cart action.
 * Validates stored data with Zod on hydration for security (prevents XSS via corrupted data).
 * 
 * Why middleware over manual sync:
 * - Automatically syncs on every action without manual calls
 * - Single source of truth for persistence logic
 * - Clean separation of concerns
 */

const CART_STORAGE_KEY = 'ecom_cart';

// Zod schema for CartItem validation
// Made lenient with defaults to handle legacy cart data
const CartItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  total: z.number().min(0).optional().default(0),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  discountedTotal: z.number().min(0).optional().default(0),
  thumbnail: z.string().optional().default(''),
});

const CartStateSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number().min(0).optional().default(0),
  discountedTotal: z.number().min(0).optional().default(0),
});

export type ValidatedCartState = z.infer<typeof CartStateSchema>;

/**
 * Load cart from localStorage with Zod validation
 * Returns null if data is missing, corrupted, or invalid
 */
export function loadCartFromStorage(): ValidatedCartState | null {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const result = CartStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    } else {
      // Log validation errors in development
      if (import.meta.env.DEV) {
        console.warn('Cart validation failed:', result.error.issues);
      }
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
  } catch (error) {
    // JSON parse failed or other error
    if (import.meta.env.DEV) {
      console.warn('Failed to load cart from storage:', error);
    }
    localStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(cartState: ValidatedCartState): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch (error) {
    // Storage full or other error
    if (import.meta.env.DEV) {
      console.warn('Failed to save cart to storage:', error);
    }
  }
}

/**
 * Redux middleware that persists cart state to localStorage
 */
export const cartPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only persist on cart actions
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const actionType = (action as { type: string }).type;
    if (actionType.startsWith('cart/')) {
      const state = store.getState() as RootState;
      saveCartToStorage({
        items: state.cart.items,
        total: state.cart.total,
        discountedTotal: state.cart.discountedTotal,
      });
    }
  }

  return result;
};

export default cartPersistenceMiddleware;
