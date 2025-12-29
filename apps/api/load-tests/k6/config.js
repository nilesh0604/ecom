/**
 * K6 Load Testing Configuration
 * 
 * This file contains shared configuration for all load tests.
 */

// Base URL for the API
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// API version prefix
export const API_PREFIX = '/api/v1';

// Test user credentials
export const TEST_USER = {
  email: __ENV.TEST_USER_EMAIL || 'loadtest@example.com',
  password: __ENV.TEST_USER_PASSWORD || 'LoadTest123!',
};

// Admin user credentials
export const ADMIN_USER = {
  email: __ENV.ADMIN_EMAIL || 'admin@example.com',
  password: __ENV.ADMIN_PASSWORD || 'Admin123!',
};

// Common thresholds for all tests
export const DEFAULT_THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
  http_req_failed: ['rate<0.01'], // Less than 1% failure rate
  http_reqs: ['rate>100'], // At least 100 requests per second
};

// Smoke test options (quick validation)
export const SMOKE_TEST_OPTIONS = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

// Load test options (normal load)
export const LOAD_TEST_OPTIONS = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: DEFAULT_THRESHOLDS,
};

// Stress test options (find breaking point)
export const STRESS_TEST_OPTIONS = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 300 },  // Stay at 300 users
    { duration: '5m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // More lenient for stress test
    http_req_failed: ['rate<0.10'],    // Allow up to 10% failure
  },
};

// Spike test options (sudden traffic spike)
export const SPIKE_TEST_OPTIONS = {
  stages: [
    { duration: '10s', target: 100 },  // Spike to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '10s', target: 500 },  // Spike to 500 users
    { duration: '3m', target: 500 },   // Stay at 500 users
    { duration: '10s', target: 100 },  // Scale down to 100
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '10s', target: 0 },    // Scale down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15'],
  },
};

// Soak test options (extended duration)
export const SOAK_TEST_OPTIONS = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '4h', target: 100 },   // Stay at 100 for 4 hours
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: DEFAULT_THRESHOLDS,
};

// Helper function to create authenticated headers
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Helper function to create guest headers with session
export function getGuestHeaders(sessionId) {
  return {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId || generateSessionId(),
  };
}

// Generate a random session ID
export function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15);
}

// Generate random email for registration tests
export function generateRandomEmail() {
  return `user_${Math.random().toString(36).substring(2, 10)}@loadtest.com`;
}
