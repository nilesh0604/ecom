# Frontend Development Concepts - Implementation Order

A comprehensive guide to all frontend concepts covered in this e-commerce project, organized in **implementation order** where each concept builds upon previous ones.

---

## 📊 Overview

This document maps **109 frontend concepts** across **18 levels** of complexity. The ordering ensures proper dependency management - you cannot implement Redux middleware without understanding slices, and you cannot write E2E tests until the full application is functional.

---

## Level 0: Foundational Knowledge (Prerequisites)

> **These are prerequisites before starting any React project**

| # | Concept | Description | Why First? |
|---|---------|-------------|------------|
| 1 | **HTML Semantic Elements** | `nav`, `main`, `article`, `button`, `section` | Foundation of web - everything renders to HTML |
| 2 | **CSS Fundamentals** | Box model, flexbox, grid, positioning | Styling is essential before any component |
| 3 | **JavaScript ES6+** | Arrow functions, destructuring, spread, modules | React is JavaScript - must know JS first |
| 4 | **TypeScript Basics** | Types, interfaces, generics, `no any` | Project uses strict TypeScript throughout |

### Key Points for Interviews
- Explain the difference between `div` and semantic elements
- Demonstrate understanding of CSS specificity
- Show ES6+ features: `const/let`, arrow functions, template literals, destructuring
- Explain TypeScript benefits: compile-time errors, better IDE support, self-documenting code

---

## Level 1: Development Environment & Tooling

> **Set up the development environment before writing any code**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 5 | **Vite Build Tool** | ESBuild, HMR, dev server | JS/TS knowledge |
| 6 | **ESLint Configuration** | Code quality, custom rules | Vite setup |
| 7 | **TypeScript Config** | `tsconfig.json`, strict mode, path aliases | Vite + TS basics |
| 8 | **Tailwind CSS** | Utility-first CSS, tree shaking | CSS fundamentals |
| 9 | **Environment Variables** | `.env`, `config.ts`, feature flags | Build tool setup |

### Project Files
- [vite.config.ts](vite.config.ts) - Vite configuration
- [tsconfig.json](tsconfig.json) - TypeScript settings
- [tailwind.config.js](tailwind.config.js) - Tailwind customization
- [eslint.config.js](eslint.config.js) - Linting rules
- [src/config/index.ts](src/config/index.ts) - Environment configuration

### Interview Discussion Points
- **Vite vs Webpack**: Vite uses ESBuild for faster builds, native ES modules for HMR
- **Path Aliases**: `@/` imports improve DX and refactoring
- **Tailwind**: Utility-first approach, no runtime overhead, tree-shaking

---

## Level 2: Core React Fundamentals

> **Master these before any advanced patterns**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 10 | **Functional Components** | JSX, props, component composition | React basics |
| 11 | **useState Hook** | Local component state | Functional components |
| 12 | **useEffect Hook** | Side effects, dependency arrays, cleanup | useState |
| 13 | **useRef Hook** | Mutable refs, DOM refs, AbortController | useEffect |
| 14 | **Conditional Rendering** | Ternary, &&, switch patterns | Components + state |
| 15 | **List Rendering** | `.map()`, keys, fragments | Conditional rendering |
| 16 | **Event Handling** | onClick, onChange, form events | Components |
| 17 | **Props & Children** | Component communication, composition | Functional components |

### Code Examples

```tsx
// Functional Component with useState
const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};

// useEffect with cleanup
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort(); // Cleanup
}, [dependency]);
```

### Interview Discussion Points
- **Why cleanup in useEffect?** Prevent memory leaks, cancel stale requests
- **Keys in lists**: React reconciliation, why index as key is problematic
- **Dependency arrays**: What happens with empty `[]` vs no array vs `[dep]`

---

## Level 3: Advanced React Hooks

