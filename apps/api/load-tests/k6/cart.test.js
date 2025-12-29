import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
    API_PREFIX,
    BASE_URL,
    LOAD_TEST_OPTIONS,
    TEST_USER,
    generateSessionId,
    getAuthHeaders,
    getGuestHeaders,
} from './config.js';

// Custom metrics
const addToCartDuration = new Trend('add_to_cart_duration');
const getCartDuration = new Trend('get_cart_duration');
const updateCartDuration = new Trend('update_cart_duration');
const failureRate = new Rate('failed_requests');
const cartOperations = new Counter('cart_operations');

export const options = {
  ...LOAD_TEST_OPTIONS,
  thresholds: {
    ...LOAD_TEST_OPTIONS.thresholds,
    add_to_cart_duration: ['p(95)<500'],
    get_cart_duration: ['p(95)<300'],
  },
};

// Setup: Login and get product IDs
export function setup() {
  // Login to get token
  const loginRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  let token = null;
  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    token = data.data.token;
  }

  // Get products
  const productsRes = http.get(
    `${BASE_URL}${API_PREFIX}/products?limit=10`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  let productIds = [1, 2, 3];
  if (productsRes.status === 200) {
    const data = JSON.parse(productsRes.body);
    productIds = data.data?.products?.map(p => p.id) || productIds;
  }

  return { token, productIds };
}

export default function (data) {
  const isAuthenticated = Math.random() > 0.5 && data.token;
  const sessionId = generateSessionId();
  const headers = isAuthenticated 
    ? getAuthHeaders(data.token)
    : getGuestHeaders(sessionId);

  group('Get Cart', () => {
    const getRes = http.get(`${BASE_URL}${API_PREFIX}/cart`, { headers });
    
    getCartDuration.add(getRes.timings.duration);
    failureRate.add(getRes.status !== 200);
    
    check(getRes, {
      'get cart status is 200': (r) => r.status === 200,
      'get cart response time < 300ms': (r) => r.timings.duration < 300,
    });

    sleep(0.5);
  });

  group('Add to Cart', () => {
    const productId = data.productIds[Math.floor(Math.random() * data.productIds.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    
    const addRes = http.post(
      `${BASE_URL}${API_PREFIX}/cart/items`,
      JSON.stringify({ productId, quantity }),
      { headers }
    );
    
    addToCartDuration.add(addRes.timings.duration);
    failureRate.add(addRes.status !== 200 && addRes.status !== 201 && addRes.status !== 404);
    
    const success = check(addRes, {
      'add to cart status is success': (r) => 
        r.status === 200 || r.status === 201 || r.status === 404,
      'add to cart response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (success) {
      cartOperations.add(1);
    }

    sleep(1);
  });

  group('Update Cart Item', () => {
    // First get cart to find an item
    const getRes = http.get(`${BASE_URL}${API_PREFIX}/cart`, { headers });
    
    if (getRes.status === 200) {
      const cart = JSON.parse(getRes.body);
      const items = cart.data?.items || cart.data?.cart?.items || [];
      
      if (items.length > 0) {
        const item = items[0];
        const newQuantity = Math.floor(Math.random() * 5) + 1;
        
        const updateRes = http.put(
          `${BASE_URL}${API_PREFIX}/cart/items/${item.id}`,
          JSON.stringify({ quantity: newQuantity }),
          { headers }
        );
        
        updateCartDuration.add(updateRes.timings.duration);
        
        check(updateRes, {
          'update cart item status is success': (r) => 
            r.status === 200 || r.status === 404,
          'update cart response time < 500ms': (r) => r.timings.duration < 500,
        });
      }
    }

    sleep(0.5);
  });

  group('Remove Cart Item', () => {
    // Get cart
    const getRes = http.get(`${BASE_URL}${API_PREFIX}/cart`, { headers });
    
    if (getRes.status === 200) {
      const cart = JSON.parse(getRes.body);
      const items = cart.data?.items || cart.data?.cart?.items || [];
      
      if (items.length > 1) {
        const item = items[items.length - 1];
        
        const deleteRes = http.del(
          `${BASE_URL}${API_PREFIX}/cart/items/${item.id}`,
          null,
          { headers }
        );
        
        check(deleteRes, {
          'delete cart item status is success': (r) => 
            r.status === 200 || r.status === 404,
        });
      }
    }

    sleep(0.5);
  });

  // Occasionally clear cart (10% of iterations)
  if (Math.random() < 0.1) {
    group('Clear Cart', () => {
      const clearRes = http.del(`${BASE_URL}${API_PREFIX}/cart`, null, { headers });
      
      check(clearRes, {
        'clear cart status is 200': (r) => r.status === 200,
      });

      sleep(0.5);
    });
  }

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'load-tests/results/cart-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const { metrics } = data;
  let output = '\n=== Cart API Load Test Summary ===\n\n';
  
  output += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed Requests: ${(metrics.http_req_failed?.values?.rate * 100).toFixed(2)}%\n`;
  output += `Cart Operations: ${metrics.cart_operations?.values?.count || 0}\n\n`;
  
  output += `Get Cart Avg: ${metrics.get_cart_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Get Cart P95: ${metrics.get_cart_duration?.values?.['p(95)']?.toFixed(2)}ms\n`;
  output += `Add to Cart Avg: ${metrics.add_to_cart_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Update Cart Avg: ${metrics.update_cart_duration?.values?.avg?.toFixed(2)}ms\n`;
  
  return output;
}
