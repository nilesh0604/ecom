/**
 * API Contract Tests - Authentication
 * 
 * These tests verify the API contract between frontend and backend.
 * Using Pact V3 for consumer-driven contract testing.
 * 
 * Contract testing ensures:
 * - API responses match expected schemas
 * - Breaking changes are detected early
 * - Frontend and backend teams can work independently
 * 
 * @module tests/contract/auth
 */

import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

const { like, eachLike } = MatchersV3;

describe('Auth API Contract Tests', () => {
  const provider = new PactV3({
    consumer: 'ecom-web',
    provider: 'ecom-api',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      await provider
        .given('no user exists with email user@example.com')
        .uponReceiving('a request to register a new user')
        .withRequest({
          method: 'POST',
          path: '/api/v1/auth/register',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'user@example.com',
            password: 'SecureP@ss123',
            firstName: 'John',
            lastName: 'Doe',
          },
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              user: {
                id: like(1),
                email: like('user@example.com'),
                firstName: like('John'),
                lastName: like('Doe'),
                role: like('USER'),
                isActive: like(true),
                createdAt: like('2024-01-01T00:00:00.000Z'),
              },
              token: like('jwt-token-string'),
            },
            message: like('Registration successful'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/auth/register`,
          {
            email: 'user@example.com',
            password: 'SecureP@ss123',
            firstName: 'John',
            lastName: 'Doe',
          }
        );

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('user');
        expect(response.data.data).toHaveProperty('token');
      });
    });

    it('should return 400 for invalid registration data', async () => {
      await provider
        .given('validation will fail')
        .uponReceiving('a request with invalid registration data')
        .withRequest({
          method: 'POST',
          path: '/api/v1/auth/register',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'invalid-email',
            password: '123',
          },
        })
        .willRespondWith({
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Validation error'),
            details: eachLike({ field: 'email', message: 'Invalid email' }),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.post(
            `${mockServer.url}/api/v1/auth/register`,
            {
              email: 'invalid-email',
              password: '123',
            }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.success).toBe(false);
        }
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await provider
        .given('user exists with email user@example.com')
        .uponReceiving('a request to login')
        .withRequest({
          method: 'POST',
          path: '/api/v1/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'user@example.com',
            password: 'SecureP@ss123',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              user: {
                id: like(1),
                email: like('user@example.com'),
                firstName: like('John'),
                lastName: like('Doe'),
                role: like('USER'),
              },
              token: like('jwt-token-string'),
            },
            message: like('Login successful'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/auth/login`,
          {
            email: 'user@example.com',
            password: 'SecureP@ss123',
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('user');
        expect(response.data.data).toHaveProperty('token');
      });
    });

    it('should return 401 for invalid credentials', async () => {
      await provider
        .given('user credentials are invalid')
        .uponReceiving('a request with wrong password')
        .withRequest({
          method: 'POST',
          path: '/api/v1/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'user@example.com',
            password: 'wrongpassword',
          },
        })
        .willRespondWith({
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Invalid credentials'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.post(
            `${mockServer.url}/api/v1/auth/login`,
            {
              email: 'user@example.com',
              password: 'wrongpassword',
            }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.success).toBe(false);
        }
      });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      await provider
        .given('user is logged in')
        .uponReceiving('a request to logout')
        .withRequest({
          method: 'POST',
          path: '/api/v1/auth/logout',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            message: like('Logged out successfully'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/auth/logout`
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile', async () => {
      await provider
        .given('user is authenticated')
        .uponReceiving('a request to get current user')
        .withRequest({
          method: 'GET',
          path: '/api/v1/auth/me',
          headers: {
            Authorization: 'Bearer valid-jwt-token',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              id: like(1),
              email: like('user@example.com'),
              firstName: like('John'),
              lastName: like('Doe'),
              role: like('USER'),
              isActive: like(true),
              emailVerified: like(true),
              createdAt: like('2024-01-01T00:00:00.000Z'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/auth/me`,
          {
            headers: {
              Authorization: 'Bearer valid-jwt-token',
            },
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('email');
      });
    });

    it('should return 401 when not authenticated', async () => {
      await provider
        .given('user is not authenticated')
        .uponReceiving('a request without auth token')
        .withRequest({
          method: 'GET',
          path: '/api/v1/auth/me',
        })
        .willRespondWith({
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Unauthorized'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.get(`${mockServer.url}/api/v1/auth/me`);
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.success).toBe(false);
        }
      });
    });
  });
});
