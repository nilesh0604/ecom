/**
 * API Contract Tests - Products
 * 
 * Contract tests for product-related API endpoints.
 * Ensures frontend receives expected product data structures.
 * 
 * @module tests/contract/products
 */

import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

const { like, eachLike } = MatchersV3;

describe('Products API Contract Tests', () => {
  const provider = new PactV3({
    consumer: 'ecom-web',
    provider: 'ecom-api',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  describe('GET /api/v1/products', () => {
    it('should return a list of products', async () => {
      await provider
        .given('products exist in database')
        .uponReceiving('a request to list products')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products',
          query: { page: '1', limit: '10' },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              products: eachLike({
                id: like(1),
                name: like('Sample Product'),
                slug: like('sample-product'),
                description: like('Product description'),
                price: like(99.99),
                compareAtPrice: like(129.99),
                sku: like('SKU-001'),
                stock: like(100),
                isActive: like(true),
                images: eachLike({
                  id: like(1),
                  url: like('/uploads/product-image.jpg'),
                  alt: like('Product image'),
                  isPrimary: like(true),
                }),
                category: {
                  id: like(1),
                  name: like('Electronics'),
                  slug: like('electronics'),
                },
                createdAt: like('2024-01-01T00:00:00.000Z'),
                updatedAt: like('2024-01-01T00:00:00.000Z'),
              }),
              pagination: {
                page: like(1),
                limit: like(10),
                total: like(100),
                totalPages: like(10),
              },
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/products`,
          { params: { page: 1, limit: 10 } }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('products');
        expect(response.data.data).toHaveProperty('pagination');
      });
    });

    it('should filter products by category', async () => {
      await provider
        .given('products exist in electronics category')
        .uponReceiving('a request to filter products by category')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products',
          query: { category: 'electronics' },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              products: eachLike({
                id: like(1),
                name: like('Electronic Product'),
                price: like(199.99),
                category: {
                  id: like(1),
                  name: like('Electronics'),
                  slug: like('electronics'),
                },
              }),
              pagination: {
                page: like(1),
                limit: like(10),
                total: like(50),
                totalPages: like(5),
              },
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/products`,
          { params: { category: 'electronics' } }
        );

        expect(response.status).toBe(200);
        expect(response.data.data.products).toBeInstanceOf(Array);
      });
    });

    it('should search products by name', async () => {
      await provider
        .given('products with keyword laptop exist')
        .uponReceiving('a request to search products')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products',
          query: { search: 'laptop' },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              products: eachLike({
                id: like(1),
                name: like('Laptop Pro'),
                price: like(999.99),
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
          `${mockServer.url}/api/v1/products`,
          { params: { search: 'laptop' } }
        );

        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a single product by id', async () => {
      await provider
        .given('product with id 1 exists')
        .uponReceiving('a request to get product by id')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products/1',
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
              name: like('Premium Laptop'),
              slug: like('premium-laptop'),
              description: like('High-performance laptop for professionals'),
              price: like(1299.99),
              compareAtPrice: like(1499.99),
              sku: like('LAP-001'),
              stock: like(50),
              isActive: like(true),
              images: eachLike({
                id: like(1),
                url: like('/uploads/laptop.jpg'),
                alt: like('Premium Laptop'),
                isPrimary: like(true),
              }),
              category: {
                id: like(1),
                name: like('Laptops'),
                slug: like('laptops'),
              },
              variants: eachLike({
                id: like(1),
                name: like('16GB RAM'),
                sku: like('LAP-001-16GB'),
                price: like(1399.99),
                stock: like(25),
              }),
              createdAt: like('2024-01-01T00:00:00.000Z'),
              updatedAt: like('2024-01-01T00:00:00.000Z'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/products/1`
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('price');
      });
    });

    it('should return 404 for non-existent product', async () => {
      await provider
        .given('product with id 9999 does not exist')
        .uponReceiving('a request for non-existent product')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products/9999',
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
          await axios.get(`${mockServer.url}/api/v1/products/9999`);
          fail('Expected request to fail');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.success).toBe(false);
        }
      });
    });
  });

  describe('GET /api/v1/products/slug/:slug', () => {
    it('should return a product by slug', async () => {
      await provider
        .given('product with slug premium-laptop exists')
        .uponReceiving('a request to get product by slug')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products/slug/premium-laptop',
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
              name: like('Premium Laptop'),
              slug: like('premium-laptop'),
              description: like('High-performance laptop'),
              price: like(1299.99),
              isActive: like(true),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/products/slug/premium-laptop`
        );

        expect(response.status).toBe(200);
        expect(response.data.data.slug).toBe('premium-laptop');
      });
    });
  });

  describe('GET /api/v1/products/featured', () => {
    it('should return featured products', async () => {
      await provider
        .given('featured products exist')
        .uponReceiving('a request to get featured products')
        .withRequest({
          method: 'GET',
          path: '/api/v1/products/featured',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: eachLike({
              id: like(1),
              name: like('Featured Product'),
              price: like(149.99),
              isFeatured: like(true),
            }),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/api/v1/products/featured`
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    });
  });
});
