import { OrderStatus } from '@prisma/client';
import { OrdersService } from '../../services/orders.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cart: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../services/cache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../services/eventBus.service', () => ({
  eventBus: {
    emit: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { prisma } from '../../config/database';

describe('OrdersService', () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    ordersService = new OrdersService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const mockProduct = {
      id: 1,
      title: 'Test Product',
      price: 99.99,
      stock: 10,
      isActive: true,
      discountPercentage: 0,
    };

    const mockShippingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phone: '+1234567890',
    };

    const mockCreatedOrder = {
      id: 'order-123',
      userId: 1,
      status: OrderStatus.PENDING,
      subtotal: 199.98,
      tax: 16.0,
      shipping: 0,
      total: 215.98,
      items: [{ id: 1, productId: 1, quantity: 2, price: 99.99 }],
      address: mockShippingAddress,
    };

    it('should create order from products', async () => {
      // Mock $transaction to execute the callback
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            findFirst: jest.fn().mockResolvedValue(mockProduct),
            findUnique: jest.fn().mockResolvedValue(mockProduct),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockCreatedOrder),
          },
          cart: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        };
        return await callback(tx);
      });

      const result = await ordersService.createOrder(1, {
        products: [{ id: 1, quantity: 2 }],
        shippingAddress: mockShippingAddress,
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(OrderStatus.PENDING);
    });

    it('should throw error for insufficient stock', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            findFirst: jest.fn().mockResolvedValue(mockProduct),
          },
        };
        return await callback(tx);
      });

      await expect(
        ordersService.createOrder(1, {
          products: [{ id: 1, quantity: 100 }],
          shippingAddress: mockShippingAddress,
        })
      ).rejects.toThrow();
    });
  });

  describe('getOrderById', () => {
    const mockOrder = {
      id: 'order-123',
      userId: 1,
      status: OrderStatus.PENDING,
      subtotal: 199.98,
      total: 221.97,
      items: [],
      address: {},
    };

    it('should return order for owner', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getOrderById('order-123', 1);

      expect(result).toEqual(mockOrder);
      expect(prisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-123', userId: 1 },
        })
      );
    });

    it('should throw NotFoundError for non-existent order', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(ordersService.getOrderById('non-existent', 1)).rejects.toThrow();
    });

    it('should throw ForbiddenError for non-owner', async () => {
      // When userId doesn't match, findFirst returns null (ownership check)
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(ordersService.getOrderById('order-123', 999)).rejects.toThrow();
    });
  });

  describe('getUserOrders', () => {
    const mockOrders = [
      { id: 'order-1', userId: 1, status: OrderStatus.DELIVERED, total: 100 },
      { id: 'order-2', userId: 1, status: OrderStatus.PENDING, total: 200 },
    ];

    it('should return paginated user orders', async () => {
      // $transaction with array returns array results
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockOrders, 2]);

      const result = await ordersService.getUserOrders(1, 0, 10);

      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('total');
      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter orders by status', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([[mockOrders[1]], 1]);

      const result = await ordersService.getUserOrders(1, 0, 10, OrderStatus.PENDING);

      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('updateOrderStatus', () => {
    const mockOrder = {
      id: 'order-123',
      userId: 1,
      status: OrderStatus.PENDING,
    };

    it('should update order status', async () => {
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PROCESSING,
      });

      const result = await ordersService.updateOrderStatus('order-123', {
        status: OrderStatus.PROCESSING,
      });

      expect(result.status).toBe(OrderStatus.PROCESSING);
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-123' },
          data: expect.objectContaining({ status: OrderStatus.PROCESSING }),
        })
      );
    });

    it('should set deliveredAt when status is DELIVERED', async () => {
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      });

      const result = await ordersService.updateOrderStatus('order-123', {
        status: OrderStatus.DELIVERED,
      });

      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrderStatus.DELIVERED,
            deliveredAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 1,
        status: OrderStatus.PENDING,
        items: [{ productId: 1, quantity: 2 }],
      };

      // getOrderById uses findFirst
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      const cancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          order: {
            update: jest.fn().mockResolvedValue(cancelledOrder),
          },
          product: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      const result = await ordersService.cancelOrder('order-123', 1, 'Changed my mind');

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should not cancel a delivered order', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 1,
        status: OrderStatus.DELIVERED,
      };

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ordersService.cancelOrder('order-123', 1, 'Changed my mind')
      ).rejects.toThrow();
    });

    it('should not cancel a shipped order', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 1,
        status: OrderStatus.SHIPPED,
      };

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ordersService.cancelOrder('order-123', 1, 'Changed my mind')
      ).rejects.toThrow();
    });
  });
});
