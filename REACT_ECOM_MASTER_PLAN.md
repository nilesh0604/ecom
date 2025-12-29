# React E-Commerce Master Plan (Tech Lead/Dev & Interview Prep)

This master document merges the strategic practice plan, component architecture, and the detailed 7-day execution schedule into a single source of truth.

---

## Part 1: Strategic Context & Standards

### Context / Your Ask
- **Goal**: Prepare for a full-stack/frontend tech lead interview (machine-coding heavy).
- **Target Role**: Dev / Tech Lead / Architect.
- **Project**: "E-com Lite" (React 18 + TS + Vite + Redux Toolkit).
- **Timeline**: 1 Week (Aggressive Build) + DSA Maintenance.

### Engineering Requirements (Non-negotiable)
To demonstrate "Tech Lead" quality, every drill must adhere to:
1.  **Validation**: Zod/Joi for all inputs.
2.  **Typed Contracts**: No `any`. Shared interfaces for API responses.
3.  **Error Handling**: Consistent `ErrorBoundary` and API error shapes.
4.  **Security**:
    - Sanitized inputs.
    - No secrets in client bundles.
    - Security headers (Helmet).
5.  **Performance**:
    - Code splitting (`React.lazy`).
    - Memoization (`useMemo`, `useCallback`) where appropriate.
    - Bundle size monitoring.
6.  **Accessibility**: WCAG AA (Contrast, Aria-labels, Keyboard nav).

### High-Level Application Architecture

- **App Type**: SPA built with React 18 + TypeScript + Vite.
- **Routing**:
  - `react-router-dom` with nested layouts (`MainLayout`, `AuthLayout`).
  - Route-level code splitting using `React.lazy` + `Suspense`.
- **State Management**:
  - Redux Toolkit slices for `cart`, `products`, `auth`, `orders`, `ui`.
  - Memoized selectors for derived state (totals, counts, filtered lists).
- **Data Layer**:
  - Central `apiClient` wrapper (e.g., `fetch` or `axios`) with:
    - Base URL, timeouts, and default headers.
    - Interceptors for auth tokens and error mapping.
  - Typed response models in a shared `types/` folder (no `any`).
- **Design System**:
  - Tailwind for layout/spacing/typography.
  - Reusable headless primitives (`Button`, `Input`, `Modal`, `Toast`).
- **Cross-Cutting Concerns**:
  - `ErrorBoundary` at layout level.
  - `ThemeContext` (dark/light mode).
  - Basic `useAnalytics` hook for key events (page views, add-to-cart, checkout).

### Non-Functional Targets (Tech Lead-Level)

- **Performance Targets**:
  - Initial load LCP < 2.5s on simulated 3G for Home/Listing pages.
  - Initial JS bundle budget: **≤ 250kb gzipped**.
  - Use route-level code splitting and avoid unnecessary polyfills.
- **Reliability & Quality**:
  - Unit tests for core business logic (cart, checkout, auth, filters).
  - Minimum 60–70% coverage for reducers, selectors, and domain helpers.
  - Consistent error shapes from `apiClient` (typed `ApiError`).
- **Security & Privacy**:
  - No secrets or API keys in client bundle; use environment config.
  - Discuss token handling strategy (HttpOnly cookies vs LocalStorage) even if mocked.
  - Sanitize all user inputs before usage in queries/UI.
- **Accessibility (A11y)**:
  - Aim for WCAG 2.1 AA:
    - Keyboard-only navigation for nav, cart, checkout.
    - Screen-reader-friendly labels and roles for all interactive elements.
    - Color contrast checks for primary/secondary actions.
- **Observability & Tooling (Aspirational)**:
  - Plan for error tracking (e.g., Sentry) and session replay (e.g., LogRocket).
  - Basic logging strategy: console for local, providers for production.

### DSA Maintenance (Daily Routine)
*Do this alongside the project build.*
- **Timebox**: 30–40 min/day.
- **Focus**: Arrays, HashMaps, Sliding Window, BFS/DFS.
- **Method**: Speak out loud (Approach, Complexity, Edge Cases).

### API Contract Definitions (Types)
Define these types upfront in `types/` folder for end-to-end type safety:

```typescript
// types/product.ts
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  thumbnail: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  stock: number;
  reviews: Review[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

// types/cart.ts
interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  variant?: { color?: string; size?: string };
}

// types/order.ts
interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: ShippingAddress;
  createdAt: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

// types/auth.ts
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// types/api.ts
interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}
```

