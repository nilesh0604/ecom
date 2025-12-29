# Changelog

All notable changes to the eCom project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Wishlist functionality
- Product recommendations
- Sentry error tracking integration
- PWA support with offline mode

---

## [1.3.0] - 2025-12-26

### Added - Complete DTC Full-Stack Implementation

#### Product Customization Frontend (apps/web/src/components/customization/)
- `ColorSelector` - Interactive color swatch picker with hover preview
- `MaterialSelector` - Material options in grid/list layouts with pricing
- `EngravingInput` - Engraving/monogram input with font selection & live preview
- `CustomizationPriceSummary` - Real-time price breakdown display
- `ProductCustomizer` - Complete tabbed customizer combining all options

#### Product Story Page Frontend (apps/web/src/components/product-story/)
- `FeatureHighlight` - Feature sections with grid/alternating (Apple-style) layouts
- `ProductComparison` - Side-by-side model comparison table
- `TechnicalSpecsAccordion` - Expandable accordion for technical specifications
- `WhatsInTheBox` - Package contents display with multiple layout options
- `ProductHeroSection` - Full-screen hero with video background support

#### Content Studio / Blog Backend
- `ContentService` - Full article CRUD, categories, analytics, shoppable content
- `ContentController` - REST API handlers for content management
- Content routes at `/api/v1/content`
- Prisma models: `Article`, `ContentCategory`, `ArticleProduct`
- Shoppable content linking articles to products

#### Content Studio / Blog Frontend (apps/web/src/components/blog/)
- `ArticleCard` - Article preview card with multiple variants (default, horizontal, featured, minimal)
- `ArticleList` - Article grid/list with filtering, search, and pagination
- `ArticleDetail` - Full article view with shoppable product sidebar
- `JournalHero` - Hero section for "The Journal" blog landing page
- `ShoppableArticle` - Inline shoppable content in various layouts (carousel, grid, spotlight)

#### Email Templates Backend (apps/api/src/services/email.service.ts)
- `sendAbandonedCartEmail` - Cart recovery with product images
- `sendBirthdayRewardEmail` - Birthday reward notification with gradient design
- `sendBackInStockEmail` - Stock notification with urgency messaging
- `sendSubscriptionReminderEmail` - Upcoming delivery reminder
- `sendReviewRequestEmail` - Post-purchase review request with points incentive
- `sendLoyaltyPointsEarnedEmail` - Points earned notification
- `sendReferralInviteEmail` - Referral invitation email
- `sendDropNotificationEmail` - Limited drop reminder with dark theme

#### Subscription Frontend (apps/web/src/components/subscription/)
- `SubscriptionPlanCard` - Display plan with frequency selection and features
- `SubscriptionManager` - Full dashboard to manage active subscriptions (skip, pause, edit)
- `SubscriptionCheckout` - Multi-step checkout flow for creating subscriptions

#### Drops & Limited Editions Frontend (apps/web/src/components/drops/)
- `DropCountdown` - Live countdown timer for upcoming drops
- `DropProductCard` - Product card with stock urgency, draw entry, access badges
- `DropBanner` - Full-width promotional banner for drops
- `DrawEntryModal` - Modal for entering product raffles/draws

#### Loyalty Program Frontend (apps/web/src/components/loyalty/)
- `LoyaltyDashboard` - Full dashboard with points, tier progress, rewards, activity
- `RewardsGrid` - Available rewards grid with filtering and redemption
- `TierProgress` - Visual tier progress with horizontal/vertical/cards layouts

#### Referral Program Frontend (apps/web/src/components/referral/)
- `ReferralDashboard` - Complete dashboard with code sharing, stats, social sharing
- `ReferralBanner` - Promotional banner with full/compact/inline variants
- `ReferralCodeInput` - Input field for applying referral codes at checkout

### Changed
- Extended Prisma schema with Article, ContentCategory, ArticleProduct models
- Updated User model with articles relation
- Updated Product model with articleProducts relation
- Updated routes/index.ts to include content routes

---

## [1.2.0] - 2025-12-26

### Added - DTC Backend Features (Phase 2)

#### Subscription Orders Backend
- `SubscriptionService` - Full subscription lifecycle (create, pause, resume, cancel, skip)
- `SubscriptionController` - REST API handlers for subscription management
- Subscription routes at `/api/v1/subscriptions`
- Stripe integration for recurring payments
- Prisma models: `Subscription`, `SubscriptionItem`

#### Product Customization Backend
- `CustomizationService` - Options management, validation, pricing calculations
- `CustomizationController` - REST API handlers
- Customization routes at `/api/v1/customization`
- Support for engraving, monogram, color, and material customizations
- Prisma models: `ProductCustomization`, `CustomizationOption`, `OrderCustomization`

#### Limited Drops Backend
- `DropsService` - Drop management, draw/lottery system, access control
- `DropsController` - REST API handlers
- Drops routes at `/api/v1/drops`
- Support for standard, draw, member-exclusive, and early-access drops
- Prisma models: `ProductDrop`, `DropProduct`, `DrawEntry`, `DropNotification`

