import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * Interview Discussion Points:
 * - Test parallelization: Speed vs resource usage
 * - Browser matrix: Chrome, Firefox, Safari, mobile
 * - CI/CD integration: Retries, artifacts, reporting
 * - Debugging: Screenshots, videos, traces
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Maximum time each action (click, fill, etc.) can take
    actionTimeout: 10000,

    // Maximum time for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for different browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewport
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  // Timeout for each test
  timeout: 30 * 1000,

  // Timeout for expect assertions
  expect: {
    timeout: 5000,
  },

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Folder for test artifacts like screenshots, videos, traces
  outputDir: 'test-results/',

  // Global setup and teardown
  // globalSetup: './e2e/global-setup.ts',
  // globalTeardown: './e2e/global-teardown.ts',
});
