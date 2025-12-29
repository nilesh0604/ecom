import cartReducer, { addCartItem, clearCart, removeCartItem, updateCartQuantity } from '@/store/slices/cartSlice';
import uiReducer, { addToast, clearToasts, removeToast } from '@/store/slices/uiSlice';
import type { CartItem } from '@/types';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Integration Tests for Cart Flow
 *
 * These tests verify the full flow of cart operations:
 * - Adding items to cart
 * - Updating quantities
 * - Removing items
 * - Clearing cart
 * - Toast notifications on cart actions
 */

// Create a minimal test state that matches what selectors expect
interface TestCartState {
  cart: {
    items: CartItem[];
    total: number;
    discountedTotal: number;
    loading: boolean;
    error: string | null;
  };
}

interface TestUIState {
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    toasts: Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string; duration?: number }>;
  };
}

type TestState = TestCartState & TestUIState;

const createTestStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      ui: uiReducer,
    },
  });

const mockCartItem: CartItem = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  quantity: 1,
  total: 29.99,
  discountPercentage: 10,
  discountedTotal: 26.99,
  thumbnail: 'https://example.com/image.jpg',
};

// Type-safe selector helpers for tests
const getCartCount = (state: TestState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
const getCartTotal = (state: TestState) => state.cart.discountedTotal;
const isCartEmpty = (state: TestState) => state.cart.items.length === 0;

describe('Cart Integration Tests', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Add to Cart Flow', () => {
    it('should add an item to cart and update state correctly', () => {
      // Initially cart should be empty
      expect(isCartEmpty(store.getState())).toBe(true);
      expect(getCartCount(store.getState())).toBe(0);

      // Add item to cart
      store.dispatch(addCartItem(mockCartItem));

      // Verify cart state
      const state = store.getState();
      expect(isCartEmpty(state)).toBe(false);
      expect(getCartCount(state)).toBe(1);
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0]).toMatchObject({
        id: 1,
        title: 'Test Product',
        quantity: 1,
      });
    });

    it('should increase quantity when adding same item again', () => {
      // Add item twice
      store.dispatch(addCartItem(mockCartItem));
      store.dispatch(addCartItem({ ...mockCartItem, quantity: 2 }));

      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0].quantity).toBe(3);
      expect(getCartCount(state)).toBe(3);
    });

    it('should add multiple different items', () => {
      const secondItem: CartItem = {
        ...mockCartItem,
        id: 2,
        title: 'Second Product',
        price: 49.99,
      };

      store.dispatch(addCartItem(mockCartItem));
      store.dispatch(addCartItem(secondItem));

      const state = store.getState();
      expect(state.cart.items).toHaveLength(2);
      expect(getCartCount(state)).toBe(2);
    });
  });

  describe('Update Quantity Flow', () => {
    it('should update item quantity', () => {
      store.dispatch(addCartItem(mockCartItem));
      store.dispatch(updateCartQuantity({ id: 1, quantity: 5 }));

      const state = store.getState();
      expect(state.cart.items[0].quantity).toBe(5);
      expect(getCartCount(state)).toBe(5);
    });

    it('should recalculate totals when quantity changes', () => {
      store.dispatch(addCartItem(mockCartItem));
      const initialTotal = getCartTotal(store.getState());

      store.dispatch(updateCartQuantity({ id: 1, quantity: 3 }));
      const newTotal = getCartTotal(store.getState());

      expect(newTotal).toBeGreaterThan(initialTotal);
    });
  });

  describe('Remove Item Flow', () => {
    it('should remove item from cart', () => {
      store.dispatch(addCartItem(mockCartItem));
      expect(getCartCount(store.getState())).toBe(1);

      store.dispatch(removeCartItem(1));

      expect(isCartEmpty(store.getState())).toBe(true);
      expect(getCartCount(store.getState())).toBe(0);
    });

    it('should only remove the specified item', () => {
      const secondItem: CartItem = {
        ...mockCartItem,
        id: 2,
        title: 'Second Product',
      };

      store.dispatch(addCartItem(mockCartItem));
      store.dispatch(addCartItem(secondItem));
      store.dispatch(removeCartItem(1));

      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0].id).toBe(2);
    });
  });

  describe('Clear Cart Flow', () => {
    it('should clear all items from cart', () => {
      store.dispatch(addCartItem(mockCartItem));
      store.dispatch(addCartItem({ ...mockCartItem, id: 2 }));

      expect(getCartCount(store.getState())).toBe(2);

      store.dispatch(clearCart());

      expect(isCartEmpty(store.getState())).toBe(true);
      expect(getCartCount(store.getState())).toBe(0);
    });
  });
});

describe('Toast Integration Tests', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should add a toast notification', () => {
    const toast = {
      id: 'test-toast-1',
      type: 'success' as const,
      message: 'Item added to cart!',
      duration: 4000,
    };

    store.dispatch(addToast(toast));

    const state = store.getState();
    expect(state.ui.toasts).toHaveLength(1);
    expect(state.ui.toasts[0]).toEqual(toast);
  });

  it('should remove a specific toast', () => {
    const toast1 = { id: 'toast-1', type: 'success' as const, message: 'Success!' };
    const toast2 = { id: 'toast-2', type: 'error' as const, message: 'Error!' };

    store.dispatch(addToast(toast1));
    store.dispatch(addToast(toast2));

    expect(store.getState().ui.toasts).toHaveLength(2);

    store.dispatch(removeToast('toast-1'));

    const state = store.getState();
    expect(state.ui.toasts).toHaveLength(1);
    expect(state.ui.toasts[0].id).toBe('toast-2');
  });

  it('should clear all toasts', () => {
    store.dispatch(addToast({ id: '1', type: 'info' as const, message: 'Info 1' }));
    store.dispatch(addToast({ id: '2', type: 'info' as const, message: 'Info 2' }));

    store.dispatch(clearToasts());

    expect(store.getState().ui.toasts).toHaveLength(0);
  });

  it('should support multiple toast types', () => {
    const toastTypes = ['success', 'error', 'warning', 'info'] as const;

    toastTypes.forEach((type, index) => {
      store.dispatch(addToast({
        id: `toast-${index}`,
        type,
        message: `${type} message`,
      }));
    });

    const state = store.getState();
    expect(state.ui.toasts).toHaveLength(4);
    toastTypes.forEach((type, index) => {
      expect(state.ui.toasts[index].type).toBe(type);
    });
  });
});

describe('Cart + Toast Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should support the full add-to-cart-with-notification flow', () => {
    // Simulate the flow from ProductDetail page
    
    // 1. Add item to cart
    store.dispatch(addCartItem(mockCartItem));
    
    // 2. Show success toast (as the page component would do)
    store.dispatch(addToast({
      id: 'cart-toast-1',
      type: 'success',
      message: `${mockCartItem.title} added to cart!`,
    }));

    const state = store.getState();
    
    // Verify both cart and toast states
    expect(getCartCount(state)).toBe(1);
    expect(state.ui.toasts).toHaveLength(1);
    expect(state.ui.toasts[0].message).toContain(mockCartItem.title);
  });

  it('should support the checkout completion flow', () => {
    // Add items to cart
    store.dispatch(addCartItem(mockCartItem));
    
    // Clear cart (simulating order completion)
    store.dispatch(clearCart());
    
    // Show success notification
    store.dispatch(addToast({
      id: 'order-success',
      type: 'success',
      message: 'Order placed successfully!',
    }));

    const state = store.getState();
    expect(isCartEmpty(state)).toBe(true);
    expect(state.ui.toasts[0].type).toBe('success');
    expect(state.ui.toasts[0].message).toContain('Order placed');
  });
});