> **Build on basic hooks to create powerful abstractions**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 18 | **useReducer** | Complex state logic, state machines | useState mastery |
| 19 | **useContext** | Global state without prop drilling | useReducer understanding |
| 20 | **useCallback** | Memoized callbacks, stable references | useEffect, props |
| 21 | **useMemo** | Expensive calculations memoization | useCallback |
| 22 | **useId** | SSR-safe unique IDs | React 18 features |
| 23 | **useTransition** | Non-blocking updates, `isPending` | React 18 concurrent |
| 24 | **Custom Hooks** | `useFetch`, `useDebounce`, `useToast` | All basic hooks |

### Project Implementation
- [src/hooks/useFetch.ts](src/hooks/useFetch.ts) - Data fetching with AbortController
- [src/hooks/useDebounce.ts](src/hooks/useDebounce.ts) - Debounced values
- [src/hooks/useToast.ts](src/hooks/useToast.ts) - Toast notification system
- [src/hooks/useSearch.ts](src/hooks/useSearch.ts) - useTransition for search

### Interview Discussion Points
- **useReducer vs useState**: Complex state transitions, multiple sub-values
- **useCallback vs useMemo**: Functions vs values, when to use each
- **Custom hooks rules**: Must start with `use`, can call other hooks

---

## Level 4: Component Architecture

> **Build a reusable component library**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 25 | **forwardRef** | Passing refs to child components | useRef |
| 26 | **Atomic UI Components** | `Button`, `Input`, `Spinner`, `Badge` | Tailwind, forwardRef |
| 27 | **Component Organization** | Feature-based vs atomic design | Multiple components |
| 28 | **Class Components** | `ErrorBoundary` (still requires class) | Functional components |
| 29 | **Error Boundaries** | Fallback UI, error recovery | Class components |
| 30 | **React Portals** | `Modal`, `ToastContainer` outside DOM tree | Atomic components |

### Project Structure
```
components/
├── ui/          # Atomic: Button, Input, Modal, Toast
├── auth/        # Feature: LoginForm, RegisterForm
├── cart/        # Feature: CartDrawer, CartItem
├── checkout/    # Feature: ShippingForm, PaymentForm
├── product/     # Feature: ProductCard, ProductGrid
└── layout/      # Structural: Navbar, Footer
```

### Project Implementation
- [src/components/ui/Button.tsx](src/components/ui/Button.tsx) - forwardRef example
- [src/components/ui/Input.tsx](src/components/ui/Input.tsx) - Form input with ref
- [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) - Class component
- [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx) - Portal usage

### Interview Discussion Points
- **Why Error Boundaries need classes**: `componentDidCatch` has no hook equivalent
- **Portal use cases**: Modals, tooltips, toasts that escape parent styling
- **Component organization trade-offs**: Feature-based for scaling, atomic for reuse

---

## Level 5: Routing & Navigation

> **Implement client-side navigation**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 31 | **React Router Setup** | `BrowserRouter`, routes, outlets | Component architecture |
| 32 | **Nested Layouts** | `MainLayout`, `AuthLayout` | Router setup |
| 33 | **Route Parameters** | `useParams`, dynamic routes | Basic routing |
| 34 | **Programmatic Navigation** | `useNavigate` | Router context |
| 35 | **URL State (useSearchParams)** | Filter/search state in URL | Routing + state |
| 36 | **Protected Routes** | Auth guards, redirect patterns | Router + auth concept |
| 37 | **Breadcrumbs** | Navigation path component | Nested routes |

### Project Implementation
- [src/routes/index.tsx](src/routes/index.tsx) - Route configuration
- [src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx) - Public layout
- [src/layouts/AuthLayout.tsx](src/layouts/AuthLayout.tsx) - Auth pages layout
- [src/components/auth/ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx) - Auth guard

### Interview Discussion Points
- **URL state benefits**: Shareable links, bookmarking, SEO
- **Protected routes pattern**: Redirect with `from` state for return navigation
- **Nested layouts**: Avoid duplicating Navbar/Footer across pages

