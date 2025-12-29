/**
 * Application Configuration
 *
 * Centralized configuration for environment-aware settings.
 * All environment variables should be accessed through this module.
 *
 * Why centralize config:
 * - Single source of truth for all env variables
 * - Type safety for configuration values
 * - Validation at startup (fail fast if misconfigured)
 * - Easy to mock in tests
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const mode = import.meta.env.MODE;

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Feature Flags
const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || isDevelopment;

// App metadata
const APP_NAME = 'eCom';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0';

/**
 * Validate required configuration
 * Throws early in development if critical config is missing
 */
function validateConfig(): void {
  const errors: string[] = [];

  // Add validation rules here as the app grows
  // Example:
  // if (isProduction && !import.meta.env.VITE_API_BASE_URL) {
  //   errors.push('VITE_API_BASE_URL is required in production');
  // }

  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    if (isDevelopment) {
      throw new Error(`Invalid configuration:\n${errors.join('\n')}`);
    }
  }
}

// Validate on module load
validateConfig();

/**
 * Exported configuration object
 */
export const config = {
  // Environment
  isDevelopment,
  isProduction,
  mode,

  // API
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
  },

  // Feature Flags
  features: {
    analytics: ENABLE_ANALYTICS,
    mockData: ENABLE_MOCK_DATA,
  },

  // App
  app: {
    name: APP_NAME,
    version: APP_VERSION,
  },
} as const;

// Type for the config object
export type Config = typeof config;

export default config;
