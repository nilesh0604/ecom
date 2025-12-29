# Testing Guide

This document outlines the testing strategy, tools, and best practices for the eCom project.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types & Coverage](#test-types--coverage)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Mocking Strategies](#mocking-strategies)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

We follow the **Testing Trophy** approach (popularized by Kent C. Dodds):

```
    ┌─────────────┐
    │    E2E      │  ← Few, critical user flows
    ├─────────────┤
    │ Integration │  ← More, feature-level tests
    ├─────────────┤
    │    Unit     │  ← Many, for complex logic
    └─────────────┘
       Static Analysis (TypeScript, ESLint)
```

### Key Principles

1. **Test behavior, not implementation** - Focus on what the user sees/does
2. **Avoid testing implementation details** - Don't test internal state directly
3. **Write tests that give confidence** - If it could break, test it
4. **Keep tests maintainable** - Tests are code, treat them well

---

## Test Types & Coverage

| Test Type | Tool | Coverage Target | Location |
|-----------|------|-----------------|----------|
| Unit | Vitest | 100% | `*.test.ts` |
| Component | React Testing Library | 70% | `*.test.tsx` |
| Integration | Vitest + RTL | Key flows | `src/test/integration/` |
| E2E | Playwright | Critical paths | `e2e/` |
| Visual | Playwright | Key pages | `e2e/visual-regression.spec.ts` |

### What to Test

| Type | Test | Don't Test |
|------|------|------------|
| **Redux** | Reducers, selectors, middleware | Internal Redux implementation |
| **Hooks** | Return values, side effects | React internals |
| **Components** | User interactions, rendered output | Styling details |
| **Utils** | Input/output, edge cases | Third-party libraries |
| **Forms** | Validation, submission | React Hook Form internals |

---

## Running Tests

### Commands

```bash
# Unit & Integration tests (watch mode)
npm test

# Single run
npm run test:run

# With coverage report
npm run test:coverage

# Specific file
npm test -- src/store/slices/cartSlice.test.ts

# Matching pattern
npm test -- -t "should add item to cart"

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# E2E in headed mode (see browser)
npm run test:e2e:headed

# E2E debug mode
npm run test:e2e:debug
```

### Watch Mode Shortcuts

In watch mode, press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename
- `t` - Filter by test name
- `q` - Quit

---

## Unit Testing

### Redux Slices

Test reducers as pure functions:

```typescript
// src/store/slices/cartSlice.test.ts
import { cartReducer, addToCart, removeFromCart, updateQuantity } from './cartSlice';

describe('cartSlice', () => {
  const initialState = { items: [], isOpen: false };
  
  const mockProduct = {
    productId: 1,
    title: 'Test Product',
    price: 29.99,
    quantity: 1,
    thumbnail: 'test.jpg',
  };

  describe('addToCart', () => {
    it('should add a new item to empty cart', () => {
      const result = cartReducer(initialState, addToCart(mockProduct));
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockProduct);
    });

    it('should increment quantity for existing item', () => {
      const stateWithItem = { ...initialState, items: [mockProduct] };
      
      const result = cartReducer(stateWithItem, addToCart(mockProduct));
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item by productId', () => {
      const stateWithItem = { ...initialState, items: [mockProduct] };
      
      const result = cartReducer(stateWithItem, removeFromCart(1));
      
      expect(result.items).toHaveLength(0);
    });
  });
});
```

### Selectors

Test memoization and derived values:

```typescript
// src/store/selectors/cartSelectors.test.ts
import { selectCartTotal, selectCartCount } from './cartSelectors';

describe('cartSelectors', () => {
  const mockState = {
    cart: {
      items: [
        { productId: 1, price: 10, quantity: 2 },
        { productId: 2, price: 20, quantity: 1 },
      ],
    },
  };

  it('selectCartTotal calculates correct total', () => {
    const total = selectCartTotal(mockState);
    expect(total).toBe(40); // (10*2) + (20*1)
  });

  it('selectCartCount returns total item count', () => {
    const count = selectCartCount(mockState);
    expect(count).toBe(3); // 2 + 1
  });

  it('selectCartTotal is memoized', () => {
    const result1 = selectCartTotal(mockState);
    const result2 = selectCartTotal(mockState);
    expect(result1).toBe(result2);
  });
});
```

### Custom Hooks

Use `renderHook` from Testing Library:

```typescript
// src/hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Change value
    rerender({ value: 'updated' });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should update
    expect(result.current).toBe('updated');
  });
});
```

### Utility Functions

Test pure functions thoroughly:

```typescript
// src/utils/formatCurrency.test.ts
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(29.99, 'EUR')).toBe('€29.99');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-10)).toBe('-$10.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(29.999)).toBe('$30.00');
  });
});
```

---

## Component Testing

### Basic Component Test

```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

### Testing with Redux

```typescript
// src/components/cart/CartItem.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CartItem } from './CartItem';
import cartReducer from '@/store/slices/cartSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState,
  });
};