---

## Level 6: Code Splitting & Performance

> **Optimize initial load and runtime performance**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 38 | **React.lazy** | Dynamic imports, route splitting | Routing setup |
| 39 | **Suspense** | Loading states for lazy components | React.lazy |
| 40 | **React.memo** | Component memoization | useMemo understanding |
| 41 | **Debouncing** | `useDebounce` for search/input | Custom hooks |
| 42 | **Web Vitals Monitoring** | LCP, FID, CLS tracking | Performance awareness |
| 43 | **Bundle Analysis** | rollup-plugin-visualizer, chunk splitting | Build tool |

### Project Implementation
- [src/routes/index.tsx](src/routes/index.tsx) - Lazy loaded routes
- [src/components/product/ProductCard.tsx](src/components/product/ProductCard.tsx) - React.memo
- [src/hooks/useDebounce.ts](src/hooks/useDebounce.ts) - Debounce hook
- [src/utils/webVitals.ts](src/utils/webVitals.ts) - Performance monitoring

### Code Example

```tsx
// Route-level code splitting
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));

// Usage with Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/products" element={<Products />} />
  </Routes>
</Suspense>
```

### Performance Targets
- Initial JS bundle: **≤ 250kb gzipped**
- LCP: **< 2.5s** on simulated 3G
- Lighthouse Score: **> 90**

---

## Level 7: State Management (Redux)

> **Centralized, predictable state management**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 44 | **Redux Store Setup** | configureStore, provider | React context understanding |
| 45 | **Redux Toolkit Slices** | `createSlice`, reducers, actions | Store setup |
| 46 | **Typed Hooks** | `useAppDispatch`, `useAppSelector` | TypeScript + RTK |
| 47 | **Memoized Selectors** | `createSelector`, reselect | Slices + useMemo concept |
| 48 | **Redux Middleware** | Custom middleware (cart persistence) | Store + slices |
| 49 | **Redux DevTools** | Debugging, time-travel | Store configuration |

### Project Implementation
- [src/store/index.ts](src/store/index.ts) - Store configuration
- [src/store/slices/cartSlice.ts](src/store/slices/cartSlice.ts) - Cart state
- [src/store/slices/authSlice.ts](src/store/slices/authSlice.ts) - Auth state
- [src/store/selectors/cartSelectors.ts](src/store/selectors/cartSelectors.ts) - Memoized selectors
- [src/store/middleware/cartPersistence.ts](src/store/middleware/cartPersistence.ts) - localStorage sync
- [src/store/hooks.ts](src/store/hooks.ts) - Typed hooks

### Interview Discussion Points
- **Redux vs Zustand vs Context**: DevTools, middleware, team familiarity
- **When to use Redux**: Shared state, complex updates, debugging needs
- **Selector memoization**: Prevent unnecessary re-renders

---

## Level 8: Data Fetching & API Layer

> **Consistent, type-safe API communication**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 50 | **API Client Pattern** | Centralized fetch wrapper | Redux + services concept |
| 51 | **Error Normalization** | Typed `ApiError` shape | API client |
| 52 | **AbortController** | Request cancellation in `useFetch` | useEffect cleanup |
| 53 | **Service Layer** | `productService`, `authService` | API client |
| 54 | **Retry Logic** | Exponential backoff with jitter | API client |
| 55 | **Request Deduplication** | Prevent duplicate concurrent requests | API client |

### Project Implementation
- [src/utils/apiClient.ts](src/utils/apiClient.ts) - Centralized API client
- [src/services/productService.ts](src/services/productService.ts) - Product API
- [src/services/authService.ts](src/services/authService.ts) - Auth API
- [src/utils/requestDeduplication.ts](src/utils/requestDeduplication.ts) - Request deduplication
- [src/types/api.ts](src/types/api.ts) - API type definitions