### Error Recovery Patterns
- **Retry Logic**: Exponential backoff (1s, 2s, 4s) for transient failures.
- **Stale-While-Revalidate**: Show cached product data while fetching fresh.
- **Graceful Degradation**: Disable checkout if payment service unavailable.
- **Offline Support**: Queue cart operations, sync when online.

---

## Part 2: Component Architecture Reference

### 1. Core Layout & Navigation
- **`MainLayout`**: Wrapper for the public pages (Navbar + Content + Footer).
- **`Navbar`**: Top navigation bar with Logo, Search Trigger, Cart Badge, User Menu.
- **`Footer`**: Legal links, sitemap, social icons.
- **`MobileMenu`**: Hamburger menu drawer for mobile responsiveness.
- **`Breadcrumbs`**: Navigation path (e.g., Home > Men > Shoes).
- **`ThemeToggle`**: Dark/Light mode switch.

### 2. Authentication (Auth)
- **`AuthLayout`**: Focused layout for Login/Register pages (no complex nav).
- **`LoginForm`**: Email/Password inputs with validation.
- **`RegisterForm`**: Signup fields (Name, Email, Password, Confirm).
- **`ProtectedRoute`**: Higher-Order Component (or wrapper) to redirect unauthenticated users.
- **`UserProfileDropdown`**: Avatar with dropdown for Profile/Logout.

### 3. Product Discovery (Listing & Search)
- **`ProductGrid`**: Responsive grid container for product cards.
- **`ProductCard`**: Individual item preview (Image, Title, Price, "Add" Button).
- **`SearchBar`**: Input with debounce and optional autocomplete suggestions.
- **`FilterSidebar`**: Faceted search (Category, Price Range, Brand checkboxes).
- **`SortDropdown`**: Select input for "Price: Low to High", "Newest", etc.
- **`PaginationControls`**: Next/Prev buttons or page numbers.
- **`ProductSkeleton`**: Loading placeholder for the grid.

### 4. Product Details (PDP)
- **`ProductGallery`**: Main image with thumbnail strip or zoom capability.
- **`ProductInfo`**: Title, Description, SKU, Stock Status.
- **`PriceDisplay`**: Current price, formatted currency, optional discount badge.
- **`VariantSelector`**: Color swatches or Size dropdowns.
- **`QuantitySelector`**: +/- stepper input.
- **`AddToCartButton`**: Primary CTA with loading state.
- **`ReviewsList`**: List of user reviews with star ratings.

### 5. Cart & Checkout
- **`CartDrawer`**: Slide-out mini-cart for quick access.
- **`CartPage`**: Full-page view of cart items.
- **`CartItem`**: Row showing product image, name, qty adjuster, remove button, line price.
- **`CartSummary`**: Subtotal, Tax, Shipping, Total calculation box.
- **`CheckoutWizard`**: Step-based container (Shipping -> Payment -> Review).
- **`ShippingForm`**: Address inputs (Street, City, Zip, Country).
- **`PaymentForm`**: Credit card inputs (or mock payment UI).
- **`OrderSummary`**: Read-only list of items for the final review step.

### 6. Order Management
- **`OrderConfirmation`**: Success message with Order ID and "Continue Shopping" link.
- **`OrderHistoryList`**: List of past orders with status (Delivered, Processing).
- **`OrderDetails`**: specific view of a past order.

### 7. Common UI (Atomic Design)
- **`Button`**: Variants (Primary, Secondary, Ghost, Destructive).
- **`Input`**: Text fields with label and error message support.
- **`Badge`**: Status indicators (e.g., "Sale", "New", "Out of Stock").
- **`Modal`**: accessible dialog overlay.
- **`Toast/Snackbar`**: ephemeral success/error notifications.
- **`Spinner`**: Loading indicator.
- **`Alert`**: Contextual feedback (Success, Warning, Error).
- **`ErrorBoundary`**: React error boundary fallback component.

### 8. Cross-Cutting Services & Infrastructure

- **`store/index.ts`**:
  - Configure Redux store with slices: `cart`, `products`, `auth`, `orders`, `ui`.
  - Attach middleware for logging (dev only) and cart persistence.
- **Slices**:
  - `cartSlice`: `addToCart`, `removeFromCart`, `updateQty`, `clearCart`.
  - `productsSlice`: product list, filters, loading/error states.
  - `authSlice`: user info, auth status, tokens (if applicable).
  - `ordersSlice`: past orders, selected order details.
