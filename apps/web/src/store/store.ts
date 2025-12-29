/**
 * Redux Store Configuration
 * 
 * Configures and exports the Redux store for the application.
 * Includes cart persistence middleware and preloaded state hydration.
 * 
 * @module store/store
 * 
 * Features:
 * - Cart state persistence to localStorage
 * - Zod validation for hydrated cart data
 * - Type-safe state and dispatch
 * 
 * @example
 * ```tsx
 * // In main.tsx
 * import { Provider } from 'react-redux';
 * import { store } from '@/store';
 * 
 * <Provider store={store}>
 *   <App />
 * </Provider>
 * ```
 */
import { configureStore } from '@reduxjs/toolkit';
import { cartPersistenceMiddleware, loadCartFromStorage } from './middleware';
import authReducer from './slices/authSlice';
import cartReducer, { type CartState } from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import productReducer from './slices/productSlice';
import uiReducer from './slices/uiSlice';

/**
 * Hydrate cart state from localStorage
 * 
 * Attempts to load previously saved cart from localStorage.
 * Uses Zod validation to ensure data integrity and prevent
 * corrupted data from breaking the app.
 * 
 * @returns {CartState} Validated cart state or initial empty state
 */
const getPreloadedCartState = (): CartState => {
  const savedCart = loadCartFromStorage();
  if (savedCart) {
    return {
      items: savedCart.items,
      total: savedCart.total,
      discountedTotal: savedCart.discountedTotal,
      loading: false,
      error: null,
    };
  }
  return {
    items: [],
    total: 0,
    discountedTotal: 0,
    loading: false,
    error: null,
  };
};

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    orders: ordersReducer,
  },
  preloadedState: {
    cart: getPreloadedCartState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
