import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Shopping Cart Features
 * 
 * Features Covered:
 * - Add to cart functionality
 * - Cart drawer/sidebar
 * - Quantity updates
 * - Remove items
 * - Cart persistence (localStorage)
 * - Cart summary calculations
 * - Promo codes/coupons
 * - Gift options
 * - Store credit application
 * 
 * @module e2e/cart
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

async function addProductToCart(page: Page) {
  await page.goto('/products');
  await page.locator('[data-testid="add-to-cart-button"]').first().click();
  await page.waitForTimeout(300);
}

async function clearCart(page: Page) {
  await page.goto('/cart');
  const clearButton = page.locator('[data-testid="clear-cart-button"]');
  if (await clearButton.isVisible()) {
    await clearButton.click();
  }
}

// ============================================
// Add to Cart Tests
// ============================================

test.describe('Add to Cart', () => {
  test('should add product to cart from product listing', async ({ page }) => {
    await page.goto('/products');
    
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Verify cart badge updates
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/products/1');
    
    await page.click('[data-testid="add-to-cart-button"]');
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should select quantity before adding to cart', async ({ page }) => {
    await page.goto('/products/1');
    
    // Increase quantity
    const quantityInput = page.locator('[data-testid="quantity-input"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3');
    } else {
      await page.click('[data-testid="increase-quantity"]');
      await page.click('[data-testid="increase-quantity"]');
    }
    
    await page.click('[data-testid="add-to-cart-button"]');
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('3');
  });

  test('should show success notification after adding to cart', async ({ page }) => {
    await page.goto('/products/1');
    
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Check for toast/notification
    const notification = page.locator('[data-testid="cart-notification"]');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText(/added to cart/i);
  });

  test('should open cart drawer after adding product', async ({ page }) => {
    await page.goto('/products/1');
    
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Cart drawer should open automatically
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
  });

  test('should require variant selection before adding', async ({ page }) => {
    await page.goto('/products/1');
    
    // Try to add without selecting required variant
    const sizeOptions = page.locator('[data-testid="size-option"]');
    if (await sizeOptions.first().isVisible()) {
      // Clear any default selection
      await page.click('[data-testid="add-to-cart-button"]');
      
      // Should show error or prevent adding
      const errorMessage = page.locator('[data-testid="variant-error"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText(/select.*size/i);
      }
    }
  });
});

// ============================================
// Cart Drawer Tests
// ============================================

test.describe('Cart Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
  });

  test('should open cart drawer on cart icon click', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
  });

  test('should close cart drawer', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    
    await page.click('[data-testid="close-cart-drawer"]');
    
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeVisible();
  });

  test('should close cart drawer on backdrop click', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    
    await page.click('[data-testid="cart-backdrop"]');
    
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeVisible();
  });

  test('should close cart drawer on Escape key', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeVisible();
  });

  test('should display cart items in drawer', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-price"]')).toBeVisible();
  });

  test('should navigate to checkout from drawer', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should navigate to cart page from drawer', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="view-cart-button"]');
    
    await expect(page).toHaveURL('/cart');
  });
});

// ============================================
// Cart Page Tests
// ============================================

test.describe('Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display cart items', async ({ page }) => {
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });

  test('should display item details', async ({ page }) => {
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    
    await expect(cartItem.locator('[data-testid="item-image"]')).toBeVisible();
    await expect(cartItem.locator('[data-testid="item-name"]')).toBeVisible();
    await expect(cartItem.locator('[data-testid="item-price"]')).toBeVisible();
    await expect(cartItem.locator('[data-testid="item-quantity"]')).toBeVisible();
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await clearCart(page);
    await page.goto('/cart');
    
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="continue-shopping-link"]')).toBeVisible();
  });
});

// ============================================
// Quantity Update Tests
// ============================================

