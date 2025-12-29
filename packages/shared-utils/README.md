# @ecom/shared-utils

Shared utility functions used across the eCom monorepo.

## Overview

This package provides common utility functions for currency formatting, string manipulation, date handling, validation, and more. These utilities ensure consistency across the frontend and backend applications.

## Installation

This package is automatically available in the monorepo. No separate installation needed.

## Usage

Import utilities in any app or package:

```typescript
import { 
  formatCurrency, 
  slugify, 
  truncate,
  debounce,
  formatDate 
} from '@ecom/shared-utils';
```

## Available Utilities

### Currency Utilities

| Function | Description |
|----------|-------------|
| `formatCurrency(cents, currency?, locale?)` | Format cents to currency string |
| `dollarsToCents(dollars)` | Convert dollars to cents |
| `centsToDollars(cents)` | Convert cents to dollars |

```typescript
import { formatCurrency, dollarsToCents } from '@ecom/shared-utils';

formatCurrency(2999);              // "$29.99"
formatCurrency(2999, 'EUR', 'de-DE'); // "29,99 €"
dollarsToCents(29.99);             // 2999
```

### String Utilities

| Function | Description |
|----------|-------------|
| `slugify(text)` | Generate URL-friendly slug |
| `truncate(text, maxLength?, suffix?)` | Truncate text with ellipsis |
| `capitalize(text)` | Capitalize first letter |
| `pluralize(count, singular, plural?)` | Pluralize based on count |

```typescript
import { slugify, truncate, capitalize, pluralize } from '@ecom/shared-utils';

slugify('Hello World!');           // "hello-world"
truncate('Long text...', 10);      // "Long te..."
capitalize('hello');               // "Hello"
pluralize(1, 'item');              // "1 item"
pluralize(5, 'item');              // "5 items"
```

### Date Utilities

| Function | Description |
|----------|-------------|
| `formatDate(date, format?)` | Format date string |
| `formatRelativeTime(date)` | Format as relative time |
| `isValidDate(date)` | Check if date is valid |

```typescript
import { formatDate, formatRelativeTime } from '@ecom/shared-utils';

formatDate('2024-01-15');          // "January 15, 2024"
formatDate('2024-01-15', 'short'); // "Jan 15, 2024"
formatRelativeTime(new Date());    // "just now"
```

### Validation Utilities

| Function | Description |
|----------|-------------|
| `isEmail(value)` | Validate email format |
| `isPhoneNumber(value)` | Validate phone number |
| `isPostalCode(value, country?)` | Validate postal code |

```typescript
import { isEmail, isPhoneNumber } from '@ecom/shared-utils';

isEmail('user@example.com');       // true
isPhoneNumber('+1234567890');      // true
```

### Function Utilities

| Function | Description |
|----------|-------------|
| `debounce(fn, delay)` | Debounce function calls |
| `throttle(fn, limit)` | Throttle function calls |
| `memoize(fn)` | Memoize function results |

```typescript
import { debounce, throttle } from '@ecom/shared-utils';

const debouncedSearch = debounce(search, 300);
const throttledScroll = throttle(handleScroll, 100);
```

### Array Utilities

| Function | Description |
|----------|-------------|
| `chunk(array, size)` | Split array into chunks |
| `unique(array)` | Remove duplicates |
| `groupBy(array, key)` | Group array by key |

```typescript
import { chunk, unique, groupBy } from '@ecom/shared-utils';

chunk([1, 2, 3, 4, 5], 2);         // [[1, 2], [3, 4], [5]]
unique([1, 2, 2, 3]);               // [1, 2, 3]
groupBy(products, 'category');      // { electronics: [...], clothing: [...] }
```

### ID Utilities

| Function | Description |
|----------|-------------|
| `generateId()` | Generate unique ID |
| `isValidUUID(value)` | Validate UUID format |

```typescript
import { generateId, isValidUUID } from '@ecom/shared-utils';

generateId();                       // "f47ac10b-58cc..."
isValidUUID('f47ac10b-58cc...');   // true
```

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
npx nx lint shared-utils

# Test
npx nx test shared-utils

# Type check
npx nx typecheck shared-utils
```

## Adding New Utilities

1. Add the utility function to `src/index.ts` or create a new module
2. Add JSDoc documentation with examples
3. Export from `src/index.ts`
4. Add unit tests
5. Update this README

## Best Practices

1. **Pure Functions**: All utilities should be pure functions with no side effects
2. **Type Safety**: Use proper TypeScript types for parameters and return values
3. **Documentation**: Add JSDoc comments with `@param`, `@returns`, and `@example`
4. **Testing**: Write unit tests for all utility functions
5. **Performance**: Consider memoization for expensive computations

## Dependencies

This package depends on:
- `@ecom/shared-types` - For shared type definitions

## Related Documentation

- [Shared Types](../shared-types/README.md)
- [Monorepo Guide](../../README.monorepo.md)
