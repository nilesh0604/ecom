/**
 * Cart Redux Slice
 * 
 * Manages shopping cart state including items, quantities, and totals.
 * Automatically recalculates totals when items change.
 * 
 * @module store/slices/cartSlice
 * 
 * State Structure:
 * - items: Array of cart items with quantity and pricing
 * - total: Sum of all item prices × quantities
 * - discountedTotal: Total after applying discounts
 * - loading: Async operation in progress
 * - error: Error message if operation failed
 * 
 * @example
 * ```tsx
 * // Add item to cart
 * dispatch(addCartItem(cartItem));
 * 
 * // Update quantity
 * dispatch(updateCartQuantity({ id: 1, quantity: 3 }));
 * 
 * // Remove item
 * dispatch(removeCartItem(1));
 * ```
 */
import type { CartItem } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart state interface
 * @interface CartState
 */
export interface CartState {
  /** Array of items in the cart */
  items: CartItem[];
  /** Total price before discounts */
  total: number;
  /** Total price after discounts applied */
  discountedTotal: number;
  /** Whether cart operation is in progress */
  loading: boolean;
  /** Error message from failed operation */
  error: string | null;
}

/** Initial empty cart state */
const initialState: CartState = {
  items: [],
  total: 0,
  discountedTotal: 0,
  loading: false,
  error: null,
};

const recalcTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      const lineTotal = item.price * item.quantity;
      const lineDiscounted = lineTotal * (1 - item.discountPercentage / 100);
      acc.total += lineTotal;
      acc.discountedTotal += lineDiscounted;
      return acc;
    },
    { total: 0, discountedTotal: 0 }
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      const totals = recalcTotals(state.items);
      state.total = totals.total;
      state.discountedTotal = totals.discountedTotal;
    },
    addCartItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((item) => item.id === action.payload.id);

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      const totals = recalcTotals(state.items);
      state.total = totals.total;
      state.discountedTotal = totals.discountedTotal;
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) {
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        const totals = recalcTotals(state.items);
        state.total = totals.total;
        state.discountedTotal = totals.discountedTotal;
      }
    },
    removeCartItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = recalcTotals(state.items);
      state.total = totals.total;
      state.discountedTotal = totals.discountedTotal;
    },
    clearCart(state) {
      state.items = [];
      state.total = 0;
      state.discountedTotal = 0;
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCartError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setCartItems,
  addCartItem,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  setCartLoading,
  setCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