### Error Recovery Patterns
- **Retry Logic**: Exponential backoff (1s, 2s, 4s) for transient failures
- **Stale-While-Revalidate**: Show cached data while fetching fresh
- **Graceful Degradation**: Disable checkout if payment service unavailable

---

## Level 9: Form Handling

> **Complex form management with validation**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 56 | **React Hook Form** | Uncontrolled form management | Input components |
| 57 | **Zod Schemas** | Schema validation, type inference | TypeScript |
| 58 | **Zod Resolver** | RHF + Zod integration | Both above |
| 59 | **Form Wizard Pattern** | Multi-step checkout with useReducer | Forms + useReducer |
| 60 | **Custom Validation** | Luhn algorithm, card formatting | Zod schemas |

### Project Implementation
- [src/components/checkout/ShippingForm.tsx](src/components/checkout/ShippingForm.tsx)
- [src/components/checkout/PaymentForm.tsx](src/components/checkout/PaymentForm.tsx)
- [src/components/checkout/checkoutSchemas.ts](src/components/checkout/checkoutSchemas.ts) - Zod schemas
- [src/pages/Checkout.tsx](src/pages/Checkout.tsx) - useReducer for wizard state

### Interview Discussion Points
- **RHF vs Formik**: Uncontrolled vs controlled, performance difference
- **Zod vs Yup**: TypeScript-first, better inference
- **Schema sharing**: Same Zod schema can validate frontend & backend

---

## Level 10: UI Patterns & Feedback

> **User feedback and interaction patterns**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 61 | **Toast/Snackbar System** | Ephemeral notifications | Portal, context |
| 62 | **Modal/Dialog** | Accessible overlays, focus trap | Portal, a11y |
| 63 | **Alert Component** | Inline contextual messages | Atomic components |
| 64 | **Skeleton Loading** | Shimmer placeholders | CSS, components |
| 65 | **Empty/Error States** | Friendly fallback UIs | Components |
| 66 | **Confirm Modal** | Destructive action confirmation | Modal |

### Project Implementation
- [src/components/ui/Toast.tsx](src/components/ui/Toast.tsx) - Toast notifications
- [src/components/ui/ToastContainer.tsx](src/components/ui/ToastContainer.tsx) - Toast portal
- [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx) - Accessible modal
- [src/components/ui/Alert.tsx](src/components/ui/Alert.tsx) - Inline alerts
- [src/hooks/useToast.ts](src/hooks/useToast.ts) - Toast hook

### Usage Example

```tsx
const toast = useToast();

const handleAddToCart = () => {
  dispatch(addToCart(item));
  toast.success('Item added to cart!');
};

const handleError = () => {
  toast.error('Something went wrong');
};
```

---

## Level 11: Authentication & Security

> **Secure user authentication and data protection**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 67 | **Auth Context/Slice** | User state, tokens | Redux or Context |
| 68 | **Login/Register Forms** | Auth forms with validation | Form handling |
| 69 | **Protected Route Pattern** | HOC/wrapper for auth guards | Routing + auth state |
| 70 | **Token Storage Strategy** | Memory vs localStorage vs cookies | Security awareness |
| 71 | **Input Sanitization** | XSS prevention, DOMPurify | Security |
| 72 | **CSP Headers** | Content-Security-Policy | Production security |
| 73 | **Security Headers (Helmet)** | Meta security headers | React Helmet |

### Project Implementation
- [src/store/slices/authSlice.ts](src/store/slices/authSlice.ts) - Auth state
- [src/components/auth/LoginForm.tsx](src/components/auth/LoginForm.tsx)
- [src/components/auth/RegisterForm.tsx](src/components/auth/RegisterForm.tsx)
- [src/components/auth/ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx)
- [src/utils/sanitize.ts](src/utils/sanitize.ts) - XSS prevention
- [docs/CSP_SECURITY.md](docs/CSP_SECURITY.md) - CSP documentation

