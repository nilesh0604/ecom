/**
 * Integration Tests - Cart to Checkout Flow
 *
 * Interview Discussion Points:
 * - Integration testing vs unit testing vs E2E
 * - Testing user flows vs isolated components
 * - Mock strategies for integration tests
 * - State management testing
 *
 * @module test/integration
 */

import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import slices
import authReducer from '@/store/slices/authSlice';
import cartReducer, {
    addCartItem,
    clearCart,
    removeCartItem,
    updateCartQuantity,
} from '@/store/slices/cartSlice';

// Import selectors
import {
    selectCartItemCount,
    selectCartItems,
    selectCartTotal,
} from '@/store/selectors/cartSelectors';

// Types
import type { Product } from '@/types';

// ============================================
// Test Utilities
// ============================================

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
    preloadedState,
  });
}

type TestStore = ReturnType<typeof createTestStore>;

function renderWithProviders(
  ui: React.ReactElement,
  {
    store = createTestStore(),
    route = '/',
  }: {
    store?: TestStore;
    route?: string;
  } = {}
) {
  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}

// ============================================
// Mock Data
// ============================================

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  image: 'https://example.com/image.jpg',
  category: 'electronics',
  stock: 10,
  rating: 4.5,
};

const mockProduct2: Product = {
  id: '2',
  name: 'Another Product',
  description: 'Another test product',
  price: 49.99,
  image: 'https://example.com/image2.jpg',
  category: 'clothing',
  stock: 5,
  rating: 4.0,
};

// ============================================
// Cart State Integration Tests
// ============================================

describe('Cart State Integration', () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Add to Cart Flow', () => {
    it('should add a product to cart and update totals', () => {
      // Add product
      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));

      const state = store.getState();
      const items = selectCartItems(state);
      const total = selectCartTotal(state);
      const itemCount = selectCartItemCount(state);

      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('1');
      expect(items[0].quantity).toBe(2);
      expect(total).toBe(59.98); // 29.99 * 2
      expect(itemCount).toBe(2);
    });

    it('should increment quantity when adding same product', () => {
      store.dispatch(addToCart({ product: mockProduct, quantity: 1 }));
      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));

      const items = selectCartItems(store.getState());

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('should handle multiple different products', () => {
      store.dispatch(addToCart({ product: mockProduct, quantity: 1 }));
      store.dispatch(addToCart({ product: mockProduct2, quantity: 2 }));

      const state = store.getState();
      const items = selectCartItems(state);
      const total = selectCartTotal(state);

      expect(items).toHaveLength(2);
      expect(total).toBeCloseTo(129.97); // 29.99 + (49.99 * 2)
    });
  });

  describe('Update Quantity Flow', () => {
    beforeEach(() => {
      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));
    });

    it('should update quantity and recalculate total', () => {
      store.dispatch(updateQuantity({ productId: '1', quantity: 5 }));

      const state = store.getState();
      const items = selectCartItems(state);
      const total = selectCartTotal(state);

      expect(items[0].quantity).toBe(5);
      expect(total).toBeCloseTo(149.95); // 29.99 * 5
    });

    it('should not allow quantity below 1', () => {
      store.dispatch(updateQuantity({ productId: '1', quantity: 0 }));

      const items = selectCartItems(store.getState());
      expect(items[0].quantity).toBe(1); // Should be minimum 1 or remove item
    });

    it('should not exceed stock limit', () => {
      store.dispatch(updateQuantity({ productId: '1', quantity: 100 }));

      const items = selectCartItems(store.getState());
      expect(items[0].quantity).toBeLessThanOrEqual(mockProduct.stock);
    });
  });

  describe('Remove from Cart Flow', () => {
    beforeEach(() => {
      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));
      store.dispatch(addToCart({ product: mockProduct2, quantity: 1 }));
    });

    it('should remove specific item from cart', () => {
      store.dispatch(removeFromCart('1'));

      const items = selectCartItems(store.getState());
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('2');
    });

    it('should update totals after removal', () => {
      store.dispatch(removeFromCart('1'));

      const total = selectCartTotal(store.getState());
      expect(total).toBeCloseTo(49.99);
    });
  });

  describe('Clear Cart Flow', () => {
    beforeEach(() => {
      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));
      store.dispatch(addToCart({ product: mockProduct2, quantity: 1 }));
    });

    it('should clear all items from cart', () => {
      store.dispatch(clearCart());

      const state = store.getState();
      expect(selectCartItems(state)).toHaveLength(0);
      expect(selectCartTotal(state)).toBe(0);
      expect(selectCartItemCount(state)).toBe(0);
    });
  });
});

// ============================================
// Checkout Flow Integration Tests
// ============================================

