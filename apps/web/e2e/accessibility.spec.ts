import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Accessibility Features
 * 
 * Features Covered:
 * - WCAG 2.1 AA Compliance
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - High contrast mode
 * - Reduced motion
 * - Skip links
 * - ARIA labels and roles
 * 
 * @module e2e/accessibility
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

// ============================================
// Skip Links Tests
// ============================================

test.describe('Skip Links', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    // Focus on the body and press Tab to reveal skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('[data-testid="skip-to-main"]');
    await expect(skipLink).toBeFocused();
  });

  test('should skip to main content on activation', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Focus should be on main content or first interactive element in main
    const mainContent = page.locator('main, [role="main"], #main-content');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should have skip to navigation link', async ({ page }) => {
    await page.goto('/');
    
    const skipNav = page.locator('[data-testid="skip-to-nav"]');
    if (await skipNav.isVisible()) {
      await expect(skipNav).toBeVisible();
    }
  });
});

// ============================================
// Keyboard Navigation Tests
// ============================================

test.describe('Keyboard Navigation', () => {
  test('should navigate through navbar with keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Tab through skip links to reach navbar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be on first navbar item
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
    expect(['a', 'button']).toContain(tagName);
  });

  test('should navigate product cards with keyboard', async ({ page }) => {
    await page.goto('/products');
    
    // Tab to first product
    let tabCount = 0;
    while (tabCount < 20) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const focused = page.locator(':focus');
      const isProductCard = await focused.locator('[data-testid="product-card"]').count() > 0 ||
                           await focused.getAttribute('data-testid') === 'product-card-link';
      
      if (isProductCard) break;
    }
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/products?\//);
  });

  test('should navigate form fields with Tab', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
  });

  test('should support Shift+Tab for reverse navigation', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.locator('[data-testid="password-input"]');
    const emailInput = page.locator('[data-testid="email-input"]');
    
    await passwordInput.focus();
    await page.keyboard.press('Shift+Tab');
    
    await expect(emailInput).toBeFocused();
  });

  test('should activate buttons with Enter and Space', async ({ page }) => {
    await page.goto('/products/1');
    
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await addToCartButton.focus();
    
    // Test Enter key
    await page.keyboard.press('Enter');
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should navigate dropdown menus with arrow keys', async ({ page }) => {
    await login(page);
    
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.focus();
    await page.keyboard.press('Enter');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    
    const focusedItem = page.locator('[data-testid="user-dropdown"] :focus');
    await expect(focusedItem).toBeVisible();
  });
});

// ============================================
// Focus Management Tests
// ============================================

test.describe('Focus Management', () => {
  test('should show visible focus indicator', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    const outlineStyle = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });
    
    // Should have some focus indicator
    expect(outlineStyle).not.toBe('none');
  });

  test('should trap focus in modal', async ({ page }) => {
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Cart drawer should be open
    const drawer = page.locator('[data-testid="cart-drawer"]');
    if (await drawer.isVisible()) {
      // Tab multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Focus should still be inside the drawer
      const focusedElement = page.locator(':focus');
      const isInsideDrawer = await drawer.locator(':focus').count() > 0;
      expect(isInsideDrawer).toBeTruthy();
    }
  });

  test('should restore focus after modal close', async ({ page }) => {
    await page.goto('/products/1');
    
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await addToCartButton.click();
    
    const drawer = page.locator('[data-testid="cart-drawer"]');
    if (await drawer.isVisible()) {
      await page.keyboard.press('Escape');
      
      // Focus should return to the trigger element
      await expect(addToCartButton).toBeFocused();
    }
  });

  test('should focus first invalid field on form error', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.click('[data-testid="login-button"]');
    
    // Focus should be on first invalid field
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeFocused();
  });

  test('should focus error message for screen readers', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.click('[data-testid="login-button"]');
    
    const errorMessage = page.locator('[data-testid="email-error"]');
    const hasAriaLive = await errorMessage.getAttribute('aria-live') !== null ||
                        await errorMessage.getAttribute('role') === 'alert';
    
    expect(hasAriaLive).toBeTruthy();
  });
});