- **`apiClient.ts`**:
  - Thin wrapper around `fetch`/`axios` with:
    - Base URL config.
    - Request/response interceptors.
    - Unified `ApiError` type and error normalization.
- **`config.ts`**:
  - Environment-aware configuration (`API_BASE_URL`, feature flags).
  - Guardrails for missing/invalid config (throw early in dev).
- **`useAnalytics.ts`** (optional but interview-friendly):
  - Hook for tracking key events (`view_product`, `add_to_cart`, `checkout_start`).
  - Abstraction that can later plug into Segment, GA, etc.

### 9. Error & Empty States

- **`EmptyState`**:
  - Generic component for:
    - Empty cart.
    - No products found.
    - No orders yet.
- **`ErrorState`**:
  - Friendly error UI with:
    - Title, description, retry button.
    - Optional technical details in dev mode.
- **Usage**:
  - Product Listing:
    - Show `EmptyState` when no products match filters.
    - Show `ErrorState` when API call fails.
  - Cart:
    - Show `EmptyState` when there are no items.
  - Orders:
    - Show `EmptyState` if user has no history yet.

---

## Part 3: Daily Execution Plan (7 Days)

### Day 1: Foundation & Application Shell
**Business Requirement**:
As a user, I want to land on a branded application with clear navigation (desktop & mobile) so I can access the Shop, Cart, and Login pages. The app must handle 404s gracefully.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| Project Init & Config | 1.5 hrs |
| UI Components (Button, Spinner) | 1.5 hrs |
| Routing Setup | 1.5 hrs |
| Layout Components | 2.5 hrs |
| Redux Store Scaffold | 0.5 hrs |
| Buffer/Polish | 0.5 hrs |

**📂 Components to Build**:
- **Core Layout**: `MainLayout`, `Navbar`, `Footer`, `MobileMenu`, `ThemeToggle`.
- **Common UI**: `Button`, `Spinner`, `ErrorBoundary`.

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Project Init**: Setup Vite + TS + Tailwind + Eslint.
    - Define folder structure and path aliases (`@components`, `@features`, `@hooks`).
    - Set up `.env` and `config.ts` for API base URL and feature flags.
    - Configure custom ESLint rules for project conventions.
2.  **Redux Store Scaffold**:
    - Initialize Redux store with placeholder slices (`cart`, `products`, `auth`, `orders`, `ui`).
    - Configure Redux DevTools for debugging.
    - Set up store types and hooks (`useAppDispatch`, `useAppSelector`).
3.  **UI Library**: Create atomic components:
    - `Button.tsx` (Variants: Primary, Ghost).
    - `Spinner.tsx` (SVG animation).
4.  **Routing**:
    - Configure `react-router-dom` with `Layout` routes.
    - Create Lazy-loaded pages: `Home`, `Shop`, `ProductDetails`, `Cart`, `Checkout`, `Login`.
5.  **Layout Implementation**:
    - `Navbar`: Grid/Flex layout with Logo, Search Trigger (placeholder), Cart Badge placeholder, User Icon.
    - `MobileMenu`: Hamburger drawer (responsive check).
    - `ThemeToggle`: Implement `ThemeContext` provider with localStorage persistence.
    - Wrap App in `ErrorBoundary`.

**🚀 Tech Lead Focus**:
- **Perf**: Lazy load all routes (`React.lazy`).
- **Security**: Add `Helmet` for security headers.
- **Architecture**: Be ready to explain SPA vs microfrontends vs MPA choices and why an SPA is appropriate here.

**✅ Done When**:
- [ ] All routes lazy-loaded and render placeholder content
- [ ] Mobile menu toggles correctly on viewport < 768px
- [ ] Theme persists across page refresh (localStorage)
- [ ] ErrorBoundary catches errors and displays fallback UI
- [ ] Redux DevTools shows store with empty slices
- [ ] No TypeScript errors, ESLint passes

---

### Day 2: Product Discovery (Listing & Pagination)
**Business Requirement**:
As a user, I want to view a grid of products, see loading skeletons while data fetches, and navigate between pages of results.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| useFetch Hook | 1 hr |
| API Integration | 0.5 hrs |
| PriceDisplay & Badge | 1 hr |
| ProductCard & Skeleton | 2 hrs |
| ProductGrid | 1.5 hrs |
| Pagination | 1.5 hrs |
| Testing | 0.5 hrs |