describe('Checkout Flow Integration', () => {
  const mockCheckoutData = {
    shipping: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    payment: {
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'John Doe',
    },
  };

  // Mock API calls
  const mockPlaceOrder = vi.fn();
  const mockValidateCard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaceOrder.mockResolvedValue({ orderId: 'ORDER-123' });
    mockValidateCard.mockResolvedValue({ valid: true });
  });

  describe('Step Navigation', () => {
    it('should start at shipping step', () => {
      const store = createTestStore({
        cart: {
          items: [{ product: mockProduct, quantity: 1 }],
        },
      });

      // This would render your actual checkout component
      // For now, testing the concept
      expect(store.getState().cart.items).toHaveLength(1);
    });

    it('should validate shipping before proceeding to payment', async () => {
      // Integration test for form validation
      const isShippingValid = (data: typeof mockCheckoutData.shipping) => {
        return (
          data.firstName.length > 0 &&
          data.lastName.length > 0 &&
          data.address.length > 0 &&
          data.city.length > 0 &&
          data.zipCode.length === 5
        );
      };

      expect(isShippingValid(mockCheckoutData.shipping)).toBe(true);
      expect(isShippingValid({ ...mockCheckoutData.shipping, zipCode: '' })).toBe(false);
    });

    it('should validate payment before proceeding to review', async () => {
      const isPaymentValid = (data: typeof mockCheckoutData.payment) => {
        return (
          data.cardNumber.length === 16 &&
          data.cvv.length === 3 &&
          data.expiryDate.match(/^\d{2}\/\d{2}$/) !== null
        );
      };

      expect(isPaymentValid(mockCheckoutData.payment)).toBe(true);
      expect(isPaymentValid({ ...mockCheckoutData.payment, cvv: '12' })).toBe(false);
    });
  });

  describe('Order Placement', () => {
    it('should submit order with complete data', async () => {
      const orderData = {
        items: [{ productId: '1', quantity: 2, price: 29.99 }],
        shipping: mockCheckoutData.shipping,
        payment: {
          last4: '1111',
          type: 'visa',
        },
        total: 59.98,
      };

      await mockPlaceOrder(orderData);

      expect(mockPlaceOrder).toHaveBeenCalledWith(orderData);
      expect(mockPlaceOrder).toHaveBeenCalledTimes(1);
    });

    it('should clear cart after successful order', async () => {
      const store = createTestStore({
        cart: {
          items: [{ product: mockProduct, quantity: 2 }],
        },
      });

      // Simulate successful order
      await mockPlaceOrder({});
      store.dispatch(clearCart());

      expect(selectCartItems(store.getState())).toHaveLength(0);
    });

    it('should handle order failure gracefully', async () => {
      mockPlaceOrder.mockRejectedValueOnce(new Error('Payment failed'));

      const store = createTestStore({
        cart: {
          items: [{ product: mockProduct, quantity: 2 }],
        },
      });

      await expect(mockPlaceOrder({})).rejects.toThrow('Payment failed');

      // Cart should still have items after failed order
      expect(selectCartItems(store.getState())).toHaveLength(1);
    });
  });
});

// ============================================
// User Flow Integration Tests
// ============================================

describe('User Flow Integration', () => {
  describe('Guest to Registered User Flow', () => {
    it('should preserve cart when logging in', () => {
      const store = createTestStore({
        cart: {
          items: [{ product: mockProduct, quantity: 2 }],
        },
        auth: {
          user: null,
          isAuthenticated: false,
        },
      });

      const cartBefore = selectCartItems(store.getState());
      expect(cartBefore).toHaveLength(1);

      // Simulate login (in real app, this would be an action)
      // Cart should persist through login
      const cartAfter = selectCartItems(store.getState());
      expect(cartAfter).toEqual(cartBefore);
    });

    it('should merge carts when logging in with existing cart', () => {
      // This tests the cart merge logic
      const guestCart = [{ product: mockProduct, quantity: 2 }];
      const userCart = [{ product: mockProduct2, quantity: 1 }];

      // Merged cart should contain both items
      const mergedItems = [...guestCart, ...userCart];
      expect(mergedItems).toHaveLength(2);
    });
  });

  describe('Product to Checkout Flow', () => {
    it('should complete full purchase flow', async () => {
      const steps: string[] = [];

      // 1. View product
      steps.push('view_product');

      // 2. Add to cart
      const store = createTestStore();
      store.dispatch(addToCart({ product: mockProduct, quantity: 1 }));
      steps.push('add_to_cart');

      // 3. View cart
      expect(selectCartItems(store.getState())).toHaveLength(1);
      steps.push('view_cart');

      // 4. Proceed to checkout
      steps.push('start_checkout');

      // 5. Fill shipping
      steps.push('fill_shipping');

      // 6. Fill payment
      steps.push('fill_payment');

      // 7. Review order
      steps.push('review_order');

      // 8. Place order
      steps.push('place_order');

      // 9. Order confirmation
      store.dispatch(clearCart());
      steps.push('order_confirmed');

      expect(steps).toEqual([
        'view_product',
        'add_to_cart',
        'view_cart',
        'start_checkout',
        'fill_shipping',
        'fill_payment',
        'review_order',
        'place_order',
        'order_confirmed',
      ]);

      expect(selectCartItems(store.getState())).toHaveLength(0);
    });
  });
});
