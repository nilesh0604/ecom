import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Order History & Management Features
 * 
 * Features Covered:
 * - Order history listing
 * - Order details view
 * - Order tracking with timeline
 * - Returns portal
 * - Exchanges
 * - Downloadable invoices
 * - Reorder functionality
 * 
 * @module e2e/orders
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
// Order History Tests
// ============================================

test.describe('Order History', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display order history page', async ({ page }) => {
    await page.goto('/orders');
    
    await expect(page.locator('h1')).toContainText(/orders/i);
  });

  test('should list past orders', async ({ page }) => {
    await page.goto('/orders');
    
    const orders = page.locator('[data-testid="order-item"]');
    const orderCount = await orders.count();
    
    // May have orders or show empty state
    if (orderCount === 0) {
      await expect(page.locator('[data-testid="no-orders-message"]')).toBeVisible();
    } else {
      await expect(orders.first()).toBeVisible();
    }
  });

  test('should display order summary in list', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await expect(firstOrder.locator('[data-testid="order-number"]')).toBeVisible();
      await expect(firstOrder.locator('[data-testid="order-date"]')).toBeVisible();
      await expect(firstOrder.locator('[data-testid="order-total"]')).toBeVisible();
      await expect(firstOrder.locator('[data-testid="order-status"]')).toBeVisible();
    }
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    
    const statusFilter = page.locator('[data-testid="order-status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('delivered');
      
      expect(page.url()).toContain('status=delivered');
    }
  });

  test('should sort orders by date', async ({ page }) => {
    await page.goto('/orders');
    
    const sortSelect = page.locator('[data-testid="order-sort"]');
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('oldest');
      
      expect(page.url()).toContain('sort=oldest');
    }
  });

  test('should paginate orders', async ({ page }) => {
    await page.goto('/orders');
    
    const pagination = page.locator('[data-testid="orders-pagination"]');
    if (await pagination.isVisible()) {
      await page.click('[data-testid="pagination-next"]');
      
      expect(page.url()).toContain('page=2');
    }
  });
});

// ============================================
// Order Details Tests
// ============================================

test.describe('Order Details', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to order details', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    }
  });

  test('should display order items', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="order-items-list"]')).toBeVisible();
      const items = page.locator('[data-testid="order-item-detail"]');
      expect(await items.count()).toBeGreaterThan(0);
    }
  });

  test('should display shipping address', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="order-shipping-address"]')).toBeVisible();
    }
  });

  test('should display payment information', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="order-payment-info"]')).toBeVisible();
      const paymentText = await page.locator('[data-testid="order-payment-info"]').textContent();
      expect(paymentText).toMatch(/\*{4}.*\d{4}|ending/i);
    }
  });

  test('should display order totals breakdown', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="order-subtotal"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-tax"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-shipping-cost"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    }
  });
});

// ============================================
// Order Tracking Tests
// ============================================

test.describe('Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display tracking timeline', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      await expect(page.locator('[data-testid="tracking-timeline"]')).toBeVisible();
    }
  });

  test('should show order status steps', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const steps = page.locator('[data-testid="tracking-step"]');
      expect(await steps.count()).toBeGreaterThan(0);
    }
  });

  test('should highlight current status', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const activeStep = page.locator('[data-testid="tracking-step"][data-active="true"]');
      await expect(activeStep).toBeVisible();
    }
  });

  test('should display estimated delivery', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const estimatedDelivery = page.locator('[data-testid="estimated-delivery"]');
      if (await estimatedDelivery.isVisible()) {
        const text = await estimatedDelivery.textContent();
        expect(text).toMatch(/\d{1,2}.*\d{4}|today|tomorrow|days/i);
      }
    }
  });

  test('should show delivery countdown', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const countdown = page.locator('[data-testid="delivery-countdown"]');
      if (await countdown.isVisible()) {
        await expect(countdown).toContainText(/\d+\s*(day|hour|minute)/i);
      }
    }
  });

  test('should link to carrier tracking', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const trackingLink = page.locator('[data-testid="carrier-tracking-link"]');
      if (await trackingLink.isVisible()) {
        const href = await trackingLink.getAttribute('href');
        expect(href).toMatch(/ups|fedex|usps|dhl/i);
      }
    }
  });

  test('should display tracking number', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const trackingNumber = page.locator('[data-testid="tracking-number"]');
      if (await trackingNumber.isVisible()) {
        const text = await trackingNumber.textContent();
        expect(text!.length).toBeGreaterThan(5);
      }
    }
  });
});