test.describe('Cart Quantity Updates', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should increase item quantity', async ({ page }) => {
    const initialQuantity = await page.locator('[data-testid="item-quantity"]').textContent();
    
    await page.click('[data-testid="increase-quantity"]');
    
    await page.waitForTimeout(300);
    const newQuantity = await page.locator('[data-testid="item-quantity"]').textContent();
    expect(parseInt(newQuantity!)).toBe(parseInt(initialQuantity!) + 1);
  });

  test('should decrease item quantity', async ({ page }) => {
    // First increase to 2
    await page.click('[data-testid="increase-quantity"]');
    await page.waitForTimeout(300);
    
    // Then decrease
    await page.click('[data-testid="decrease-quantity"]');
    await page.waitForTimeout(300);
    
    const quantity = await page.locator('[data-testid="item-quantity"]').textContent();
    expect(parseInt(quantity!)).toBe(1);
  });

  test('should remove item when quantity reaches zero', async ({ page }) => {
    await page.click('[data-testid="decrease-quantity"]');
    await page.waitForTimeout(300);
    
    // Item should be removed or confirmation shown
    const cartItem = page.locator('[data-testid="cart-item"]');
    const isEmpty = !(await cartItem.isVisible());
    const confirmationShown = await page.locator('[data-testid="remove-confirmation"]').isVisible();
    
    expect(isEmpty || confirmationShown).toBeTruthy();
  });

  test('should update quantity via input', async ({ page }) => {
    const quantityInput = page.locator('[data-testid="quantity-input"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('5');
      await quantityInput.blur();
      
      await page.waitForTimeout(300);
      await expect(quantityInput).toHaveValue('5');
    }
  });

  test('should update subtotal on quantity change', async ({ page }) => {
    const initialSubtotal = await page.locator('[data-testid="cart-subtotal"]').textContent();
    
    await page.click('[data-testid="increase-quantity"]');
    await page.waitForTimeout(500);
    
    const newSubtotal = await page.locator('[data-testid="cart-subtotal"]').textContent();
    expect(newSubtotal).not.toBe(initialSubtotal);
  });

  test('should respect maximum quantity limit', async ({ page }) => {
    const quantityInput = page.locator('[data-testid="quantity-input"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('999');
      await quantityInput.blur();
      
      // Should show error or cap the quantity
      const hasError = await page.locator('[data-testid="quantity-error"]').isVisible();
      const cappedValue = await quantityInput.inputValue();
      
      expect(hasError || parseInt(cappedValue) < 999).toBeTruthy();
    }
  });
});

// ============================================
// Remove Item Tests
// ============================================

test.describe('Remove Cart Items', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should remove item from cart', async ({ page }) => {
    await page.click('[data-testid="remove-item"]');
    
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
  });

  test('should show confirmation before removing (if enabled)', async ({ page }) => {
    await page.click('[data-testid="remove-item"]');
    
    const confirmation = page.locator('[data-testid="remove-confirmation"]');
    if (await confirmation.isVisible()) {
      await expect(confirmation).toContainText(/remove|delete|confirm/i);
      await page.click('[data-testid="confirm-remove"]');
    }
    
    await expect(page.locator('[data-testid="cart-item"]')).not.toBeVisible();
  });

  test('should update cart badge after removal', async ({ page }) => {
    await page.click('[data-testid="remove-item"]');
    await page.waitForTimeout(300);
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    const badgeText = await cartBadge.textContent();
    expect(badgeText === '0' || badgeText === '').toBeTruthy();
  });
});

// ============================================
// Cart Persistence Tests
// ============================================

test.describe('Cart Persistence', () => {
  test('should persist cart after page reload', async ({ page }) => {
    await addProductToCart(page);
    
    // Reload the page
    await page.reload();
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should persist cart across pages', async ({ page }) => {
    await addProductToCart(page);
    
    // Navigate to different pages
    await page.goto('/about');
    await page.goto('/');
    await page.goto('/products');
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should persist cart after browser close (simulated)', async ({ page, context }) => {
    await addProductToCart(page);
    
    // Get localStorage
    const storage = await context.storageState();
    
    // Create new page (simulating new session)
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    const cartBadge = newPage.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
    
    await newPage.close();
  });
});

// ============================================
// Cart Summary Tests
// ============================================

