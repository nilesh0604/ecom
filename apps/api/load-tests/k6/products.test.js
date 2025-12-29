import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';
import {
    API_PREFIX,
    BASE_URL,
    LOAD_TEST_OPTIONS,
    generateSessionId,
    getGuestHeaders,
} from './config.js';

// Custom metrics
const productListDuration = new Trend('product_list_duration');
const productDetailDuration = new Trend('product_detail_duration');
const searchDuration = new Trend('search_duration');
const failureRate = new Rate('failed_requests');

export const options = LOAD_TEST_OPTIONS;

// Setup: Get product IDs to use in tests
export function setup() {
  const res = http.get(`${BASE_URL}${API_PREFIX}/products?limit=10`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return {
      productIds: data.data?.products?.map(p => p.id) || [1, 2, 3],
      categories: ['Electronics', 'Clothing', 'Books'],
    };
  }
  
  return {
    productIds: [1, 2, 3],
    categories: ['Electronics', 'Clothing', 'Books'],
  };
}

export default function (data) {
  const sessionId = generateSessionId();
  const headers = getGuestHeaders(sessionId);

  group('Product Listing', () => {
    // Get all products
    const listRes = http.get(`${BASE_URL}${API_PREFIX}/products`, { headers });
    
    productListDuration.add(listRes.timings.duration);
    failureRate.add(listRes.status !== 200);
    
    check(listRes, {
      'product list status is 200': (r) => r.status === 200,
      'product list has products': (r) => {
        const body = JSON.parse(r.body);
        return body.data && body.data.products && body.data.products.length > 0;
      },
      'product list response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // Get products with pagination
    const paginatedRes = http.get(
      `${BASE_URL}${API_PREFIX}/products?page=1&limit=20`,
      { headers }
    );
    
    check(paginatedRes, {
      'paginated products status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    // Get products by category
    const category = data.categories[Math.floor(Math.random() * data.categories.length)];
    const categoryRes = http.get(
      `${BASE_URL}${API_PREFIX}/products?category=${encodeURIComponent(category)}`,
      { headers }
    );
    
    check(categoryRes, {
      'category filter status is 200': (r) => r.status === 200,
    });

    sleep(0.5);
  });

  group('Product Detail', () => {
    const productId = data.productIds[Math.floor(Math.random() * data.productIds.length)];
    
    const detailRes = http.get(
      `${BASE_URL}${API_PREFIX}/products/${productId}`,
      { headers }
    );
    
    productDetailDuration.add(detailRes.timings.duration);
    failureRate.add(detailRes.status !== 200 && detailRes.status !== 404);
    
    check(detailRes, {
      'product detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'product detail response time < 300ms': (r) => r.timings.duration < 300,
    });

    sleep(1);
  });

  group('Product Search', () => {
    const searchTerms = ['phone', 'laptop', 'shirt', 'book', 'watch'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const searchRes = http.get(
      `${BASE_URL}${API_PREFIX}/products/search?q=${term}`,
      { headers }
    );
    
    searchDuration.add(searchRes.timings.duration);
    failureRate.add(searchRes.status !== 200);
    
    check(searchRes, {
      'search status is 200': (r) => r.status === 200,
      'search response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.5);
  });

  group('Categories and Brands', () => {
    const categoriesRes = http.get(
      `${BASE_URL}${API_PREFIX}/products/categories`,
      { headers }
    );
    
    check(categoriesRes, {
      'categories status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    const brandsRes = http.get(
      `${BASE_URL}${API_PREFIX}/products/brands`,
      { headers }
    );
    
    check(brandsRes, {
      'brands status is 200': (r) => r.status === 200,
    });

    sleep(0.5);
  });

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'load-tests/results/products-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  let output = '\n=== Products API Load Test Summary ===\n\n';
  
  output += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed Requests: ${(metrics.http_req_failed?.values?.rate * 100).toFixed(2)}%\n`;
  output += `Avg Response Time: ${metrics.http_req_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `P95 Response Time: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2)}ms\n`;
  output += `P99 Response Time: ${metrics.http_req_duration?.values?.['p(99)']?.toFixed(2)}ms\n\n`;
  
  output += `Product List Avg: ${metrics.product_list_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Product Detail Avg: ${metrics.product_detail_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Search Avg: ${metrics.search_duration?.values?.avg?.toFixed(2)}ms\n`;
  
  return output;
}
