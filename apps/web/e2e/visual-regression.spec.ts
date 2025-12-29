/**
 * Visual Regression Testing Configuration
 *
 * Interview Discussion Points:
 * - Visual regression testing strategies
 * - Snapshot testing vs visual comparison
 * - CI/CD integration for visual tests
 * - Handling responsive design testing
 * - Managing visual test baselines
 *
 * This file configures Playwright for visual regression testing
 * as an alternative to Chromatic/Percy (which require paid services)
 *
 * @module e2e/visual-regression
 */

import { expect, test, type Page } from '@playwright/test';

// ============================================
// Visual Test Configuration
// ============================================

/**
 * Common viewport sizes for visual testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
} as const;

/**
 * Visual comparison options
 */
export const VISUAL_OPTIONS = {
  // Maximum allowed pixel difference
  maxDiffPixels: 100,
  // Maximum allowed percentage difference
  maxDiffPixelRatio: 0.01,
  // Threshold for color difference (0-1)
  threshold: 0.2,
  // Animation settings
  animations: 'disabled' as const,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Wait for page to be fully loaded and stable
 */
async function waitForStable(page: Page): Promise<void> {
  // Wait for network idle
  await page.waitForLoadState('networkidle');

  // Wait for any animations to complete
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });

  // Additional delay for fonts and images
  await page.waitForTimeout(500);
}

/**
 * Hide dynamic elements that change between runs
 */
async function hideDynamicElements(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Hide dynamic content */
      [data-testid="timestamp"],
      [data-testid="random-id"],
      .loading-spinner,
      .skeleton {
        visibility: hidden !important;
      }
      
      /* Disable animations */
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
}

/**
 * Take a full page screenshot with consistent settings
 */
async function takeSnapshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  }
): Promise<void> {
  await waitForStable(page);
  await hideDynamicElements(page);

  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options?.fullPage ?? true,
    clip: options?.clip,
    ...VISUAL_OPTIONS,
  });
}

// ============================================
// Component Visual Tests
// ============================================

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('desktop layout', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await takeSnapshot(page, 'home-desktop');
    });

    test('mobile layout', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await takeSnapshot(page, 'home-mobile');
    });

    test('tablet layout', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto('/');
      await takeSnapshot(page, 'home-tablet');
    });
  });

  test.describe('Product Grid', () => {
    test('product cards display correctly', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-card"]');
      await takeSnapshot(page, 'product-grid');
    });

    test('product filters sidebar', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/products');
      await takeSnapshot(page, 'product-filters', {
        fullPage: false,
        clip: { x: 0, y: 0, width: 300, height: 600 },
      });
    });
  });

  test.describe('Product Detail', () => {
    test('product detail page', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/products/1');
      await takeSnapshot(page, 'product-detail');
    });

    test('product gallery', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/products/1');
      const gallery = page.locator('[data-testid="product-gallery"]');
      await expect(gallery).toHaveScreenshot('product-gallery.png');
    });
  });

  test.describe('Cart', () => {
    test('empty cart', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await page.click('[data-testid="cart-button"]');
      await page.waitForSelector('[data-testid="cart-drawer"]');
      await takeSnapshot(page, 'cart-empty', { fullPage: false });
    });

    test('cart with items', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      // Add item to cart first
      await page.goto('/products/1');
      await page.click('[data-testid="add-to-cart"]');
      await page.click('[data-testid="cart-button"]');
      await page.waitForSelector('[data-testid="cart-item"]');
      await takeSnapshot(page, 'cart-with-items', { fullPage: false });
    });
  });

  test.describe('Checkout Flow', () => {
    test('shipping form', async ({ page }) => {
      // Setup: add item and go to checkout
      await page.goto('/products/1');
      await page.click('[data-testid="add-to-cart"]');
      await page.goto('/checkout');
      await takeSnapshot(page, 'checkout-shipping');
    });

    test('payment form', async ({ page }) => {
      await page.goto('/checkout?step=payment');
      await takeSnapshot(page, 'checkout-payment');
    });

    test('order review', async ({ page }) => {
      await page.goto('/checkout?step=review');
      await takeSnapshot(page, 'checkout-review');
    });
  });

  test.describe('Authentication', () => {
    test('login form', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/login');
      await takeSnapshot(page, 'login-form');
    });

    test('register form', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/register');
      await takeSnapshot(page, 'register-form');
    });

    test('login form with errors', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/login');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="error-message"]');
      await takeSnapshot(page, 'login-form-errors');
    });
  });

  test.describe('UI Components', () => {
    test('modal dialog', async ({ page }) => {
      await page.goto('/');
      // Trigger a modal (adjust selector as needed)
      await page.evaluate(() => {
        // Dispatch custom event to open modal for testing
        window.dispatchEvent(new CustomEvent('open-test-modal'));
      });
      await page.waitForSelector('[role="dialog"]');
      await takeSnapshot(page, 'modal-dialog', { fullPage: false });
    });

    test('toast notifications', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: { message: 'Test notification', type: 'success' },
          })
        );
      });
      await page.waitForSelector('[data-testid="toast"]');
      await takeSnapshot(page, 'toast-notification', { fullPage: false });
    });
  });
});

// ============================================
// Responsive Comparison Tests
// ============================================

test.describe('Responsive Design Comparison', () => {
  const pages = ['/', '/products', '/login'];

  for (const pagePath of pages) {
    test(`${pagePath} - all viewports`, async ({ page }) => {
      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport);
        await page.goto(pagePath);
        await takeSnapshot(
          page,
          `responsive-${pagePath.replace('/', 'home')}-${name}`
        );
      }
    });
  }
});

// ============================================
// Dark Mode Tests
// ============================================

test.describe('Dark Mode Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('home page dark mode', async ({ page }) => {
    await page.goto('/');
    await takeSnapshot(page, 'home-dark-mode');
  });

  test('product page dark mode', async ({ page }) => {
    await page.goto('/products');
    await takeSnapshot(page, 'products-dark-mode');
  });
});

// ============================================
// Component Isolation Tests
// ============================================

/**
 * These tests use Storybook for component isolation
 * Run: npx playwright test --project=chromium e2e/visual-regression.spec.ts
 */
test.describe('Storybook Component Tests', () => {
  const storybookUrl = 'http://localhost:6006';

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Storybook tests only on Chromium'
  );

  test.beforeAll(async () => {
    // Check if Storybook is running
    try {
      await fetch(storybookUrl);
    } catch {
      test.skip();
    }
  });

  test('Button variants', async ({ page }) => {
    await page.goto(`${storybookUrl}/iframe.html?id=ui-button--all-variants`);
    await waitForStable(page);
    await expect(page).toHaveScreenshot('storybook-button-variants.png');
  });

  test('Input states', async ({ page }) => {
    await page.goto(`${storybookUrl}/iframe.html?id=ui-input--input-types`);
    await waitForStable(page);
    await expect(page).toHaveScreenshot('storybook-input-states.png');
  });

  test('Modal dialog', async ({ page }) => {
    await page.goto(`${storybookUrl}/iframe.html?id=ui-modal--default`);
    await page.click('button');
    await page.waitForSelector('[role="dialog"]');
    await expect(page).toHaveScreenshot('storybook-modal.png');
  });
});
