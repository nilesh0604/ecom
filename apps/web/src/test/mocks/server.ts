import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server Setup for Node.js (Tests)
 * 
 * This server is used in Vitest tests to intercept API requests
 * and return mock responses.
 * 
 * Usage in tests:
 * ```typescript
 * import { server } from '@/test/mocks/server';
 * import { http, HttpResponse } from 'msw';
 * 
 * // Override handler for specific test
 * server.use(
 *   http.get('/api/products', () => {
 *     return HttpResponse.json({ products: [] });
 *   })
 * );
 * ```
 */

export const server = setupServer(...handlers);

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after tests
afterAll(() => server.close());
