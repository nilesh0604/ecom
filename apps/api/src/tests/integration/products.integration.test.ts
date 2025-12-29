import express, { Express } from 'express';
import request from 'supertest';

// Create a minimal test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  return app;
};

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    productReview: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

jest.mock('../../services/cache.service', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    healthCheck: jest.fn().mockResolvedValue(true),
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

describe('Products API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    const productsRoutes = (await import('../../routes/products.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');
    
    app = createTestApp();
    app.use('/api/v1/products', productsRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/products', () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product 1',
        description: 'Description 1',
        price: 99.99,
        category: 'electronics',
        brand: 'Brand1',
        stock: 10,
        isActive: true,
      },
      {
        id: 2,
        title: 'Product 2',
        description: 'Description 2',
        price: 149.99,
        category: 'electronics',
        brand: 'Brand2',
        stock: 5,
        isActive: true,
      },
    ];

    it('should return paginated products', async () => {
      // $transaction with array returns [products, count]
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockProducts, 2]);

      const response = await request(app)
        .get('/api/v1/products')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Response structure is { data: { products, total, skip, limit } }
    });

    it('should filter products by category', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([[mockProducts[0]], 1]);

      const response = await request(app)
        .get('/api/v1/products?category=electronics')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should filter products by price range', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockProducts, 2]);

      const response = await request(app)
        .get('/api/v1/products?minPrice=50&maxPrice=200')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should support pagination', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockProducts, 100]);

      const response = await request(app)
        .get('/api/v1/products?page=2&limit=10')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    const mockProduct = {
      id: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      brand: 'TestBrand',
      stock: 10,
      isActive: true,
      reviews: [],
    };

    it('should return product by ID', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/v1/products/1')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent product', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/products/999')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/products/invalid')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should search products by query', async () => {
      const mockProducts = [
        { id: 1, title: 'Wireless Headphones' },
        { id: 2, title: 'Wireless Mouse' },
      ];

      // Search uses $transaction
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockProducts, 2]);

      const response = await request(app)
        .get('/api/v1/products/search?q=wireless')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/products/categories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { category: 'electronics' },
        { category: 'clothing' },
        { category: 'books' },
      ];

      // Uses findMany with distinct, not groupBy
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/v1/products/categories')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/products/brands', () => {
    it('should return all brands', async () => {
      const mockBrands = [
        { brand: 'Sony' },
        { brand: 'Apple' },
        { brand: 'Samsung' },
      ];

      // Uses findMany with distinct, not groupBy
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockBrands);

      const response = await request(app)
        .get('/api/v1/products/brands')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/products/category/:category', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: 1, title: 'Product 1', category: 'electronics' },
      ];

      // Uses $transaction
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockProducts, 1]);

      const response = await request(app)
        .get('/api/v1/products/category/electronics')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
