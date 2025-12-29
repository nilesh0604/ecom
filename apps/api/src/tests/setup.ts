import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for testing
jest.mock('../config/database', () => ({
  prisma: new PrismaClient(),
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Global test setup
beforeAll(async () => {
  // Setup code before all tests
});

afterAll(async () => {
  // Cleanup code after all tests
});

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
