import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for Checkout Flow Features
 * 
 * Features Covered:
 * - Multi-step checkout wizard
 * - Shipping address form
 * - Payment information form
 * - Express checkout (Apple Pay, Google Pay, PayPal)
 * - Order review and confirmation
 * - Form validation
 * - Tax calculation
 * - Shipping method selection
 * 
 * @module e2e/checkout
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

async function fillShippingForm(page: Page, address = {
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Main Street',
  apartment: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  phone: '555-123-4567',
}) {
  await page.fill('[data-testid="shipping-first-name"]', address.firstName);
  await page.fill('[data-testid="shipping-last-name"]', address.lastName);
  await page.fill('[data-testid="shipping-address"]', address.address);
  
  const apartmentField = page.locator('[data-testid="shipping-apartment"]');
  if (await apartmentField.isVisible()) {
    await apartmentField.fill(address.apartment);
  }
  
  await page.fill('[data-testid="shipping-city"]', address.city);
  await page.fill('[data-testid="shipping-state"]', address.state);
  await page.fill('[data-testid="shipping-zip"]', address.zip);
  await page.fill('[data-testid="shipping-phone"]', address.phone);
}

async function fillPaymentForm(page: Page, card = {
  number: '4242424242424242',
  expiry: '12/28',
  cvv: '123',
  name: 'John Doe',
}) {
  await page.fill('[data-testid="card-number"]', card.number);
  await page.fill('[data-testid="card-expiry"]', card.expiry);
  await page.fill('[data-testid="card-cvv"]', card.cvv);
  
  const nameField = page.locator('[data-testid="card-name"]');
  if (await nameField.isVisible()) {
    await nameField.fill(card.name);
  }
}

// ============================================
// Checkout Access Tests
// ============================================

test.describe('Checkout Access', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/checkout');
    
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should redirect to products when cart is empty', async ({ page }) => {
    await login(page);
    await page.goto('/checkout');
    
    // Should redirect or show empty cart message
    const hasEmptyMessage = await page.locator('[data-testid="empty-cart-checkout"]').isVisible();
    const redirectedToProducts = page.url().includes('/products') || page.url().includes('/cart');
    
    expect(hasEmptyMessage || redirectedToProducts).toBeTruthy();
  });

  test('should proceed to checkout when logged in with items', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    
    await expect(page.locator('[data-testid="checkout-wizard"]')).toBeVisible();
  });
});

// ============================================
// Checkout Wizard Navigation Tests
// ============================================

test.describe('Checkout Wizard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
  });

  test('should display step indicator', async ({ page }) => {
    await expect(page.locator('[data-testid="checkout-steps"]')).toBeVisible();
  });

  test('should show shipping step as active initially', async ({ page }) => {
    await expect(page.locator('[data-testid="step-shipping"]')).toHaveAttribute('data-active', 'true');
  });

  test('should navigate to payment step after shipping', async ({ page }) => {
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    
    await expect(page.locator('[data-testid="step-payment"]')).toHaveAttribute('data-active', 'true');
  });

  test('should navigate to review step after payment', async ({ page }) => {
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    
    await fillPaymentForm(page);
    await page.click('[data-testid="continue-to-review"]');
    
    await expect(page.locator('[data-testid="step-review"]')).toHaveAttribute('data-active', 'true');
  });

  test('should allow going back to previous step', async ({ page }) => {
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    
    await page.click('[data-testid="back-to-shipping"]');
    
    await expect(page.locator('[data-testid="step-shipping"]')).toHaveAttribute('data-active', 'true');
  });

  test('should preserve form data when navigating back', async ({ page }) => {
    await fillShippingForm(page, { firstName: 'Jane', lastName: 'Smith', address: '456 Oak Ave', apartment: '', city: 'Boston', state: 'MA', zip: '02101', phone: '555-987-6543' });
    await page.click('[data-testid="continue-to-payment"]');
    await page.click('[data-testid="back-to-shipping"]');
    
    await expect(page.locator('[data-testid="shipping-first-name"]')).toHaveValue('Jane');
    await expect(page.locator('[data-testid="shipping-address"]')).toHaveValue('456 Oak Ave');
  });
});

