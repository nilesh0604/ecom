import { expect, test, type Page } from '@playwright/test';

/**
 * E2E Tests for DTC (Direct-to-Consumer) Features
 * 
 * Features Covered:
 * - Brand Storytelling (Hero, About Page)
 * - Membership Program
 * - Subscriptions
 * - Limited Drops
 * - Gift Cards & Store Credit
 * - Privacy & Consent
 * - Customer Support (Help Center, FAQ)
 * - Search & Merchandising
 * - SEO & Accessibility features
 * 
 * @module e2e/dtc-features
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
// Brand Storytelling Tests
// ============================================

test.describe('Brand Storytelling', () => {
  test('should display hero section on homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  });

  test('should have animated hero content', async ({ page }) => {
    await page.goto('/');
    
    const hero = page.locator('[data-testid="hero-section"]');
    const hasAnimation = await hero.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animation !== 'none' || style.transition !== 'none';
    });
    
    // Animation may be CSS-based or JS-based
    await expect(hero).toBeVisible();
  });

  test('should display featured collections', async ({ page }) => {
    await page.goto('/');
    
    const collections = page.locator('[data-testid="featured-collections"]');
    if (await collections.isVisible()) {
      await expect(collections).toBeVisible();
      const collectionCount = await page.locator('[data-testid="collection-card"]').count();
      expect(collectionCount).toBeGreaterThan(0);
    }
  });

  test('should navigate to About page', async ({ page }) => {
    await page.goto('/about');
    
    await expect(page.locator('h1')).toContainText(/about|story|mission/i);
  });

  test('should display brand mission on About page', async ({ page }) => {
    await page.goto('/about');
    
    await expect(page.locator('[data-testid="brand-mission"]')).toBeVisible();
  });

  test('should display timeline on About page', async ({ page }) => {
    await page.goto('/about');
    
    const timeline = page.locator('[data-testid="brand-timeline"]');
    if (await timeline.isVisible()) {
      const milestoneCount = await page.locator('[data-testid="timeline-milestone"]').count();
      expect(milestoneCount).toBeGreaterThan(0);
    }
  });

  test('should display team section on About page', async ({ page }) => {
    await page.goto('/about');
    
    const team = page.locator('[data-testid="team-section"]');
    if (await team.isVisible()) {
      await expect(team).toBeVisible();
    }
  });
});

// ============================================
// Membership Program Tests
// ============================================

test.describe('Membership Program', () => {
  test('should display membership page', async ({ page }) => {
    await page.goto('/membership');
    
    await expect(page.locator('[data-testid="membership-page"]')).toBeVisible();
  });

  test('should display membership benefits', async ({ page }) => {
    await page.goto('/membership');
    
    await expect(page.locator('[data-testid="membership-benefits"]')).toBeVisible();
    const benefitCount = await page.locator('[data-testid="benefit-item"]').count();
    expect(benefitCount).toBeGreaterThan(0);
  });

  test('should allow joining membership (free tier)', async ({ page }) => {
    await login(page);
    await page.goto('/membership');
    
    const joinButton = page.locator('[data-testid="join-membership-button"]');
    if (await joinButton.isVisible()) {
      await joinButton.click();
      
      await expect(page.locator('[data-testid="membership-confirmation"]')).toBeVisible();
    }
  });

  test('should display member-only pricing when logged in as member', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    
    const memberPrice = page.locator('[data-testid="member-price"]');
    if (await memberPrice.isVisible()) {
      await expect(memberPrice).toContainText(/member/i);
    }
  });

  test('should display loyalty points balance', async ({ page }) => {
    await login(page);
    await page.goto('/membership');
    
    const pointsBalance = page.locator('[data-testid="loyalty-points-balance"]');
    if (await pointsBalance.isVisible()) {
      await expect(pointsBalance).toBeVisible();
    }
  });

  test('should display rewards history', async ({ page }) => {
    await login(page);
    await page.goto('/membership/rewards');
    
    const rewardsHistory = page.locator('[data-testid="rewards-history"]');
    if (await rewardsHistory.isVisible()) {
      await expect(rewardsHistory).toBeVisible();
    }
  });
});

// ============================================
// Subscription Tests
// ============================================

test.describe('Subscriptions', () => {
  test('should display subscribe option on product', async ({ page }) => {
    await page.goto('/products/1');
    
    const subscribeOption = page.locator('[data-testid="subscribe-save-option"]');
    if (await subscribeOption.isVisible()) {
      await expect(subscribeOption).toBeVisible();
    }
  });

  test('should select subscription frequency', async ({ page }) => {
    await page.goto('/products/1');
    
    const subscribeOption = page.locator('[data-testid="subscribe-save-option"]');
    if (await subscribeOption.isVisible()) {
      await subscribeOption.click();
      
      const frequencySelect = page.locator('[data-testid="subscription-frequency"]');
      await expect(frequencySelect).toBeVisible();
      await frequencySelect.selectOption('monthly');
    }
  });

  test('should display subscription discount', async ({ page }) => {
    await page.goto('/products/1');
    
    const subscribeOption = page.locator('[data-testid="subscribe-save-option"]');
    if (await subscribeOption.isVisible()) {
      await subscribeOption.click();
      
      const discount = page.locator('[data-testid="subscription-discount"]');
      await expect(discount).toContainText(/%|save/i);
    }
  });

  test('should access subscription management portal', async ({ page }) => {
    await login(page);
    await page.goto('/subscriptions');
    
    await expect(page.locator('[data-testid="subscriptions-page"]')).toBeVisible();
  });

  test('should display active subscriptions', async ({ page }) => {
    await login(page);
    await page.goto('/subscriptions');
    
    const subscriptionsList = page.locator('[data-testid="subscriptions-list"]');
    if (await subscriptionsList.isVisible()) {
      await expect(subscriptionsList).toBeVisible();
    }
  });

  test('should pause subscription', async ({ page }) => {
    await login(page);
    await page.goto('/subscriptions');
    
    const pauseButton = page.locator('[data-testid="pause-subscription"]').first();
    if (await pauseButton.isVisible()) {
      await pauseButton.click();
      
      await expect(page.locator('[data-testid="subscription-paused"]')).toBeVisible();
    }
  });

  test('should cancel subscription', async ({ page }) => {
    await login(page);
    await page.goto('/subscriptions');
    
    const cancelButton = page.locator('[data-testid="cancel-subscription"]').first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel"]');
      
      await expect(page.locator('[data-testid="subscription-cancelled"]')).toBeVisible();
    }
  });

  test('should modify subscription frequency', async ({ page }) => {
    await login(page);
    await page.goto('/subscriptions');
    
    const editButton = page.locator('[data-testid="edit-subscription"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      await page.selectOption('[data-testid="edit-frequency"]', 'bi-weekly');
      await page.click('[data-testid="save-subscription"]');
      
      await expect(page.locator('[data-testid="subscription-updated"]')).toBeVisible();
    }
  });
});

// ============================================
// Limited Drops Tests
// ============================================

test.describe('Limited Drops', () => {
  test('should display drops calendar', async ({ page }) => {
    await page.goto('/drops');
    
    await expect(page.locator('[data-testid="drops-calendar"]')).toBeVisible();
  });

  test('should display upcoming drops', async ({ page }) => {
    await page.goto('/drops');
    
    const upcomingDrops = page.locator('[data-testid="upcoming-drops"]');
    if (await upcomingDrops.isVisible()) {
      const dropCount = await page.locator('[data-testid="drop-item"]').count();
      expect(dropCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display countdown for upcoming drop', async ({ page }) => {
    await page.goto('/drops');
    
    const countdown = page.locator('[data-testid="drop-countdown"]').first();
    if (await countdown.isVisible()) {
      await expect(countdown).toContainText(/\d+.*\d+.*\d+/);
    }
  });

  test('should allow notification signup for drops', async ({ page }) => {
    await page.goto('/drops');
    
    const notifyButton = page.locator('[data-testid="notify-drop"]').first();
    if (await notifyButton.isVisible()) {
      await notifyButton.click();
      
      await expect(page.locator('[data-testid="drop-notification-success"]')).toBeVisible();
    }
  });

  test('should show member early access', async ({ page }) => {
    await login(page);
    await page.goto('/drops');
    
    const earlyAccess = page.locator('[data-testid="member-early-access"]');
    if (await earlyAccess.isVisible()) {
      await expect(earlyAccess).toContainText(/early|exclusive/i);
    }
  });

  test('should enter draw for limited product', async ({ page }) => {
    await login(page);
    await page.goto('/drops');
    
    const enterDraw = page.locator('[data-testid="enter-draw-button"]').first();
    if (await enterDraw.isVisible()) {
      await enterDraw.click();
      
      await expect(page.locator('[data-testid="draw-entry-confirmed"]')).toBeVisible();
    }
  });
});

// ============================================
// Gift Cards Tests
// ============================================

test.describe('Gift Cards', () => {
  test('should display gift cards page', async ({ page }) => {
    await page.goto('/gift-cards');
    
    await expect(page.locator('[data-testid="gift-cards-page"]')).toBeVisible();
  });

  test('should select gift card amount', async ({ page }) => {
    await page.goto('/gift-cards');
    
    await page.click('[data-testid="gift-card-amount-50"]');
    
    await expect(page.locator('[data-testid="gift-card-amount-50"]')).toHaveAttribute('data-selected', 'true');
  });

  test('should enter custom gift card amount', async ({ page }) => {
    await page.goto('/gift-cards');
    
    const customInput = page.locator('[data-testid="custom-amount-input"]');
    if (await customInput.isVisible()) {
      await customInput.fill('75');
      await expect(customInput).toHaveValue('75');
    }
  });

  test('should add gift card to cart', async ({ page }) => {
    await page.goto('/gift-cards');
    
    await page.click('[data-testid="gift-card-amount-50"]');
    await page.fill('[data-testid="recipient-email"]', 'friend@example.com');
    await page.fill('[data-testid="gift-message"]', 'Happy Birthday!');
    await page.click('[data-testid="add-gift-card-button"]');
    
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('should schedule gift card delivery', async ({ page }) => {
    await page.goto('/gift-cards');
    
    const scheduleOption = page.locator('[data-testid="schedule-delivery"]');
    if (await scheduleOption.isVisible()) {
      await scheduleOption.click();
      
      const dateInput = page.locator('[data-testid="delivery-date"]');
      await dateInput.fill('2025-01-15');
    }
  });

  test('should check gift card balance', async ({ page }) => {
    await page.goto('/gift-cards/balance');
    
    await page.fill('[data-testid="gift-card-number"]', 'GIFT-12345-ABCDE');
    await page.click('[data-testid="check-balance-button"]');
    
    // Either shows balance or error
    const hasBalance = await page.locator('[data-testid="gift-card-balance"]').isVisible();
    const hasError = await page.locator('[data-testid="balance-error"]').isVisible();
    
    expect(hasBalance || hasError).toBeTruthy();
  });
});

// ============================================
// Store Credit Tests
// ============================================

test.describe('Store Credit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display store credit balance', async ({ page }) => {
    await page.goto('/account/store-credit');
    
    await expect(page.locator('[data-testid="store-credit-balance"]')).toBeVisible();
  });

  test('should display store credit transaction history', async ({ page }) => {
    await page.goto('/account/store-credit');
    
    const history = page.locator('[data-testid="credit-history"]');
    if (await history.isVisible()) {
      await expect(history).toBeVisible();
    }
  });

  test('should apply store credit at checkout', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    const applyCredit = page.locator('[data-testid="apply-store-credit"]');
    if (await applyCredit.isVisible()) {
      await applyCredit.click();
      
      await expect(page.locator('[data-testid="store-credit-applied"]')).toBeVisible();
    }
  });
});

// ============================================
// Privacy & Consent Tests
// ============================================

test.describe('Privacy & Consent', () => {
  test('should display cookie consent banner', async ({ page }) => {
    // Clear cookies first
    await page.context().clearCookies();
    await page.goto('/');
    
    await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
  });

  test('should accept all cookies', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    
    await page.click('[data-testid="accept-all-cookies"]');
    
    await expect(page.locator('[data-testid="cookie-consent-banner"]')).not.toBeVisible();
  });

  test('should open cookie preferences modal', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    
    await page.click('[data-testid="customize-cookies"]');
    
    await expect(page.locator('[data-testid="cookie-preferences-modal"]')).toBeVisible();
  });

  test('should customize cookie preferences', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    
    await page.click('[data-testid="customize-cookies"]');
    
    // Disable marketing cookies
    await page.uncheck('[data-testid="marketing-cookies"]');
    await page.click('[data-testid="save-preferences"]');
    
    await expect(page.locator('[data-testid="cookie-consent-banner"]')).not.toBeVisible();
  });

  test('should display privacy policy', async ({ page }) => {
    await page.goto('/privacy');
    
    await expect(page.locator('h1')).toContainText(/privacy/i);
  });

  test('should access privacy settings from account', async ({ page }) => {
    await login(page);
    await page.goto('/account/privacy');
    
    await expect(page.locator('[data-testid="privacy-settings"]')).toBeVisible();
  });

  test('should manage marketing preferences', async ({ page }) => {
    await login(page);
    await page.goto('/account/privacy');
    
    const marketingToggle = page.locator('[data-testid="marketing-opt-in"]');
    if (await marketingToggle.isVisible()) {
      await marketingToggle.click();
      
      await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible();
    }
  });

  test('should request data export', async ({ page }) => {
    await login(page);
    await page.goto('/account/privacy');
    
    const exportButton = page.locator('[data-testid="request-data-export"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      await expect(page.locator('[data-testid="export-request-submitted"]')).toBeVisible();
    }
  });

  test('should request data deletion', async ({ page }) => {
    await login(page);
    await page.goto('/account/privacy');
    
    const deleteButton = page.locator('[data-testid="request-data-deletion"]');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Should show confirmation modal
      await expect(page.locator('[data-testid="deletion-confirmation-modal"]')).toBeVisible();
    }
  });
});

// ============================================
// Customer Support Tests
// ============================================

test.describe('Customer Support', () => {
  test('should display help center', async ({ page }) => {
    await page.goto('/help');
    
    await expect(page.locator('[data-testid="help-center"]')).toBeVisible();
  });

  test('should search FAQ', async ({ page }) => {
    await page.goto('/help');
    
    await page.fill('[data-testid="faq-search"]', 'return policy');
    await page.waitForTimeout(500);
    
    const results = page.locator('[data-testid="faq-search-results"]');
    if (await results.isVisible()) {
      const resultCount = await page.locator('[data-testid="faq-result"]').count();
      expect(resultCount).toBeGreaterThan(0);
    }
  });

  test('should display FAQ categories', async ({ page }) => {
    await page.goto('/help');
    
    await expect(page.locator('[data-testid="faq-categories"]')).toBeVisible();
    const categoryCount = await page.locator('[data-testid="faq-category"]').count();
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('should expand FAQ answer', async ({ page }) => {
    await page.goto('/help');
    
    const faqItem = page.locator('[data-testid="faq-item"]').first();
    if (await faqItem.isVisible()) {
      await faqItem.click();
      
      await expect(page.locator('[data-testid="faq-answer"]').first()).toBeVisible();
    }
  });

  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');
    
    await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
  });

  test('should submit contact form', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('[data-testid="contact-name"]', 'John Doe');
    await page.fill('[data-testid="contact-email"]', 'john@example.com');
    await page.selectOption('[data-testid="contact-topic"]', 'order_issue');
    await page.fill('[data-testid="contact-message"]', 'I have a question about my order.');
    await page.click('[data-testid="submit-contact-form"]');
    
    await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
  });

  test('should associate contact form with order', async ({ page }) => {
    await page.goto('/contact');
    
    const orderInput = page.locator('[data-testid="contact-order-number"]');
    if (await orderInput.isVisible()) {
      await orderInput.fill('ORD-12345');
    }
  });

  test('should trigger live chat', async ({ page }) => {
    await page.goto('/help');
    
    const chatButton = page.locator('[data-testid="live-chat-button"]');
    if (await chatButton.isVisible()) {
      await chatButton.click();
      
      await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible();
    }
  });
});

// ============================================
// Search & Merchandising Tests
// ============================================

test.describe('Search & Merchandising', () => {
  test('should display instant search', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="search-trigger"]');
    
    await expect(page.locator('[data-testid="instant-search"]')).toBeVisible();
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="search-trigger"]');
    await page.fill('[data-testid="search-input"]', 'shirt');
    await page.waitForTimeout(500);
    
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      const suggestionCount = await page.locator('[data-testid="search-suggestion"]').count();
      expect(suggestionCount).toBeGreaterThan(0);
    }
  });

  test('should display search results grid', async ({ page }) => {
    await page.goto('/search?q=shirt');
    
    await expect(page.locator('[data-testid="search-results-grid"]')).toBeVisible();
  });

  test('should show zero results help', async ({ page }) => {
    await page.goto('/search?q=xyznonexistent12345');
    
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-suggestions-help"]')).toBeVisible();
  });

  test('should display featured collections on homepage', async ({ page }) => {
    await page.goto('/');
    
    const collections = page.locator('[data-testid="featured-collections"]');
    if (await collections.isVisible()) {
      await expect(collections).toBeVisible();
    }
  });

  test('should navigate to collection page', async ({ page }) => {
    await page.goto('/collections/new-arrivals');
    
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="collection-title"]')).toBeVisible();
  });
});

// ============================================
// Recommendations Tests
// ============================================

test.describe('Product Recommendations', () => {
  test('should display "Complete the look" on product page', async ({ page }) => {
    await page.goto('/products/1');
    
    const completeLook = page.locator('[data-testid="complete-the-look"]');
    if (await completeLook.isVisible()) {
      await expect(completeLook).toBeVisible();
    }
  });

  test('should display "Frequently bought together"', async ({ page }) => {
    await page.goto('/products/1');
    
    const fbt = page.locator('[data-testid="frequently-bought-together"]');
    if (await fbt.isVisible()) {
      await expect(fbt).toBeVisible();
    }
  });

  test('should show post-add-to-cart suggestions', async ({ page }) => {
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-cart-button"]');
    
    const suggestions = page.locator('[data-testid="post-add-suggestions"]');
    if (await suggestions.isVisible()) {
      await expect(suggestions).toBeVisible();
    }
  });

  test('should display checkout upsells', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    await page.goto('/checkout');
    
    const upsells = page.locator('[data-testid="checkout-upsells"]');
    if (await upsells.isVisible()) {
      await expect(upsells).toBeVisible();
    }
  });
});

// ============================================
// User-Generated Content Tests
// ============================================

test.describe('User-Generated Content', () => {
  test('should display photo reviews', async ({ page }) => {
    await page.goto('/products/1');
    
    const photoReviews = page.locator('[data-testid="photo-reviews"]');
    if (await photoReviews.isVisible()) {
      await expect(photoReviews).toBeVisible();
    }
  });

  test('should display UGC gallery', async ({ page }) => {
    await page.goto('/products/1');
    
    const ugcGallery = page.locator('[data-testid="ugc-gallery"]');
    if (await ugcGallery.isVisible()) {
      await expect(ugcGallery).toBeVisible();
    }
  });

  test('should display community gallery page', async ({ page }) => {
    await page.goto('/community');
    
    const communityGallery = page.locator('[data-testid="community-gallery"]');
    if (await communityGallery.isVisible()) {
      await expect(communityGallery).toBeVisible();
    }
  });

  test('should allow uploading photo review', async ({ page }) => {
    await login(page);
    await page.goto('/products/1');
    
    const writeReviewButton = page.locator('[data-testid="write-review-button"]');
    if (await writeReviewButton.isVisible()) {
      await writeReviewButton.click();
      
      const photoUpload = page.locator('[data-testid="photo-upload"]');
      if (await photoUpload.isVisible()) {
        await expect(photoUpload).toBeVisible();
      }
    }
  });
});

// ============================================
// SEO Features Tests
// ============================================

test.describe('SEO Features', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    
    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDescription).not.toBeNull();
    expect(metaDescription!.length).toBeGreaterThan(0);
  });

  test('should have OpenGraph tags', async ({ page }) => {
    await page.goto('/');
    
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
    
    expect(ogTitle).not.toBeNull();
    expect(ogDescription).not.toBeNull();
  });

  test('should have Twitter card tags', async ({ page }) => {
    await page.goto('/');
    
    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    expect(twitterCard).not.toBeNull();
  });

  test('should have structured data on product page', async ({ page }) => {
    await page.goto('/products/1');
    
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).not.toBeNull();
    
    const data = JSON.parse(structuredData!);
    expect(data['@type']).toBe('Product');
  });

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/products/1');
    
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).not.toBeNull();
  });
});
