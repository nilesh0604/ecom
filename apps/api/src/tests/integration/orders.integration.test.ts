import express, { Express } from 'express';
import request from 'supertest';

// Create a minimal test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  return app;
};

// Mock the database
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Mock the orders service
jest.mock('../../services/orders.service', () => ({
  ordersService: {
    createOrder: jest.fn(),
    getUserOrders: jest.fn(),
    getOrderById: jest.fn(),
    getAllOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
    cancelOrder: jest.fn(),
    getTrackingInfo: jest.fn(),
    getOrderStats: jest.fn(),
  },
}));

jest.mock('../../services/cache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token) => {
    if (token === 'valid-token') {
      return { sub: 1, email: 'user@example.com', role: 'USER' };
    }
    if (token === 'admin-token') {
      return { sub: 2, email: 'admin@example.com', role: 'ADMIN' };
    }
    throw new Error('Invalid token');
  }),
  sign: jest.fn(() => 'mock-token'),
}));

import { prisma } from '../../config/database';
import { ordersService } from '../../services/orders.service';
import { AppError, NotFoundError } from '../../utils/errors';

describe('Orders API Integration Tests', () => {
  let app: Express;

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    isActive: true,
  };

  const mockAdminUser = {
    id: 2,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
  };

  const mockOrder = {
    id: '1',
    userId: 1,
    status: 'PENDING',
    subtotal: 199.98,
    tax: 16.00,
    shipping: 10.00,
    total: 225.98,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const ordersRoutes = (await import('../../routes/orders.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');

    app = createTestApp();
    app.use('/api/v1/orders', ordersRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
      if (where.id === 1) return Promise.resolve(mockUser);
      if (where.id === 2) return Promise.resolve(mockAdminUser);
      return Promise.resolve(null);
    });
  });

  describe('POST /api/v1/orders', () => {
    const createOrderPayload = {
      products: [{ id: 1, quantity: 2 }],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1234567890',
      },
    };

    it('should create a new order', async () => {
      (ordersService.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(createOrderPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(ordersService.createOrder).toHaveBeenCalledWith(1, createOrderPayload);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .send(createOrderPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should return 400 for empty cart', async () => {
      (ordersService.createOrder as jest.Mock).mockRejectedValue(
        new AppError('Cart is empty', 400)
      );

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(createOrderPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return user orders', async () => {
      (ordersService.getUserOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
        skip: 0,
        limit: 10,
      });

      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order by ID', async () => {
      (ordersService.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .get('/api/v1/orders/1')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      (ordersService.getOrderById as jest.Mock).mockRejectedValue(
        new NotFoundError('Order')
      );

      const response = await request(app)
        .get('/api/v1/orders/999')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/orders/:id/cancel', () => {
    it('should cancel a pending order', async () => {
      (ordersService.cancelOrder as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      });

      const response = await request(app)
        .post('/api/v1/orders/1/cancel')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for non-cancellable order', async () => {
      (ordersService.cancelOrder as jest.Mock).mockRejectedValue(
        new AppError('Cannot cancel order in current status', 400)
      );

      const response = await request(app)
        .post('/api/v1/orders/1/cancel')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      (ordersService.cancelOrder as jest.Mock).mockRejectedValue(
        new NotFoundError('Order')
      );

      const response = await request(app)
        .post('/api/v1/orders/999/cancel')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/orders/:id/tracking', () => {
    it('should return tracking info', async () => {
      (ordersService.getTrackingInfo as jest.Mock).mockResolvedValue({
        trackingNumber: 'TRACK123',
        carrier: 'UPS',
        status: 'IN_TRANSIT',
      });

      const response = await request(app)
        .get('/api/v1/orders/1/tracking')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      (ordersService.getTrackingInfo as jest.Mock).mockRejectedValue(
        new NotFoundError('Order')
      );

      const response = await request(app)
        .get('/api/v1/orders/999/tracking')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/orders/admin/all (Admin)', () => {
    it('should return all orders for admin', async () => {
      (ordersService.getAllOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
        skip: 0,
        limit: 10,
      });

      const response = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/orders/admin/stats (Admin)', () => {
    it('should return order statistics for admin', async () => {
      (ordersService.getOrderStats as jest.Mock).mockResolvedValue({
        totalOrders: 100,
        totalRevenue: 50000,
        averageOrderValue: 500,
      });

      const response = await request(app)
        .get('/api/v1/orders/admin/stats')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/stats')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/orders/:id/status (Admin)', () => {
    it('should update order status', async () => {
      (ordersService.updateOrderStatus as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });

      const response = await request(app)
        .patch('/api/v1/orders/1/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'PROCESSING' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/api/v1/orders/1/status')
        .set('Authorization', 'Bearer valid-token')
        .send({ status: 'PROCESSING' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch('/api/v1/orders/1/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'INVALID_STATUS' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      (ordersService.updateOrderStatus as jest.Mock).mockRejectedValue(
        new NotFoundError('Order')
      );

      const response = await request(app)
        .patch('/api/v1/orders/999/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'PROCESSING' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });
});
