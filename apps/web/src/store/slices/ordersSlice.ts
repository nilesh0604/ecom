import type { Order } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Order status type
 */
type OrderStatus = Order['status'];

/**
 * Order state interface
 */
interface OrdersState {
  /** List of user's orders */
  orders: Order[];
  /** Currently selected order for detail view */
  selectedOrder: Order | null;
  /** Loading state for order operations */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

/**
 * Orders slice for managing order history and order details
 * 
 * @example
 * // Dispatch actions
 * dispatch(fetchOrdersStart());
 * dispatch(fetchOrdersSuccess(orders));
 * dispatch(selectOrder(orderId));
 */
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    /**
     * Start fetching orders - sets loading state
     */
    fetchOrdersStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Successfully fetched orders
     */
    fetchOrdersSuccess(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Failed to fetch orders
     */
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    /**
     * Add a new order (after successful checkout)
     */
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload);
    },

    /**
     * Select an order for detailed view
     */
    selectOrder(state, action: PayloadAction<string>) {
      const order = state.orders.find((o) => o.id === action.payload);
      state.selectedOrder = order || null;
    },

    /**
     * Clear selected order
     */
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },

    /**
     * Update order status (for real-time updates)
     */
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>
    ) {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
      }
      if (state.selectedOrder?.id === orderId) {
        state.selectedOrder.status = status;
      }
    },

    /**
     * Clear all orders (on logout)
     */
    clearOrders(state) {
      state.orders = [];
      state.selectedOrder = null;
      state.error = null;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  addOrder,
  selectOrder,
  clearSelectedOrder,
  updateOrderStatus,
  clearOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