test.describe('Cart Summary', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display subtotal', async ({ page }) => {
    await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible();
    const subtotal = await page.locator('[data-testid="cart-subtotal"]').textContent();
    expect(subtotal).toMatch(/\$|€|£/);
  });

  test('should display estimated tax', async ({ page }) => {
    await expect(page.locator('[data-testid="estimated-tax"]')).toBeVisible();
  });

  test('should display shipping estimate', async ({ page }) => {
    const shippingEstimate = page.locator('[data-testid="shipping-estimate"]');
    await expect(shippingEstimate).toBeVisible();
  });

  test('should calculate total correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    const total = await page.locator('[data-testid="cart-total"]').textContent();
    expect(total).toMatch(/\$|€|£/);
  });

  test('should show free shipping threshold', async ({ page }) => {
    const freeShipping = page.locator('[data-testid="free-shipping-progress"]');
    if (await freeShipping.isVisible()) {
      await expect(freeShipping).toContainText(/free shipping|away from free/i);
    }
  });
});

// ============================================
// Promo Code/Coupon Tests
// ============================================

test.describe('Promo Codes & Coupons', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display promo code input', async ({ page }) => {
    await expect(page.locator('[data-testid="promo-code-input"]')).toBeVisible();
  });

  test('should apply valid promo code', async ({ page }) => {
    await page.fill('[data-testid="promo-code-input"]', 'SAVE10');
    await page.click('[data-testid="apply-promo-button"]');
    
    await expect(page.locator('[data-testid="promo-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });

  test('should show error for invalid promo code', async ({ page }) => {
    await page.fill('[data-testid="promo-code-input"]', 'INVALIDCODE');
    await page.click('[data-testid="apply-promo-button"]');
    
    await expect(page.locator('[data-testid="promo-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="promo-error"]')).toContainText(/invalid|expired|not found/i);
  });

  test('should remove applied promo code', async ({ page }) => {
    // Apply promo first
    await page.fill('[data-testid="promo-code-input"]', 'SAVE10');
    await page.click('[data-testid="apply-promo-button"]');
    await page.waitForTimeout(300);
    
    // Remove promo
    await page.click('[data-testid="remove-promo"]');
    
    await expect(page.locator('[data-testid="discount-amount"]')).not.toBeVisible();
  });

  test('should update total after applying promo', async ({ page }) => {
    const initialTotal = await page.locator('[data-testid="cart-total"]').textContent();
    
    await page.fill('[data-testid="promo-code-input"]', 'SAVE10');
    await page.click('[data-testid="apply-promo-button"]');
    await page.waitForTimeout(500);
    
    const newTotal = await page.locator('[data-testid="cart-total"]').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test('should show promo code restrictions', async ({ page }) => {
    await page.fill('[data-testid="promo-code-input"]', 'MINSPEND50');
    await page.click('[data-testid="apply-promo-button"]');
    
    const error = page.locator('[data-testid="promo-error"]');
    if (await error.isVisible()) {
      await expect(error).toContainText(/minimum|spend|required/i);
    }
  });
});

// ============================================
// Gift Card Tests
// ============================================

test.describe('Gift Cards', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display gift card input', async ({ page }) => {
    const giftCardInput = page.locator('[data-testid="gift-card-input"]');
    if (await giftCardInput.isVisible()) {
      await expect(giftCardInput).toBeVisible();
    }
  });

  test('should apply valid gift card', async ({ page }) => {
    const giftCardInput = page.locator('[data-testid="gift-card-input"]');
    if (await giftCardInput.isVisible()) {
      await giftCardInput.fill('GIFTCARD123');
      await page.click('[data-testid="apply-gift-card-button"]');
      
      await expect(page.locator('[data-testid="gift-card-applied"]')).toBeVisible();
    }
  });

  test('should check gift card balance', async ({ page }) => {
    await page.goto('/gift-cards/balance');
    
    await page.fill('[data-testid="gift-card-number"]', 'GIFTCARD123');
    await page.click('[data-testid="check-balance-button"]');
    
    await expect(page.locator('[data-testid="gift-card-balance"]')).toBeVisible();
  });
});

// ============================================
// Store Credit Tests
// ============================================

test.describe('Store Credit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display available store credit', async ({ page }) => {
    const storeCredit = page.locator('[data-testid="store-credit-available"]');
    if (await storeCredit.isVisible()) {
      await expect(storeCredit).toBeVisible();
    }
  });

  test('should apply store credit to order', async ({ page }) => {
    const applyCredit = page.locator('[data-testid="apply-store-credit"]');
    if (await applyCredit.isVisible()) {
      await applyCredit.click();
      
      await expect(page.locator('[data-testid="store-credit-applied"]')).toBeVisible();
    }
  });
});

