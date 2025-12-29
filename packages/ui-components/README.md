# @ecom/ui-components

Shared React UI components used across the eCom monorepo.

## Overview

This package provides reusable, accessible, and customizable React components that ensure visual consistency across all frontend applications in the monorepo.

## Installation

This package is automatically available in the monorepo. No separate installation needed.

### Peer Dependencies

Make sure your app has these peer dependencies:

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

## Usage

Import components in any React app:

```typescript
import { Button, Spinner, Badge, Input, Card } from '@ecom/ui-components';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter your email" />
      <Button variant="primary" size="md">
        Submit
      </Button>
    </Card>
  );
}
```

## Available Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@ecom/ui-components';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With loading state
<Button isLoading>Loading...</Button>

// With icons
<Button leftIcon={<SearchIcon />}>Search</Button>
<Button rightIcon={<ArrowIcon />}>Next</Button>
```

#### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `leftIcon` | `ReactNode` | - | Icon on the left |
| `rightIcon` | `ReactNode` | - | Icon on the right |
| `disabled` | `boolean` | `false` | Disable the button |

### Spinner

A loading spinner with customizable size and color.

```tsx
import { Spinner } from '@ecom/ui-components';

<Spinner />
<Spinner size="sm" />
<Spinner size="lg" color="blue" />
```

#### Spinner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `color` | `string` | `'currentColor'` | Spinner color |

### Badge

A badge component for labels, tags, and status indicators.

```tsx
import { Badge } from '@ecom/ui-components';

<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
```

#### Badge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Badge color variant |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |

### Input

A styled input component with validation support.

```tsx
import { Input } from '@ecom/ui-components';

<Input placeholder="Enter text" />
<Input type="email" label="Email" />
<Input error="This field is required" />
<Input disabled />
```

#### Input Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text below input |

### Card

A card container component.

```tsx
import { Card } from '@ecom/ui-components';

<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content goes here</Card.Body>
  <Card.Footer>Footer content</Card.Footer>
</Card>
```

### Modal

A modal dialog component.

```tsx
import { Modal } from '@ecom/ui-components';

<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Confirm Action</Modal.Header>
  <Modal.Body>Are you sure you want to proceed?</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

## Styling

Components are styled with Tailwind CSS classes and can be customized:

1. **className prop**: All components accept a `className` prop for additional styling
2. **CSS Variables**: Override CSS variables for theming
3. **Tailwind Config**: Extend the Tailwind configuration in your app

```tsx
// Using className for customization
<Button className="w-full rounded-full">Full Width Rounded</Button>
```

## Accessibility

All components are built with accessibility in mind:

- ✅ ARIA attributes properly set
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Color contrast compliance (WCAG 2.1 AA)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on source files |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Nx Commands

From the monorepo root:

```bash
# Lint
npx nx lint ui-components

# Test
npx nx test ui-components

# Type check
npx nx typecheck ui-components
```

## Adding New Components

1. Create the component in `src/` directory
2. Add TypeScript interfaces for props
3. Add JSDoc documentation
4. Export from `src/index.ts`
5. Add unit tests
6. Add Storybook stories (optional)
7. Update this README

### Component Template

```tsx
import React from 'react';

export interface MyComponentProps {
  /** Description of the prop */
  variant?: 'default' | 'alternate';
  /** Additional CSS classes */
  className?: string;
  /** Component children */
  children?: React.ReactNode;
}

/**
 * MyComponent description
 * 
 * @example
 * <MyComponent variant="default">Content</MyComponent>
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  variant = 'default',
  className = '',
  children,
}) => {
  return (
    <div className={`base-styles ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
```

## Best Practices

1. **Props Interface**: Define a clear TypeScript interface for all props
2. **Default Props**: Provide sensible defaults
3. **Forwarded Refs**: Use `React.forwardRef` for components that wrap native elements
4. **Display Name**: Set `displayName` for better debugging
5. **Accessibility**: Include ARIA attributes and keyboard support
6. **Documentation**: Add JSDoc comments with examples

## Related Documentation

- [Web App](../../apps/web/README.md)
- [Shared Types](../shared-types/README.md)
- [Shared Utils](../shared-utils/README.md)
- [Monorepo Guide](../../README.monorepo.md)
