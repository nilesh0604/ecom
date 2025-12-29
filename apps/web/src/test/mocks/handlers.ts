import { delay, http, HttpResponse } from 'msw';

/**
 * MSW (Mock Service Worker) Handlers
 * 
 * Purpose:
 * - Mock API responses in tests without changing application code
 * - Intercepts requests at the network level
 * - Works in both browser and Node.js (tests)
 * 
 * Interview Discussion Points:
 * - MSW vs Jest mocks: Network level vs module level, more realistic
 * - Benefits: Same mocks work in browser/tests, no fetch mocking boilerplate
 * - Use cases: Testing, development without backend, demos
 * - Integration: Works with any fetch library (fetch, axios, etc.)
 * 
 * @see https://mswjs.io/
 */

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProducts = [
  {
    id: 1,
    title: 'iPhone 15 Pro',
    description: 'Latest Apple smartphone with A17 Pro chip',
    price: 999,
    discountPercentage: 5,
    rating: 4.8,
    stock: 50,
    brand: 'Apple',
    category: 'smartphones',
    thumbnail: 'https://dummyjson.com/image/i/products/1/thumbnail.jpg',
    images: ['https://dummyjson.com/image/i/products/1/1.jpg'],
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24',
    description: 'Samsung flagship with Galaxy AI',
    price: 899,
    discountPercentage: 10,
    rating: 4.6,
    stock: 75,
    brand: 'Samsung',
    category: 'smartphones',
    thumbnail: 'https://dummyjson.com/image/i/products/2/thumbnail.jpg',
    images: ['https://dummyjson.com/image/i/products/2/1.jpg'],
  },
  {
    id: 3,
    title: 'MacBook Pro 16"',
    description: 'Powerful laptop for professionals',
    price: 2499,
    discountPercentage: 0,
    rating: 4.9,
    stock: 25,
    brand: 'Apple',
    category: 'laptops',
    thumbnail: 'https://dummyjson.com/image/i/products/3/thumbnail.jpg',
    images: ['https://dummyjson.com/image/i/products/3/1.jpg'],
  },
];

const mockCategories = ['smartphones', 'laptops', 'tablets', 'accessories'];

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  image: 'https://dummyjson.com/icon/testuser/128',
  token: 'mock-jwt-token',
};

const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 1099.99,
    items: [
      { productId: 1, quantity: 1, price: 999, title: 'iPhone 15 Pro' },
    ],
  },
  {
    id: 'ORD-002',
    date: '2024-01-20',
    status: 'processing',
    total: 2499,
    items: [
      { productId: 3, quantity: 1, price: 2499, title: 'MacBook Pro 16"' },
    ],
  },
];

// =============================================================================
// HANDLERS
// =============================================================================

export const handlers = [
  // =========================================================================
  // PRODUCTS
  // =========================================================================
  
  // Get all products
  http.get('*/products', async ({ request }) => {
    const url = new URL(request.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    await delay(100); // Simulate network latency
    
    const paginatedProducts = mockProducts.slice(skip, skip + limit);
    
    return HttpResponse.json({
      products: paginatedProducts,
      total: mockProducts.length,
      skip,
      limit,
    });
  }),

  // Get single product
  http.get('*/products/:id', async ({ params }) => {
    const { id } = params;
    await delay(100);
    
    const product = mockProducts.find(p => p.id === Number(id));
    
    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(product);
  }),

  // Search products
  http.get('*/products/search', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    
    await delay(100);
    
    const filtered = mockProducts.filter(
      p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    
    return HttpResponse.json({
      products: filtered,
      total: filtered.length,
      skip: 0,
      limit: 10,
    });
  }),

  // Get products by category
  http.get('*/products/category/:category', async ({ params }) => {
    const { category } = params;
    await delay(100);
    
    const filtered = mockProducts.filter(p => p.category === category);
    
    return HttpResponse.json({
      products: filtered,
      total: filtered.length,
      skip: 0,
      limit: 10,
    });
  }),

  // Get categories
  http.get('*/products/categories', async () => {
    await delay(50);
    return HttpResponse.json(mockCategories);
  }),

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================

  // Login
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    await delay(200);
    
    // Simulate invalid credentials
    if (body.username === 'invalid') {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      ...mockUser,
      username: body.username,
    });
  }),

  // Register
  http.post('*/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; username: string };
    await delay(200);
    
    // Simulate email already exists
    if (body.email === 'exists@example.com') {
      return HttpResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }
    
    return HttpResponse.json({
      ...mockUser,
      ...body,
    });
  }),

  // Validate token
  http.get('*/auth/me', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    await delay(100);
    
    if (!authHeader || !authHeader.includes('Bearer')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json(mockUser);
  }),

  // =========================================================================
  // CART
  // =========================================================================

  // Get cart
  http.get('*/carts/:userId', async () => {
    await delay(100);
    return HttpResponse.json({
      id: 1,
      products: [],
      total: 0,
      discountedTotal: 0,
      userId: 1,
      totalProducts: 0,
      totalQuantity: 0,
    });
  }),

  // Add to cart
  http.post('*/carts/add', async ({ request }) => {
    const body = await request.json() as { productId: number; quantity: number };
    await delay(100);
    
    const product = mockProducts.find(p => p.id === body.productId);
    
    return HttpResponse.json({
      id: 1,
      products: product ? [{ ...product, quantity: body.quantity }] : [],
      total: product ? product.price * body.quantity : 0,
      userId: 1,
    });
  }),

  // =========================================================================
  // ORDERS
  // =========================================================================

  // Get orders
  http.get('*/orders', async () => {
    await delay(100);
    return HttpResponse.json({
      orders: mockOrders,
      total: mockOrders.length,
    });
  }),

  // Get single order
  http.get('*/orders/:id', async ({ params }) => {
    const { id } = params;
    await delay(100);
    
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(order);
  }),

  // Create order
  http.post('*/orders', async ({ request }) => {
    const body = await request.json() as { items: unknown[]; total: number };
    await delay(300);
    
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending',
      ...body,
    };
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // =========================================================================
  // PAYMENT (Mock)
  // =========================================================================

  http.post('*/payment/process', async () => {
    await delay(500); // Simulate payment processing
    
    // 10% chance of payment failure for testing
    if (Math.random() < 0.1) {
      return HttpResponse.json(
        { message: 'Payment declined' },
        { status: 402 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      transactionId: `TXN-${Date.now()}`,
    });
  }),
];

// =============================================================================
// ERROR HANDLERS (for testing error states)
// =============================================================================

export const errorHandlers = {
  // Simulate server error
  serverError: http.get('*/products', () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Simulate network error
  networkError: http.get('*/products', () => {
    return HttpResponse.error();
  }),

  // Simulate slow response
  slowResponse: http.get('*/products', async () => {
    await delay(5000);
    return HttpResponse.json({ products: mockProducts });
  }),
};

export { mockCategories, mockOrders, mockProducts, mockUser };

