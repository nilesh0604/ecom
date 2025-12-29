# @ecom/web - React Frontend

A modern, production-ready React e-commerce frontend built with TypeScript, Vite, and Tailwind CSS.

## Features

- 🛍️ **Product Browsing**: Browse, search, filter, and sort products
- 🛒 **Shopping Cart**: Full cart functionality with localStorage persistence
- 💳 **Checkout Flow**: Multi-step checkout wizard with form validation
- 🔐 **Authentication**: Login/Register with protected routes
- 📦 **Order History**: View and track past orders
- 🌓 **Dark Mode**: Full dark mode support
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 📱 **Responsive**: Mobile-first responsive design

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Redux Toolkit |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Testing Library |
| E2E Testing | Playwright |
| Documentation | Storybook, TypeDoc |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

From the monorepo root:

```bash
npm install
```

### Development

```bash
# From monorepo root
npm run dev

# Or from this directory
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Application name | `eCom` |

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run preview` | Preview production build |
| `npm run storybook` | Start Storybook on port 6006 |

### Building

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run build:analyze` | Build with bundle analyzer |
| `npm run build-storybook` | Build Storybook static site |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests in watch mode |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:e2e:headed` | Run E2E tests in headed mode |
| `npm run test:e2e:debug` | Debug E2E tests |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

### Documentation

| Command | Description |
|---------|-------------|
| `npm run docs` | Generate TypeDoc documentation |
| `npm run docs:watch` | Generate docs in watch mode |
| `npm run docs:serve` | Generate and serve docs |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── cart/           # Cart-related components
│   ├── checkout/       # Checkout flow components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── orders/         # Order management components
│   ├── product/        # Product listing/detail components
│   └── ui/             # Atomic UI components
├── config/             # App configuration
├── context/            # React Context providers
├── features/           # Feature-based modules
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
```

## Using Shared Packages

This app uses shared packages from the monorepo:

```typescript
// Shared types
import type { Product, User, CartItem } from '@ecom/shared-types';

// Shared utilities
import { formatCurrency, slugify } from '@ecom/shared-utils';

// Shared UI components
import { Button, Spinner, Badge } from '@ecom/ui-components';
```

## Nx Commands

Run commands using Nx from the monorepo root:

```bash
# Development
npx nx serve web

# Build
npx nx build web

# Test
npx nx test web

# Lint
npx nx lint web
```

## Related Documentation

- [Monorepo Guide](../../README.monorepo.md)
- [API Documentation](../api/README.md)
- [Testing Guide](../../TESTING.md)
- [Contributing Guide](../../CONTRIBUTING.md)
