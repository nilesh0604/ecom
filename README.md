# eCom - React E-Commerce Monorepo

A production-ready e-commerce application built as a **monorepo** using **Nx** and **Lerna**. Features React 18, TypeScript, Redux Toolkit, and Tailwind CSS.

> **📚 Monorepo Documentation**: See [README.monorepo.md](README.monorepo.md) for detailed monorepo setup, commands, and structure.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start web app development
npm run dev

# View dependency graph
npm run graph
```

## 📁 Structure

```
ecom/
├── apps/
│   └── web/                  # React frontend
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   ├── shared-utils/         # Shared utilities
│   └── ui-components/        # Shared UI components
├── nx.json                   # Nx config
├── lerna.json                # Lerna config
└── package.json              # Root workspace
```

## 🚀 Features

### Core Functionality
- **Product Discovery**: Browse, search, filter, and sort products
- **Product Details**: Full product information with image gallery and reviews
- **Shopping Cart**: Add, update, remove items with localStorage persistence
- **Checkout Flow**: Multi-step wizard with form validation
- **Authentication**: Login/Register with protected routes
- **Order History**: View past orders and order details

### DTC (Direct-to-Consumer) Features
- **Gift Options**: Gift wrapping (free/paid), gift messages, gift receipts, recipient notifications
- **Waitlist/Notify Me**: Email capture for out-of-stock items, variant preferences, member priority messaging
- **Brand Storytelling**: Full-screen hero with animations, About page with timeline & team, Featured collections
- **Enhanced Product Gallery**: High-resolution zoom on hover, full-screen lightbox, image navigation
- **Size Guide**: Size charts for clothing & shoes, measurement guide with illustrations, US/UK/EU comparison
- **Express Checkout**: Apple Pay, Google Pay, PayPal Express integration, saved payment methods
- **Order Tracking**: Visual timeline stepper, estimated delivery countdown, carrier integration
- **Returns Portal**: Self-service returns, reason selection, prepaid labels, refund status tracking
- **SEO Optimization**: Schema markup (Product, Organization, Breadcrumb, FAQ), OpenGraph & Twitter Cards
- **Accessibility**: Skip links, high contrast mode, reduced motion support, focus trap, screen reader optimization
- **Social Authentication**: Continue with Google/Apple, One-tap sign-in, Account linking
- **Gift Cards**: Purchase digital gift cards, balance lookup, apply at checkout, scheduled delivery
- **Store Credit**: Balance display, transaction history, apply at checkout
- **Promotions & Coupons**: Promo code validation, percentage/fixed discounts, minimum spend, promotion banner
- **Inventory States**: Preorder/Backorder messaging, availability states, estimated ship dates, split shipment policy
- **Taxes & Invoices**: Tax breakdown by address, downloadable invoices/receipts, VAT/GST fields, tax exemption upload
- **Fraud Controls**: Risk scoring display, velocity check indicators, verification challenges, manual review/blocked banners
- **Customer Support**: Help Center with searchable FAQ, contact form with order association, guest order lookup, live chat trigger
- **Exchanges**: Size/variant exchange requests, exchange status tracking, instant exchange policy, eligibility checker
- **Search & Merchandising**: Instant search with suggestions, search results grid, featured collections, zero-results help
- **Privacy & Consent**: Cookie consent banner/modal, granular cookie preferences, marketing opt-in management, data export/delete requests
- **Membership Program**: Free membership tier, member-only pricing, early access, birthday rewards, exclusive products
- **Subscriptions**: Subscribe & save with frequency selection, subscription management portal, starter kits, reorder reminders
- **Recommendations**: Complete the look, frequently bought together, post-add-to-cart suggestions, checkout upsells
- **Limited Drops**: Drop calendar with countdown, draw/lottery entry, member early access, notification system
- **User-Generated Content**: Photo/video reviews, UGC gallery, community gallery, social media integration, moderation queue

### Technical Highlights
- **Type Safety**: Full TypeScript with no `any` types
- **State Management**: Redux Toolkit with memoized selectors
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router with lazy loading and code splitting
- **Styling**: Tailwind CSS with dark mode support
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Performance**: Web Vitals monitoring, optimized bundle size

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript 5.x |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Redux Toolkit |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Testing Library |
| API | Fetch + Custom apiClient |

## 🏗️ Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── cart/           # Cart-related components
│   ├── checkout/       # Checkout flow components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── orders/         # Order management components
│   ├── product/        # Product listing/detail components
│   └── ui/             # Atomic UI components (Button, Modal, Toast)
├── config/             # App configuration
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── layouts/            # Page layout wrappers
├── pages/              # Route page components
├── routes/             # React Router configuration
├── services/           # API service layer
├── store/              # Redux store configuration
│   ├── middleware/     # Custom Redux middleware
│   ├── selectors/      # Memoized selectors
│   └── slices/         # Redux Toolkit slices
├── test/               # Test utilities and setup
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
\`\`\`

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ecom

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run docs         # Generate TypeDoc documentation
npm run docs:watch   # Generate docs and watch for changes
npm run docs:serve   # Generate and serve docs locally
\`\`\`

## 📚 Documentation

### Project Documentation

This project includes comprehensive documentation across multiple files:

| Document | Description |
|----------|-------------|
| [REACT_ECOM_MASTER_PLAN.md](REACT_ECOM_MASTER_PLAN.md) | Master plan and roadmap for the React e-commerce application |
| [BACKEND_API_REQUIREMENTS.md](BACKEND_API_REQUIREMENTS.md) | Backend API specifications and requirements |
| [FRONTEND_CONCEPTS.md](FRONTEND_CONCEPTS.md) | Frontend architecture concepts and patterns |
| [INTERVIEW_CONCEPTS.md](INTERVIEW_CONCEPTS.md) | Key concepts for tech lead interviews |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions and rationale |
| [DEPENDENCIES.md](DEPENDENCIES.md) | Project dependencies and their purposes |
| [docs/CSP_SECURITY.md](docs/CSP_SECURITY.md) | Content Security Policy configuration guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines and code style |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions for various platforms |
| [TESTING.md](TESTING.md) | Testing strategy and best practices |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |

### API Documentation

This project uses [TypeDoc](https://typedoc.org/) for generating API documentation from JSDoc comments.

### Generating Documentation

\`\`\`bash
# Generate docs (outputs to ./docs folder)
npm run docs

# Generate and serve locally
npm run docs:serve
\`\`\`

### Documentation Standards

All public APIs are documented with JSDoc comments including:
- **Description**: What the function/component does
- **@param**: Parameter types and descriptions
- **@returns**: Return type and description
- **@example**: Usage examples
- **@see**: Related functions or documentation

Example:
\`\`\`typescript
/**
 * Format a number as currency
 * 
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$29.99")
 * 
 * @example
 * formatCurrency(29.99) // "$29.99"
 */
export function formatCurrency(amount: number, currency?: string): string
\`\`\`

## 🧪 Testing

The project uses Vitest with React Testing Library for testing.

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
\`\`\`

### Test Structure
- Unit tests for hooks, utilities, and Redux slices
- Integration tests for cart and checkout flows
- Component tests for UI components

## 🎨 UI Components

### Feedback Components (Day 7)
- **Toast**: Ephemeral notifications for actions (success, error, warning, info)
- **Alert**: Inline contextual messages
- **Modal**: Accessible dialog overlay with focus trap

### Usage Examples

\`\`\`tsx
// Toast notifications
import { useToast } from '@/hooks';

const MyComponent = () => {
  const toast = useToast();
  
  const handleAction = () => {
    toast.success('Item added to cart!');
    toast.error('Something went wrong');
    toast.warning('Low stock warning');
    toast.info('Processing...');
  };
};

// Modal
import { Modal, ConfirmModal } from '@/components/ui';

<Modal isOpen={isOpen} onClose={onClose} title="Modal Title">
  <p>Modal content here</p>
</Modal>

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Delete Item?"
  message="Are you sure you want to delete this item?"
  variant="destructive"
/>

// Alert
import { Alert } from '@/components/ui';

<Alert variant="warning" title="Warning">
  This action cannot be undone.
</Alert>
\`\`\`

## ⚡ Performance

### Web Vitals Monitoring
The app includes built-in Core Web Vitals monitoring:
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1

### Optimization Strategies
- Route-level code splitting with \`React.lazy\`
- Memoized selectors for Redux state
- Image lazy loading
- Debounced search inputs

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Skip links for main content
- Focus management in modals
- Color contrast compliance

### Accessibility Utilities

\`\`\`tsx
import { 
  announceToScreenReader,
  trapFocus,
  calculateContrastRatio 
} from '@/utils/a11y';

// Announce to screen readers
announceToScreenReader('Item added to cart', 'polite');

// Check color contrast
const ratio = calculateContrastRatio('#000000', '#FFFFFF'); // 21:1
\`\`\`

## 🔒 Security

- Form input validation with Zod schemas
- XSS prevention through React's built-in escaping
- Security headers via React Helmet
- Cart data validation on localStorage hydration
- No secrets in client bundle

## � CI/CD Pipeline

### Pre-commit Hooks
Add these to your `.husky/pre-commit` file:
\`\`\`bash
npm run lint
npm run test:run
\`\`\`

### GitHub Actions Workflow
\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
      - run: npm audit --audit-level=high
\`\`\`

## 📝 Architecture Decisions

### State Management
- Redux Toolkit for global state (cart, auth, ui)
- React Hook Form for form state
- URL params for filter/search state (shareable links)

### API Layer
- Custom \`apiClient\` wrapper with error normalization
- TypeScript interfaces for all API responses
- AbortController for request cancellation

### Code Organization
- Feature-based component organization
- Centralized type definitions
- Reusable hooks for common patterns

## 📊 Observability

### Error Tracking (Planned)
\`\`\`tsx
// Future Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
\`\`\`

### Session Replay (Planned)
\`\`\`tsx
// Future LogRocket integration
import LogRocket from 'logrocket';

if (process.env.NODE_ENV === 'production') {
  LogRocket.init('app-id');
}
\`\`\`

## 🛣️ Roadmap

- [ ] Add E2E tests with Playwright
- [ ] Implement Sentry error tracking
- [ ] Add PWA support
- [ ] Implement server-side search
- [ ] Add product recommendations

## 📄 License

MIT License - see LICENSE file for details