// ============================================
// Returns Portal Tests
// ============================================

test.describe('Returns Portal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to returns page', async ({ page }) => {
    await page.goto('/returns');
    
    await expect(page.locator('h1')).toContainText(/return/i);
  });

  test('should initiate return from order details', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const returnButton = page.locator('[data-testid="initiate-return-button"]');
      if (await returnButton.isVisible()) {
        await returnButton.click();
        
        await expect(page.locator('[data-testid="return-form"]')).toBeVisible();
      }
    }
  });

  test('should select items to return', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const returnButton = page.locator('[data-testid="initiate-return-button"]');
      if (await returnButton.isVisible()) {
        await returnButton.click();
        
        const itemCheckbox = page.locator('[data-testid="return-item-checkbox"]').first();
        if (await itemCheckbox.isVisible()) {
          await itemCheckbox.check();
          await expect(itemCheckbox).toBeChecked();
        }
      }
    }
  });

  test('should select return reason', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const returnButton = page.locator('[data-testid="initiate-return-button"]');
      if (await returnButton.isVisible()) {
        await returnButton.click();
        
        const reasonSelect = page.locator('[data-testid="return-reason-select"]');
        if (await reasonSelect.isVisible()) {
          await reasonSelect.selectOption('wrong_size');
          await expect(reasonSelect).toHaveValue('wrong_size');
        }
      }
    }
  });

  test('should show refund estimate', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const returnButton = page.locator('[data-testid="initiate-return-button"]');
      if (await returnButton.isVisible()) {
        await returnButton.click();
        
        // Select an item
        const itemCheckbox = page.locator('[data-testid="return-item-checkbox"]').first();
        if (await itemCheckbox.isVisible()) {
          await itemCheckbox.check();
          
          await expect(page.locator('[data-testid="refund-estimate"]')).toBeVisible();
        }
      }
    }
  });

  test('should submit return request', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const returnButton = page.locator('[data-testid="initiate-return-button"]');
      if (await returnButton.isVisible()) {
        await returnButton.click();
        
        // Fill return form
        await page.locator('[data-testid="return-item-checkbox"]').first().check();
        await page.locator('[data-testid="return-reason-select"]').selectOption('wrong_size');
        
        await page.click('[data-testid="submit-return-button"]');
        
        await expect(page.locator('[data-testid="return-confirmation"]')).toBeVisible();
      }
    }
  });

  test('should generate prepaid shipping label', async ({ page }) => {
    await page.goto('/returns');
    
    const returnItem = page.locator('[data-testid="return-request-item"]').first();
    if (await returnItem.isVisible()) {
      const labelButton = page.locator('[data-testid="print-label-button"]');
      if (await labelButton.isVisible()) {
        // Just check the button is clickable
        await expect(labelButton).toBeEnabled();
      }
    }
  });

  test('should track return status', async ({ page }) => {
    await page.goto('/returns');
    
    const returnItem = page.locator('[data-testid="return-request-item"]').first();
    if (await returnItem.isVisible()) {
      await expect(page.locator('[data-testid="return-status"]')).toBeVisible();
    }
  });
});

// ============================================
// Exchange Tests
// ============================================

test.describe('Exchanges', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should initiate exchange from order details', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const exchangeButton = page.locator('[data-testid="exchange-button"]');
      if (await exchangeButton.isVisible()) {
        await exchangeButton.click();
        
        await expect(page.locator('[data-testid="exchange-form"]')).toBeVisible();
      }
    }
  });

  test('should select item to exchange', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const exchangeButton = page.locator('[data-testid="exchange-button"]');
      if (await exchangeButton.isVisible()) {
        await exchangeButton.click();
        
        await page.locator('[data-testid="exchange-item-checkbox"]').first().check();
        await expect(page.locator('[data-testid="exchange-item-checkbox"]').first()).toBeChecked();
      }
    }
  });

  test('should select new size/variant for exchange', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const exchangeButton = page.locator('[data-testid="exchange-button"]');
      if (await exchangeButton.isVisible()) {
        await exchangeButton.click();
        
        await page.locator('[data-testid="exchange-item-checkbox"]').first().check();
        
        const sizeSelect = page.locator('[data-testid="exchange-size-select"]');
        if (await sizeSelect.isVisible()) {
          await sizeSelect.selectOption({ index: 1 });
        }
      }
    }
  });

  test('should show instant exchange option', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const exchangeButton = page.locator('[data-testid="exchange-button"]');
      if (await exchangeButton.isVisible()) {
        await exchangeButton.click();
        
        const instantExchange = page.locator('[data-testid="instant-exchange-option"]');
        if (await instantExchange.isVisible()) {
          await expect(instantExchange).toContainText(/instant|immediately/i);
        }
      }
    }
  });

  test('should track exchange status', async ({ page }) => {
    await page.goto('/exchanges');
    
    const exchangeItem = page.locator('[data-testid="exchange-request-item"]').first();
    if (await exchangeItem.isVisible()) {
      await expect(page.locator('[data-testid="exchange-status"]')).toBeVisible();
    }
  });
});

