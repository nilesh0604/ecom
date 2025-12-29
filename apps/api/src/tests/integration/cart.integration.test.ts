import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import request from 'supertest';

// Create a minimal test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  return app;
};

// Mock the database
jest.mock('../../config/database', () => ({
  prisma: {
    cart: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
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
    throw new Error('Invalid token');
  }),
  sign: jest.fn(() => 'mock-token'),
}));

import { prisma } from '../../config/database';

describe('Cart API Integration Tests', () => {
  let app: Express;
  const sessionId = 'test-session-id';

  const mockProduct = {
    id: 1,
    title: 'Test Product',
    price: 99.99,
    stock: 10,
    thumbnail: 'https://example.com/image.jpg',
    isActive: true,
  };

  const mockCartItem = {
    id: 1,
    cartId: 1,
    productId: 1,
    quantity: 2,
    product: mockProduct,
  };

  const mockCart = {
    id: 1,
    userId: null,
    sessionId: sessionId,
    items: [mockCartItem],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const cartRoutes = (await import('../../routes/cart.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');

    app = createTestApp();
    app.use('/api/v1/cart', cartRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cart', () => {
    it('should return empty cart for new guest session', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.cart.create as jest.Mock).mockResolvedValue({
        ...mockCart,
        items: [],
      });

      const response = await request(app)
        .get('/api/v1/cart')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return existing cart with items', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);

      const response = await request(app)
        .get('/api/v1/cart')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return cart for authenticated user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'USER',
        isActive: true,
      });
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue({
        ...mockCart,
        userId: 1,
        sessionId: null,
      });

      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    const addItemPayload = {
      productId: 1,
      quantity: 2,
    };

    it('should add item to cart', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.cartItem.upsert as jest.Mock).mockResolvedValue(mockCartItem);
      // For getCart after add
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('x-session-id', sessionId)
        .send(addItemPayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to cart');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('x-session-id', sessionId)
        .send({ productId: -1, quantity: 1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('x-session-id', sessionId)
        .send({ productId: 1, quantity: 0 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('x-session-id', sessionId)
        .send({ productId: 999, quantity: 1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/cart/items/:itemId', () => {
    it('should update cart item quantity', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        product: mockProduct,
      });
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        quantity: 5,
      });

      const response = await request(app)
        .put('/api/v1/cart/items/1')
        .set('x-session-id', sessionId)
        .send({ quantity: 5 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .put('/api/v1/cart/items/1')
        .set('x-session-id', sessionId)
        .send({ quantity: -1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent cart item', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/cart/items/999')
        .set('x-session-id', sessionId)
        .send({ quantity: 3 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/cart/items/:itemId', () => {
    it('should remove item from cart', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/v1/cart/items/1')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent item', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete('/api/v1/cart/items/999')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear all items from cart', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/v1/cart')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cart cleared');
    });
  });

  describe('POST /api/v1/cart/merge', () => {
    it('should merge guest cart into user cart', async () => {
      const guestCart = { ...mockCart, userId: null, sessionId: sessionId };
      const userCart = { ...mockCart, userId: 1, sessionId: null, items: [] };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'USER',
        isActive: true,
      });
      // First call finds guest cart, second creates/finds user cart
      (prisma.cart.findFirst as jest.Mock)
        .mockResolvedValueOnce(guestCart) // Guest cart lookup
        .mockResolvedValueOnce(userCart) // User cart lookup for merge
        .mockResolvedValueOnce({ ...userCart, items: [mockCartItem] }); // Final getCart
      (prisma.cartItem.upsert as jest.Mock).mockResolvedValue(mockCartItem);
      (prisma.cart.delete as jest.Mock).mockResolvedValue(guestCart);

      const response = await request(app)
        .post('/api/v1/cart/merge')
        .set('Authorization', 'Bearer valid-token')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/cart/merge')
        .set('x-session-id', sessionId)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});
