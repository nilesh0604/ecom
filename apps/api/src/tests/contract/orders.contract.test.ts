/**
 * API Contract Tests - Orders
 * 
 * Contract tests for order-related API endpoints.
 * Defines the expected structure for order creation and management.
 * 
 * @module tests/contract/orders
 */

import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

const { like, eachLike, regex } = MatchersV3;

describe('Orders API Contract Tests', () => {
  const provider = new PactV3({
    consumer: 'ecom-web',
    provider: 'ecom-api',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  const authHeader = { Authorization: 'Bearer valid-jwt-token' };

  describe('GET /api/v1/orders', () => {
    it('should return user orders', async () => {
      await provider
        .given('user has existing orders')
        .uponReceiving('a request to list orders')
        .withRequest({
          method: 'GET',
          path: '/api/v1/orders',
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
              orders: eachLike({
                id: like(1),
                orderNumber: like('ORD-2024-001'),
                status: regex('PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED', 'PENDING'),
                subtotal: like(199.98),
                tax: like(16.00),
                shippingCost: like(9.99),
                total: like(225.97),
                itemCount: like(2),
                items: eachLike({
                  id: like(1),
                  productId: like(1),
                  quantity: like(1),
                  price: like(99.99),
                  product: {
                    id: like(1),
                    name: like('Sample Product'),
                    images: eachLike({
                      url: like('/uploads/product.jpg'),
                    }),
                  },
                }),
                shippingAddress: {
                  firstName: like('John'),
                  lastName: like('Doe'),
                  address1: like('123 Main St'),
                  city: like('New York'),
                  state: like('NY'),
                  postalCode: like('10001'),
                  country: like('US'),
                },
                createdAt: like('2024-01-01T00:00:00.000Z'),
              }),
              pagination: {
                page: like(1),
                limit: like(10),
                total: like(5),
                totalPages: like(1),
              },
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/orders`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('orders');
      });
    });

    it('should return empty orders for new user', async () => {
      await provider
        .given('user has no orders')
        .uponReceiving('a request for orders when none exist')
        .withRequest({
          method: 'GET',
          path: '/api/v1/orders',
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
              orders: [],
              pagination: {
                page: like(1),
                limit: like(10),
                total: like(0),
                totalPages: like(0),
              },
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/orders`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.data.orders).toEqual([]);
      });
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order details', async () => {
      await provider
        .given('order with id 1 exists for user')
        .uponReceiving('a request to get order details')
        .withRequest({
          method: 'GET',
          path: '/api/v1/orders/1',
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
              orderNumber: like('ORD-2024-001'),
              status: like('PROCESSING'),
              subtotal: like(199.98),
              tax: like(16.00),
              shippingCost: like(9.99),
              total: like(225.97),
              items: eachLike({
                id: like(1),
                productId: like(1),
                quantity: like(2),
                price: like(99.99),
                product: {
                  id: like(1),
                  name: like('Sample Product'),
                  slug: like('sample-product'),
                  images: eachLike({
                    url: like('/uploads/product.jpg'),
                  }),
                },
              }),
              shippingAddress: {
                firstName: like('John'),
                lastName: like('Doe'),
                address1: like('123 Main St'),
                address2: like('Apt 4B'),
                city: like('New York'),
                state: like('NY'),
                postalCode: like('10001'),
                country: like('US'),
                phone: like('555-1234'),
              },
              billingAddress: {
                firstName: like('John'),
                lastName: like('Doe'),
                address1: like('123 Main St'),
                city: like('New York'),
                state: like('NY'),
                postalCode: like('10001'),
                country: like('US'),
              },
              paymentMethod: like('CREDIT_CARD'),
              paymentStatus: like('PAID'),
              trackingNumber: like('1Z999AA10123456784'),
              notes: like('Please leave at door'),
              createdAt: like('2024-01-01T00:00:00.000Z'),
              updatedAt: like('2024-01-02T00:00:00.000Z'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/orders/1`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('orderNumber');
        expect(response.data.data).toHaveProperty('items');
        expect(response.data.data).toHaveProperty('shippingAddress');
      });
    });

    it('should return 404 for non-existent order', async () => {
      await provider
        .given('order with id 9999 does not exist')
        .uponReceiving('a request for non-existent order')
        .withRequest({
          method: 'GET',
          path: '/api/v1/orders/9999',
          headers: authHeader,
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Order not found'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.get(
            `${mockServer.url}/api/v1/orders/9999`,
            { headers: authHeader }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
        }
      });
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order', async () => {
      const orderPayload = {
        shippingAddressId: 1,
        billingAddressId: 1,
        paymentMethod: 'CREDIT_CARD',
        paymentDetails: {
          cardToken: 'tok_visa',
        },
        notes: 'Please leave at door',
      };

      await provider
        .given('user has items in cart and valid addresses')
        .uponReceiving('a request to create an order')
        .withRequest({
          method: 'POST',
          path: '/api/v1/orders',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: orderPayload,
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
              orderNumber: like('ORD-2024-001'),
              status: like('PENDING'),
              subtotal: like(199.98),
              tax: like(16.00),
              shippingCost: like(9.99),
              total: like(225.97),
              items: eachLike({
                id: like(1),
                productId: like(1),
                quantity: like(2),
                price: like(99.99),
              }),
              createdAt: like('2024-01-01T00:00:00.000Z'),
            },
            message: like('Order created successfully'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/orders`,
          orderPayload,
          { headers: authHeader }
        );

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('orderNumber');
        expect(response.data.message).toContain('created');
      });
    });

    it('should return 400 for empty cart', async () => {
      await provider
        .given('user cart is empty')
        .uponReceiving('a request to create order with empty cart')
        .withRequest({
          method: 'POST',
          path: '/api/v1/orders',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: {
            shippingAddressId: 1,
            billingAddressId: 1,
            paymentMethod: 'CREDIT_CARD',
          },
        })
        .willRespondWith({
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Cart is empty'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.post(
            `${mockServer.url}/api/v1/orders`,
            {
              shippingAddressId: 1,
              billingAddressId: 1,
              paymentMethod: 'CREDIT_CARD',
            },
            { headers: authHeader }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error).toContain('Cart is empty');
        }
      });
    });
  });

  describe('PUT /api/v1/orders/:id/cancel', () => {
    it('should cancel an order', async () => {
      await provider
        .given('order with id 1 is cancellable')
        .uponReceiving('a request to cancel an order')
        .withRequest({
          method: 'PUT',
          path: '/api/v1/orders/1/cancel',
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
              orderNumber: like('ORD-2024-001'),
              status: like('CANCELLED'),
            },
            message: like('Order cancelled successfully'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.put(
          `${mockServer.url}/api/v1/orders/1/cancel`,
          {},
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.data.status).toBe('CANCELLED');
      });
    });

    it('should return 400 for already shipped order', async () => {
      await provider
        .given('order with id 2 is already shipped')
        .uponReceiving('a request to cancel shipped order')
        .withRequest({
          method: 'PUT',
          path: '/api/v1/orders/2/cancel',
          headers: authHeader,
        })
        .willRespondWith({
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: false,
            error: like('Cannot cancel shipped order'),
          },
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.put(
            `${mockServer.url}/api/v1/orders/2/cancel`,
            {},
            { headers: authHeader }
          );
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });
  });

  describe('GET /api/v1/orders/:id/tracking', () => {
    it('should return order tracking information', async () => {
      await provider
        .given('order with id 1 has tracking info')
        .uponReceiving('a request for order tracking')
        .withRequest({
          method: 'GET',
          path: '/api/v1/orders/1/tracking',
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
              orderId: like(1),
              orderNumber: like('ORD-2024-001'),
              carrier: like('UPS'),
              trackingNumber: like('1Z999AA10123456784'),
              trackingUrl: like('https://www.ups.com/track?tracknum=1Z999AA10123456784'),
              estimatedDelivery: like('2024-01-05'),
              events: eachLike({
                status: like('IN_TRANSIT'),
                location: like('New York, NY'),
                timestamp: like('2024-01-03T10:30:00.000Z'),
                description: like('Package in transit'),
              }),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/orders/1/tracking`,
          { headers: authHeader }
        );

        expect(response.status).toBe(200);
        expect(response.data.data).toHaveProperty('trackingNumber');
        expect(response.data.data).toHaveProperty('events');
      });
    });
  });
});
