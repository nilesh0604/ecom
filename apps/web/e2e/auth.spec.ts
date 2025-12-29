import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Authentication Features
 * 
 * Features Covered:
 * - Login/Register with protected routes
 * - Social Authentication (Google, Apple)
 * - User profile management
 * - Session persistence
 * - Password reset flow
 * 
 * @module e2e/auth
 */

// ============================================
// Helper Functions
// ============================================

async function registerUser(
  page: Page,
  user = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
  }
) {
  await page.goto('/auth/register');
  await page.fill('[data-testid="first-name-input"]', user.firstName);
  await page.fill('[data-testid="last-name-input"]', user.lastName);
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.fill('[data-testid="confirm-password-input"]', user.password);
  await page.click('[data-testid="register-button"]');
  return user;
}

async function login(page: Page, email = 'test@example.com', password = 'Password123!') {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}

// ============================================
// Login Tests
// ============================================

test.describe('Login Flow', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="forgot-password-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-link"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page);
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.locator('[data-testid="password-input"]');
    const toggleButton = page.locator('[data-testid="password-toggle"]');
    
    // Initially password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should remember user with "Remember me" checkbox', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login
    await page.waitForURL('/');
    
    // Create a new context to simulate new session
    const cookies = await page.context().cookies();
    const rememberCookie = cookies.find(c => c.name === 'remember_token' || c.name === 'refresh_token');
    expect(rememberCookie).toBeDefined();
  });
});

// ============================================
// Registration Tests
// ============================================

test.describe('Registration Flow', () => {
  test('should display registration form correctly', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    const user = await registerUser(page);
    
    // Should redirect to home or verification page
    await expect(page).not.toHaveURL('/auth/register');
    
    // User should be logged in or see verification message
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();
    const hasVerificationMessage = await page.locator('[data-testid="verification-message"]').isVisible();
    
    expect(isLoggedIn || hasVerificationMessage).toBeTruthy();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('[data-testid="password-input"]', 'weak');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
  });

  test('should prevent registration with existing email', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="register-error"]')).toContainText(/already exists|already registered/i);
  });
});

// ============================================
// Social Authentication Tests
// ============================================

test.describe('Social Authentication', () => {
  test('should display Google login button', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('[data-testid="google-login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="google-login-button"]')).toContainText(/Google/i);
  });

  test('should display Apple login button', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('[data-testid="apple-login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="apple-login-button"]')).toContainText(/Apple/i);
  });

  test('should redirect to Google OAuth on click', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click Google button and check it initiates OAuth flow
    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      page.click('[data-testid="google-login-button"]'),
    ]);
    
    // Either redirects or opens popup for OAuth
    const currentUrl = page.url();
    const hasOAuthRedirect = currentUrl.includes('accounts.google.com') || popup !== null;
    expect(hasOAuthRedirect || currentUrl.includes('oauth')).toBeTruthy();
  });
});

// ============================================
// Logout Tests
// ============================================

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify user is logged out
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should clear cart on logout (if guest cart disabled)', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Cart should be empty or user redirected
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    const badgeText = await cartBadge.textContent();
    expect(badgeText === '0' || badgeText === '').toBeTruthy();
  });

  test('should redirect to login when accessing protected routes after logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// ============================================
// Protected Routes Tests
// ============================================

test.describe('Protected Routes', () => {
  test('should redirect to login for orders page', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should redirect to login for checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should redirect to login for profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should redirect to login for wishlist page', async ({ page }) => {
    await page.goto('/wishlist');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should preserve intended destination after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/orders');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/auth\/login/);
    expect(page.url()).toContain('returnUrl');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect back to orders
    await expect(page).toHaveURL('/orders');
  });
});

// ============================================
// User Profile Tests
// ============================================

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display user profile dropdown', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    
    await expect(page.locator('[data-testid="user-dropdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="profile-link"]');
    
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/profile');
    
    await page.fill('[data-testid="first-name-input"]', 'Updated');
    await page.fill('[data-testid="last-name-input"]', 'Name');
    await page.click('[data-testid="save-profile-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});

// ============================================
// Password Reset Tests
// ============================================

test.describe('Password Reset', () => {
  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('[data-testid="forgot-password-link"]');
    
    await expect(page).toHaveURL('/auth/forgot-password');
  });

  test('should submit forgot password request', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/email|sent|check/i);
  });

  test('should validate email format on forgot password', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });
});

// ============================================
// Session Persistence Tests
// ============================================

test.describe('Session Persistence', () => {
  test('should maintain login state after page reload', async ({ page }) => {
    await login(page);
    
    // Reload the page
    await page.reload();
    
    // User should still be logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should maintain login state across navigation', async ({ page }) => {
    await login(page);
    
    // Navigate to different pages
    await page.goto('/products');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    await page.goto('/cart');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