**📂 Components to Build**:
- **Discovery**: `ProductGrid`, `ProductCard`, `ProductSkeleton`, `PaginationControls`.
- **Common UI**: `Badge` (Sale/New), `PriceDisplay` (for Card).

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Data Layer**: Create `useFetch` hook (generics, loading, error, data).
2.  **API Integration**: Fetch from `dummyjson.com/products`.
3.  **Component Build**:
    - `PriceDisplay`: Formatter utility (Currency).
    - `Badge`: Reusable status indicator.
    - `ProductCard`: Thumbnail, Title, `PriceDisplay`, `Badge`.
    - `ProductSkeleton`: Shimmer loading state (match Card height).
    - `ProductGrid`: Responsive CSS Grid (1col -> 2col -> 4col).
4.  **Pagination Logic**: Implement `PaginationControls` with `Next`/`Prev`/`PageNumbers` logic.
5.  **Testing**:
    - Unit test `useFetch` hook (loading states, error handling, abort).
    - Unit test `formatCurrency` utility function.
    - Snapshot test `ProductCard` rendering.

**🚀 Tech Lead Focus**:
- **Perf**: Use `AbortController` in `useFetch` to cancel stale requests.
- **Access**: Ensure `ProductCard` images have meaningful `alt` text.
- **Data**: Be able to explain when you'd replace a custom `useFetch` hook with React Query or RTK Query in a real project.

**✅ Done When**:
- [ ] Products load from API and display in responsive grid
- [ ] Loading skeleton shows during fetch
- [ ] Pagination navigates between pages correctly
- [ ] All images have descriptive alt text
- [ ] `useFetch` hook tests pass
- [ ] No console errors or warnings

---

### Day 3: Product Details & Cart System
**Business Requirement**:
As a user, I want to view full product details, add items to cart (selecting variants), and manage my cart contents.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| cartSlice & Persistence | 1.5 hrs |
| PDP Components | 3 hrs |
| Cart Components | 2.5 hrs |
| Testing | 1 hr |

**📂 Components to Build**:
- **PDP**: `ProductGallery`, `ProductInfo`, `VariantSelector`, `QuantitySelector`, `AddToCartButton`, `ReviewsList`.
- **Cart**: `CartDrawer` (Mini-Cart), `CartPage`, `CartItem`, `CartSummary`.

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Redux Setup**:
    - Create `cartSlice.ts`: `addToCart`, `removeFromCart`, `updateQty`, `clearCart`.
    - Persistence Middleware (`localStorage`).
    - Define `CartItem` type and invariants (`qty >= 1`, `qty <= stock`).
    - Memoized selectors: `selectCartItems`, `selectCartTotal`, `selectCartCount`.
2.  **PDP Implementation**:
    - `ProductGallery`: Main image + thumbnail strip.
    - `VariantSelector`: Color/Size chips (visual only if API lacks variants).
    - `QuantitySelector`: + / - stepper.
    - `AddToCartButton`: Connect to Redux dispatch.
    - `ReviewsList`: Map over reviews array (DummyJSON provides this).
3.  **Cart Implementation**:
    - `CartItem`: Reuse `QuantitySelector` here.
    - `CartSummary`: Calculate Subtotal, Tax, Total.
    - `CartDrawer`: Overlay with `CartItem` list + "Checkout" button.
    - `CartPage`: Full page version of the drawer logic.
4.  **Testing**:
    - Unit test `cartSlice` reducer (add, remove, update, clear, edge cases).
    - Unit test memoized selectors (total calculation, count).
    - Test localStorage hydration with Zod validation.

**🚀 Tech Lead Focus**:
- **Perf**: Memoize `selectCartTotal` selector to prevent Header re-renders.
- **Security**: Validate `localStorage` data with Zod on hydration (prevent XSS).
- **UX**: Implement optimistic UI for cart operations (update UI immediately, rollback on failure).
- **Consistency**: Think through how to handle price changes between cart and checkout (price updates, discounts, currency changes).

**✅ Done When**:
- [ ] PDP displays all product details with gallery
- [ ] Add to cart updates Redux store and badge count
- [ ] Cart persists across page refresh (localStorage)
- [ ] CartDrawer slides in/out smoothly
- [ ] Quantity cannot go below 1 or above stock
- [ ] `cartSlice` reducer tests pass (100% coverage)

---

### Day 4: Advanced Search & Navigation
**Business Requirement**:
As a user, I want to find specific items by name or filter by category. I want to see my navigation path.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| SearchBar with Debounce | 1.5 hrs |
| FilterSidebar | 2 hrs |
| SortDropdown | 1 hr |
| URL Sync & Breadcrumbs | 2 hrs |
| Testing | 1 hr |
| Buffer | 0.5 hrs |

