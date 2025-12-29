/**
 * API Contract Tests Index
 * 
 * This module exports all contract test configurations.
 * Contract tests use Pact for consumer-driven contract testing.
 * 
 * @module tests/contract
 */

// Export Pact configuration for use in CI/CD
export const pactConfig = {
  consumer: 'ecom-web',
  provider: 'ecom-api',
  pactBrokerUrl: process.env.PACT_BROKER_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
};

// Contract test files
export const contractTestFiles = [
  'auth.contract.test.ts',
  'products.contract.test.ts',
  'cart.contract.test.ts',
  'orders.contract.test.ts',
];
