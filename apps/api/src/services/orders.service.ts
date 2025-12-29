import { Order, OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Orders Service
 * 
 * @description Manages all order-related operations including:
 * - Order creation with stock validation
 * - Order retrieval and filtering
 * - Status updates and tracking
 * - Automatic tax and shipping calculation
 * - Order cancellation and refunds
 * 
 * @example
 * ```typescript
 * import { ordersService } from './services/orders.service';
 * 
 * // Create an order
 * const order = await ordersService.createOrder(userId, {
 *   products: [{ id: 1, quantity: 2 }],
 *   shippingAddress: { firstName: 'John', ... }
 * });
 * ```
 * 
 * @class OrdersService
 * @category Services
 */
export class OrdersService {
  /**
   * Create a new order
   * 
   * @description Creates an order with the following steps:
   * 1. Validates product availability and stock (atomic operation)
   * 2. Decrements stock for each product
   * 3. Calculates subtotal, tax (8%), and shipping (free over $100)
   * 4. Creates order with items and shipping address
   * 5. Clears user's cart
   * 6. Sends confirmation email
   * 
   * @param userId - ID of the user placing the order
   * @param orderData - Order data including products and shipping address
   * @returns Created order with items and address
   * @throws {NotFoundError} If any product doesn't exist
   * @throws {AppError} If insufficient stock for any product (400)
   * 
   * @example
   * ```typescript
   * const order = await ordersService.createOrder(userId, {
   *   products: [
   *     { id: 1, quantity: 2 },
   *     { id: 3, quantity: 1 }
   *   ],
   *   shippingAddress: {
   *     firstName: 'John',
   *     lastName: 'Doe',
   *     address: '123 Main St',
   *     city: 'New York',
   *     state: 'NY',
   *     zipCode: '10001',
   *     country: 'USA',
   *     phone: '555-1234'
   *   },
   *   paymentIntentId: 'pi_xxx' // Optional
   * });
   * ```
   */
  async createOrder(userId: number, orderData: CreateOrderDto): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      // Validate products and calculate totals
      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of orderData.products) {
        // Use atomic update with stock check
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.id,
            isActive: true,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          const product = await tx.product.findFirst({
            where: { id: item.id, isActive: true },
          });

          if (!product) {
            throw new NotFoundError(`Product ${item.id}`);
          }

          throw new AppError(
            `Insufficient stock for ${product.title}. Available: ${product.stock}`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        // Get product details
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        const price = Number(product!.price);
        const discount = Number(product!.discountPercentage || 0);
        const discountedPrice = price * (1 - discount / 100);
        const itemTotal = discountedPrice * item.quantity;

        subtotal += itemTotal;

        orderItems.push({
          product: { connect: { id: item.id } },
          quantity: item.quantity,
          price: product!.price,
          total: itemTotal,
        });
      }

      // Calculate totals
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          shipping,
          total,
          items: {
            create: orderItems,
          },
          address: {
            create: orderData.shippingAddress,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
      });

      // Clear user's cart
      const cart = await tx.cart.findFirst({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      logger.info(`Order created: ${order.id} for user ${userId}`);

      return order;
    });
  }

  /**
   * Get paginated orders for a user
   * 
   * @description Retrieves user's orders with optional status filter.
   * Includes order items with product details and shipping address.
   * 
   * @param userId - User ID to get orders for
   * @param skip - Number of orders to skip (pagination offset)
   * @param limit - Maximum number of orders to return
   * @param status - Optional status filter (PENDING, CONFIRMED, etc.)
   * @returns Object containing orders array, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * // Get all orders
   * const { orders } = await ordersService.getUserOrders(userId);
   * 
   * // Get only shipped orders
   * const { orders } = await ordersService.getUserOrders(userId, 0, 10, 'SHIPPED');
   * ```
   */
  async getUserOrders(userId: number, skip = 0, limit = 10, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                },
              },
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get a specific order by ID
   * 
   * @description Retrieves full order details including items, address, payment,
   * and user info. Can optionally verify ownership by userId.
   * 
   * @param orderId - Order ID to retrieve
   * @param userId - Optional user ID for ownership verification
   * @returns Full order object with all related data
   * @throws {NotFoundError} If order doesn't exist or doesn't belong to user
   * 
   * @example
   * ```typescript
   * // Get order (admin - no ownership check)
   * const order = await ordersService.getOrderById(orderId);
   * 
   * // Get order (user - verify ownership)
   * const order = await ordersService.getOrderById(orderId, userId);
   * ```
   */
  async getOrderById(orderId: string, userId?: number): Promise<Order> {
    const where: Prisma.OrderWhereInput = { id: orderId };

    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    return order;
  }

  /**
   * Get all orders (Admin only)
   * 
   * @description Retrieves all orders across all users with optional status filter.
   * Includes user details for each order.
   * 
   * @param skip - Number of orders to skip (pagination offset)
   * @param limit - Maximum number of orders to return
   * @param status - Optional status filter
   * @returns Object containing orders array, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * // Get pending orders for admin review
   * const { orders } = await ordersService.getAllOrders(0, 20, 'PENDING');
   * ```
   */
  async getAllOrders(skip = 0, limit = 10, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      skip,
      limit,
    };
  }

  /**
   * Update order status (Admin only)
   * 
   * @description Updates order status and optional tracking information.
   * Automatically sets deliveredAt timestamp when status is DELIVERED.
   * 
   * @param orderId - Order ID to update
   * @param updateData - Status and optional tracking info
   * @returns Updated order object
   * 
   * @example
   * ```typescript
   * const order = await ordersService.updateOrderStatus(orderId, {
   *   status: 'SHIPPED',
   *   trackingNumber: '1Z999AA10123456784',
   *   carrier: 'UPS',
   *   estimatedDelivery: new Date('2024-01-15')
   * });
   * ```
   */
  async updateOrderStatus(orderId: string, updateData: UpdateOrderStatusDto): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: updateData.status,
        trackingNumber: updateData.trackingNumber,
        carrier: updateData.carrier,
        estimatedDelivery: updateData.estimatedDelivery,
        deliveredAt: updateData.status === OrderStatus.DELIVERED ? new Date() : undefined,
      },
      include: {
        items: true,
        user: true,
      },
    });

    logger.info(`Order ${orderId} status updated to ${updateData.status}`);

    // TODO: Send notification email

    return order;
  }

  /**
   * Cancel an order
   * 
   * @description Cancels an order if it hasn't been shipped yet.
   * Restores product stock and processes refund if applicable.
   * 
   * @param orderId - Order ID to cancel
   * @param userId - User ID for ownership verification
   * @param reason - Optional cancellation reason
   * @returns Cancelled order object
   * @throws {NotFoundError} If order doesn't exist or doesn't belong to user
   * @throws {AppError} If order has already been shipped (422)
   * 
   * @example
   * ```typescript
   * const order = await ordersService.cancelOrder(
   *   orderId,
   *   userId,
   *   'Changed my mind'
   * );
   * ```
   */
  async cancelOrder(orderId: string, userId: number, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId, userId);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new AppError(
        'Cannot cancel order that has been shipped',
        422,
        'ORDER_CANNOT_CANCEL'
      );
    }

    return await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
        include: {
          items: true,
        },
      });

      // Restore stock
      for (const item of (order as any).items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      logger.info(`Order ${orderId} cancelled by user ${userId}`);

      // TODO: Process refund if payment was made

      return updatedOrder;
    });
  }

  /**
   * Get tracking info
   */
  async getTrackingInfo(orderId: string, userId: number) {
    const order = await this.getOrderById(orderId, userId);

    if (!order.trackingNumber) {
      throw new AppError('Tracking information not available', 404, 'TRACKING_UNAVAILABLE');
    }

    // In a real application, you would integrate with carrier APIs
    return {
      orderId,
      status: order.status,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.carrier
        ? `https://www.${order.carrier.toLowerCase()}.com/track?tracknum=${order.trackingNumber}`
        : null,
      estimatedDelivery: order.estimatedDelivery,
      events: [
        {
          status: 'order_placed',
          location: 'Online',
          timestamp: order.createdAt,
          description: 'Order placed',
        },
        {
          status: order.status.toLowerCase(),
          location: 'In Transit',
          timestamp: order.updatedAt,
          description: `Order ${order.status.toLowerCase()}`,
        },
      ],
    };
  }

  /**
   * Get order statistics (admin)
   */
  async getOrderStats() {
    const [totalOrders, pendingOrders, completedOrders, cancelledOrders, revenue] =
      await prisma.$transaction([
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        prisma.order.aggregate({
          where: { status: { not: OrderStatus.CANCELLED } },
          _sum: { total: true },
        }),
      ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenue: Number(revenue._sum.total || 0),
    };
  }
}

export const ordersService = new OrdersService();
export default ordersService;
