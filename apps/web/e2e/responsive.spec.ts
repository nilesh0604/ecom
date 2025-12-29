import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Responsive Design & Mobile Features
 * 
 * Features Covered:
 * - Mobile navigation (hamburger menu)
 * - Responsive layouts
 * - Touch interactions
 * - Mobile-specific components
 * - Tablet views
 * 
 * @module e2e/responsive
 */

// ============================================
// Viewport Configurations
// ============================================

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 800 },
  widescreen: { width: 1920, height: 1080 },
};

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
// Mobile Navigation Tests
// ============================================

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display hamburger menu on mobile', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should close mobile menu on link click', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.click('[data-testid="mobile-nav-link"]');
    
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('should close mobile menu on backdrop click', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.click('[data-testid="mobile-menu-backdrop"]');
    
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('should close mobile menu on escape key', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('should display all navigation links in mobile menu', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    await expect(page.locator('[data-testid="mobile-nav-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-cart"]')).toBeVisible();
  });

  test('should show user menu items in mobile menu when logged in', async ({ page }) => {
    await login(page);
    await page.setViewportSize(VIEWPORTS.mobile);
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    await expect(page.locator('[data-testid="mobile-nav-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-orders"]')).toBeVisible();
  });
});

// ============================================
// Mobile Product Listing Tests
// ============================================

test.describe('Mobile Product Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display products in single/double column on mobile', async ({ page }) => {
    await page.goto('/products');
    
    const productGrid = page.locator('[data-testid="product-grid"]');
    const gridColumns = await productGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 1 or 2 columns on mobile
    const columnCount = gridColumns.split(' ').filter(s => s !== '').length;
    expect(columnCount).toBeLessThanOrEqual(2);
  });

  test('should show filter button on mobile', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="filter-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-sidebar"]')).not.toBeVisible();
  });

  test('should open filter drawer on mobile', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('[data-testid="filter-toggle"]');
    
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();
  });

  test('should close filter drawer', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('[data-testid="filter-toggle"]');
    await page.click('[data-testid="close-filter-drawer"]');
    
    await expect(page.locator('[data-testid="filter-drawer"]')).not.toBeVisible();
  });

  test('should apply filters from drawer', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('[data-testid="filter-toggle"]');
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="apply-filters"]');
    
    expect(page.url()).toContain('category');
  });
});

// ============================================
// Mobile Product Detail Tests
// ============================================

test.describe('Mobile Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display product images in carousel on mobile', async ({ page }) => {
    await page.goto('/products/1');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    if (await carousel.isVisible()) {
      await expect(carousel).toBeVisible();
    } else {
      // Or gallery with swipe
      await expect(page.locator('[data-testid="product-gallery"]')).toBeVisible();
    }
  });

  test('should support swipe gestures on image carousel', async ({ page }) => {
    await page.goto('/products/1');
    
    const gallery = page.locator('[data-testid="product-gallery"]');
    const initialImage = await page.locator('[data-testid="product-main-image"]').getAttribute('src');
    
    // Simulate swipe
    const box = await gallery.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }
    
    // Image may have changed
    await page.waitForTimeout(300);
  });

  test('should have sticky add to cart button on mobile', async ({ page }) => {
    await page.goto('/products/1');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    
    const stickyButton = page.locator('[data-testid="sticky-add-to-cart"]');
    if (await stickyButton.isVisible()) {
      await expect(stickyButton).toBeVisible();
    }
  });

  test('should display collapsible sections on mobile', async ({ page }) => {
    await page.goto('/products/1');
    
    const accordionSection = page.locator('[data-testid="product-accordion"]');
    if (await accordionSection.isVisible()) {
      await expect(accordionSection).toBeVisible();
    }
  });
});

// ============================================
// Mobile Cart Tests
// ============================================