### Token Storage Decision (ADR-005)
- **Demo**: Store token in memory (React Context) with mock refresh
- **Production**: Use HttpOnly cookies with CSRF protection

### Interview Discussion Points
- **localStorage vs HttpOnly cookies**: XSS vs CSRF trade-offs
- **CSP**: Prevent inline scripts, report-only mode for testing
- **Input sanitization**: Never trust user input, sanitize before render

---

## Level 12: Accessibility (A11y)

> **WCAG 2.1 AA compliance for inclusive design**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 74 | **ARIA Labels** | Screen reader support | Semantic HTML |
| 75 | **Keyboard Navigation** | Tab order, focus management | Components |
| 76 | **Focus Trap** | Modal accessibility | Modal component |
| 77 | **Skip Links** | Screen reader navigation | Layout components |
| 78 | **Color Contrast** | WCAG AA (4.5:1) | Tailwind theming |
| 79 | **aria-live Regions** | Screen reader announcements | Toast/feedback |

### Project Implementation
- [src/utils/a11y.ts](src/utils/a11y.ts) - Accessibility utilities
- [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx) - Focus trap
- [src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx) - Skip links

### A11y Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all focusable elements
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Form inputs have associated labels
- [ ] Images have meaningful alt text
- [ ] aria-live regions for dynamic content

---

## Level 13: Advanced React Patterns

> **Sophisticated component patterns for complex UIs**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 80 | **Compound Components** | `Tabs` with shared context | Context + children |
| 81 | **Render Props** | MouseTracker, Toggle, Fetcher | Advanced composition |
| 82 | **HOC Pattern** | `withLoading`, `withAuth`, `withErrorBoundary` | Component composition |
| 83 | **Container/Presenter** | Smart/dumb component separation | Architecture |
| 84 | **Feature Flags** | `FeatureGate` component | Config + conditionals |
| 85 | **State Machine** | XState-like patterns, `useMachine` | useReducer mastery |

### Project Implementation
- [src/components/ui/Tabs.tsx](src/components/ui/Tabs.tsx) - Compound components
- [src/components/ui/RenderProps.tsx](src/components/ui/RenderProps.tsx) - Render props examples
- [src/utils/hoc.tsx](src/utils/hoc.tsx) - HOC patterns
- [src/utils/featureFlags.ts](src/utils/featureFlags.ts) - Feature flags
- [src/utils/stateMachine.ts](src/utils/stateMachine.ts) - State machine

### Compound Component Example

```tsx
<Tabs defaultValue="details">
  <Tabs.List>
    <Tabs.Trigger value="details">Details</Tabs.Trigger>
    <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="details">Product details...</Tabs.Content>
  <Tabs.Content value="reviews">Reviews list...</Tabs.Content>
</Tabs>
```

---

## Level 14: Performance Optimization

> **Advanced performance techniques for large-scale apps**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 86 | **Virtual Scrolling** | `useVirtualScroll`, `VirtualList` | Performance + hooks |
| 87 | **Infinite Scroll** | Intersection Observer pagination | useFetch + scroll |
| 88 | **Optimistic Updates** | `useOptimistic` with rollback | State + API |
| 89 | **Route Prefetching** | Hover/viewport prefetch | Routing + performance |
| 90 | **Image Optimization** | Lazy loading, srcset, WebP, blur placeholder | Images + performance |

### Project Implementation
- [src/hooks/useVirtualScroll.ts](src/hooks/useVirtualScroll.ts) - Virtual scrolling
- [src/components/ui/VirtualList.tsx](src/components/ui/VirtualList.tsx) - Virtualized list
- [src/hooks/useInfiniteScroll.ts](src/hooks/useInfiniteScroll.ts) - Infinite scroll
- [src/hooks/useOptimistic.ts](src/hooks/useOptimistic.ts) - Optimistic updates
- [src/utils/routePrefetch.ts](src/utils/routePrefetch.ts) - Route prefetching
- [src/components/ui/OptimizedImage.tsx](src/components/ui/OptimizedImage.tsx) - Image optimization