**📂 Components to Build**:
- **Discovery**: `SearchBar`, `FilterSidebar`, `SortDropdown`.
- **Navigation**: `Breadcrumbs`.

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Search Logic**:
    - `SearchBar`: Input with debounce (300ms).
    - Create `useDebounce` custom hook.
2.  **Filter Logic**:
    - `FilterSidebar`: Categories (Checkbox), Price Range (Slider/Inputs).
    - `SortDropdown`: "Price: Low-High", "Newest".
    - Sync all state to **URL Query Params** using `useSearchParams`.
3.  **Navigation**:
    - `Breadcrumbs`: Generate links based on route (Home > Category > Product).
4.  **Refactor**: Update `ProductGrid` to consume URL params for filtering.
5.  **Testing**:
    - Unit test `useDebounce` hook.
    - Test URL param sync (filter → URL → page reload → filter restored).
    - Test sorting logic correctness.

**🚀 Tech Lead Focus**:
- **Perf**: Use `useMemo` for client-side sorting/filtering calculations.
- **Security**: Sanitize search input before passing to API logic (use DOMPurify or custom sanitizer).
- **Scalability**: Discuss trade-offs between server-side search and client-side filtering as the catalog size grows.

**✅ Done When**:
- [ ] Search filters products with 300ms debounce
- [ ] Category/Price filters update product grid
- [ ] Filters persist in URL (shareable links)
- [ ] Page refresh restores filter state from URL
- [ ] Breadcrumbs show correct navigation path
- [ ] `useDebounce` hook tests pass

---

### Day 5: Checkout Flow (Complex Forms)
**Business Requirement**:
As a user, I want a secure, multi-step checkout process with validation.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| Form Setup (RHF + Zod) | 1 hr |
| CheckoutWizard Container | 1.5 hrs |
| ShippingForm | 1.5 hrs |
| PaymentForm | 1.5 hrs |
| OrderSummary & Confirmation | 1.5 hrs |
| Testing | 1 hr |

**📂 Components to Build**:
- **Checkout**: `CheckoutWizard` (Steps), `ShippingForm`, `PaymentForm`, `OrderSummary`, `OrderConfirmation`.
- **Common UI**: `Input` (Forms).

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Form Setup**: React Hook Form + Zod.
2.  **Wizard Container**:
    - `CheckoutWizard`: Visual progress steps.
    - Use `useReducer` for wizard state (`currentStep`, `formData`, `isSubmitting`).
    - Add skeleton screens for step transitions.
3.  **Step 1: Shipping**:
    - `ShippingForm`: Name, Address, City, Zip, Country.
    - Validation: Zod schema with custom error messages.
4.  **Step 2: Payment**:
    - `PaymentForm`: Card Number (Luhn algorithm validation), Expiry, CVV.
    - Mask card input for UX.
5.  **Step 3: Review**:
    - `OrderSummary`: Read-only view of `CartSummary` and Items.
6.  **Step 4: Success**:
    - `OrderConfirmation`: "Thank you" message + Order ID.
    - Clear cart on success.
7.  **Testing**:
    - Unit test Zod schemas (valid/invalid inputs).
    - Test form submission flow (step navigation).
    - Test Luhn algorithm validation.

**🚀 Tech Lead Focus**:
- **Perf**: Use "Uncontrolled Components" (React Hook Form) to minimize render count.
- **UX**: Auto-focus first input on step change.
- **Security**: Be able to explain why real card data should be handled via a PCI-compliant provider (e.g., Stripe, Braintree) instead of being processed directly by your backend.
- **Contracts**: Note how Zod schemas for checkout can be shared with a Node backend for end-to-end type safety.

**✅ Done When**:
- [ ] Wizard navigates through all 4 steps
- [ ] Form validation shows inline errors
- [ ] Cannot proceed to next step with invalid data
- [ ] Order confirmation displays generated Order ID
- [ ] Cart clears after successful checkout
- [ ] Zod schema tests pass

---

### Day 6: Authentication & Order Management
**Business Requirement**:
As a user, I want to manage my profile and see past orders. Guest users are restricted from History.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| AuthContext & Slice | 1.5 hrs |
| Login/Register Forms | 2 hrs |
| ProtectedRoute | 1 hr |
| Order History Components | 2 hrs |
| Testing | 1 hr |
| Buffer | 0.5 hrs |

