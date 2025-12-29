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

// Mock the entire app module for integration tests
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
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
  },
}));

import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';

describe('Auth API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Import routes after mocks are set up
    const authRoutes = (await import('../../routes/auth.routes')).default;
    const { errorHandler } = await import('../../middleware/error.middleware');
    
    app = createTestApp();
    app.use('/api/v1/auth', authRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegistration = {
      email: 'newuser@example.com',
      password: 'SecureP@ss123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user with valid data', async () => {
      const mockUser = {
        id: 1,
        ...validRegistration,
        password: 'hashedPassword',
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistration)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(validRegistration.email.toLowerCase());
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validRegistration,
          email: 'invalid-email',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validRegistration,
          password: '123',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for existing email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: validRegistration.email,
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistration)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const validLogin = {
      email: 'user@example.com',
      password: 'SecureP@ss123',
    };

    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(validLogin.password, 10);
      const mockUser = {
        id: 1,
        email: validLogin.email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        token: 'refresh-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLogin)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      // refreshToken is set as HTTP-only cookie, not in response body
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLogin)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 423 for deactivated account', async () => {
      const hashedPassword = await bcrypt.hash(validLogin.password, 10);
      const mockUser = {
        id: 1,
        email: validLogin.email,
        password: hashedPassword,
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLogin)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(423);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // Mock deleteMany for refreshToken (logout invalidates token)
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', ['refreshToken=mock-refresh-token'])
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