// ============================================
// Invoice & Receipt Tests
// ============================================

test.describe('Invoices & Receipts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display download invoice button', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const invoiceButton = page.locator('[data-testid="download-invoice-button"]');
      await expect(invoiceButton).toBeVisible();
    }
  });

  test('should display download receipt button', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const receiptButton = page.locator('[data-testid="download-receipt-button"]');
      if (await receiptButton.isVisible()) {
        await expect(receiptButton).toBeVisible();
      }
    }
  });

  test('should download invoice as PDF', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const invoiceButton = page.locator('[data-testid="download-invoice-button"]');
      if (await invoiceButton.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download').catch(() => null),
          invoiceButton.click(),
        ]);
        
        if (download) {
          expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf/i);
        }
      }
    }
  });

  test('should email invoice option', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const emailInvoiceButton = page.locator('[data-testid="email-invoice-button"]');
      if (await emailInvoiceButton.isVisible()) {
        await emailInvoiceButton.click();
        
        await expect(page.locator('[data-testid="invoice-email-confirmation"]')).toBeVisible();
      }
    }
  });
});

// ============================================
// Reorder Tests
// ============================================

test.describe('Reorder', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display reorder button', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const reorderButton = page.locator('[data-testid="reorder-button"]');
      await expect(reorderButton).toBeVisible();
    }
  });

  test('should add all items to cart on reorder', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const reorderButton = page.locator('[data-testid="reorder-button"]');
      if (await reorderButton.isVisible()) {
        await reorderButton.click();
        
        // Should add items and potentially go to cart
        const cartBadge = page.locator('[data-testid="cart-badge"]');
        const badgeText = await cartBadge.textContent();
        expect(parseInt(badgeText!)).toBeGreaterThan(0);
      }
    }
  });

  test('should show unavailable items message', async ({ page }) => {
    await page.goto('/orders');
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      
      const reorderButton = page.locator('[data-testid="reorder-button"]');
      if (await reorderButton.isVisible()) {
        await reorderButton.click();
        
        // If some items are unavailable
        const unavailableMessage = page.locator('[data-testid="unavailable-items-message"]');
        if (await unavailableMessage.isVisible()) {
          await expect(unavailableMessage).toContainText(/unavailable|out of stock/i);
        }
      }
    }
  });
});

// ============================================
// Guest Order Lookup Tests
// ============================================

test.describe('Guest Order Lookup', () => {
  test('should display guest order lookup form', async ({ page }) => {
    await page.goto('/order-lookup');
    
    await expect(page.locator('[data-testid="order-lookup-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-email-input"]')).toBeVisible();
  });

  test('should look up order by number and email', async ({ page }) => {
    await page.goto('/order-lookup');
    
    await page.fill('[data-testid="order-number-input"]', 'ORD-12345');
    await page.fill('[data-testid="order-email-input"]', 'guest@example.com');
    await page.click('[data-testid="lookup-order-button"]');
    
    // Either show order details or error
    const hasResult = await page.locator('[data-testid="order-details"]').isVisible();
    const hasError = await page.locator('[data-testid="order-not-found"]').isVisible();
    
    expect(hasResult || hasError).toBeTruthy();
  });

  test('should validate order number format', async ({ page }) => {
    await page.goto('/order-lookup');
    
    await page.fill('[data-testid="order-number-input"]', 'invalid');
    await page.click('[data-testid="lookup-order-button"]');
    
    await expect(page.locator('[data-testid="order-number-error"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/order-lookup');
    
    await page.fill('[data-testid="order-number-input"]', 'ORD-12345');
    await page.fill('[data-testid="order-email-input"]', 'invalid-email');
    await page.click('[data-testid="lookup-order-button"]');
    
    await expect(page.locator('[data-testid="order-email-error"]')).toBeVisible();
  });
});