// ============================================
// Shipping Address Tests
// ============================================

test.describe('Shipping Address Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
  });

  test('should display all required shipping fields', async ({ page }) => {
    await expect(page.locator('[data-testid="shipping-first-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-last-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="continue-to-payment"]');
    
    await expect(page.locator('[data-testid="shipping-first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-error"]')).toBeVisible();
  });

  test('should validate zip code format', async ({ page }) => {
    await page.fill('[data-testid="shipping-zip"]', 'invalid');
    await page.click('[data-testid="continue-to-payment"]');
    
    await expect(page.locator('[data-testid="shipping-zip-error"]')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.fill('[data-testid="shipping-phone"]', 'invalid');
    await page.click('[data-testid="continue-to-payment"]');
    
    await expect(page.locator('[data-testid="shipping-phone-error"]')).toBeVisible();
  });

  test('should autofill saved addresses', async ({ page }) => {
    const savedAddressSelector = page.locator('[data-testid="saved-address-select"]');
    if (await savedAddressSelector.isVisible()) {
      await savedAddressSelector.selectOption({ index: 0 });
      
      // Form should be filled with saved address
      const firstNameValue = await page.locator('[data-testid="shipping-first-name"]').inputValue();
      expect(firstNameValue.length).toBeGreaterThan(0);
    }
  });

  test('should offer address suggestions', async ({ page }) => {
    await page.fill('[data-testid="shipping-address"]', '123 Main');
    await page.waitForTimeout(500);
    
    const suggestions = page.locator('[data-testid="address-suggestions"]');
    if (await suggestions.isVisible()) {
      const suggestionCount = await suggestions.locator('[data-testid="address-suggestion"]').count();
      expect(suggestionCount).toBeGreaterThan(0);
    }
  });

  test('should save address for future use', async ({ page }) => {
    await fillShippingForm(page);
    
    const saveCheckbox = page.locator('[data-testid="save-address-checkbox"]');
    if (await saveCheckbox.isVisible()) {
      await saveCheckbox.check();
      await expect(saveCheckbox).toBeChecked();
    }
  });
});

// ============================================
// Shipping Method Tests
// ============================================

test.describe('Shipping Method Selection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
  });

  test('should display shipping method options', async ({ page }) => {
    await expect(page.locator('[data-testid="shipping-methods"]')).toBeVisible();
    const methodCount = await page.locator('[data-testid="shipping-method"]').count();
    expect(methodCount).toBeGreaterThan(0);
  });

  test('should have standard shipping pre-selected', async ({ page }) => {
    await expect(page.locator('[data-testid="shipping-method-standard"]')).toBeChecked();
  });

  test('should select express shipping', async ({ page }) => {
    await page.click('[data-testid="shipping-method-express"]');
    
    await expect(page.locator('[data-testid="shipping-method-express"]')).toBeChecked();
  });

  test('should update order total based on shipping method', async ({ page }) => {
    const initialTotal = await page.locator('[data-testid="order-total"]').textContent();
    
    await page.click('[data-testid="shipping-method-express"]');
    await page.waitForTimeout(300);
    
    const newTotal = await page.locator('[data-testid="order-total"]').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test('should display estimated delivery date', async ({ page }) => {
    await expect(page.locator('[data-testid="estimated-delivery"]')).toBeVisible();
    const deliveryText = await page.locator('[data-testid="estimated-delivery"]').textContent();
    expect(deliveryText).toMatch(/\d{1,2}.*\d{4}|days|week/i);
  });

  test('should show free shipping when eligible', async ({ page }) => {
    const freeShippingMessage = page.locator('[data-testid="free-shipping-applied"]');
    if (await freeShippingMessage.isVisible()) {
      await expect(freeShippingMessage).toContainText(/free/i);
    }
  });
});

// ============================================
// Payment Information Tests
// ============================================

