import { Request, Response } from 'express';
import { ordersService } from '../services/orders.service';
import { AuthRequest, CreateOrderDto, UpdateOrderStatusDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Create order
 * POST /api/v1/orders
 */
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const orderData: CreateOrderDto = req.body;

  const order = await ordersService.createOrder(userId, orderData);

  ApiResponse.created(res, order, 'Order created successfully');
});

/**
 * Get user's orders
 * GET /api/v1/orders
 */
export const getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { skip = '0', limit = '10', status } = req.query;

  const result = await ordersService.getUserOrders(
    userId,
    parseInt(skip as string),
    parseInt(limit as string),
    status as any
  );

  ApiResponse.paginated(
    res,
    result.orders,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Get order by ID
 * GET /api/v1/orders/:id
 */
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user!.id;

  const order = await ordersService.getOrderById(orderId, userId);

  ApiResponse.success(res, order);
});

/**
 * Get all orders (admin)
 * GET /api/v1/orders/admin/all
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { skip = '0', limit = '10', status } = req.query;

  const result = await ordersService.getAllOrders(
    parseInt(skip as string),
    parseInt(limit as string),
    status as any
  );

  ApiResponse.paginated(
    res,
    result.orders,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Update order status (admin)
 * PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const updateData: UpdateOrderStatusDto = req.body;

  const order = await ordersService.updateOrderStatus(orderId, updateData);

  ApiResponse.success(res, order, 'Order status updated successfully');
});

/**
 * Cancel order
 * POST /api/v1/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user!.id;
  const { reason } = req.body;

  const order = await ordersService.cancelOrder(orderId, userId, reason);

  ApiResponse.success(res, order, 'Order cancelled successfully');
});

/**
 * Get tracking info
 * GET /api/v1/orders/:id/tracking
 */
export const getTrackingInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user!.id;

  const tracking = await ordersService.getTrackingInfo(orderId, userId);

  ApiResponse.success(res, tracking);
});

/**
 * Get order statistics (admin)
 * GET /api/v1/orders/admin/stats
 */
export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await ordersService.getOrderStats();

  ApiResponse.success(res, stats);
});
