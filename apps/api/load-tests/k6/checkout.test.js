import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
    API_PREFIX,
    BASE_URL,
    STRESS_TEST_OPTIONS,
    TEST_USER,
    generateSessionId,
    getAuthHeaders,
    getGuestHeaders,
} from './config.js';

// Custom metrics
const checkoutDuration = new Trend('checkout_duration');
const orderListDuration = new Trend('order_list_duration');
const orderDetailDuration = new Trend('order_detail_duration');
const failureRate = new Rate('failed_requests');
const ordersCreated = new Counter('orders_created');

export const options = {
  ...STRESS_TEST_OPTIONS,
  thresholds: {
    ...STRESS_TEST_OPTIONS.thresholds,
    checkout_duration: ['p(95)<3000'],
    order_list_duration: ['p(95)<500'],
  },
};

// Setup: Login and prepare cart
export function setup() {
  // Login
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
    `${BASE_URL}${API_PREFIX}/products?limit=5`,
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
  if (!data.token) {
    console.log('No auth token available, skipping checkout tests');
    sleep(1);
    return;
  }

  const headers = getAuthHeaders(data.token);

  group('Order Listing', () => {
    const listRes = http.get(`${BASE_URL}${API_PREFIX}/orders`, { headers });
    
    orderListDuration.add(listRes.timings.duration);
    failureRate.add(listRes.status !== 200);
    
    check(listRes, {
      'order list status is 200': (r) => r.status === 200,
      'order list response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.5);
  });

  group('Order Details', () => {
    // Get orders first
    const listRes = http.get(`${BASE_URL}${API_PREFIX}/orders`, { headers });
    
    if (listRes.status === 200) {
      const data = JSON.parse(listRes.body);
      const orders = data.data?.orders || data.data || [];
      
      if (orders.length > 0) {
        const order = orders[Math.floor(Math.random() * orders.length)];
        
        const detailRes = http.get(
          `${BASE_URL}${API_PREFIX}/orders/${order.id}`,
          { headers }
        );
        
        orderDetailDuration.add(detailRes.timings.duration);
        
        check(detailRes, {
          'order detail status is 200': (r) => r.status === 200,
          'order detail response time < 300ms': (r) => r.timings.duration < 300,
        });
      }
    }

    sleep(0.5);
  });

  // Create new order (less frequently to avoid overwhelming the system)
  if (Math.random() < 0.2) {
    group('Checkout Flow', () => {
      // Add item to cart
      const productId = data.productIds[Math.floor(Math.random() * data.productIds.length)];
      
      http.post(
        `${BASE_URL}${API_PREFIX}/cart/items`,
        JSON.stringify({ productId, quantity: 1 }),
        { headers }
      );

      sleep(0.5);

      // Create order
      const orderPayload = {
        shippingAddress: {
          firstName: 'Load',
          lastName: 'Test',
          address: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'USA',
          phone: '+1234567890',
        },
        billingAddress: {
          firstName: 'Load',
          lastName: 'Test',
          address: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'USA',
          phone: '+1234567890',
        },
      };

      const createRes = http.post(
        `${BASE_URL}${API_PREFIX}/orders`,
        JSON.stringify(orderPayload),
        { headers }
      );
      
      checkoutDuration.add(createRes.timings.duration);
      
      const success = check(createRes, {
        'create order status is success or cart empty': (r) => 
          r.status === 201 || r.status === 200 || r.status === 400,
        'checkout response time < 3000ms': (r) => r.timings.duration < 3000,
      });

      if (createRes.status === 201 || createRes.status === 200) {
        ordersCreated.add(1);
      }

      sleep(1);
    });
  }

  // Cancel order (rare)
  if (Math.random() < 0.05) {
    group('Cancel Order', () => {
      const listRes = http.get(`${BASE_URL}${API_PREFIX}/orders`, { headers });
      
      if (listRes.status === 200) {
        const data = JSON.parse(listRes.body);
        const orders = data.data?.orders || data.data || [];
        const pendingOrders = orders.filter(o => o.status === 'PENDING');
        
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          
          const cancelRes = http.post(
            `${BASE_URL}${API_PREFIX}/orders/${order.id}/cancel`,
            null,
            { headers }
          );
          
          check(cancelRes, {
            'cancel order status is success or already processed': (r) => 
              r.status === 200 || r.status === 400,
          });
        }
      }

      sleep(0.5);
    });
  }

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'load-tests/results/checkout-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const { metrics } = data;
  let output = '\n=== Checkout API Load Test Summary ===\n\n';
  
  output += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed Requests: ${(metrics.http_req_failed?.values?.rate * 100).toFixed(2)}%\n`;
  output += `Orders Created: ${metrics.orders_created?.values?.count || 0}\n\n`;
  
  output += `Checkout Avg: ${metrics.checkout_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Checkout P95: ${metrics.checkout_duration?.values?.['p(95)']?.toFixed(2)}ms\n`;
  output += `Order List Avg: ${metrics.order_list_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Order Detail Avg: ${metrics.order_detail_duration?.values?.avg?.toFixed(2)}ms\n`;
  
  return output;
}
