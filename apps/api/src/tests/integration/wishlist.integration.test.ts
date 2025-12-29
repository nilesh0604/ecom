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
    wishlist: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
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

describe('Wishlist API Integration Tests', () => {
  let app: Express;

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    isActive: true,
  };

  const mockProduct = {
    id: 1,
    title: 'Test Product',
    description: 'A test product description',
    price: 99.99,
    discountPercentage: 10,
    rating: 4.5,
    stock: 10,
    brand: 'TestBrand',
    category: 'Electronics',
    thumbnail: 'https://example.com/image.jpg',
    images: ['https://example.com/image1.jpg'],
    isActive: true,
  };

  const mockWishlistItem = {
    id: 1,
    userId: 1,
    productId: 1,
    product: mockProduct,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    const wishlistRoutes = (await import('../../routes/wishlist.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');

    app = createTestApp();
    app.use('/api/v1/wishlist', wishlistRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/v1/wishlist', () => {
    it('should return user wishlist', async () => {
      (prisma.wishlist.findMany as jest.Mock).mockResolvedValue([mockWishlistItem]);

      const response = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('count');
    });

    it('should return empty array for empty wishlist', async () => {
      (prisma.wishlist.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/wishlist/count', () => {
    it('should return wishlist count', async () => {
      (prisma.wishlist.count as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .get('/api/v1/wishlist/count')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(5);
    });

    it('should return 0 for empty wishlist', async () => {
      (prisma.wishlist.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/wishlist/count')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /api/v1/wishlist/check/:productId', () => {
    it('should return true if product is in wishlist', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(mockWishlistItem);

      const response = await request(app)
        .get('/api/v1/wishlist/check/1')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(true);
    });

    it('should return false if product is not in wishlist', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/wishlist/check/999')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(false);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist/check/invalid')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/wishlist', () => {
    it('should add product to wishlist', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.wishlist.create as jest.Mock).mockResolvedValue(mockWishlistItem);

      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .send({ productId: 1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing productId', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid productId', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .send({ productId: -1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent product', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .send({ productId: 999 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 if product already in wishlist', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(mockWishlistItem);

      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .send({ productId: 1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist')
        .send({ productId: 1 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/wishlist/:productId', () => {
    it('should remove product from wishlist', async () => {
      (prisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/v1/wishlist/1')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if product not in wishlist', async () => {
      (prisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete('/api/v1/wishlist/999')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .delete('/api/v1/wishlist/invalid')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/wishlist', () => {
    it('should clear entire wishlist', async () => {
      (prisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const response = await request(app)
        .delete('/api/v1/wishlist')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/wishlist')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});
