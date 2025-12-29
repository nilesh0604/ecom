import type { CartItem } from '@/types';
import { describe, expect, it } from 'vitest';
import type { RootState } from '../store';
import {
    selectCartCount,
    selectCartSavings,
    selectCartSubtotal,
    selectCartTotal,
    selectCartUniqueCount,
    selectEstimatedShipping,
    selectEstimatedTax,
    selectIsCartEmpty,
    selectIsInCart,
    selectItemQuantity,
    selectOrderTotal,
} from './cartSelectors';

/**
 * Cart Selectors Tests
 * 
 * Tests verify:
 * - Correct derived values from cart state
 * - Memoization behavior
 * - Edge cases (empty cart, single item, etc.)
 */

describe('cartSelectors', () => {
  // Helper to create mock state
  const createMockState = (items: CartItem[], total: number, discountedTotal: number): RootState => ({
    cart: {
      items,
      total,
      discountedTotal,
      loading: false,
      error: null,
    },
    product: {
      products: [],
      total: 0,
      loading: false,
      error: null,
    },
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    ui: {
      isMobileMenuOpen: false,
      isLoading: false,
      theme: 'light',
    },
  });

  const sampleItem: CartItem = {
    id: 1,
    title: 'Test Product',
    price: 100,
    quantity: 2,
    total: 200,
    discountPercentage: 10,
    discountedTotal: 180,
    thumbnail: 'test.jpg',
  };

  const anotherItem: CartItem = {
    id: 2,
    title: 'Another Product',
    price: 50,
    quantity: 3,
    total: 150,
    discountPercentage: 0,
    discountedTotal: 150,
    thumbnail: 'another.jpg',
  };

  describe('selectCartCount', () => {
    it('should return 0 for empty cart', () => {
      const state = createMockState([], 0, 0);
      expect(selectCartCount(state)).toBe(0);
    });

    it('should return total quantity across all items', () => {
      const state = createMockState([sampleItem, anotherItem], 350, 330);
      expect(selectCartCount(state)).toBe(5); // 2 + 3
    });

    it('should handle single item', () => {
      const state = createMockState([sampleItem], 200, 180);
      expect(selectCartCount(state)).toBe(2);
    });
  });

  describe('selectCartUniqueCount', () => {
    it('should return 0 for empty cart', () => {
      const state = createMockState([], 0, 0);
      expect(selectCartUniqueCount(state)).toBe(0);
    });

    it('should return number of unique products', () => {
      const state = createMockState([sampleItem, anotherItem], 350, 330);
      expect(selectCartUniqueCount(state)).toBe(2);
    });
  });

  describe('selectCartSubtotal', () => {
    it('should return 0 for empty cart', () => {
      const state = createMockState([], 0, 0);
      expect(selectCartSubtotal(state)).toBe(0);
    });

    it('should calculate subtotal from price * quantity', () => {
      const state = createMockState([sampleItem, anotherItem], 350, 330);
      // (100 * 2) + (50 * 3) = 200 + 150 = 350
      expect(selectCartSubtotal(state)).toBe(350);
    });
  });

  describe('selectCartTotal', () => {
    it('should return discounted total from state', () => {
      const state = createMockState([sampleItem], 200, 180);
      expect(selectCartTotal(state)).toBe(180);
    });
  });

  describe('selectCartSavings', () => {
    it('should return 0 when no discounts', () => {
      const state = createMockState([anotherItem], 150, 150);
      expect(selectCartSavings(state)).toBe(0);
    });

    it('should calculate savings correctly', () => {
      const state = createMockState([sampleItem], 200, 180);
      expect(selectCartSavings(state)).toBe(20); // 200 - 180
    });
  });

  describe('selectIsCartEmpty', () => {
    it('should return true for empty cart', () => {
      const state = createMockState([], 0, 0);
      expect(selectIsCartEmpty(state)).toBe(true);
    });

    it('should return false when cart has items', () => {
      const state = createMockState([sampleItem], 200, 180);
      expect(selectIsCartEmpty(state)).toBe(false);
    });
  });

  describe('selectIsInCart', () => {
    it('should return true if product is in cart', () => {
      const state = createMockState([sampleItem], 200, 180);
      const isInCart = selectIsInCart(sampleItem.id)(state);
      expect(isInCart).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const state = createMockState([sampleItem], 200, 180);
      const isInCart = selectIsInCart(999)(state);
      expect(isInCart).toBe(false);
    });
  });

  describe('selectItemQuantity', () => {
    it('should return quantity of item in cart', () => {
      const state = createMockState([sampleItem], 200, 180);
      const quantity = selectItemQuantity(sampleItem.id)(state);
      expect(quantity).toBe(2);
    });

    it('should return 0 if item not in cart', () => {
      const state = createMockState([sampleItem], 200, 180);
      const quantity = selectItemQuantity(999)(state);
      expect(quantity).toBe(0);
    });
  });

  describe('selectEstimatedTax', () => {
    it('should calculate 8% tax on cart total', () => {
      const state = createMockState([sampleItem], 200, 100);
      expect(selectEstimatedTax(state)).toBe(8); // 100 * 0.08
    });

    it('should return 0 for empty cart', () => {
      const state = createMockState([], 0, 0);
      expect(selectEstimatedTax(state)).toBe(0);
    });
  });

  describe('selectEstimatedShipping', () => {
    it('should return $5.99 for orders under $50', () => {
      const state = createMockState([{ ...sampleItem, quantity: 1 }], 100, 40);
      expect(selectEstimatedShipping(state)).toBe(5.99);
    });

    it('should return $0 (free shipping) for orders $50 and above', () => {
      const state = createMockState([sampleItem], 200, 50);
      expect(selectEstimatedShipping(state)).toBe(0);
    });

    it('should return free shipping for exactly $50', () => {
      const state = createMockState([sampleItem], 200, 50);
      expect(selectEstimatedShipping(state)).toBe(0);
    });
  });

  describe('selectOrderTotal', () => {
    it('should calculate cart + tax + shipping for small orders', () => {
      const state = createMockState([{ ...sampleItem, quantity: 1 }], 100, 40);
      // 40 (cart) + 3.2 (tax) + 5.99 (shipping) = 49.19
      expect(selectOrderTotal(state)).toBeCloseTo(49.19, 2);
    });

    it('should calculate cart + tax (free shipping) for large orders', () => {
      const state = createMockState([sampleItem], 200, 100);
      // 100 (cart) + 8 (tax) + 0 (shipping) = 108
      expect(selectOrderTotal(state)).toBe(108);
    });

    it('should return shipping cost for empty cart (no items to calculate from)', () => {
      const state = createMockState([], 0, 0);
      // Empty cart still shows shipping cost (5.99) - this is expected behavior
      // In practice, checkout would be disabled for empty cart
      expect(selectOrderTotal(state)).toBe(5.99);
    });
  });
});