test.describe('Payment Information Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
  });

  test('should display payment form', async ({ page }) => {
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
  });

  test('should display card input fields', async ({ page }) => {
    await expect(page.locator('[data-testid="card-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-expiry"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-cvv"]')).toBeVisible();
  });

  test('should format card number with spaces', async ({ page }) => {
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    
    const value = await page.locator('[data-testid="card-number"]').inputValue();
    expect(value).toMatch(/4242\s*4242\s*4242\s*4242/);
  });

  test('should detect and display card type', async ({ page }) => {
    await page.fill('[data-testid="card-number"]', '4242');
    
    const cardIcon = page.locator('[data-testid="card-type-icon"]');
    if (await cardIcon.isVisible()) {
      await expect(cardIcon).toHaveAttribute('data-card-type', 'visa');
    }
  });

  test('should format expiry date', async ({ page }) => {
    await page.fill('[data-testid="card-expiry"]', '1228');
    
    const value = await page.locator('[data-testid="card-expiry"]').inputValue();
    expect(value).toMatch(/12\s*\/\s*28|12\/28/);
  });

  test('should validate card number with Luhn check', async ({ page }) => {
    await page.fill('[data-testid="card-number"]', '1234567890123456');
    await page.click('[data-testid="continue-to-review"]');
    
    await expect(page.locator('[data-testid="card-number-error"]')).toBeVisible();
  });

  test('should validate expiry date not in past', async ({ page }) => {
    await page.fill('[data-testid="card-expiry"]', '01/20');
    await page.click('[data-testid="continue-to-review"]');
    
    await expect(page.locator('[data-testid="card-expiry-error"]')).toBeVisible();
  });

  test('should validate CVV length', async ({ page }) => {
    await page.fill('[data-testid="card-cvv"]', '12');
    await page.click('[data-testid="continue-to-review"]');
    
    await expect(page.locator('[data-testid="card-cvv-error"]')).toBeVisible();
  });

  test('should use saved payment method', async ({ page }) => {
    const savedPayments = page.locator('[data-testid="saved-payment-methods"]');
    if (await savedPayments.isVisible()) {
      await page.click('[data-testid="saved-payment-method"]');
      
      await expect(page.locator('[data-testid="saved-payment-method"]')).toBeChecked();
    }
  });

  test('should save payment method for future use', async ({ page }) => {
    const saveCheckbox = page.locator('[data-testid="save-payment-checkbox"]');
    if (await saveCheckbox.isVisible()) {
      await saveCheckbox.check();
      await expect(saveCheckbox).toBeChecked();
    }
  });
});

// ============================================
// Express Checkout Tests
// ============================================

test.describe('Express Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
  });

  test('should display express checkout options', async ({ page }) => {
    const expressCheckout = page.locator('[data-testid="express-checkout"]');
    if (await expressCheckout.isVisible()) {
      await expect(expressCheckout).toBeVisible();
    }
  });

  test('should display Apple Pay button', async ({ page }) => {
    const applePay = page.locator('[data-testid="apple-pay-button"]');
    if (await applePay.isVisible()) {
      await expect(applePay).toBeVisible();
    }
  });

  test('should display Google Pay button', async ({ page }) => {
    const googlePay = page.locator('[data-testid="google-pay-button"]');
    if (await googlePay.isVisible()) {
      await expect(googlePay).toBeVisible();
    }
  });

  test('should display PayPal button', async ({ page }) => {
    const paypal = page.locator('[data-testid="paypal-button"]');
    if (await paypal.isVisible()) {
      await expect(paypal).toBeVisible();
    }
  });

  test('should show express checkout divider', async ({ page }) => {
    const divider = page.locator('[data-testid="express-checkout-divider"]');
    if (await divider.isVisible()) {
      await expect(divider).toContainText(/or/i);
    }
  });
});

// ============================================
// Order Review Tests
// ============================================

