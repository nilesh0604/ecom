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

// Mock the users service
jest.mock('../../services/users.service', () => ({
  usersService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getAddresses: jest.fn(),
    addAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    getWishlist: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(),
    getAllUsers: jest.fn(),
    updateUserStatus: jest.fn(),
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

// Mock multer for file uploads
jest.mock('../../middleware/upload.middleware', () => ({
  uploadAvatar: (req: any, res: any, next: any) => next(),
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
import { usersService } from '../../services/users.service';
import { AppError, NotFoundError } from '../../utils/errors';

describe('Users API Integration Tests', () => {
  let app: Express;

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    avatar: null,
    role: 'USER',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    id: 2,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
  };

  const mockAddress = {
    id: 1,
    userId: 1,
    label: 'Home',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1234567890',
    isDefault: true,
  };

  const mockPreferences = {
    id: 1,
    userId: 1,
    newsletter: true,
    orderUpdates: true,
    promotions: false,
    theme: 'light',
    language: 'en',
  };

  beforeAll(async () => {
    const usersRoutes = (await import('../../routes/users.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');

    app = createTestApp();
    app.use('/api/v1/users', usersRoutes);
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

  describe('GET /api/v1/users/profile', () => {
    it('should return user profile', async () => {
      (usersService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    const updatePayload = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update user profile', async () => {
      (usersService.updateProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updatePayload,
      });

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/addresses', () => {
    it('should return user addresses', async () => {
      (usersService.getAddresses as jest.Mock).mockResolvedValue([mockAddress]);

      const response = await request(app)
        .get('/api/v1/users/addresses')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/addresses')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/addresses', () => {
    const newAddress = {
      label: 'Work',
      firstName: 'John',
      lastName: 'Doe',
      address: '456 Office Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      phone: '+1234567890',
    };

    it('should add a new address', async () => {
      (usersService.addAddress as jest.Mock).mockResolvedValue({
        id: 2,
        userId: 1,
        ...newAddress,
        isDefault: false,
      });

      const response = await request(app)
        .post('/api/v1/users/addresses')
        .set('Authorization', 'Bearer valid-token')
        .send(newAddress)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/addresses')
        .set('Authorization', 'Bearer valid-token')
        .send({ label: 'Work' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/addresses/:id', () => {
    it('should update an address', async () => {
      (usersService.updateAddress as jest.Mock).mockResolvedValue({
        ...mockAddress,
        address: '789 Updated St',
      });

      const response = await request(app)
        .put('/api/v1/users/addresses/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ address: '789 Updated St' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent address', async () => {
      (usersService.updateAddress as jest.Mock).mockRejectedValue(
        new NotFoundError('Address')
      );

      const response = await request(app)
        .put('/api/v1/users/addresses/999')
        .set('Authorization', 'Bearer valid-token')
        .send({ street: '789 Updated St' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/users/addresses/:id', () => {
    it('should delete an address', async () => {
      (usersService.deleteAddress as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/v1/users/addresses/1')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent address', async () => {
      (usersService.deleteAddress as jest.Mock).mockRejectedValue(
        new NotFoundError('Address')
      );

      const response = await request(app)
        .delete('/api/v1/users/addresses/999')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/users/addresses/:id/default', () => {
    it('should set address as default', async () => {
      (usersService.setDefaultAddress as jest.Mock).mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });

      const response = await request(app)
        .put('/api/v1/users/addresses/1/default')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/users/preferences', () => {
    it('should return user preferences', async () => {
      (usersService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .get('/api/v1/users/preferences')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/users/preferences', () => {
    it('should update user preferences', async () => {
      (usersService.updatePreferences as jest.Mock).mockResolvedValue({
        ...mockPreferences,
        newsletter: false,
      });

      const response = await request(app)
        .put('/api/v1/users/preferences')
        .set('Authorization', 'Bearer valid-token')
        .send({ newsletter: false })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/users/admin/all (Admin)', () => {
    it('should return all users for admin', async () => {
      (usersService.getAllUsers as jest.Mock).mockResolvedValue({
        users: [mockUser, mockAdminUser],
        total: 2,
        skip: 0,
        limit: 10,
      });

      const response = await request(app)
        .get('/api/v1/users/admin/all')
        .set('Authorization', 'Bearer admin-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/users/admin/all')
        .set('Authorization', 'Bearer valid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/users/admin/:id/status (Admin)', () => {
    it('should update user status', async () => {
      (usersService.updateUserStatus as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const response = await request(app)
        .patch('/api/v1/users/admin/1/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ isActive: false })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/api/v1/users/admin/1/status')
        .set('Authorization', 'Bearer valid-token')
        .send({ isActive: false })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      (usersService.updateUserStatus as jest.Mock).mockRejectedValue(
        new NotFoundError('User')
      );

      const response = await request(app)
        .patch('/api/v1/users/admin/999/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ isActive: false })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });
});