const renderWithRedux = (component: React.ReactElement, store = createTestStore()) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('CartItem', () => {
  const mockItem = {
    productId: 1,
    title: 'Test Product',
    price: 29.99,
    quantity: 2,
    thumbnail: 'test.jpg',
  };

  it('displays item details', () => {
    renderWithRedux(<CartItem item={mockItem} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('dispatches updateQuantity when quantity changed', async () => {
    const { store } = renderWithRedux(<CartItem item={mockItem} />, 
      createTestStore({ cart: { items: [mockItem] } })
    );

    await userEvent.click(screen.getByRole('button', { name: /increase/i }));
    
    const state = store.getState();
    expect(state.cart.items[0].quantity).toBe(3);
  });
});
```

### Testing with Router

```typescript
// src/components/auth/ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ProtectedRoute } from './ProtectedRoute';

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        } />
      </Routes>,
      { route: '/protected' }
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

---

## Integration Testing

Integration tests verify that multiple units work together:

```typescript
// src/test/integration/checkout-flow.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { TestProviders } from '@/test/TestProviders';

describe('Checkout Flow', () => {
  it('completes full checkout process', async () => {
    render(<App />, { wrapper: TestProviders });
    
    // 1. Navigate to products
    await userEvent.click(screen.getByRole('link', { name: /shop/i }));
    
    // 2. Add product to cart
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    await userEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);
    
    // 3. Go to cart
    await userEvent.click(screen.getByRole('link', { name: /cart/i }));
    
    // 4. Proceed to checkout
    await userEvent.click(screen.getByRole('button', { name: /checkout/i }));
    
    // 5. Fill shipping form
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/address/i), '123 Main St');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // 6. Fill payment form
    await userEvent.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await userEvent.click(screen.getByRole('button', { name: /place order/i }));
    
    // 7. Verify confirmation
    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing

### Playwright Setup

E2E tests are in the `e2e/` folder and use Playwright:

```typescript
// e2e/critical-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can browse and add product to cart', async ({ page }) => {
    // Navigate to products
    await page.click('text=Shop');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    // Add first product to cart
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart badge updates
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('user can complete checkout', async ({ page }) => {
    // Add product and go to checkout
    await page.goto('/products');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('text=Cart');
    await page.click('text=Checkout');
    
    // Fill shipping form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="address"]', '123 Test St');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="zip"]', '12345');
    await page.click('text=Continue');
    
    // Fill payment form
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvv"]', '123');
    await page.click('text=Place Order');
    
    // Verify success
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
```

### Visual Regression

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('home page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home.png');
  });

  test('product page matches snapshot', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await expect(page).toHaveScreenshot('products.png');
  });
});
```

---

## Mocking Strategies

### MSW (Mock Service Worker)

We use MSW for API mocking:

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://dummyjson.com/products', () => {
    return HttpResponse.json({
      products: [
        { id: 1, title: 'Product 1', price: 29.99 },
        { id: 2, title: 'Product 2', price: 49.99 },
      ],
      total: 2,
      skip: 0,
      limit: 10,
    });
  }),

  http.post('https://dummyjson.com/auth/login', async ({ request }) => {
    const body = await request.json();
    
    if (body.email === 'test@test.com') {
      return HttpResponse.json({
        token: 'mock-token',
        user: { id: 1, email: 'test@test.com', name: 'Test User' },
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

### Setup File

```typescript
// src/test/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Best Practices

### DO ✅

```typescript
// Use accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// Use userEvent for interactions
await userEvent.click(button);
await userEvent.type(input, 'text');

// Wait for async operations
await waitFor(() => expect(element).toBeInTheDocument());

// Test user behavior
expect(screen.getByText('Success!')).toBeInTheDocument();
```

### DON'T ❌

```typescript
// Don't use test IDs when accessible queries work
screen.getByTestId('submit-button'); // Avoid if button has accessible name

// Don't test implementation details
expect(component.state.isLoading).toBe(true); // Don't access internal state

// Don't use fireEvent when userEvent works
fireEvent.click(button); // Use userEvent.click instead

// Don't use arbitrary waits
await new Promise(r => setTimeout(r, 1000)); // Use waitFor instead
```

### Naming Conventions

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {});
  });
});

// Examples:
describe('CartItem', () => {
  describe('when quantity is updated', () => {
    it('should dispatch updateQuantity action', () => {});
  });
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Coverage Reports

After running `npm run test:coverage`, view the report:

```bash
# Open HTML report
open coverage/index.html
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

---

## Need Help?

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