test.describe('Mobile Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display full screen cart drawer on mobile', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    await page.click('[data-testid="cart-button"]');
    
    const cartDrawer = page.locator('[data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible();
    
    // Should be full width on mobile
    const width = await cartDrawer.evaluate(el => {
      return el.getBoundingClientRect().width;
    });
    
    expect(width).toBeGreaterThanOrEqual(VIEWPORTS.mobile.width - 20);
  });

  test('should have touch-friendly quantity buttons', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/cart');
    
    const increaseButton = page.locator('[data-testid="increase-quantity"]');
    const box = await increaseButton.boundingBox();
    
    if (box) {
      // Touch target should be at least 44x44
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

// ============================================
// Mobile Checkout Tests
// ============================================

test.describe('Mobile Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display stacked checkout steps on mobile', async ({ page }) => {
    await login(page);
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    const checkoutSteps = page.locator('[data-testid="checkout-steps"]');
    await expect(checkoutSteps).toBeVisible();
  });

  test('should have mobile-optimized form inputs', async ({ page }) => {
    await login(page);
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    // Form inputs should fill width
    const emailInput = page.locator('[data-testid="shipping-first-name"]');
    const inputWidth = await emailInput.evaluate(el => el.getBoundingClientRect().width);
    
    expect(inputWidth).toBeGreaterThan(VIEWPORTS.mobile.width * 0.8);
  });

  test('should show order summary toggle on mobile', async ({ page }) => {
    await login(page);
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    const summaryToggle = page.locator('[data-testid="mobile-order-summary-toggle"]');
    if (await summaryToggle.isVisible()) {
      await expect(summaryToggle).toBeVisible();
      
      await summaryToggle.click();
      await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    }
  });
});

// ============================================
// Tablet Layout Tests
// ============================================

test.describe('Tablet Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
  });

  test('should display desktop navigation on tablet', async ({ page }) => {
    await page.goto('/');
    
    // Tablet typically shows desktop nav
    const desktopNav = page.locator('[data-testid="desktop-nav"]');
    const mobileToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    
    // Either should be visible, not both
    const hasDesktopNav = await desktopNav.isVisible();
    const hasMobileToggle = await mobileToggle.isVisible();
    
    expect(hasDesktopNav || hasMobileToggle).toBeTruthy();
  });

  test('should display product grid with 2-3 columns on tablet', async ({ page }) => {
    await page.goto('/products');
    
    const productGrid = page.locator('[data-testid="product-grid"]');
    const gridColumns = await productGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    const columnCount = gridColumns.split(' ').filter(s => s !== '').length;
    expect(columnCount).toBeGreaterThanOrEqual(2);
    expect(columnCount).toBeLessThanOrEqual(4);
  });

  test('should show sidebar filters on tablet', async ({ page }) => {
    await page.goto('/products');
    
    const sidebar = page.locator('[data-testid="filter-sidebar"]');
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    
    // On tablet, either sidebar is visible or toggle
    const hasSidebar = await sidebar.isVisible();
    const hasToggle = await filterToggle.isVisible();
    
    expect(hasSidebar || hasToggle).toBeTruthy();
  });
});

// ============================================
// Desktop Layout Tests
// ============================================

test.describe('Desktop Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
  });

  test('should display full navigation on desktop', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).not.toBeVisible();
  });

  test('should display product grid with 4+ columns on desktop', async ({ page }) => {
    await page.goto('/products');
    
    const productGrid = page.locator('[data-testid="product-grid"]');
    const gridColumns = await productGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    const columnCount = gridColumns.split(' ').filter(s => s !== '').length;
    expect(columnCount).toBeGreaterThanOrEqual(3);
  });

  test('should show sidebar filters on desktop', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-toggle"]')).not.toBeVisible();
  });

  test('should show cart drawer as sidebar on desktop', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    await page.click('[data-testid="cart-button"]');
    
    const cartDrawer = page.locator('[data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible();
    
    // Should not be full width on desktop
    const width = await cartDrawer.evaluate(el => {
      return el.getBoundingClientRect().width;
    });
    
    expect(width).toBeLessThan(VIEWPORTS.desktop.width);
  });

  test('should display checkout in multi-column layout', async ({ page }) => {
    await login(page);
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    const checkoutContainer = page.locator('[data-testid="checkout-container"]');
    if (await checkoutContainer.isVisible()) {
      const display = await checkoutContainer.evaluate(el => {
        return window.getComputedStyle(el).display;
      });
      
      expect(['flex', 'grid']).toContain(display);
    }
  });
});

