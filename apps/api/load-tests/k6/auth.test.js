import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
    API_PREFIX,
    BASE_URL,
    LOAD_TEST_OPTIONS,
    TEST_USER,
    generateRandomEmail,
    getAuthHeaders,
} from './config.js';

// Custom metrics
const loginDuration = new Trend('login_duration');
const registerDuration = new Trend('register_duration');
const profileDuration = new Trend('profile_duration');
const failureRate = new Rate('failed_requests');
const successfulLogins = new Counter('successful_logins');

export const options = {
  ...LOAD_TEST_OPTIONS,
  thresholds: {
    ...LOAD_TEST_OPTIONS.thresholds,
    login_duration: ['p(95)<1000'],
    register_duration: ['p(95)<2000'],
  },
};

// Setup: Register test user if needed
export function setup() {
  // Try to login with test user
  const loginRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    return { token: data.data.token, userId: data.data.user.id };
  }

  // Register test user if login fails
  const registerRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/register`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
      firstName: 'Load',
      lastName: 'Test',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (registerRes.status === 201) {
    const data = JSON.parse(registerRes.body);
    return { token: data.data.token, userId: data.data.user.id };
  }

  return { token: null, userId: null };
}

export default function (data) {
  group('User Registration', () => {
    const email = generateRandomEmail();
    
    const registerRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/register`,
      JSON.stringify({
        email: email,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    registerDuration.add(registerRes.timings.duration);
    failureRate.add(registerRes.status !== 201 && registerRes.status !== 409);
    
    check(registerRes, {
      'register status is 201 or 409 (already exists)': (r) => 
        r.status === 201 || r.status === 409,
      'register response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    sleep(1);
  });

  group('User Login', () => {
    const loginRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/login`,
      JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    loginDuration.add(loginRes.timings.duration);
    failureRate.add(loginRes.status !== 200);
    
    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login returns token': (r) => {
        if (r.status === 200) {
          const body = JSON.parse(r.body);
          return body.data && body.data.token;
        }
        return false;
      },
      'login response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    if (loginSuccess) {
      successfulLogins.add(1);
    }

    sleep(1);
  });

  group('Invalid Login Attempts', () => {
    // Test with wrong password
    const wrongPassRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/login`,
      JSON.stringify({
        email: TEST_USER.email,
        password: 'WrongPassword123!',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(wrongPassRes, {
      'wrong password returns 401': (r) => r.status === 401,
    });

    sleep(0.5);

    // Test with non-existent email
    const wrongEmailRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/login`,
      JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(wrongEmailRes, {
      'non-existent email returns 401': (r) => r.status === 401,
    });

    sleep(0.5);
  });

  group('Profile Operations', () => {
    if (!data.token) {
      return;
    }

    const headers = getAuthHeaders(data.token);

    // Get profile
    const profileRes = http.get(
      `${BASE_URL}${API_PREFIX}/users/profile`,
      { headers }
    );
    
    profileDuration.add(profileRes.timings.duration);
    failureRate.add(profileRes.status !== 200);
    
    check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => {
        if (r.status === 200) {
          const body = JSON.parse(r.body);
          return body.data && body.data.email;
        }
        return false;
      },
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    });

    sleep(1);

    // Get addresses
    const addressesRes = http.get(
      `${BASE_URL}${API_PREFIX}/users/addresses`,
      { headers }
    );
    
    check(addressesRes, {
      'addresses status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    // Get preferences
    const prefsRes = http.get(
      `${BASE_URL}${API_PREFIX}/users/preferences`,
      { headers }
    );
    
    check(prefsRes, {
      'preferences status is 200': (r) => r.status === 200,
    });

    sleep(0.5);
  });

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'load-tests/results/auth-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const { metrics } = data;
  let output = '\n=== Auth API Load Test Summary ===\n\n';
  
  output += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Failed Requests: ${(metrics.http_req_failed?.values?.rate * 100).toFixed(2)}%\n`;
  output += `Successful Logins: ${metrics.successful_logins?.values?.count || 0}\n\n`;
  
  output += `Login Avg: ${metrics.login_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Login P95: ${metrics.login_duration?.values?.['p(95)']?.toFixed(2)}ms\n`;
  output += `Register Avg: ${metrics.register_duration?.values?.avg?.toFixed(2)}ms\n`;
  output += `Profile Avg: ${metrics.profile_duration?.values?.avg?.toFixed(2)}ms\n`;
  
  return output;
}