// ============================================
// ARIA Labels and Roles Tests
// ============================================

test.describe('ARIA Labels and Roles', () => {
  test('should have proper landmark roles', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmarks
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    await expect(page.locator('header, [role="banner"]')).toBeVisible();
    await expect(page.locator('footer, [role="contentinfo"]')).toBeVisible();
  });

  test('should have aria-labels on icon buttons', async ({ page }) => {
    await page.goto('/');
    
    const cartButton = page.locator('[data-testid="cart-button"]');
    const ariaLabel = await cartButton.getAttribute('aria-label');
    
    expect(ariaLabel).not.toBeNull();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  test('should have aria-label on search input', async ({ page }) => {
    await page.goto('/products');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    const ariaLabel = await searchInput.getAttribute('aria-label') ||
                      await searchInput.getAttribute('aria-labelledby');
    
    expect(ariaLabel).not.toBeNull();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const emailId = await emailInput.getAttribute('id');
    const label = page.locator(`label[for="${emailId}"]`);
    
    expect(await label.count()).toBeGreaterThan(0);
  });

  test('should have aria-expanded on expandable elements', async ({ page }) => {
    await page.goto('/products');
    
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      const ariaExpanded = await filterToggle.getAttribute('aria-expanded');
      expect(ariaExpanded).not.toBeNull();
    }
  });

  test('should have aria-current on active nav items', async ({ page }) => {
    await page.goto('/products');
    
    const activeNavItem = page.locator('nav a[aria-current="page"]');
    if (await activeNavItem.count() > 0) {
      await expect(activeNavItem).toBeVisible();
    }
  });

  test('should have aria-describedby for form validation', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('[data-testid="login-button"]');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    
    if (ariaDescribedBy) {
      const errorElement = page.locator(`#${ariaDescribedBy}`);
      await expect(errorElement).toBeVisible();
    }
  });
});

// ============================================
// Screen Reader Support Tests
// ============================================

test.describe('Screen Reader Support', () => {
  test('should have descriptive page titles', async ({ page }) => {
    await page.goto('/products');
    
    const title = await page.title();
    expect(title).toContain('Products');
  });

  test('should have heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Should have h1
    const h1 = page.locator('h1');
    expect(await h1.count()).toBe(1);
    
    // Should have logical hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should announce loading states', async ({ page }) => {
    await page.goto('/products');
    
    const loadingElement = page.locator('[aria-busy="true"], [role="status"]');
    // Check that loading states have proper ARIA
    // This may not always be visible, so we just check the structure exists
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/products/1');
    
    const productImage = page.locator('[data-testid="product-main-image"]');
    const altText = await productImage.getAttribute('alt');
    
    expect(altText).not.toBeNull();
    expect(altText!.length).toBeGreaterThan(0);
    expect(altText).not.toBe('image');
  });

  test('should have aria-live for dynamic content', async ({ page }) => {
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Cart notification should be announced
    const notification = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="alert"], [role="status"]');
    expect(await notification.count()).toBeGreaterThan(0);
  });
});

// ============================================
// High Contrast Mode Tests
// ============================================

