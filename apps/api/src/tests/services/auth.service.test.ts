import bcrypt from 'bcryptjs';
import { AuthService } from '../../services/auth.service';

// Mock dependencies
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
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../services/cache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Import mocked prisma
import { prisma } from '../../config/database';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      const mockCreatedUser = {
        id: 1,
        ...mockUserData,
        password: 'hashedPassword',
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await authService.register(mockUserData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockUserData.email.toLowerCase());
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictError if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: mockUserData.email,
      });

      await expect(authService.register(mockUserData)).rejects.toThrow(
        'Email already registered'
      );
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash(mockCredentials.password, 10);
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
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
        id: 'refresh-id',
        token: 'refresh-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const result = await authService.login(mockCredentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresAt');
    });

    it('should throw AuthenticationError for invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw AuthenticationError for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        password: await bcrypt.hash('differentPassword', 10),
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw AppError for deactivated account', async () => {
      const hashedPassword = await bcrypt.hash(mockCredentials.password, 10);
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        password: hashedPassword,
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Account is deactivated'
      );
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = (authService as any).generateAccessToken(1, 'test@example.com', 'USER');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
