# Contributing to eCom

Thank you for your interest in contributing to the eCom project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ecom.git
cd ecom

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/ecom.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env.local

# 6. Start development server
npm run dev
```

### Verify Setup

```bash
# Run linting
npm run lint

# Run tests
npm run test:run

# Run type checking
npm run typecheck

# Build the project
npm run build
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/wishlist-page` |
| Bug Fix | `fix/description` | `fix/cart-quantity-bug` |
| Refactor | `refactor/description` | `refactor/api-client` |
| Docs | `docs/description` | `docs/add-deployment-guide` |
| Test | `test/description` | `test/checkout-flow` |

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Changes

Follow the [Commit Message Convention](#commit-message-convention) below.

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style Guidelines

### TypeScript

- **No `any` types** - Use proper typing or `unknown`
- **Prefer interfaces** over type aliases for object shapes
- **Use strict mode** - Already configured in `tsconfig.json`
- **Export types** explicitly when needed

```typescript
// ✅ Good
interface ProductProps {
  id: number;
  title: string;
  price: number;
}

// ❌ Bad
type ProductProps = any;
```

### React Components

- **Functional components** only (except ErrorBoundary)
- **Use hooks** for state and side effects
- **Props destructuring** in function signature
- **Named exports** for components

```tsx
// ✅ Good
export const ProductCard = ({ id, title, price }: ProductProps) => {
  return <div>{title}</div>;
};

// ❌ Bad
export default function(props) {
  return <div>{props.title}</div>;
}
```

### File Organization

```
src/
├── components/
│   └── product/
│       ├── ProductCard.tsx       # Component
│       ├── ProductCard.test.tsx  # Tests
│       ├── ProductCard.stories.tsx # Storybook
│       └── index.ts              # Re-exports
```

### Imports

Use path aliases and organize imports:

```typescript
// 1. React/external libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal modules (using @ alias)
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/components/ui';

// 3. Types
import type { Product } from '@/types';

// 4. Styles (if any)
import './styles.css';
```

### CSS/Tailwind

- Use **Tailwind utility classes** for styling
- Extract repeated patterns to components, not CSS
- Use **semantic class ordering**: layout → spacing → typography → colors

```tsx
// ✅ Good - Logical ordering
<div className="flex items-center gap-4 p-4 text-lg font-bold text-gray-900 bg-white rounded-lg shadow">

// ❌ Bad - Random ordering
<div className="shadow text-lg p-4 flex bg-white rounded-lg gap-4 items-center font-bold text-gray-900">
```

---

## Commit Message Convention

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature/fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |

### Examples

```bash
# Feature
feat(cart): add quantity validation with max stock limit

# Bug fix
fix(checkout): prevent form submission with invalid card

# Documentation
docs(readme): add deployment instructions

# Refactor
refactor(api): extract retry logic to separate utility

# With body
feat(auth): implement password reset flow

Added forgot password form with email validation.
Integrated with auth service for reset token generation.

Closes #123
```

### Scope Examples

`cart`, `checkout`, `auth`, `product`, `order`, `ui`, `api`, `store`, `hooks`, `config`, `docs`, `test`

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm run test:run`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Updated relevant documentation
- [ ] Added tests for new features
- [ ] Commits follow convention

### PR Title Format

Same as commit messages:
```
feat(cart): add wishlist functionality
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests
- [ ] All new and existing tests pass
- [ ] I have updated the documentation

## Screenshots (if applicable)
Add screenshots for UI changes.
```

### Review Process

1. At least 1 approval required
2. All CI checks must pass
3. No unresolved conversations
4. Squash merge preferred

---

## Testing Requirements

### What to Test

| Type | Coverage Target | Location |
|------|----------------|----------|
| Redux slices | 100% | `*.test.ts` |
| Custom hooks | 90% | `*.test.ts` |
| Utility functions | 100% | `*.test.ts` |
| Components | 70% | `*.test.tsx` |
| E2E critical paths | N/A | `e2e/*.spec.ts` |

### Running Tests

```bash
# Unit tests in watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('displays product title', () => {
    render(<ProductCard title="Test Product" price={29.99} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', async () => {
    const onAddToCart = vi.fn();
    render(<ProductCard title="Test" price={29.99} onAddToCart={onAddToCart} />);
    
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });
});
```

---

## Documentation

### When to Update Docs

- Adding new components → Update component JSDoc
- Changing API contracts → Update type definitions
- Adding features → Update README features list
- Making architecture decisions → Add to DECISIONS.md

### JSDoc Standards

```typescript
/**
 * Formats a number as currency
 * 
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(29.99) // "$29.99"
 * formatCurrency(29.99, 'EUR') // "€29.99"
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  // implementation
}
```

### Generating API Docs

```bash
npm run docs
```

---

## Questions?

If you have questions, please:
1. Check existing documentation
2. Search closed issues/PRs
3. Open a new issue with the `question` label

Thank you for contributing! 🎉