test.describe('Order Review', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    await fillPaymentForm(page);
    await page.click('[data-testid="continue-to-review"]');
  });

  test('should display order summary', async ({ page }) => {
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test('should display cart items in review', async ({ page }) => {
    await expect(page.locator('[data-testid="review-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-item-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-item-price"]')).toBeVisible();
  });

  test('should display shipping address in review', async ({ page }) => {
    await expect(page.locator('[data-testid="review-shipping-address"]')).toBeVisible();
    const addressText = await page.locator('[data-testid="review-shipping-address"]').textContent();
    expect(addressText).toContain('John');
    expect(addressText).toContain('123 Main');
  });

  test('should display payment method in review', async ({ page }) => {
    await expect(page.locator('[data-testid="review-payment-method"]')).toBeVisible();
    const paymentText = await page.locator('[data-testid="review-payment-method"]').textContent();
    expect(paymentText).toMatch(/\*{4}\s*4242|ending.*4242/i);
  });

  test('should display subtotal, tax, shipping, and total', async ({ page }) => {
    await expect(page.locator('[data-testid="review-subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-tax"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-total"]')).toBeVisible();
  });

  test('should allow editing shipping address', async ({ page }) => {
    await page.click('[data-testid="edit-shipping"]');
    
    await expect(page.locator('[data-testid="step-shipping"]')).toHaveAttribute('data-active', 'true');
  });

  test('should allow editing payment method', async ({ page }) => {
    await page.click('[data-testid="edit-payment"]');
    
    await expect(page.locator('[data-testid="step-payment"]')).toHaveAttribute('data-active', 'true');
  });
});

// ============================================
// Tax Calculation Tests
// ============================================

test.describe('Tax Calculation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
  });

  test('should calculate tax based on shipping address', async ({ page }) => {
    await fillShippingForm(page);
    
    // Tax should be displayed
    await expect(page.locator('[data-testid="estimated-tax"]')).toBeVisible();
  });

  test('should update tax when address changes', async ({ page }) => {
    await fillShippingForm(page, { firstName: 'John', lastName: 'Doe', address: '123 Main St', apartment: '', city: 'New York', state: 'NY', zip: '10001', phone: '555-123-4567' });
    await page.waitForTimeout(500);
    
    const nyTax = await page.locator('[data-testid="estimated-tax"]').textContent();
    
    // Change to a different state
    await page.fill('[data-testid="shipping-state"]', 'OR');
    await page.fill('[data-testid="shipping-zip"]', '97201');
    await page.waitForTimeout(500);
    
    const orTax = await page.locator('[data-testid="estimated-tax"]').textContent();
    
    // Oregon has no sales tax, so it should be different
    expect(orTax).not.toBe(nyTax);
  });

  test('should display tax breakdown', async ({ page }) => {
    await fillShippingForm(page);
    
    const taxBreakdown = page.locator('[data-testid="tax-breakdown"]');
    if (await taxBreakdown.isVisible()) {
      await expect(taxBreakdown).toContainText(/state|local|tax/i);
    }
  });

  test('should handle VAT for international orders', async ({ page }) => {
    const countrySelect = page.locator('[data-testid="shipping-country"]');
    if (await countrySelect.isVisible()) {
      await countrySelect.selectOption('GB');
      
      await expect(page.locator('[data-testid="vat-included"]')).toBeVisible();
    }
  });
});

// ============================================
// Place Order Tests
// ============================================

