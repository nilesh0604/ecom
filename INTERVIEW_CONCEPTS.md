# Frontend Interview Concepts Coverage

A comprehensive checklist of frontend concepts for Dev, Tech Lead, and Architect interviews. This document maps concepts to implementations in this codebase and identifies gaps.

---

## 📊 Coverage Summary

| Category | Implemented | Partially | Missing |
|----------|-------------|-----------|---------|
| Core React | 13/14 | 1 | 0 |
| State Management | 8/9 | 1 | 0 |
| Performance | 12/12 | 0 | 0 |
| Architecture | 9/10 | 1 | 0 |
| Testing | 9/9 | 0 | 0 |
| Security | 7/7 | 0 | 0 |
| Accessibility | 7/8 | 1 | 0 |
| Advanced Patterns | 9/10 | 0 | 1 |
| Build & Tooling | 10/10 | 0 | 0 |
| API & Data Fetching | 9/9 | 0 | 0 |

---

## 1. Core React Concepts

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Functional Components** | All components | Class vs Function, hooks migration |
| **Class Components** | [ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) | Error boundaries require classes (for now) |
| **useState/useEffect** | Throughout | Dependency arrays, cleanup functions |
| **useReducer** | [Checkout.tsx](src/pages/Checkout.tsx#L126) | Complex state, when to use vs useState |
| **useCallback/useMemo** | [Products.tsx](src/pages/Products.tsx), [Orders.tsx](src/pages/Orders.tsx) | Referential equality, over-optimization |
| **useRef** | [useFetch.ts](src/hooks/useFetch.ts) | Mutable refs, DOM refs, AbortController |
| **useContext** | [ThemeContext.tsx](src/context/ThemeContext.tsx) | Context pitfalls, performance |
| **Custom Hooks** | [useFetch](src/hooks/useFetch.ts), [useDebounce](src/hooks/useDebounce.ts), [useToast](src/hooks/useToast.ts) | Encapsulation, reusability |
| **forwardRef** | [Input.tsx](src/components/ui/Input.tsx), [Button.tsx](src/components/ui/Button.tsx) | Form libraries, imperative handle |
| **Error Boundaries** | [ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) | Fallback UI, error recovery |
| **React.lazy + Suspense** | [routes/index.tsx](src/routes/index.tsx) | Code splitting, loading states |
| **Portals** | [Modal.tsx](src/components/ui/Modal.tsx), [ToastContainer.tsx](src/components/ui/ToastContainer.tsx) | Z-index, event bubbling |

### ⚠️ Partial Implementation

| Concept | Status | Recommendation |
|---------|--------|----------------|
| **useId** | Used in [Input.tsx](src/components/ui/Input.tsx) | Document SSR implications |

### ✅ Recently Added

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **useTransition** | [useSearch.ts](src/hooks/useSearch.ts) | Non-blocking updates, isPending state |

---

## 2. State Management

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Redux Toolkit** | [store/](src/store/) | Why RTK over vanilla Redux |
| **createSlice** | [cartSlice](src/store/slices/cartSlice.ts), [authSlice](src/store/slices/authSlice.ts) | Immer, reducers, actions |
| **Memoized Selectors** | [cartSelectors.ts](src/store/selectors/cartSelectors.ts) | Reselect, input/output selectors |
| **Redux Middleware** | [cartPersistence.ts](src/store/middleware/cartPersistence.ts) | Custom middleware pattern |
| **Typed Hooks** | [hooks.ts](src/store/hooks.ts) | useAppDispatch, useAppSelector |
| **Form State** | React Hook Form | Server state vs form state |
| **URL State** | useSearchParams | Shareable links, SEO |
| **Context for Theme** | [ThemeContext.tsx](src/context/ThemeContext.tsx) | When Context vs Redux |

### ⚠️ Add Discussion Points

| Concept | Status | Interview Discussion |
|---------|--------|---------------------|
| **Server State vs Client State** | Documented | When to use React Query/RTK Query vs Redux |

---

## 3. Performance Optimization

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Code Splitting** | [routes/index.tsx](src/routes/index.tsx) | Route-based splitting, bundle analysis |
| **Lazy Loading Routes** | React.lazy() | Network waterfall, prefetching |
| **Memoized Selectors** | createSelector | Preventing re-renders |
| **useCallback for Handlers** | Products.tsx, Checkout.tsx | Stable references |
| **useMemo for Computed** | filteredProducts, cartTotal | Expensive calculations |
| **Debounced Search** | [useDebounce.ts](src/hooks/useDebounce.ts) | API call optimization |
| **Web Vitals Monitoring** | [webVitals.ts](src/utils/webVitals.ts) | LCP, FID, CLS targets |

### ⚠️ Partial - Enhance These

| Concept | Status | Recommendation |
|---------|--------|----------------|
| **Image Optimization** | Basic | Add lazy loading, WebP, responsive images |
| **Bundle Size Monitoring** | Planned | Add bundle analyzer to CI |

### ✅ Recently Added

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **React.memo** | [ProductCard.tsx](src/components/product/ProductCard.tsx) | Custom areEqual function, when to use |
| **Optimistic Updates** | [useOptimistic.ts](src/hooks/useOptimistic.ts) | Rollback pattern, UX improvement |
| **Virtual Scrolling** | [useVirtualScroll.ts](src/hooks/useVirtualScroll.ts), [VirtualList.tsx](src/components/ui/VirtualList.tsx) | Windowing technique, performance |
| **Route Prefetching** | [routePrefetch.ts](src/utils/routePrefetch.ts) | Hover prefetch, viewport prefetch |
| **Infinite Scroll** | [useInfiniteScroll.ts](src/hooks/useInfiniteScroll.ts) | Intersection Observer, pagination alternative |
| **Image Optimization** | [OptimizedImage.tsx](src/components/ui/OptimizedImage.tsx) | Lazy loading, srcset, blur placeholder, WebP |

---

## 4. Architecture & Design

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **SPA Architecture** | [ADR-001](DECISIONS.md) | SPA vs MPA vs Microfrontends |
| **Component Organization** | [ADR-006](DECISIONS.md) | Feature-based vs Atomic Design |
| **API Client Pattern** | [apiClient.ts](src/utils/apiClient.ts) | Centralized config, error handling |
| **Service Layer** | [services/](src/services/) | Separation of concerns |
| **Type-Safe Contracts** | [types/](src/types/) | No `any`, shared interfaces |
| **ADR Documentation** | [DECISIONS.md](DECISIONS.md) | Documenting trade-offs |
| **Nested Layouts** | [layouts/](src/layouts/) | Composition, route nesting |
| **Environment Config** | [config/index.ts](src/config/index.ts) | Validation, feature flags |

### ⚠️ Document for Discussion

| Concept | Status | Interview Discussion |
|---------|--------|---------------------|
| **Module Federation** | Not implemented | When to use, microfrontends trade-offs |

### ❌ Missing - Add These

| Concept | Priority | Implementation Suggestion |
|---------|----------|--------------------------|
| **Dependency Injection** | Low | Document pattern for service testing |

---

## 5. Advanced React Patterns

### ✅ Implemented

| Pattern | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Custom Hooks** | hooks/ folder | Encapsulation, testing |
| **Compound Components** | Modal (partial) | Shared state, flexible API |
| **Container/Presenter** | Pages vs Components | Smart/dumb components |
| **Protected Routes** | [ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx) | Auth HOC pattern |

### ⚠️ Partial - Enhance These

| Pattern | Status | Recommendation |
|---------|--------|----------------|
| **State Machine** | Not demonstrated | Add XState for checkout flow (alternative) |

### ✅ Recently Added

| Pattern | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Compound Components** | [Tabs.tsx](src/components/ui/Tabs.tsx) | Context sharing, flexible API, ARIA |
| **Feature Flags** | [featureFlags.ts](src/utils/featureFlags.ts) | FeatureGate component, environment override |
| **Render Props** | [RenderProps.tsx](src/components/ui/RenderProps.tsx) | MouseTracker, Toggle, Fetcher, SelectableList |
| **HOC Pattern** | [hoc.tsx](src/utils/hoc.tsx) | withLoading, withAuth, withErrorBoundary, withAnalytics |
| **State Machine** | [stateMachine.ts](src/utils/stateMachine.ts) | XState-like patterns, useMachine hook, checkout flow |

---

## 6. Testing Strategy

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Unit Tests** | [cartSlice.test.ts](src/store/slices/cartSlice.test.ts) | Reducer testing, pure functions |
| **Hook Testing** | [useFetch.test.ts](src/hooks/useFetch.test.ts), [useDebounce.test.ts](src/hooks/useDebounce.test.ts) | renderHook, act() |
| **Component Tests** | [ProtectedRoute.test.tsx](src/components/auth/ProtectedRoute.test.tsx) | RTL, user interactions |
| **Selector Tests** | [cartSelectors.test.ts](src/store/selectors/cartSelectors.test.ts) | Memoization verification |
| **Utility Tests** | [formatCurrency.test.ts](src/utils/formatCurrency.test.ts) | Pure function testing |

### ✅ Recently Added

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **E2E Tests** | [e2e/critical-flows.spec.ts](e2e/critical-flows.spec.ts) | Playwright, critical user flows |
| **Mock Service Worker** | [test/mocks/](src/test/mocks/) | MSW handlers, server/browser setup |
| **Integration Tests** | [checkout-flow.test.ts](src/test/integration/checkout-flow.test.ts) | Cart to checkout flow, state management testing |
| **Visual Regression** | [visual-regression.spec.ts](e2e/visual-regression.spec.ts) | Playwright screenshots, responsive testing |

---

## 7. Security

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Zod Validation** | checkout/, auth forms | Schema validation |
| **localStorage Validation** | [cartPersistence.ts](src/store/middleware/cartPersistence.ts) | Prevent corrupted data |
| **Security Headers** | react-helmet-async | Helmet for meta security |
| **No Secrets in Bundle** | [config/index.ts](src/config/index.ts) | Environment variables |
| **Token Strategy Doc** | [ADR-005](DECISIONS.md) | HttpOnly cookies discussion |
| **CSP Documentation** | [CSP_SECURITY.md](docs/CSP_SECURITY.md) | Content-Security-Policy headers, nonces |
| **Input Sanitization** | [sanitize.ts](src/utils/sanitize.ts) | XSS prevention, HTML sanitization, SafeHtml component |

---

## 8. Accessibility (A11y)

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Semantic HTML** | All components | nav, main, article, button |
| **ARIA Labels** | Modal, buttons | When to use, common patterns |
| **Keyboard Navigation** | Modal focus trap | Tab order, focus management |
| **Skip Links** | MainLayout | Screen reader navigation |
| **Color Contrast** | [a11y.ts](src/utils/a11y.ts) | WCAG AA (4.5:1) |
| **Screen Reader Announce** | [a11y.ts](src/utils/a11y.ts) | aria-live regions |
| **Focus Trap** | [Modal.tsx](src/components/ui/Modal.tsx) | Modal accessibility |

### ⚠️ Partial - Enhance These

| Concept | Status | Recommendation |
|---------|--------|----------------|
| **Form Error Announcements** | Basic | Add aria-describedby consistently |

---

## 9. Build & Tooling

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Vite** | vite.config.ts | ESBuild, HMR, vs Webpack |
| **TypeScript** | tsconfig.json | Strict mode, path aliases |
| **ESLint** | eslint.config.js | Code quality, custom rules |
| **Tailwind CSS** | tailwind.config.js | Utility-first, tree shaking |
| **Path Aliases** | @/ imports | DX, refactoring |
| **TypeDoc** | typedoc.json | API documentation |
| **Husky Pre-commit** | [.husky/](/.husky/) | lint-staged, commit-msg validation |
| **Bundle Analyzer** | [vite.config.ts](vite.config.ts) | rollup-plugin-visualizer, chunk splitting |
| **Playwright E2E** | [playwright.config.ts](playwright.config.ts) | Multi-browser testing, CI integration |
| **Storybook** | [.storybook/](.storybook/) | Component documentation, visual testing |

---

## 10. API & Data Fetching

### ✅ Implemented

| Concept | Location | Interview Discussion Points |
|---------|----------|---------------------------|
| **Custom apiClient** | [apiClient.ts](src/utils/apiClient.ts) | Centralized, typed |
| **AbortController** | useFetch | Request cancellation |
| **Error Normalization** | ApiError type | Consistent error shapes |
| **Service Abstraction** | services/ folder | Decoupling from components |
| **Retry Logic** | [apiClient.ts](src/utils/apiClient.ts) | Exponential backoff with jitter |
| **Request Deduplication** | [requestDeduplication.ts](src/utils/requestDeduplication.ts) | Prevent duplicate requests, cache |
| **Optimistic Updates** | [useOptimistic.ts](src/hooks/useOptimistic.ts) | Rollback on failure, UX improvement |
| **WebSocket Manager** | [websocket.ts](src/utils/websocket.ts) | Real-time updates, reconnection, useWebSocket hook |
| **Offline Support** | [serviceWorker.ts](src/utils/serviceWorker.ts) | Service Worker, offline queue, background sync |

---

## 11. Real-World Scenarios (System Design)

### Topics to Discuss in Interviews

| Scenario | Your Implementation | Discussion Points |
|----------|-------------------|-------------------|
| **Cart Persistence** | Redux + localStorage | Sync strategies, conflicts |
| **Auth Token Storage** | Memory (demo) | HttpOnly cookies production |
| **Search Implementation** | Client-side filtering | Server-side vs client-side at scale |
| **Pagination** | Offset-based | Cursor vs offset, infinite scroll |
| **Form Wizard** | useReducer | Step validation, data persistence |
| **Error Handling** | ErrorBoundary + apiClient | Global vs local, user feedback |
| **Theme Persistence** | localStorage | System preference, CSS variables |
| **Infinite Scroll** | [useInfiniteScroll.ts](src/hooks/useInfiniteScroll.ts) | Intersection Observer, load on demand |

### ✅ Recently Added Scenarios

| Scenario | Implementation | Location |
|----------|----------------|----------|
| **Real-time Updates** | WebSocket with reconnection, order status hook | [websocket.ts](src/utils/websocket.ts) |
| **Offline Support** | Service Worker, action queue, background sync | [serviceWorker.ts](src/utils/serviceWorker.ts) |

---

## 12. Interview Talking Points by Role

### Frontend Developer

Focus on demonstrating:
1. **Hooks mastery**: Custom hooks, useEffect cleanup, dependencies
2. **State management**: Redux flow, selectors, middleware
3. **Testing**: Unit tests, RTL best practices
4. **TypeScript**: Generics, type inference, strict mode
5. **Performance basics**: Memoization, lazy loading

### Tech Lead

Focus on demonstrating:
1. **Architecture decisions**: ADRs, trade-off analysis
2. **Code organization**: Feature-based, scalability
3. **Testing strategy**: Pyramid, coverage targets
4. **Security awareness**: XSS, token storage, validation
5. **Performance monitoring**: Web Vitals, metrics

### Architect

Focus on demonstrating:
1. **System design**: Caching, CDN, SSR considerations
2. **Scalability**: Microfrontends, module federation
3. **Observability**: Error tracking, session replay
4. **Team processes**: CI/CD, code review, documentation
5. **Future-proofing**: Migration paths, technical debt

---

## 🎯 Priority Action Items

### ✅ Completed (High Priority)

1. **~~Add Compound Component Example~~** ✓
   - Created Tabs component with Context
   - Location: [Tabs.tsx](src/components/ui/Tabs.tsx)

2. **~~Add React.memo Example~~** ✓
   - Wrapped ProductCard with memo
   - Location: [ProductCard.tsx](src/components/product/ProductCard.tsx)

3. **~~Add Optimistic Updates~~** ✓
   - Implemented useOptimistic hook
   - Location: [useOptimistic.ts](src/hooks/useOptimistic.ts)

4. **~~Add E2E Test Setup~~** ✓
   - Playwright config with critical flow tests
   - Location: [playwright.config.ts](playwright.config.ts), [e2e/](e2e/)

5. **~~Add useTransition Example~~** ✓
   - Used in search for non-blocking UI
   - Location: [useSearch.ts](src/hooks/useSearch.ts)

### ✅ Completed (Medium Priority)

6. **~~Virtual Scrolling~~** ✓
   - Custom useVirtualScroll hook and VirtualList component
   - Location: [useVirtualScroll.ts](src/hooks/useVirtualScroll.ts), [VirtualList.tsx](src/components/ui/VirtualList.tsx)

7. **~~Bundle Analysis~~** ✓
   - Added rollup-plugin-visualizer with chunk splitting
   - Run: `npm run build:analyze`

8. **~~MSW for Testing~~** ✓
   - Mock API handlers for products, auth, orders
   - Location: [test/mocks/](src/test/mocks/)

9. **~~Pre-commit Hooks~~** ✓
   - Husky + lint-staged + commit message validation
   - Location: [.husky/](.husky/), [.lintstagedrc.json](.lintstagedrc.json)

10. **~~Route Prefetching~~** ✓
    - PrefetchLink component with hover/viewport prefetch
    - Location: [routePrefetch.ts](src/utils/routePrefetch.ts)

11. **~~Image Optimization~~** ✓
    - OptimizedImage with lazy loading, srcset, blur placeholder
    - Location: [OptimizedImage.tsx](src/components/ui/OptimizedImage.tsx)

12. **~~Storybook~~** ✓
    - Component documentation with stories
    - Location: [.storybook/](.storybook/), [*.stories.tsx](src/components/ui/)

13. **~~CSP Documentation~~** ✓
    - Content-Security-Policy guide
    - Location: [CSP_SECURITY.md](docs/CSP_SECURITY.md)

### Remaining Items

| Concept | Priority | Status |
|---------|----------|--------|
| **Contract Testing** | Low | Shared Zod schemas for API (optional) |

---

## 📚 Quick Reference for Interviews

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
| Manual tests | E2E with Playwright ✓ |
| No observability | Sentry + LogRocket |

---

## 🆕 New Implementations Reference

### Hooks

| Hook | Purpose | Location |
|------|---------|----------|
| `useVirtualScroll` | Virtual scrolling for large lists | [useVirtualScroll.ts](src/hooks/useVirtualScroll.ts) |
| `useInfiniteScroll` | Infinite scroll with Intersection Observer | [useInfiniteScroll.ts](src/hooks/useInfiniteScroll.ts) |
| `useOptimistic` | Optimistic updates with rollback | [useOptimistic.ts](src/hooks/useOptimistic.ts) |
| `useRoutePrefetch` | Route prefetching on hover/viewport | [routePrefetch.ts](src/utils/routePrefetch.ts) |

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `VirtualList` | Virtualized list rendering | [VirtualList.tsx](src/components/ui/VirtualList.tsx) |
| `RenderProps` | Render props pattern examples | [RenderProps.tsx](src/components/ui/RenderProps.tsx) |
| `OptimizedImage` | Lazy loading images with srcset | [OptimizedImage.tsx](src/components/ui/OptimizedImage.tsx) |

### Utilities

| Utility | Purpose | Location |
|---------|---------|----------|
| `apiClient` (retry) | Retry with exponential backoff | [apiClient.ts](src/utils/apiClient.ts) |
| `hoc` | HOC examples (withLoading, withAuth, etc.) | [hoc.tsx](src/utils/hoc.tsx) |
| `requestDeduplication` | Dedupe concurrent requests | [requestDeduplication.ts](src/utils/requestDeduplication.ts) |

### Testing

| Tool | Purpose | Location |
|------|---------|----------|
| Playwright | E2E testing | [playwright.config.ts](playwright.config.ts), [e2e/](e2e/) |
| MSW | API mocking | [test/mocks/](src/test/mocks/) |

### Build & DX

| Tool | Purpose | Location |
|------|---------|----------|
| Husky | Pre-commit hooks | [.husky/](.husky/) |
| lint-staged | Run linters on staged files | [.lintstagedrc.json](.lintstagedrc.json) |
| Bundle Analyzer | Analyze bundle size | `npm run build:analyze` |
| Storybook | Component documentation | [.storybook/](.storybook/), `npm run storybook` |

### Utilities

| Utility | Purpose | Location |
|---------|---------|----------|
| `stateMachine` | State machine pattern, useMachine hook | [stateMachine.ts](src/utils/stateMachine.ts) |
| `websocket` | WebSocket manager, useWebSocket hook | [websocket.ts](src/utils/websocket.ts) |
| `serviceWorker` | PWA support, offline queue | [serviceWorker.ts](src/utils/serviceWorker.ts) |
| `sanitize` | XSS prevention, SafeHtml component | [sanitize.ts](src/utils/sanitize.ts) |

### Testing

| Test | Purpose | Location |
|------|---------|----------|
| Integration Tests | Cart to checkout flow | [checkout-flow.test.ts](src/test/integration/checkout-flow.test.ts) |
| Visual Regression | Screenshot comparison | [visual-regression.spec.ts](e2e/visual-regression.spec.ts) |

### Documentation

| Doc | Purpose | Location |
|-----|---------|----------|
| CSP Guide | Content-Security-Policy setup | [CSP_SECURITY.md](docs/CSP_SECURITY.md) |
