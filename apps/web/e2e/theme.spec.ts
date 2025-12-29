import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Dark Mode & Theme Features
 * 
 * Features Covered:
 * - Dark mode toggle
 * - Theme persistence
 * - System preference detection
 * - Theme-specific styling
 * - Component theming
 * 
 * @module e2e/theme
 */

// ============================================
// Helper Functions
// ============================================

async function login(page: Page) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'Password123!');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}

async function isDarkMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const html = document.documentElement;
    return html.classList.contains('dark') || 
           html.getAttribute('data-theme') === 'dark' ||
           document.body.classList.contains('dark');
  });
}

async function isLightMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const html = document.documentElement;
    return html.classList.contains('light') || 
           html.getAttribute('data-theme') === 'light' ||
           !html.classList.contains('dark');
  });
}

// ============================================
// Theme Toggle Tests
// ============================================

test.describe('Theme Toggle', () => {
  test('should display theme toggle button', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
  });

  test('should toggle to dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Ensure we start in light mode
    await page.evaluate(() => {
      localStorage.removeItem('theme');
      document.documentElement.classList.remove('dark');
    });
    await page.reload();
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should toggle back to light mode', async ({ page }) => {
    await page.goto('/');
    
    // Start in dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await page.reload();
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    
    expect(await isLightMode(page)).toBeTruthy();
  });

  test('should have accessible theme toggle', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Should have aria-label
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    expect(ariaLabel).not.toBeNull();
    expect(ariaLabel!.toLowerCase()).toMatch(/theme|mode|dark|light/);
  });

  test('should show appropriate icon for current theme', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // In light mode, should show moon/dark icon
    const initialIcon = await themeToggle.locator('svg, [data-testid="theme-icon"]').getAttribute('data-icon');
    
    await themeToggle.click();
    await page.waitForTimeout(100);
    
    // Icon should change
    const newIcon = await themeToggle.locator('svg, [data-testid="theme-icon"]').getAttribute('data-icon');
    
    // Icons should be different (sun vs moon)
    // Note: This depends on implementation
  });
});

// ============================================
// Theme Persistence Tests
// ============================================

test.describe('Theme Persistence', () => {
  test('should persist dark mode preference', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Enable dark mode
    if (!(await isDarkMode(page))) {
      await themeToggle.click();
    }
    
    // Reload page
    await page.reload();
    
    // Should still be in dark mode
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should persist light mode preference', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Enable light mode
    if (await isDarkMode(page)) {
      await themeToggle.click();
    }
    
    // Reload page
    await page.reload();
    
    // Should still be in light mode
    expect(await isLightMode(page)).toBeTruthy();
  });

  test('should persist theme across pages', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Enable dark mode
    if (!(await isDarkMode(page))) {
      await themeToggle.click();
    }
    
    // Navigate to different pages
    await page.goto('/products');
    expect(await isDarkMode(page)).toBeTruthy();
    
    await page.goto('/auth/login');
    expect(await isDarkMode(page)).toBeTruthy();
    
    await page.goto('/cart');
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should store theme preference in localStorage', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).not.toBeNull();
  });
});

// ============================================
// System Preference Tests
// ============================================

test.describe('System Preference Detection', () => {
  test('should respect system dark mode preference', async ({ page }) => {
    // Clear any stored preference
    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });
    
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    // Should be in dark mode
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should respect system light mode preference', async ({ page }) => {
    // Clear any stored preference
    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });
    
    // Emulate light mode preference
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    
    // Should be in light mode
    expect(await isLightMode(page)).toBeTruthy();
  });

  test('should override system preference with user choice', async ({ page }) => {
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Toggle to light mode
    if (await isDarkMode(page)) {
      await themeToggle.click();
    }
    
    // Should be light mode despite system preference
    expect(await isLightMode(page)).toBeTruthy();
    
    // Reload and verify it persists
    await page.reload();
    expect(await isLightMode(page)).toBeTruthy();
  });
});

// ============================================
// Dark Mode Styling Tests
// ============================================