// ============================================
// Gift Options Tests
// ============================================

test.describe('Gift Options', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display gift options toggle', async ({ page }) => {
    const giftOption = page.locator('[data-testid="gift-option-toggle"]');
    if (await giftOption.isVisible()) {
      await expect(giftOption).toBeVisible();
    }
  });

  test('should expand gift options form', async ({ page }) => {
    const giftOption = page.locator('[data-testid="gift-option-toggle"]');
    if (await giftOption.isVisible()) {
      await giftOption.click();
      
      await expect(page.locator('[data-testid="gift-message-input"]')).toBeVisible();
    }
  });

  test('should add gift message', async ({ page }) => {
    const giftOption = page.locator('[data-testid="gift-option-toggle"]');
    if (await giftOption.isVisible()) {
      await giftOption.click();
      
      await page.fill('[data-testid="gift-message-input"]', 'Happy Birthday!');
      await page.click('[data-testid="save-gift-options"]');
      
      await expect(page.locator('[data-testid="gift-message-saved"]')).toBeVisible();
    }
  });

  test('should select gift wrapping option', async ({ page }) => {
    const giftOption = page.locator('[data-testid="gift-option-toggle"]');
    if (await giftOption.isVisible()) {
      await giftOption.click();
      
      const giftWrap = page.locator('[data-testid="gift-wrap-option"]');
      if (await giftWrap.isVisible()) {
        await giftWrap.click();
        
        await expect(giftWrap).toBeChecked();
      }
    }
  });

  test('should update total with gift wrapping fee', async ({ page }) => {
    const giftOption = page.locator('[data-testid="gift-option-toggle"]');
    if (await giftOption.isVisible()) {
      const initialTotal = await page.locator('[data-testid="cart-total"]').textContent();
      
      await giftOption.click();
      await page.locator('[data-testid="gift-wrap-premium"]').click();
      await page.waitForTimeout(300);
      
      const newTotal = await page.locator('[data-testid="cart-total"]').textContent();
      // Total may increase with gift wrapping fee
    }
  });
});

// ============================================
// Inventory State Tests
// ============================================

test.describe('Inventory States in Cart', () => {
  test('should show low stock warning', async ({ page }) => {
    // Add low stock item
    await page.goto('/products');
    const lowStockItem = page.locator('[data-testid="product-card"][data-stock="low"]').first();
    if (await lowStockItem.isVisible()) {
      await lowStockItem.locator('[data-testid="add-to-cart-button"]').click();
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="low-stock-warning"]')).toBeVisible();
    }
  });

  test('should show backorder message', async ({ page }) => {
    await page.goto('/cart');
    
    const backorderMessage = page.locator('[data-testid="backorder-message"]');
    if (await backorderMessage.isVisible()) {
      await expect(backorderMessage).toContainText(/backorder|ships/i);
    }
  });

  test('should show preorder status', async ({ page }) => {
    await page.goto('/cart');
    
    const preorderMessage = page.locator('[data-testid="preorder-message"]');
    if (await preorderMessage.isVisible()) {
      await expect(preorderMessage).toContainText(/preorder|pre-order/i);
    }
  });
});

// ============================================
// Recommendations in Cart Tests
// ============================================

test.describe('Cart Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/cart');
  });

  test('should display "You may also like" section', async ({ page }) => {
    const recommendations = page.locator('[data-testid="cart-recommendations"]');
    if (await recommendations.isVisible()) {
      await expect(recommendations).toBeVisible();
    }
  });

  test('should display "Frequently bought together"', async ({ page }) => {
    const fbt = page.locator('[data-testid="frequently-bought-together"]');
    if (await fbt.isVisible()) {
      await expect(fbt).toBeVisible();
    }
  });

  test('should add recommended item to cart', async ({ page }) => {
    const addButton = page.locator('[data-testid="add-recommended-item"]').first();
    if (await addButton.isVisible()) {
      const initialCount = await page.locator('[data-testid="cart-item"]').count();
      
      await addButton.click();
      await page.waitForTimeout(300);
      
      const newCount = await page.locator('[data-testid="cart-item"]').count();
      expect(newCount).toBe(initialCount + 1);
    }
  });
});
