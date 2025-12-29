import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/**
 * Memoized Cart Selectors
 * 
 * Why memoized selectors:
 * - Prevents re-renders when cart state hasn't changed
 * - Derived values (totals, counts) only recompute when source data changes
 * - Critical for performance in Header/Navbar that shows cart badge
 * 
 * These selectors use createSelector from Redux Toolkit (which uses Reselect)
 * to create memoized selectors that only recompute when their inputs change.
 */

// Base selectors (not memoized, just extract data from state)
const selectCartState = (state: RootState) => state.cart;

/**
 * Select cart items array
 * Used in: Cart drawer, Checkout, Order summary
 */
export const selectCartItems = (state: RootState) => state.cart.items;

/**
 * Select total number of items in cart (sum of all quantities)
 * Used in: Navbar cart badge
 */
export const selectCartCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((count, item) => count + item.quantity, 0)
);

/**
 * Select number of unique products in cart
 * Used in: Cart summary "X unique items"
 */
export const selectCartUniqueCount = createSelector(
  [selectCartItems],
  (items) => items.length
);

/**
 * Select cart subtotal (before any discounts)
 * Used in: Cart summary
 */
export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

/**
 * Select cart total with discounts applied
 * Used in: Cart summary, Checkout
 */
export const selectCartTotal = createSelector(
  [selectCartState],
  (cart) => cart.discountedTotal
);

/**
 * Select total savings from discounts
 * Used in: Cart summary "You save $X"
 */
export const selectCartSavings = createSelector(
  [selectCartState],
  (cart) => cart.total - cart.discountedTotal
);

/**
 * Check if cart is empty
 * Used in: Conditional rendering of empty state
 */
export const selectIsCartEmpty = createSelector(
  [selectCartItems],
  (items) => items.length === 0
);

/**
 * Select cart loading state
 */
export const selectCartLoading = createSelector(
  [selectCartState],
  (cart) => cart.loading
);

/**
 * Select cart error state
 */
export const selectCartError = createSelector(
  [selectCartState],
  (cart) => cart.error
);

/**
 * Check if a specific product is in cart
 * Used in: Product cards/PDP to show "In Cart" indicator
 */
export const selectIsInCart = (productId: number) =>
  createSelector(
    [selectCartItems],
    (items) => items.some((item) => item.id === productId)
  );

/**
 * Get quantity of a specific item in cart
 * Used in: ProductDetail page to show current qty
 */
export const selectItemQuantity = (productId: number) =>
  createSelector(
    [selectCartItems],
    (items) => items.find((item) => item.id === productId)?.quantity ?? 0
  );

/**
 * Calculate estimated tax (for demo purposes, 8% tax rate)
 * In production, this would depend on shipping address
 */
export const selectEstimatedTax = createSelector(
  [selectCartTotal],
  (total) => total * 0.08
);

/**
 * Calculate estimated shipping
 * Free shipping over $50, otherwise $5.99
 */
export const selectEstimatedShipping = createSelector(
  [selectCartTotal],
  (total) => (total >= 50 ? 0 : 5.99)
);

/**
 * Calculate order total (cart + tax + shipping)
 */
export const selectOrderTotal = createSelector(
  [selectCartTotal, selectEstimatedTax, selectEstimatedShipping],
  (cartTotal, tax, shipping) => cartTotal + tax + shipping
);