#### User-Generated Content Backend
- `UGCService` - Content submission, moderation, social media import
- `UGCController` - REST API handlers
- UGC routes at `/api/v1/ugc`
- Support for photos, videos, and social media integration
- Prisma model: `UserGeneratedContent`

### Changed
- Updated `routes/index.ts` to include all new DTC route modules
- Extended Prisma schema with new DTC models and relations
- Added `stripeCustomerId` field to User model for subscription payments

---

## [1.0.0] - 2025-12-25

### Added

#### Core Features
- **Product Discovery**: Browse, search, filter, and sort products
- **Product Details**: Full product information with image gallery and reviews
- **Shopping Cart**: Add, update, remove items with localStorage persistence
- **Checkout Flow**: Multi-step wizard with form validation (Shipping → Payment → Review → Confirmation)
- **Authentication**: Login/Register with protected routes
- **Order History**: View past orders and order details
- **Theme Support**: Dark/Light mode with system preference detection

#### Components
- Atomic UI components: Button, Input, Badge, Modal, Toast, Alert, Spinner
- Product components: ProductCard, ProductGrid, ProductGallery, ProductSkeleton
- Cart components: CartDrawer, CartItem, CartSummary
- Checkout components: CheckoutWizard, ShippingForm, PaymentForm, OrderSummary
- Auth components: LoginForm, RegisterForm, ProtectedRoute, UserProfileDropdown
- Layout components: Navbar, Footer, MobileMenu, Breadcrumbs, ThemeToggle
- Advanced components: VirtualList, OptimizedImage, Tabs (compound component)

#### State Management
- Redux Toolkit store with slices: cart, auth, products, ui
- Memoized selectors for cart totals and filtered products
- Cart persistence middleware with localStorage
- Typed hooks (useAppDispatch, useAppSelector)

#### Custom Hooks
- `useFetch` - Data fetching with AbortController
- `useDebounce` - Debounced values for search
- `useToast` - Toast notification system
- `useSearch` - Search with useTransition for non-blocking UI
- `useVirtualScroll` - Virtual scrolling for large lists
- `useInfiniteScroll` - Infinite scroll with Intersection Observer
- `useOptimistic` - Optimistic updates with rollback
- `useProductFilters` - Product filtering logic

#### Utilities
- `apiClient` - Centralized API client with retry logic
- `formatCurrency` - Currency formatting
- `sanitize` - XSS prevention utilities
- `a11y` - Accessibility helpers (focus trap, screen reader announcements)
- `webVitals` - Core Web Vitals monitoring
- `requestDeduplication` - Prevent duplicate API requests
- `routePrefetch` - Route prefetching on hover/viewport
- `featureFlags` - Feature flag system
- `stateMachine` - State machine pattern implementation
- `websocket` - WebSocket manager with reconnection
- `serviceWorker` - Service worker utilities for offline support

#### Testing
- Unit tests for Redux slices and selectors
- Hook tests with React Testing Library
- Component tests
- Integration tests for cart and checkout flows
- E2E tests with Playwright
- Visual regression tests
- MSW (Mock Service Worker) setup for API mocking

#### Documentation
- Comprehensive README with features and setup instructions
- Architecture Decisions (DECISIONS.md) with 10 ADRs
- Backend API Requirements (BACKEND_API_REQUIREMENTS.md)
- Frontend Concepts Guide (FRONTEND_CONCEPTS.md)
- Interview Concepts (INTERVIEW_CONCEPTS.md)
- Dependencies Documentation (DEPENDENCIES.md)
- CSP Security Guide (docs/CSP_SECURITY.md)
- TypeDoc API documentation

#### DevOps & Tooling
- Vite 7 with React plugin
- TypeScript 5.x with strict mode
- ESLint with React Hooks and Prettier plugins
- Tailwind CSS 4 for styling
- Husky pre-commit hooks with lint-staged
- Bundle analyzer (rollup-plugin-visualizer)
- Storybook for component documentation
- Playwright for E2E testing

### Technical Highlights
- **Zero `any` types** - Full TypeScript coverage
- **WCAG 2.1 AA** - Accessible with keyboard navigation
- **Web Vitals** - LCP < 2.5s target
- **Bundle budget** - < 250kb gzipped
- **Code splitting** - Route-level lazy loading

---

## [0.1.0] - 2025-12-18

### Added
- Initial project setup with Vite + React + TypeScript
- Basic folder structure
- ESLint and Prettier configuration
- Tailwind CSS integration
- React Router setup with lazy loading
- Redux store scaffold

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-12-25 | Full e-commerce MVP with all core features |
| 0.1.0 | 2025-12-18 | Initial project scaffolding |

---

## How to Update This Changelog

When making changes:

1. Add entries under `[Unreleased]` section
2. Use these categories:
   - `Added` - New features
   - `Changed` - Changes in existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Vulnerability fixes

3. When releasing, move `[Unreleased]` items to a new version section

### Example Entry

```markdown
## [Unreleased]

### Added
- Wishlist page with save for later functionality (#123)

### Fixed
- Cart quantity not updating on slow networks (#124)
```