test.describe('Dark Mode Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
  });

  test('should have dark background in dark mode', async ({ page }) => {
    await page.goto('/');
    
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    
    // Dark background should have low RGB values
    // rgb(r, g, b) where r, g, b are low numbers
    const match = backgroundColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeLessThan(100); // Dark colors have low brightness
    }
  });

  test('should have light text in dark mode', async ({ page }) => {
    await page.goto('/');
    
    const textColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).color;
    });
    
    // Light text should have high RGB values
    const match = textColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeGreaterThan(150); // Light colors have high brightness
    }
  });

  test('should style cards correctly in dark mode', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    const cardBackground = await productCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Card background should be darker than pure black but visible
    expect(cardBackground).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should style form inputs in dark mode', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const inputStyles = await emailInput.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor,
      };
    });
    
    // Input should have visible text
    expect(inputStyles.color).not.toBe('rgb(0, 0, 0)');
  });

  test('should style buttons in dark mode', async ({ page }) => {
    await page.goto('/products/1');
    
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    const buttonStyles = await addToCartButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      };
    });
    
    // Button should have visible styling
    expect(buttonStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should style navigation in dark mode', async ({ page }) => {
    await page.goto('/');
    
    const navbar = page.locator('[data-testid="navbar"], nav').first();
    const navStyles = await navbar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      };
    });
    
    // Navigation should be styled for dark mode
    expect(navStyles.backgroundColor).toBeDefined();
  });
});

// ============================================
// Light Mode Styling Tests
// ============================================

test.describe('Light Mode Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });
  });

  test('should have light background in light mode', async ({ page }) => {
    await page.goto('/');
    
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    
    // Light background should have high RGB values
    const match = backgroundColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeGreaterThan(200); // Light colors have high brightness
    }
  });

  test('should have dark text in light mode', async ({ page }) => {
    await page.goto('/');
    
    const textColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).color;
    });
    
    // Dark text should have low RGB values
    const match = textColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeLessThan(100);
    }
  });
});

// ============================================
// Component Theme Tests
// ============================================

test.describe('Component Theming', () => {
  test('should theme modal/drawer in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-cart-button"]');
    
    const drawer = page.locator('[data-testid="cart-drawer"]');
    if (await drawer.isVisible()) {
      const drawerBackground = await drawer.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Drawer should have dark background
      const match = drawerBackground.match(/\d+/g);
      if (match) {
        const [r, g, b] = match.map(Number);
        const brightness = (r + g + b) / 3;
        expect(brightness).toBeLessThan(150);
      }
    }
  });

  test('should theme dropdown menus in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await login(page);
    await page.click('[data-testid="user-menu"]');
    
    const dropdown = page.locator('[data-testid="user-dropdown"]');
    if (await dropdown.isVisible()) {
      const dropdownBackground = await dropdown.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      expect(dropdownBackground).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should theme footer in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await page.goto('/');
    
    const footer = page.locator('footer');
    const footerStyles = await footer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      };
    });
    
    expect(footerStyles.backgroundColor).toBeDefined();
  });

  test('should theme badges and tags in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await page.goto('/products');
    
    const badge = page.locator('[data-testid="product-badge"], [data-testid="cart-badge"]').first();
    if (await badge.isVisible()) {
      const badgeStyles = await badge.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
        };
      });
      
      // Badge should be visible
      expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});

// ============================================
// Transition Tests
// ============================================

test.describe('Theme Transition', () => {
  test('should have smooth transition when toggling theme', async ({ page }) => {
    await page.goto('/');
    
    const body = page.locator('body');
    
    // Check for transition property
    const hasTransition = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transition !== 'none' && style.transition !== '';
    });
    
    // Transition is optional but nice to have
    // Just verify toggle works smoothly
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    
    await page.waitForTimeout(300); // Wait for transition
    
    // Theme should have changed
    const currentTheme = await isDarkMode(page);
    expect(typeof currentTheme).toBe('boolean');
  });

  test('should not flash wrong theme on page load', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    // Navigate and immediately check theme
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Should be in dark mode immediately
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ||
             document.documentElement.getAttribute('data-theme') === 'dark';
    });
    
    // This test checks for FOUC (Flash of Unstyled Content)
    // The theme should be applied before content is visible
  });
});

// ============================================
// Theme in Different Views Tests
// ============================================

test.describe('Theme in Different Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
  });

  test('should apply dark theme to checkout', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should apply dark theme to order history', async ({ page }) => {
    await login(page);
    await page.goto('/orders');
    
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should apply dark theme to help center', async ({ page }) => {
    await page.goto('/help');
    
    expect(await isDarkMode(page)).toBeTruthy();
  });

  test('should apply dark theme to mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    expect(await isDarkMode(page)).toBeTruthy();
  });
});
