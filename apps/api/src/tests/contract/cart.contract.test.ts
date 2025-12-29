/**
 * API Contract Tests - Cart
 * 
 * Contract tests for cart-related API endpoints.
 * Ensures consistent cart data structures between frontend and backend.
 * 
 * @module tests/contract/cart
 */

import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

const { like, eachLike } = MatchersV3;

describe('Cart API Contract Tests', () => {
  const provider = new PactV3({
    consumer: 'ecom-web',
    provider: 'ecom-api',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  const authHeader = { Authorization: 'Bearer valid-jwt-token' };

  describe('GET /api/v1/cart', () => {
    it('should return the user cart', async () => {
      await provider
        .given('user has items in cart')
        .uponReceiving('a request to get cart')
        .withRequest({
          method: 'GET',
          path: '/api/v1/cart',
          headers: authHeader,
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
              userId: like(1),
              items: eachLike({
                id: like(1),
                productId: like(1),
                quantity: like(2),
                price: like(99.99),
                product: {
                  id: like(1),
                  name: like('Sample Product'),
                  slug: like('sample-product'),
                  price: like(99.99),
                  images: eachLike({
                    id: like(1),
                    url: like('/uploads/product.jpg'),
                    isPrimary: like(true),
                  }),
                  stock: like(100),
                },
              }),
              subtotal: like(199.98),
              itemCount: like(2),
              createdAt: like('2024-01-01T00:00:00.000Z'),
              updatedAt: like('2024-01-01T00:00:00.000Z'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/cart`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('items');
        expect(response.data.data).toHaveProperty('subtotal');
      });
    });

    it('should return empty cart for new user', async () => {
      await provider
        .given('user has empty cart')
        .uponReceiving('a request to get empty cart')
        .withRequest({
          method: 'GET',
          path: '/api/v1/cart',
          headers: authHeader,
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
              userId: like(1),
              items: [],
              subtotal: like(0),
              itemCount: like(0),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/cart`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.data.items).toEqual([]);
      });
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add item to cart', async () => {
      await provider
        .given('product is available for purchase')
        .uponReceiving('a request to add item to cart')
        .withRequest({
          method: 'POST',
          path: '/api/v1/cart/items',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: {
            productId: 1,
            quantity: 1,
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
              id: like(1),
              items: eachLike({
                id: like(1),
                productId: like(1),
                quantity: like(1),
                price: like(99.99),
                product: {
                  id: like(1),
                  name: like('Sample Product'),
                  price: like(99.99),
                },
              }),
              subtotal: like(99.99),
              itemCount: like(1),
            },
            message: like('Item added to cart'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/cart/items`,
          { productId: 1, quantity: 1 },
          { headers: authHeader }
        );

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toContain('added');
      });
    });

    it('should return 400 for invalid quantity', async () => {
      await provider
        .given('validation will fail for quantity')
        .uponReceiving('a request with invalid quantity')
        .withRequest({
          method: 'POST',
          path: '/api/v1/cart/items',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: {
            productId: 1,
            quantity: -1,
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
            details: eachLike({ field: 'quantity', message: 'Quantity must be positive' }),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.post(
            `${mockServer.url}/api/v1/cart/items`,
            { productId: 1, quantity: -1 },
            { headers: authHeader }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });

    it('should return 404 for non-existent product', async () => {
      await provider
        .given('product with id 9999 does not exist for cart')
        .uponReceiving('a request to add non-existent product')
        .withRequest({
          method: 'POST',
          path: '/api/v1/cart/items',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: {
            productId: 9999,
            quantity: 1,
          },
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Product not found'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.post(
            `${mockServer.url}/api/v1/cart/items`,
            { productId: 9999, quantity: 1 },
            { headers: authHeader }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
        }
      });
    });
  });

  describe('PUT /api/v1/cart/items/:itemId', () => {
    it('should update cart item quantity', async () => {
      await provider
        .given('cart item with id 1 exists')
        .uponReceiving('a request to update cart item')
        .withRequest({
          method: 'PUT',
          path: '/api/v1/cart/items/1',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: {
            quantity: 3,
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
              items: eachLike({
                id: like(1),
                productId: like(1),
                quantity: like(3),
                price: like(99.99),
              }),
              subtotal: like(299.97),
              itemCount: like(3),
            },
            message: like('Cart updated'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.put(
          `${mockServer.url}/api/v1/cart/items/1`,
          { quantity: 3 },
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    });
  });

  describe('DELETE /api/v1/cart/items/:itemId', () => {
    it('should remove item from cart', async () => {
      await provider
        .given('cart has item with id 1')
        .uponReceiving('a request to remove cart item')
        .withRequest({
          method: 'DELETE',
          path: '/api/v1/cart/items/1',
          headers: authHeader,
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
              items: [],
              subtotal: like(0),
              itemCount: like(0),
            },
            message: like('Item removed from cart'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.delete(
          `${mockServer.url}/api/v1/cart/items/1`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear the entire cart', async () => {
      await provider
        .given('user has items in cart to clear')
        .uponReceiving('a request to clear cart')
        .withRequest({
          method: 'DELETE',
          path: '/api/v1/cart',
          headers: authHeader,
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            message: like('Cart cleared'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.delete(
          `${mockServer.url}/api/v1/cart`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    });
  });
});