### Interview Discussion Points
- **Virtual scrolling**: Render only visible items, windowing technique
- **Optimistic updates**: Update UI immediately, rollback on failure
- **When to use**: Large lists (1000+ items), slow networks, perceived performance

---

## Level 15: Testing Strategy

> **Comprehensive testing pyramid**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 91 | **Vitest Setup** | Test runner configuration | Build tool |
| 92 | **Unit Testing** | Reducers, selectors, utilities | Vitest |
| 93 | **Hook Testing** | `renderHook`, `act()` | Custom hooks + testing |
| 94 | **Component Testing (RTL)** | React Testing Library | Components + Vitest |
| 95 | **Mock Service Worker (MSW)** | API mocking for tests | Testing + API layer |
| 96 | **Integration Tests** | Redux + component flows | Unit tests mastery |
| 97 | **E2E Tests (Playwright)** | Critical user flows | Full app working |
| 98 | **Visual Regression** | Screenshot comparison | E2E setup |

### Project Implementation
- [vitest.config.ts](vitest.config.ts) - Test configuration
- [src/store/slices/cartSlice.test.ts](src/store/slices/cartSlice.test.ts) - Reducer tests
- [src/hooks/useFetch.test.ts](src/hooks/useFetch.test.ts) - Hook tests
- [src/test/mocks/](src/test/mocks/) - MSW handlers
- [src/test/integration/checkout-flow.test.ts](src/test/integration/checkout-flow.test.ts) - Integration
- [e2e/critical-flows.spec.ts](e2e/critical-flows.spec.ts) - E2E tests
- [e2e/visual-regression.spec.ts](e2e/visual-regression.spec.ts) - Visual regression

### Testing Pyramid
```
       /\
      /E2E\          <- Few, slow, high confidence
     /------\
    /Integration\    <- More, medium speed
   /--------------\
  /  Unit Tests    \ <- Many, fast, focused
 /------------------\
```

### Coverage Targets
- Unit tests for core business logic: **60-70%**
- Integration tests for critical flows
- E2E tests for happy paths

---

## Level 16: Real-time & Offline

> **Modern web capabilities for enhanced UX**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 99 | **WebSocket Manager** | Real-time updates, reconnection | API layer |
| 100 | **useWebSocket Hook** | WebSocket as hook | WebSocket manager |
| 101 | **Service Worker** | PWA, offline support | Advanced |
| 102 | **Offline Queue** | Action queue, background sync | Service Worker |

### Project Implementation
- [src/utils/websocket.ts](src/utils/websocket.ts) - WebSocket manager
- [src/utils/serviceWorker.ts](src/utils/serviceWorker.ts) - Service Worker

### Interview Discussion Points
- **Real-time use cases**: Order status, inventory updates, chat
- **Offline strategy**: Queue operations, sync when online
- **PWA benefits**: App-like experience, faster loads, offline support

---

## Level 17: Developer Experience & Tooling

> **Productivity tools and documentation**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 103 | **Husky Pre-commit Hooks** | lint-staged, commit validation | Git + ESLint |
| 104 | **TypeDoc** | API documentation from JSDoc | TypeScript |
| 105 | **Storybook** | Component documentation, visual testing | Component library |
| 106 | **Bundle Analyzer** | CI integration | Build tool |

### Project Implementation
- [.husky/](.husky/) - Pre-commit hooks
- [.lintstagedrc.json](.lintstagedrc.json) - Staged file linting
- [typedoc.json](typedoc.json) - Documentation config
- [.storybook/](.storybook/) - Storybook configuration

### Available Scripts
```bash
npm run docs         # Generate TypeDoc documentation
npm run storybook    # Start Storybook
npm run build:analyze # Analyze bundle size
```

---

## Level 18: Architecture & Documentation

> **System design and decision documentation**