**📂 Components to Build**:
- **Auth**: `AuthLayout`, `LoginForm`, `RegisterForm`, `ProtectedRoute`, `UserProfileDropdown`.
- **Orders**: `OrderHistoryList`, `OrderDetails`.

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Auth System**:
    - `AuthContext` + `authSlice`: Mock login/logout methods.
    - `LoginForm`/`RegisterForm`: Validation with Zod and API mock.
    - `AuthLayout`: Centered card layout.
    - **Token Strategy**: Use React Context with token in memory + refresh token concept (mocked). In production, prefer HttpOnly cookies.
2.  **Access Control**:
    - `ProtectedRoute`: Redirect if no user, preserve intended destination.
    - Apply to `/checkout`, `/orders`.
3.  **User Menu**:
    - `UserProfileDropdown`: Replace "Login" button in Navbar when auth'd.
4.  **Order History**:
    - `OrderHistoryList`: Table/List of past orders.
    - `OrderDetails`: Modal or Page showing specific order items.
    - Design as if consumed from an Orders microservice (typed API response).
5.  **Testing**:
    - Test `ProtectedRoute` behavior (redirect, preserve location).
    - Test auth flow (login → redirect → protected page accessible).
    - Test logout clears state.

**🚀 Tech Lead Focus**:
- **Security**: Discuss storing tokens in `HttpOnly` cookies vs LocalStorage. **Decision for this project**: Memory + Context for demo, document HttpOnly as production approach.
- **UX**: Implement "Redirect to intended page" after login (preserve `from` location).
- **Architecture**: Be ready to describe how auth and orders would integrate with real backend services (identity provider, orders microservice).

**✅ Done When**:
- [x] Login/Register forms validate and submit
- [x] Protected routes redirect unauthenticated users
- [x] After login, user redirects to intended page
- [x] User menu shows name and logout option
- [x] Order history displays mock orders
- [x] Auth flow tests pass

---

### Day 7: Reliability, Testing & Polish
**Business Requirement**:
The application must be accessible, robust, and feature-complete with feedback mechanisms.

**⏱️ Time Allocation**: ~8 hrs
| Task | Time |
|------|------|
| Toast/Alert/Modal | 2 hrs |
| Integration Tests | 2 hrs |
| A11y Audit & Fixes | 1.5 hrs |
| Performance Audit | 1 hr |
| Documentation | 1.5 hrs |

**📂 Components to Build**:
- **Common UI**: `Toast/Snackbar`, `Alert`, `Modal`.

**✅ Detailed Work Breakdown Structure (WBS)**:
1.  **Feedback Systems**:
    - `Toast`: Trigger on "Add to Cart", "Order Placed".
    - `Alert`: Inline error messages for API failures.
    - `Modal`: Confirmation for "Remove Item" or "Quick View" (optional).
2.  **Testing**:
    - Integration Test: "Add to Cart" flow (click → Redux update → badge count).
    - Integration Test: Checkout flow (form → submit → confirmation).
    - E2E consideration: Document Playwright/Cypress setup for future.
3.  **Accessibility (A11y)**:
    - Audit `tabIndex`, `aria-label` on all interactive elements.
    - Check Color Contrast (WCAG AA: 4.5:1 for text).
    - Keyboard navigation test (Tab through entire app).
4.  **Performance**:
    - Integrate `web-vitals` library for Core Web Vitals monitoring.
    - Log LCP, FID, CLS metrics to console (production: send to analytics).
    - Run Lighthouse audit, fix any issues.
    - Verify bundle size < 250kb gzipped.
5.  **Documentation**: `README.md`, `DECISIONS.md`.
    - Document pre-commit hooks (lint + test) and a simple CI pipeline (lint, test, build).
    - Add architecture diagram (Mermaid).

**🚀 Tech Lead Focus**:
- **Quality**: Run `npm audit` and fix vulnerabilities.
- **Quality**: Achieve Lighthouse Score > 90 (Performance, Accessibility, Best Practices).
- **Observability**: Document Sentry/LogRocket integration plan (code stubs if time permits).

**✅ Done When**:
- [x] Toast notifications appear for key actions
- [x] All integration tests pass
- [x] Keyboard navigation works throughout app
- [x] Color contrast passes WCAG AA
- [x] Lighthouse scores > 90
- [x] Bundle size < 250kb gzipped
- [x] README and DECISIONS docs complete
- [x] `npm audit` shows no high/critical vulnerabilities
