import type { CartItem } from '@/types';
import { beforeEach, describe, expect, it } from 'vitest';
import cartReducer, {
    addCartItem,
    clearCart,
    removeCartItem,
    setCartError,
    setCartItems,
    setCartLoading,
    updateCartQuantity,
    type CartState,
} from './cartSlice';

/**
 * Cart Slice Tests
 * 
 * Tests cover:
 * - Adding items (new and existing)
 * - Removing items
 * - Updating quantities
 * - Clearing cart
 * - Total calculations
 * - Edge cases (empty cart, invalid operations)
 */

describe('cartSlice', () => {
  // Sample cart item for testing
  const sampleItem: CartItem = {
    id: 1,
    title: 'Test Product',
    price: 100,
    quantity: 1,
    total: 100,
    discountPercentage: 10,
    discountedTotal: 90,
    thumbnail: 'https://example.com/image.jpg',
  };

  const anotherItem: CartItem = {
    id: 2,
    title: 'Another Product',
    price: 50,
    quantity: 2,
    total: 100,
    discountPercentage: 0,
    discountedTotal: 100,
    thumbnail: 'https://example.com/image2.jpg',
  };

  // Initial state for testing
  let initialState: CartState;

  beforeEach(() => {
    initialState = {
      items: [],
      total: 0,
      discountedTotal: 0,
      loading: false,
      error: null,
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('addCartItem', () => {
    it('should add a new item to empty cart', () => {
      const state = cartReducer(initialState, addCartItem(sampleItem));

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(sampleItem);
      expect(state.total).toBe(100);
      expect(state.discountedTotal).toBe(90);
    });

    it('should add multiple different items', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, addCartItem(anotherItem));

      expect(state.items).toHaveLength(2);
      expect(state.total).toBe(200); // 100 + 50*2
      expect(state.discountedTotal).toBe(190); // 90 + 100
    });

    it('should increase quantity when adding existing item', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      
      const sameItemWithMoreQty: CartItem = {
        ...sampleItem,
        quantity: 2,
      };
      state = cartReducer(state, addCartItem(sameItemWithMoreQty));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3); // 1 + 2
      expect(state.total).toBe(300); // 100 * 3
      expect(state.discountedTotal).toBe(270); // 90 * 3
    });

    it('should handle item with no discount', () => {
      const noDiscountItem: CartItem = {
        ...sampleItem,
        discountPercentage: 0,
        discountedTotal: 100,
      };
      const state = cartReducer(initialState, addCartItem(noDiscountItem));

      expect(state.total).toBe(100);
      expect(state.discountedTotal).toBe(100);
    });
  });

  describe('removeCartItem', () => {
    it('should remove an item from cart', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, addCartItem(anotherItem));
      state = cartReducer(state, removeCartItem(sampleItem.id));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe(anotherItem.id);
      expect(state.total).toBe(100); // Only anotherItem remains
    });

    it('should handle removing non-existent item', () => {
      const state = cartReducer(initialState, addCartItem(sampleItem));
      const newState = cartReducer(state, removeCartItem(999));

      expect(newState.items).toHaveLength(1);
      expect(newState).toEqual(state);
    });

    it('should result in empty cart when removing last item', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, removeCartItem(sampleItem.id));

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.discountedTotal).toBe(0);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update quantity of an existing item', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, updateCartQuantity({ id: sampleItem.id, quantity: 5 }));

      expect(state.items[0].quantity).toBe(5);
      expect(state.total).toBe(500); // 100 * 5
      expect(state.discountedTotal).toBe(450); // 90 * 5
    });

    it('should handle updating to quantity of 1', () => {
      let state = cartReducer(initialState, addCartItem({ ...sampleItem, quantity: 5 }));
      state = cartReducer(state, updateCartQuantity({ id: sampleItem.id, quantity: 1 }));

      expect(state.items[0].quantity).toBe(1);
    });

    it('should not update non-existent item', () => {
      const state = cartReducer(initialState, addCartItem(sampleItem));
      const newState = cartReducer(state, updateCartQuantity({ id: 999, quantity: 5 }));

      expect(newState).toEqual(state);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, addCartItem(anotherItem));
      state = cartReducer(state, clearCart());

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.discountedTotal).toBe(0);
    });

    it('should handle clearing already empty cart', () => {
      const state = cartReducer(initialState, clearCart());

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('setCartItems', () => {
    it('should replace all items in cart', () => {
      const items: CartItem[] = [sampleItem, anotherItem];
      const state = cartReducer(initialState, setCartItems(items));

      expect(state.items).toEqual(items);
      expect(state.total).toBe(200);
    });

    it('should handle setting empty array', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, setCartItems([]));

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      const state = cartReducer(initialState, setCartLoading(true));
      expect(state.loading).toBe(true);

      const newState = cartReducer(state, setCartLoading(false));
      expect(newState.loading).toBe(false);
    });

    it('should set error state', () => {
      const errorMessage = 'Failed to load cart';
      const state = cartReducer(initialState, setCartError(errorMessage));
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error state', () => {
      let state = cartReducer(initialState, setCartError('Some error'));
      state = cartReducer(state, setCartError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('total calculations', () => {
    it('should correctly calculate totals with multiple items', () => {
      const item1: CartItem = {
        id: 1,
        title: 'Product 1',
        price: 100,
        quantity: 2,
        total: 200,
        discountPercentage: 20,
        discountedTotal: 160,
        thumbnail: 'img1.jpg',
      };

      const item2: CartItem = {
        id: 2,
        title: 'Product 2',
        price: 50,
        quantity: 3,
        total: 150,
        discountPercentage: 10,
        discountedTotal: 135,
        thumbnail: 'img2.jpg',
      };

      let state = cartReducer(initialState, addCartItem(item1));
      state = cartReducer(state, addCartItem(item2));

      // Total: (100 * 2) + (50 * 3) = 200 + 150 = 350
      expect(state.total).toBe(350);
      // Discounted: (100 * 2 * 0.8) + (50 * 3 * 0.9) = 160 + 135 = 295
      expect(state.discountedTotal).toBe(295);
    });

    it('should recalculate totals after quantity update', () => {
      let state = cartReducer(initialState, addCartItem(sampleItem));
      state = cartReducer(state, updateCartQuantity({ id: sampleItem.id, quantity: 10 }));

      expect(state.total).toBe(1000); // 100 * 10
      expect(state.discountedTotal).toBe(900); // 90 * 10
    });
  });

  describe('edge cases', () => {
    it('should handle item with 100% discount', () => {
      const freeItem: CartItem = {
        ...sampleItem,
        discountPercentage: 100,
        discountedTotal: 0,
      };
      const state = cartReducer(initialState, addCartItem(freeItem));

      expect(state.total).toBe(100);
      expect(state.discountedTotal).toBe(0);
    });

    it('should handle very large quantities', () => {
      const largeQtyItem: CartItem = {
        ...sampleItem,
        quantity: 1000,
        total: 100000,
        discountedTotal: 90000,
      };
      const state = cartReducer(initialState, addCartItem(largeQtyItem));

      expect(state.items[0].quantity).toBe(1000);
      expect(state.total).toBe(100000);
    });

    it('should handle decimal prices correctly', () => {
      const decimalItem: CartItem = {
        id: 3,
        title: 'Decimal Price',
        price: 99.99,
        quantity: 3,
        total: 299.97,
        discountPercentage: 15,
        discountedTotal: 254.97,
        thumbnail: 'decimal.jpg',
      };
      const state = cartReducer(initialState, addCartItem(decimalItem));

      expect(state.items[0].price).toBe(99.99);
      // Due to floating point, we use toBeCloseTo
      expect(state.total).toBeCloseTo(299.97, 2);
    });
  });
});