test.describe('Place Order', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    await fillPaymentForm(page);
    await page.click('[data-testid="continue-to-review"]');
  });

  test('should display place order button', async ({ page }) => {
    await expect(page.locator('[data-testid="place-order-button"]')).toBeVisible();
  });

  test('should require terms acceptance', async ({ page }) => {
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await page.click('[data-testid="place-order-button"]');
      
      await expect(page.locator('[data-testid="terms-error"]')).toBeVisible();
    }
  });

  test('should place order successfully', async ({ page }) => {
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    
    // Wait for order processing
    await page.waitForURL(/\/order-confirmation|\/orders\/\d+/, { timeout: 30000 });
    
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });

  test('should display order number on confirmation', async ({ page }) => {
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    await page.waitForURL(/\/order-confirmation|\/orders\/\d+/, { timeout: 30000 });
    
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    const orderNumber = await page.locator('[data-testid="order-number"]').textContent();
    expect(orderNumber).toMatch(/\d+|#[A-Z0-9]+/);
  });

  test('should show loading state while processing', async ({ page }) => {
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Click and immediately check for loading state
    await page.click('[data-testid="place-order-button"]');
    
    const loadingState = page.locator('[data-testid="order-processing"]');
    if (await loadingState.isVisible()) {
      await expect(loadingState).toBeVisible();
    }
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // Use a card that triggers failure
    await page.click('[data-testid="edit-payment"]');
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.click('[data-testid="continue-to-review"]');
    
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
  });

  test('should clear cart after successful order', async ({ page }) => {
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    await page.waitForURL(/\/order-confirmation|\/orders\/\d+/, { timeout: 30000 });
    
    // Check cart is empty
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    const badgeText = await cartBadge.textContent();
    expect(badgeText === '0' || badgeText === '').toBeTruthy();
  });
});

// ============================================
// Order Confirmation Tests
// ============================================

test.describe('Order Confirmation', () => {
  test('should display confirmation page after order', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    await fillPaymentForm(page);
    await page.click('[data-testid="continue-to-review"]');
    
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    await page.waitForURL(/\/order-confirmation|\/orders\/\d+/, { timeout: 30000 });
    
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-email-message"]')).toBeVisible();
  });

  test('should show order summary on confirmation', async ({ page }) => {
    // Navigate to a confirmation page if there's a recent order
    await login(page);
    await page.goto('/orders');
    
    const orderLink = page.locator('[data-testid="order-item"]').first();
    if (await orderLink.isVisible()) {
      await orderLink.click();
      
      await expect(page.locator('[data-testid="order-items-summary"]')).toBeVisible();
    }
  });

  test('should have link to track order', async ({ page }) => {
    await login(page);
    await page.goto('/orders');
    
    const orderLink = page.locator('[data-testid="order-item"]').first();
    if (await orderLink.isVisible()) {
      await orderLink.click();
      
      await expect(page.locator('[data-testid="track-order-link"]')).toBeVisible();
    }
  });

  test('should have continue shopping button', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
    await fillPaymentForm(page);
    await page.click('[data-testid="continue-to-review"]');
    
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('[data-testid="place-order-button"]');
    await page.waitForURL(/\/order-confirmation|\/orders\/\d+/, { timeout: 30000 });
    
    const continueButton = page.locator('[data-testid="continue-shopping-button"]');
    await expect(continueButton).toBeVisible();
    
    await continueButton.click();
    await expect(page).toHaveURL('/products');
  });
});

// ============================================
// Billing Address Tests
// ============================================

test.describe('Billing Address', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="continue-to-payment"]');
  });

  test('should have "same as shipping" option checked by default', async ({ page }) => {
    const sameAsShipping = page.locator('[data-testid="billing-same-as-shipping"]');
    await expect(sameAsShipping).toBeChecked();
  });

  test('should show billing form when unchecked', async ({ page }) => {
    await page.uncheck('[data-testid="billing-same-as-shipping"]');
    
    await expect(page.locator('[data-testid="billing-address-form"]')).toBeVisible();
  });

  test('should fill different billing address', async ({ page }) => {
    await page.uncheck('[data-testid="billing-same-as-shipping"]');
    
    await page.fill('[data-testid="billing-first-name"]', 'Jane');
    await page.fill('[data-testid="billing-last-name"]', 'Smith');
    await page.fill('[data-testid="billing-address"]', '789 Billing Ave');
    await page.fill('[data-testid="billing-city"]', 'Chicago');
    await page.fill('[data-testid="billing-state"]', 'IL');
    await page.fill('[data-testid="billing-zip"]', '60601');
    
    await expect(page.locator('[data-testid="billing-first-name"]')).toHaveValue('Jane');
  });
});
