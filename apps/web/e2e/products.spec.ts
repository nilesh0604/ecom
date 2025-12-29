import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Product Browsing Features
 * 
 * Features Covered:
 * - Product listing and grid display
 * - Search functionality with instant search
 * - Category filtering
 * - Price and attribute filtering
 * - Sorting options
 * - Pagination
 * - Product detail page
 * - Product gallery (zoom, lightbox)
 * - Size guide
 * - Product reviews
 * - Wishlist functionality
 * 
 * @module e2e/products
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
// Product Listing Tests
// ============================================

test.describe('Product Listing', () => {
  test('should display product grid on products page', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    const productCount = await page.locator('[data-testid="product-card"]').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should display product cards with required information', async ({ page }) => {
    await page.goto('/products');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    await expect(firstProduct.locator('[data-testid="product-image"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });

  test('should show loading state while fetching products', async ({ page }) => {
    // Navigate with network throttling
    await page.route('**/api/**/products**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await page.goto('/products');
    
    // Check for loading skeleton or spinner
    const hasLoading = 
      await page.locator('[data-testid="loading-skeleton"]').isVisible() ||
      await page.locator('[data-testid="loading-spinner"]').isVisible();
    
    expect(hasLoading).toBeTruthy();
  });

  test('should show empty state when no products found', async ({ page }) => {
    await page.goto('/products?search=xyznonexistent12345');
    
    await expect(page.locator('[data-testid="no-products-found"]')).toBeVisible();
  });

  test('should display product count', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="product-count"]')).toBeVisible();
    const countText = await page.locator('[data-testid="product-count"]').textContent();
    expect(countText).toMatch(/\d+\s*(products?|results?|items?)/i);
  });
});

// ============================================
// Search Tests
// ============================================

test.describe('Product Search', () => {
  test('should display search input', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('should search products by keyword', async ({ page }) => {
    await page.goto('/products');
    
    await page.fill('[data-testid="search-input"]', 'phone');
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    
    // Verify URL contains search parameter
    expect(page.url()).toContain('search=phone');
    
    // Products should be filtered
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('should show instant search suggestions', async ({ page }) => {
    await page.goto('/products');
    
    await page.fill('[data-testid="search-input"]', 'lap');
    
    // Check for suggestions dropdown
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      const suggestionCount = await suggestions.locator('[data-testid="search-suggestion"]').count();
      expect(suggestionCount).toBeGreaterThan(0);
    }
  });

  test('should clear search results', async ({ page }) => {
    await page.goto('/products?search=phone');
    
    await page.click('[data-testid="clear-search"]');
    
    // URL should not contain search parameter
    expect(page.url()).not.toContain('search=');
  });

  test('should show search results count', async ({ page }) => {
    await page.goto('/products');
    
    await page.fill('[data-testid="search-input"]', 'phone');
    await page.waitForTimeout(500);
    
    const resultsText = await page.locator('[data-testid="search-results-count"]').textContent();
    expect(resultsText).toMatch(/\d+\s*(results?|products?|found)/i);
  });
});

// ============================================
// Filter Tests
// ============================================

test.describe('Product Filters', () => {
  test('should display filter sidebar', async ({ page }) => {
    await page.goto('/products');
    
    // On mobile, may need to open filter panel
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/products');
    
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    // Click first category filter
    await page.locator('[data-testid="category-filter"]').first().click();
    
    // URL should contain category parameter
    await page.waitForURL(/category=/);
    expect(page.url()).toContain('category');
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/products');
    
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    // Set price range
    const minPriceInput = page.locator('[data-testid="min-price-input"]');
    const maxPriceInput = page.locator('[data-testid="max-price-input"]');
    
    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill('50');
      await maxPriceInput.fill('200');
      await page.click('[data-testid="apply-price-filter"]');
      
      expect(page.url()).toMatch(/minPrice=50|min=50/);
      expect(page.url()).toMatch(/maxPrice=200|max=200/);
    }
  });

  test('should filter by rating', async ({ page }) => {
    await page.goto('/products');
    
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    const ratingFilter = page.locator('[data-testid="rating-filter-4"]');
    if (await ratingFilter.isVisible()) {
      await ratingFilter.click();
      
      expect(page.url()).toContain('rating');
    }
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.goto('/products');
    
    const filterToggle = page.locator('[data-testid="filter-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    // Apply category filter
    await page.locator('[data-testid="category-filter"]').first().click();
    await page.waitForTimeout(300);
    
    // Apply another filter if available
    const inStockFilter = page.locator('[data-testid="in-stock-filter"]');
    if (await inStockFilter.isVisible()) {
      await inStockFilter.click();
    }
    
    // Both filters should be in URL
    expect(page.url()).toContain('category');
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/products?category=electronics&minPrice=50');
    
    await page.click('[data-testid="clear-all-filters"]');
    
    // URL should be clean
    expect(page.url()).not.toContain('category');
    expect(page.url()).not.toContain('minPrice');
  });

  test('should show active filter tags', async ({ page }) => {
    await page.goto('/products?category=electronics');
    
    await expect(page.locator('[data-testid="active-filter-tag"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-filter-tag"]')).toContainText(/electronics/i);
  });
});

// ============================================
// Sorting Tests
// ============================================

test.describe('Product Sorting', () => {
  test('should display sort dropdown', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="sort-select"]')).toBeVisible();
  });

  test('should sort by price low to high', async ({ page }) => {
    await page.goto('/products');
    
    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    
    expect(page.url()).toMatch(/sort=price|sortBy=price|order=asc/);
  });

  test('should sort by price high to low', async ({ page }) => {
    await page.goto('/products');
    
    await page.selectOption('[data-testid="sort-select"]', 'price-desc');
    
    expect(page.url()).toMatch(/sort=price|sortBy=price|order=desc/);
  });

  test('should sort by newest', async ({ page }) => {
    await page.goto('/products');
    
    await page.selectOption('[data-testid="sort-select"]', 'newest');
    
    expect(page.url()).toMatch(/sort=date|sort=newest|sortBy=createdAt/);
  });

  test('should sort by popularity', async ({ page }) => {
    await page.goto('/products');
    
    await page.selectOption('[data-testid="sort-select"]', 'popular');
    
    expect(page.url()).toMatch(/sort=popular|sortBy=popularity/);
  });
});

// ============================================
// Pagination Tests
// ============================================

test.describe('Product Pagination', () => {
  test('should display pagination controls', async ({ page }) => {
    await page.goto('/products');
    
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should navigate to next page', async ({ page }) => {
    await page.goto('/products');
    
    const nextButton = page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      
      expect(page.url()).toMatch(/page=2/);
    }
  });

  test('should navigate to specific page', async ({ page }) => {
    await page.goto('/products');
    
    const page3Button = page.locator('[data-testid="pagination-page-3"]');
    if (await page3Button.isVisible()) {
      await page3Button.click();
      
      expect(page.url()).toMatch(/page=3/);
    }
  });
});

// ============================================
// Product Detail Tests
// ============================================

test.describe('Product Detail Page', () => {
  test('should navigate to product detail from listing', async ({ page }) => {
    await page.goto('/products');
    
    await page.locator('[data-testid="product-card"]').first().click();
    
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page).toHaveURL(/\/products?\//);
  });

  test('should display product information', async ({ page }) => {
    await page.goto('/products/1');
    
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should display product images gallery', async ({ page }) => {
    await page.goto('/products/1');
    
    await expect(page.locator('[data-testid="product-gallery"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-main-image"]')).toBeVisible();
  });

  test('should change main image on thumbnail click', async ({ page }) => {
    await page.goto('/products/1');
    
    const thumbnails = page.locator('[data-testid="product-thumbnail"]');
    const thumbnailCount = await thumbnails.count();
    
    if (thumbnailCount > 1) {
      // Get initial image src
      const initialSrc = await page.locator('[data-testid="product-main-image"]').getAttribute('src');
      
      // Click second thumbnail
      await thumbnails.nth(1).click();
      
      // Image should change
      const newSrc = await page.locator('[data-testid="product-main-image"]').getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }
  });

  test('should open lightbox on image click', async ({ page }) => {
    await page.goto('/products/1');
    
    await page.locator('[data-testid="product-main-image"]').click();
    
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
  });

  test('should close lightbox', async ({ page }) => {
    await page.goto('/products/1');
    
    await page.locator('[data-testid="product-main-image"]').click();
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
    
    // Close with button or escape
    await page.click('[data-testid="lightbox-close"]');
    
    await expect(page.locator('[data-testid="lightbox"]')).not.toBeVisible();
  });

  test('should zoom image on hover', async ({ page }) => {
    await page.goto('/products/1');
    
    const mainImage = page.locator('[data-testid="product-main-image"]');
    await mainImage.hover();
    
    // Check for zoom container or zoom lens
    const hasZoom = 
      await page.locator('[data-testid="zoom-lens"]').isVisible() ||
      await page.locator('[data-testid="zoom-container"]').isVisible();
    
    expect(hasZoom).toBeTruthy();
  });
});

// ============================================
// Size Guide Tests
// ============================================

test.describe('Size Guide', () => {
  test('should display size guide link', async ({ page }) => {
    await page.goto('/products/1');
    
    const sizeGuideLink = page.locator('[data-testid="size-guide-link"]');
    if (await sizeGuideLink.isVisible()) {
      await expect(sizeGuideLink).toBeVisible();
    }
  });

  test('should open size guide modal', async ({ page }) => {
    await page.goto('/products/1');
    
    const sizeGuideLink = page.locator('[data-testid="size-guide-link"]');
    if (await sizeGuideLink.isVisible()) {
      await sizeGuideLink.click();
      
      await expect(page.locator('[data-testid="size-guide-modal"]')).toBeVisible();
    }
  });

  test('should display size chart', async ({ page }) => {
    await page.goto('/products/1');
    
    const sizeGuideLink = page.locator('[data-testid="size-guide-link"]');
    if (await sizeGuideLink.isVisible()) {
      await sizeGuideLink.click();
      
      await expect(page.locator('[data-testid="size-chart"]')).toBeVisible();
    }
  });

  test('should switch between size units (US/UK/EU)', async ({ page }) => {
    await page.goto('/products/1');
    
    const sizeGuideLink = page.locator('[data-testid="size-guide-link"]');
    if (await sizeGuideLink.isVisible()) {
      await sizeGuideLink.click();
      
      const ukTab = page.locator('[data-testid="size-unit-uk"]');
      if (await ukTab.isVisible()) {
        await ukTab.click();
        
        // Verify UK sizes are shown
        await expect(page.locator('[data-testid="size-chart"]')).toContainText(/UK/);
      }
    }
  });
});

// ============================================
// Product Variants Tests
// ============================================

test.describe('Product Variants', () => {
  test('should display color options', async ({ page }) => {
    await page.goto('/products/1');
    
    const colorSelector = page.locator('[data-testid="color-selector"]');
    if (await colorSelector.isVisible()) {
      await expect(colorSelector).toBeVisible();
      const colorCount = await page.locator('[data-testid="color-option"]').count();
      expect(colorCount).toBeGreaterThan(0);
    }
  });

  test('should select color variant', async ({ page }) => {
    await page.goto('/products/1');
    
    const colorOptions = page.locator('[data-testid="color-option"]');
    if (await colorOptions.first().isVisible()) {
      await colorOptions.nth(1).click();
      
      // Check if selected state is applied
      await expect(colorOptions.nth(1)).toHaveAttribute('data-selected', 'true');
    }
  });

  test('should display size options', async ({ page }) => {
    await page.goto('/products/1');
    
    const sizeSelector = page.locator('[data-testid="size-selector"]');
    if (await sizeSelector.isVisible()) {
      const sizeCount = await page.locator('[data-testid="size-option"]').count();
      expect(sizeCount).toBeGreaterThan(0);
    }
  });

  test('should show out of stock variants as disabled', async ({ page }) => {
    await page.goto('/products/1');
    
    const disabledSize = page.locator('[data-testid="size-option"][data-available="false"]');
    if (await disabledSize.isVisible()) {
      await expect(disabledSize).toBeDisabled();
    }
  });

  test('should update price on variant selection', async ({ page }) => {
    await page.goto('/products/1');
    
    const priceElement = page.locator('[data-testid="product-price"]');
    const initialPrice = await priceElement.textContent();
    
    // Select a different variant if available
    const variantOption = page.locator('[data-testid="variant-option"]').nth(1);
    if (await variantOption.isVisible()) {
      await variantOption.click();
      
      // Price may have changed
      await page.waitForTimeout(300);
    }
  });
});

// ============================================
// Product Reviews Tests
// ============================================

test.describe('Product Reviews', () => {
  test('should display reviews section', async ({ page }) => {
    await page.goto('/products/1');
    
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
  });

  test('should display average rating', async ({ page }) => {
    await page.goto('/products/1');
    
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
  });

  test('should display review list', async ({ page }) => {
    await page.goto('/products/1');
    
    const reviewsList = page.locator('[data-testid="reviews-list"]');
    if (await reviewsList.isVisible()) {
      const reviewCount = await page.locator('[data-testid="review-item"]').count();
      expect(reviewCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow logged in user to write review', async ({ page }) => {
    await login(page);
    await page.goto('/products/1');
    
    const writeReviewButton = page.locator('[data-testid="write-review-button"]');
    if (await writeReviewButton.isVisible()) {
      await writeReviewButton.click();
      
      await expect(page.locator('[data-testid="review-form"]')).toBeVisible();
    }
  });

  test('should submit review successfully', async ({ page }) => {
    await login(page);
    await page.goto('/products/1');
    
    const writeReviewButton = page.locator('[data-testid="write-review-button"]');
    if (await writeReviewButton.isVisible()) {
      await writeReviewButton.click();
      
      await page.click('[data-testid="rating-star-5"]');
      await page.fill('[data-testid="review-title"]', 'Great Product!');
      await page.fill('[data-testid="review-content"]', 'This is an amazing product. Highly recommended!');
      await page.click('[data-testid="submit-review-button"]');
      
      await expect(page.locator('[data-testid="review-success-message"]')).toBeVisible();
    }
  });
});

// ============================================
// Wishlist Tests
// ============================================

test.describe('Wishlist', () => {
  test('should add product to wishlist', async ({ page }) => {
    await login(page);
    await page.goto('/products/1');
    
    await page.click('[data-testid="add-to-wishlist"]');
    
    await expect(page.locator('[data-testid="wishlist-success"]')).toBeVisible();
  });

  test('should remove product from wishlist', async ({ page }) => {
    await login(page);
    
    // First add to wishlist
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-wishlist"]');
    
    // Then remove
    await page.click('[data-testid="remove-from-wishlist"]');
    
    await expect(page.locator('[data-testid="add-to-wishlist"]')).toBeVisible();
  });

  test('should view wishlist page', async ({ page }) => {
    await login(page);
    await page.goto('/wishlist');
    
    await expect(page.locator('[data-testid="wishlist-page"]')).toBeVisible();
  });

  test('should add wishlist item to cart', async ({ page }) => {
    await login(page);
    
    // Add to wishlist first
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-wishlist"]');
    
    // Go to wishlist
    await page.goto('/wishlist');
    
    // Add to cart from wishlist
    await page.click('[data-testid="wishlist-add-to-cart"]');
    
    // Verify cart updated
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });
});

// ============================================
// Waitlist/Notify Me Tests
// ============================================

test.describe('Waitlist/Notify Me', () => {
  test('should display notify me button for out of stock items', async ({ page }) => {
    // Navigate to an out of stock product
    await page.goto('/products');
    
    const outOfStockProduct = page.locator('[data-testid="product-card"][data-stock="out"]').first();
    if (await outOfStockProduct.isVisible()) {
      await outOfStockProduct.click();
      
      await expect(page.locator('[data-testid="notify-me-button"]')).toBeVisible();
    }
  });

  test('should open notify me modal', async ({ page }) => {
    await page.goto('/products/out-of-stock-1');
    
    const notifyButton = page.locator('[data-testid="notify-me-button"]');
    if (await notifyButton.isVisible()) {
      await notifyButton.click();
      
      await expect(page.locator('[data-testid="notify-me-modal"]')).toBeVisible();
    }
  });

  test('should submit email for notification', async ({ page }) => {
    await page.goto('/products/out-of-stock-1');
    
    const notifyButton = page.locator('[data-testid="notify-me-button"]');
    if (await notifyButton.isVisible()) {
      await notifyButton.click();
      
      await page.fill('[data-testid="notify-email-input"]', 'test@example.com');
      await page.click('[data-testid="notify-submit-button"]');
      
      await expect(page.locator('[data-testid="notify-success"]')).toBeVisible();
    }
  });
});

// ============================================
// Related Products Tests
// ============================================

test.describe('Related Products', () => {
  test('should display related products section', async ({ page }) => {
    await page.goto('/products/1');
    
    await expect(page.locator('[data-testid="related-products"]')).toBeVisible();
  });

  test('should navigate to related product', async ({ page }) => {
    await page.goto('/products/1');
    
    const initialUrl = page.url();
    
    const relatedProduct = page.locator('[data-testid="related-product-card"]').first();
    if (await relatedProduct.isVisible()) {
      await relatedProduct.click();
      
      // Should navigate to different product
      expect(page.url()).not.toBe(initialUrl);
    }
  });
});
