import type { Cart, Order, PaginatedResponse } from '@/types';
import { apiClient } from '@/utils';

/**
 * Order Service - Handles order creation and management
 * 
 * Typical flow:
 * 1. User adds items to cart (cart service)
 * 2. User proceeds to checkout
 * 3. Call orderService.createOrder(cart) to create order
 * 4. Order is created from cart snapshot
 * 5. User views orders with orderService.getMyOrders()
 * 
 * Usage in components:
 * import { orderService } from '@/services/orderService';
 * 
 * const order = await orderService.createOrder(cart);
 * const orders = await orderService.getMyOrders();
 */

export interface CreateOrderRequest {
  products: Array<{
    id: number;
    quantity: number;
  }>;
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
}

export interface OrderStatusUpdate {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export const orderService = {
  /**
   * Create a new order from cart
   * 
   * What happens:
   * 1. Takes cart items and totals
   * 2. Creates permanent order record
   * 3. Clears user's cart
   * 4. Returns order with confirmation details
   * 
   * @param cartData - Current cart with items and totals
   * @returns Created order with ID and details
   * 
   * Example:
   * const order = await orderService.createOrder(cart);
   * console.log(`Order #${order.id} created!`);
   */
  createOrder: (cartData: Cart) =>
    apiClient.post<Order>('/orders', cartData),

  /**
   * Get all orders for current user
   * 
   * @param skip - Number of orders to skip (pagination)
   * @param limit - Number of orders per page
   * @returns Paginated list of user's orders
   * 
   * Example:
   * const { items: orders, total } = await orderService.getMyOrders(0, 10);
   * console.log(`You have ${total} orders`);
   */
  getMyOrders: (skip: number = 0, limit: number = 10) =>
    apiClient.get<PaginatedResponse<Order>>(
      `/orders?skip=${skip}&limit=${limit}`
    ),

  /**
   * Get single order by ID
   * 
   * @param orderId - Order ID
   * @returns Order details with all items and timeline
   * 
   * Example:
   * const order = await orderService.getOrder('ORD-12345');
   * console.log(order.status); // 'shipped'
   */
  getOrder: (orderId: string) =>
    apiClient.get<Order>(`/orders/${orderId}`),

  /**
   * Get all orders (admin only)
   * 
   * @param skip - Number of orders to skip
   * @param limit - Number of orders per page
   * @returns All orders in system
   * 
   * Example:
   * const { items: allOrders } = await orderService.getAllOrders(0, 50);
   */
  getAllOrders: (skip: number = 0, limit: number = 10) =>
    apiClient.get<PaginatedResponse<Order>>(
      `/orders/admin/all?skip=${skip}&limit=${limit}`
    ),

  /**
   * Get order statistics (admin only)
   * 
   * Returns summary of orders by status, revenue, etc.
   * 
   * @returns Order statistics
   * 
   * Example:
   * const stats = await orderService.getOrderStats();
   * console.log(`Total revenue: $${stats.totalRevenue}`);
   */
  getOrderStats: () =>
    apiClient.get<any>('/orders/admin/stats'),

  /**
   * Update order status (admin only)
   * 
   * Typical flow: pending → processing → shipped → delivered
   * 
   * @param orderId - Order ID to update
   * @param update - New status and optional notes
   * @returns Updated order
   * 
   * Example:
   * const updated = await orderService.updateStatus('ORD-12345', {
   *   status: 'shipped'
   * });
   */
  updateStatus: (orderId: string, update: OrderStatusUpdate) =>
    apiClient.patch<Order>(`/orders/${orderId}/status`, update),

  /**
   * Cancel an order
   * 
   * Requirements:
   * - Order must not be already shipped/delivered
   * - Only order owner or admin can cancel
   * 
   * @param orderId - Order ID to cancel
   * @param reason - Reason for cancellation
   * @returns Cancelled order
   * 
   * Example:
   * const cancelled = await orderService.cancelOrder('ORD-12345', 'Changed mind');
   */
  cancelOrder: (orderId: string, reason?: string) =>
    apiClient.post<Order>(`/orders/${orderId}/cancel`, { reason }),

  /**
   * Get order tracking information
   * 
   * Returns tracking number and estimated delivery date
   * 
   * @param orderId - Order ID
   * @returns Tracking information
   * 
   * Example:
   * const tracking = await orderService.getTracking('ORD-12345');
   * console.log(`Tracking: ${tracking.number}`);
   * console.log(`Arrives: ${tracking.estimatedDate}`);
   */
  getTracking: (orderId: string) =>
    apiClient.get<any>(`/orders/${orderId}/tracking`),

  /**
   * Get order invoice/receipt
   * 
   * Returns PDF URL or invoice data
   * 
   * @param orderId - Order ID
   * @returns Invoice data or download URL
   * 
   * Example:
   * const invoice = await orderService.getInvoice('ORD-12345');
   * window.open(invoice.pdfUrl); // Download PDF
   */
  getInvoice: (orderId: string) =>
    apiClient.get<any>(`/orders/${orderId}/invoice`),

  /**
   * Add order note/comment
   * 
   * @param orderId - Order ID
   * @param note - Note to add
   * @returns Updated order with note
   * 
   * Example:
   * await orderService.addNote('ORD-12345', 'Leave at door');
   */
  addNote: (orderId: string, note: string) =>
    apiClient.post<Order>(`/orders/${orderId}/notes`, { note }),

  /**
   * Request return/refund
   * 
   * @param orderId - Order ID
   * @param reason - Return reason
   * @param itemIds - Which items to return (if partial return)
   * @returns Return request
   * 
   * Example:
   * const returnReq = await orderService.requestReturn('ORD-12345', 'Defective', [123]);
   */
  requestReturn: (orderId: string, reason: string, itemIds?: number[]) =>
    apiClient.post<any>(`/orders/${orderId}/return`, { reason, itemIds }),
};