| # | Concept | Description | Dependencies |
|---|---------|-------------|--------------|
| 107 | **ADR Documentation** | Architecture Decision Records | All decisions made |
| 108 | **SPA vs MPA vs Microfrontends** | Architecture choice | System design |
| 109 | **Module Federation** | Microfrontends (discussion) | Advanced architecture |

### Project Documentation
- [DECISIONS.md](DECISIONS.md) - Architecture Decision Records
- [REACT_ECOM_MASTER_PLAN.md](REACT_ECOM_MASTER_PLAN.md) - Project plan
- [INTERVIEW_CONCEPTS.md](INTERVIEW_CONCEPTS.md) - Interview preparation

### Key ADRs
| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | SPA with React | Rich interactivity, fast navigation |
| ADR-002 | Redux Toolkit | DevTools, middleware, team familiarity |
| ADR-003 | RHF + Zod | Performance, TypeScript-first |
| ADR-004 | URL State for Filters | Shareability, bookmarking, SEO |
| ADR-005 | Token in Memory | Security for demo, HttpOnly for production |

---

## 📈 Visual Dependency Flow

```
HTML/CSS/JS → TypeScript → Vite/Tooling
                   ↓
         React Fundamentals (Components, Hooks)
                   ↓
         Component Architecture (Atomic, forwardRef)
                   ↓
         Routing (React Router, Layouts)
                   ↓
         ┌────────┴────────┐
         ↓                 ↓
   State Management    Code Splitting
   (Redux Toolkit)     (lazy, Suspense)
         ↓                 ↓
         └────────┬────────┘
                  ↓
         Data Fetching (API Client, useFetch)
                  ↓
         Form Handling (RHF + Zod)
                  ↓
         ┌───────┬┴──────┬─────────┐
         ↓       ↓       ↓         ↓
       Auth   UI/UX   A11y    Security
         ↓       ↓       ↓         ↓
         └───────┴───────┴─────────┘
                  ↓
         Advanced Patterns (Compound, HOC, State Machine)
                  ↓
         Performance (Virtual Scroll, Optimistic)
                  ↓
         Testing (Unit → Integration → E2E)
                  ↓
         Real-time & Offline (WebSocket, Service Worker)
                  ↓
         Documentation & Architecture (ADRs, Storybook)
```

---

## 🎯 Interview Quick Reference

### "Why did you choose X over Y?"

| Decision | Reasoning |
|----------|-----------|
| Redux vs Zustand | DevTools, middleware, team familiarity |
| React Hook Form vs Formik | Performance, uncontrolled components |
| Vite vs Webpack | Speed, DX, ESBuild |
| Tailwind vs CSS-in-JS | Utility-first, no runtime, bundle size |
| Zod vs Yup | TypeScript-first, inference |

### "How would you scale this?"

| Challenge | Strategy |
|-----------|----------|
| Large product catalog | Server-side search, virtual scrolling |
| Multiple teams | Microfrontends, module federation |
| High traffic | CDN, caching, SSR for SEO pages |
| Complex forms | Form builder, schema-driven UI |
| Real-time features | WebSockets, optimistic updates |

### "What would you do differently?"

| Current | Improvement |
|---------|-------------|
| Custom useFetch | React Query for caching |
| Client-side search | Server-side with Elasticsearch |
| Memory token | HttpOnly cookies |
| Console logging | Sentry + LogRocket |

---

## 📚 Related Documentation

- [REACT_ECOM_MASTER_PLAN.md](REACT_ECOM_MASTER_PLAN.md) - 7-day execution plan
- [INTERVIEW_CONCEPTS.md](INTERVIEW_CONCEPTS.md) - Interview preparation
- [DECISIONS.md](DECISIONS.md) - Architecture Decision Records
- [docs/CSP_SECURITY.md](docs/CSP_SECURITY.md) - Security headers guide
- [README.md](README.md) - Project overview