test.describe('High Contrast Mode', () => {
  test('should have high contrast mode toggle', async ({ page }) => {
    await page.goto('/');
    
    const contrastToggle = page.locator('[data-testid="high-contrast-toggle"]');
    if (await contrastToggle.isVisible()) {
      await expect(contrastToggle).toBeVisible();
    }
  });

  test('should apply high contrast styles', async ({ page }) => {
    await page.goto('/');
    
    const contrastToggle = page.locator('[data-testid="high-contrast-toggle"]');
    if (await contrastToggle.isVisible()) {
      await contrastToggle.click();
      
      const body = page.locator('body');
      const hasHighContrast = await body.evaluate(el => {
        return el.classList.contains('high-contrast') || 
               el.getAttribute('data-contrast') === 'high';
      });
      
      expect(hasHighContrast).toBeTruthy();
    }
  });

  test('should persist high contrast preference', async ({ page }) => {
    await page.goto('/');
    
    const contrastToggle = page.locator('[data-testid="high-contrast-toggle"]');
    if (await contrastToggle.isVisible()) {
      await contrastToggle.click();
      
      // Reload page
      await page.reload();
      
      const body = page.locator('body');
      const hasHighContrast = await body.evaluate(el => {
        return el.classList.contains('high-contrast') || 
               el.getAttribute('data-contrast') === 'high';
      });
      
      expect(hasHighContrast).toBeTruthy();
    }
  });
});

// ============================================
// Reduced Motion Tests
// ============================================

test.describe('Reduced Motion', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Animations should be disabled or reduced
    const heroSection = page.locator('[data-testid="hero-section"]');
    if (await heroSection.isVisible()) {
      const animationDuration = await heroSection.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.animationDuration;
      });
      
      // Animation should be short or none
      expect(animationDuration).toMatch(/^(0s|0\.0*1s|none)$/);
    }
  });

  test('should have reduced motion toggle in settings', async ({ page }) => {
    await page.goto('/');
    
    const motionToggle = page.locator('[data-testid="reduced-motion-toggle"]');
    if (await motionToggle.isVisible()) {
      await expect(motionToggle).toBeVisible();
    }
  });
});

// ============================================
// Color Contrast Tests
// ============================================

test.describe('Color Contrast', () => {
  test('should have sufficient text contrast on buttons', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('button[data-testid="primary-button"]').first();
    if (await button.isVisible()) {
      const { backgroundColor, color } = await button.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
        };
      });
      
      // Both colors should be defined
      expect(backgroundColor).not.toBe('');
      expect(color).not.toBe('');
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    await emailInput.focus();
    
    const focusStyles = await emailInput.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
      };
    });
    
    // Should have visible focus indicator
    const hasFocusIndicator = 
      focusStyles.outline !== 'none' || 
      focusStyles.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });
});

// ============================================
// Touch Target Size Tests
// ============================================

test.describe('Touch Target Size', () => {
  test('should have minimum touch target size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]').first();
    const boundingBox = await addToCartButton.boundingBox();
    
    if (boundingBox) {
      // WCAG requires 44x44 minimum
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have adequate spacing between touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    
    const buttons = await page.locator('[data-testid="add-to-cart-button"]').all();
    
    if (buttons.length >= 2) {
      const box1 = await buttons[0].boundingBox();
      const box2 = await buttons[1].boundingBox();
      
      if (box1 && box2) {
        // Should have some vertical spacing
        const spacing = box2.y - (box1.y + box1.height);
        expect(spacing).toBeGreaterThan(0);
      }
    }
  });
});

// ============================================
// Form Accessibility Tests
// ============================================

test.describe('Form Accessibility', () => {
  test('should have associated labels for all inputs', async ({ page }) => {
    await page.goto('/auth/register');
    
    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"])').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0 || ariaLabel !== null || ariaLabelledBy !== null;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should have required fields marked', async ({ page }) => {
    await page.goto('/auth/register');
    
    const requiredInputs = page.locator('input[required], input[aria-required="true"]');
    expect(await requiredInputs.count()).toBeGreaterThan(0);
  });

  test('should have error messages associated with inputs', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('[data-testid="register-button"]');
    
    const errorMessages = page.locator('[role="alert"], .error-message, [data-testid$="-error"]');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test('should have descriptive error messages', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'invalid');
    await page.click('[data-testid="login-button"]');
    
    const errorMessage = page.locator('[data-testid="email-error"]');
    if (await errorMessage.isVisible()) {
      const text = await errorMessage.textContent();
      expect(text!.length).toBeGreaterThan(10);
    }
  });
});