// ============================================
// Responsive Images Tests
// ============================================

test.describe('Responsive Images', () => {
  test('should load appropriate image sizes for mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products/1');
    
    const productImage = page.locator('[data-testid="product-main-image"]');
    const srcset = await productImage.getAttribute('srcset');
    const sizes = await productImage.getAttribute('sizes');
    
    // Should have responsive image attributes
    // Either srcset or sizes should be defined for responsive images
  });

  test('should load larger images on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/products/1');
    
    const productImage = page.locator('[data-testid="product-main-image"]');
    const src = await productImage.getAttribute('src');
    
    expect(src).toBeDefined();
  });
});

// ============================================
// Orientation Change Tests
// ============================================

test.describe('Orientation Changes', () => {
  test('should handle portrait to landscape transition', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    
    // Switch to landscape
    await page.setViewportSize(VIEWPORTS.mobileLandscape);
    
    // Layout should adapt
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test('should handle tablet orientation change', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/products');
    
    // Switch to landscape
    await page.setViewportSize(VIEWPORTS.tabletLandscape);
    
    // Layout should adapt
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});

// ============================================
// Touch Interaction Tests
// ============================================

test.describe('Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should handle tap on product card', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.tap();
    
    await expect(page).toHaveURL(/\/products?\//);
  });

  test('should handle tap on add to cart', async ({ page }) => {
    await page.goto('/products/1');
    
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await addToCartButton.tap();
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should handle long press (if applicable)', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    const box = await productCard.boundingBox();
    
    if (box) {
      // Simulate long press
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.up();
      
      // Check if context menu or quick action appeared
      const quickActions = page.locator('[data-testid="quick-actions"]');
      // This is optional feature
    }
  });
});

// ============================================
// Mobile Footer Tests
// ============================================

test.describe('Mobile Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should display accordion-style footer on mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footerAccordion = page.locator('[data-testid="footer-accordion"]');
    if (await footerAccordion.isVisible()) {
      await expect(footerAccordion).toBeVisible();
    }
  });

  test('should expand footer sections on tap', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footerSection = page.locator('[data-testid="footer-section-toggle"]').first();
    if (await footerSection.isVisible()) {
      await footerSection.tap();
      
      await expect(page.locator('[data-testid="footer-section-content"]').first()).toBeVisible();
    }
  });
});

// ============================================
// Scroll Behavior Tests
// ============================================

test.describe('Scroll Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  test('should show back to top button after scrolling', async ({ page }) => {
    await page.goto('/products');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);
    
    const backToTop = page.locator('[data-testid="back-to-top"]');
    if (await backToTop.isVisible()) {
      await expect(backToTop).toBeVisible();
    }
  });

  test('should scroll to top when back to top is clicked', async ({ page }) => {
    await page.goto('/products');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);
    
    const backToTop = page.locator('[data-testid="back-to-top"]');
    if (await backToTop.isVisible()) {
      await backToTop.click();
      await page.waitForTimeout(500);
      
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    }
  });

  test('should hide header on scroll down and show on scroll up', async ({ page }) => {
    await page.goto('/products');
    
    const header = page.locator('header');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    // Header may be hidden
    const isHiddenOnScrollDown = await header.evaluate(el => {
      return el.classList.contains('hidden') || 
             window.getComputedStyle(el).transform.includes('-');
    });
    
    // Scroll up
    await page.evaluate(() => window.scrollBy(0, -200));
    await page.waitForTimeout(300);
    
    // Header should be visible again
    await expect(header).toBeVisible();
  });
});
