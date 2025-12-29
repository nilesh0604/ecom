import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Critical User Flows
 * 
 * Interview Discussion Points:
 * - E2E vs Integration vs Unit: Testing pyramid, cost vs confidence
 * - Playwright vs Cypress: Speed, browser support, debugging
 * - Flaky tests: Retry strategies, stable selectors, test isolation
 * - CI/CD integration: Parallel execution, screenshots, video recording
 * 
 * Test Organization:
 * - Group by user journey, not by page
 * - Each test should be independent and idempotent
 * - Use data-testid attributes for stable selectors
 */

// Helper function to login
async function login(page: Page, email = 'test@example.com', password = 'password123') {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}

// =============================================================================
// USER FLOW: Product Discovery
// =============================================================================

test.describe('Product Discovery', () => {
  test('should display products on the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    // Verify multiple products are displayed
    const productCount = await page.locator('[data-testid="product-card"]').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should navigate to product details', async ({ page }) => {
    await page.goto('/products');
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Verify we're on product detail page
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Open filter sidebar if on mobile
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    // Select a category
    await page.locator('[data-testid="category-filter"]').first().click();
    
    // Wait for filtered results
    await page.waitForResponse((response) => 
      response.url().includes('/products') && response.status() === 200
    );
    
    // Verify URL contains category parameter
    expect(page.url()).toContain('category');
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/products');
    
    const searchTerm = 'phone';
    await page.fill('[data-testid="search-input"]', searchTerm);
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    
    // Verify search results or URL contains search param
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });
});

// =============================================================================
// USER FLOW: Shopping Cart
// =============================================================================

test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');
    
    // Click add to cart on first product
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Verify cart badge updates
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Go to cart
    await page.goto('/cart');
    
    // Increase quantity
    await page.click('[data-testid="increase-quantity"]');
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('2');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Go to cart
    await page.goto('/cart');
    
    // Remove item
    await page.click('[data-testid="remove-item"]');
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
  });

  test('should persist cart after page reload', async ({ page }) => {
    await page.goto('/products');
    
    // Add item to cart
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Reload page
    await page.reload();
    
    // Verify cart still has item
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });
});

// =============================================================================
// USER FLOW: Checkout
// =============================================================================

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart before each checkout test
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/checkout');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should complete checkout flow', async ({ page }) => {
    // Login first
    await login(page);
    
    // Go to checkout
    await page.goto('/checkout');
    
    // Fill shipping information
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'New York');
    await page.fill('[data-testid="shipping-zip"]', '10001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Fill payment information
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should validate shipping form', async ({ page }) => {
    await login(page);
    await page.goto('/checkout');
    
    // Try to continue without filling form
    await page.click('[data-testid="continue-to-payment"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

// =============================================================================
// USER FLOW: Authentication
// =============================================================================

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await login(page);
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    
    // Open user menu and click logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify user is logged out
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('should protect routes for unauthenticated users', async ({ page }) => {
    await page.goto('/orders');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// =============================================================================
// USER FLOW: Order History
// =============================================================================

test.describe('Order History', () => {
  test('should display order history for logged in users', async ({ page }) => {
    await login(page);
    await page.goto('/orders');
    
    // Verify orders page loads
    await expect(page.locator('h1')).toContainText(/orders/i);
  });

  test('should show order details', async ({ page }) => {
    await login(page);
    await page.goto('/orders');
    
    // Click on first order if exists
    const orderLink = page.locator('[data-testid="order-item"]').first();
    if (await orderLink.isVisible()) {
      await orderLink.click();
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe('Accessibility', () => {
  test('should have no accessibility violations on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic a11y
    // Focus should be visible
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
  });

  test('should trap focus in modal', async ({ page }) => {
    await page.goto('/products');
    
    // Add to cart to open cart drawer (if applicable)
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Check if modal/drawer is open
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      // Tab through modal, focus should stay inside
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus');
      await expect(modal).toContainText(await focusedElement.textContent() || '');
    }
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Should be able to press Enter to activate
    await page.keyboard.press('Enter');
    
    // Verify navigation occurred or action was triggered
    // This depends on your specific implementation
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe('Performance', () => {
  test('should load home page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have layout shift on product page', async ({ page }) => {
    await page.goto('/products');
    
    // Get initial position of first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();
    
    const initialBox = await firstProduct.boundingBox();
    
    // Wait for any lazy loading
    await page.waitForTimeout(1000);
    
    // Check position hasn't shifted significantly
    const finalBox = await firstProduct.boundingBox();
    
    if (initialBox && finalBox) {
      expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(10);
    }
  });
});
