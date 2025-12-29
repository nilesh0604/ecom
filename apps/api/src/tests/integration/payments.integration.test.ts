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

// Mock the payments service
jest.mock('../../services/payments.service', () => ({
  paymentsService: {
    createPaymentIntent: jest.fn(),
    getPaymentByOrderId: jest.fn(),
    refundPayment: jest.fn(),
    handleWebhook: jest.fn(),
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

// Mock rate limiter
jest.mock('../../middleware/rateLimit.middleware', () => ({
  paymentLimiter: (req: any, res: any, next: any) => next(),
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
import { paymentsService } from '../../services/payments.service';
import { AppError, NotFoundError } from '../../utils/errors';

describe('Payments API Integration Tests', () => {
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

  const mockPaymentIntent = {
    clientSecret: 'pi_test123_secret_abc',
    paymentIntentId: 'pi_test123',
    amount: 22598,
    currency: 'usd',
  };

  const mockPayment = {
    id: 1,
    orderId: 1,
    userId: 1,
    amount: 225.98,
    currency: 'usd',
    status: 'SUCCEEDED',
    stripePaymentIntentId: 'pi_test123',
    paymentMethod: 'card',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const paymentsRoutes = (await import('../../routes/payments.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');

    app = createTestApp();
    app.use('/api/v1/payments', paymentsRoutes);
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

  describe('POST /api/v1/payments/create-intent', () => {
    const createIntentPayload = {
      orderId: '1',
      amount: 225.98,
      currency: 'USD',
    };

    it('should create a payment intent', async () => {
      (paymentsService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', 'Bearer valid-token')
        .send(createIntentPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('clientSecret');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .send(createIntentPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({ orderId: '1' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      (paymentsService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new NotFoundError('Order')
      );

      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({ orderId: '999', amount: 100, currency: 'USD' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for already paid order', async () => {
      (paymentsService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new AppError('Order has already been paid', 400)
      );

      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', 'Bearer valid-token')
        .send(createIntentPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/payments/order/:orderId', () => {
    it('should return payment by order ID', async () => {
      (paymentsService.getPaymentByOrderId as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(app)
        .get('/api/v1/payments/order/1')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/payments/order/1')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent order', async () => {
      (paymentsService.getPaymentByOrderId as jest.Mock).mockRejectedValue(
        new NotFoundError('Payment')
      );

      const response = await request(app)
        .get('/api/v1/payments/order/999')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/payments/:paymentId/refund (Admin)', () => {
    it('should process refund for admin', async () => {
      (paymentsService.refundPayment as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'REFUNDED',
      });

      const response = await request(app)
        .post('/api/v1/payments/1/refund')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/v1/payments/1/refund')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent payment', async () => {
      (paymentsService.refundPayment as jest.Mock).mockRejectedValue(
        new NotFoundError('Payment')
      );

      const response = await request(app)
        .post('/api/v1/payments/999/refund')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 400 for already refunded payment', async () => {
      (paymentsService.refundPayment as jest.Mock).mockRejectedValue(
        new AppError('Payment has already been refunded', 400)
      );

      const response = await request(app)
        .post('/api/v1/payments/1/refund')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/payments/webhook', () => {
    it('should handle webhook events', async () => {
      (paymentsService.handleWebhook as jest.Mock).mockResolvedValue({ received: true });

      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
          },
        },
      };

      const response = await request(app)
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid webhook', async () => {
      (paymentsService.handleWebhook as jest.Mock).mockRejectedValue(
        new AppError('Invalid webhook signature', 400)
      );

      const response = await request(app)
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
