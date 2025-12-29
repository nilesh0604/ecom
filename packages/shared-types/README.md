# @ecom/shared-types

Shared TypeScript types and interfaces used across the eCom monorepo.

## Overview

This package provides a centralized location for all TypeScript type definitions, ensuring type consistency across the frontend, backend, and other packages in the monorepo.

## Installation

This package is automatically available in the monorepo. No separate installation needed.

## Usage

Import types in any app or package:

```typescript
import type { 
  User, 
  Product, 
  CartItem, 
  Order,
  ApiResponse,
  PaginatedResponse 
} from '@ecom/shared-types';
```

## Available Types

### Common Types

| Type | Description |
|------|-------------|
| `ID` | Unique identifier (string \| number) |
| `Timestamp` | ISO 8601 formatted timestamp |
| `CentsAmount` | Currency amount in cents |

### API Types

| Type | Description |
|------|-------------|
| `ApiResponse<T>` | Standard API response wrapper |
| `PaginatedResponse<T>` | Paginated API response |
| `ApiError` | API error response structure |

### User Types

| Type | Description |
|------|-------------|
| `User` | User profile information |
| `AuthTokens` | Authentication tokens (access + refresh) |

### Product Types

| Type | Description |
|------|-------------|
| `Product` | Product entity |
| `Category` | Product category |
| `ProductReview` | Product review/rating |

### Cart Types

| Type | Description |
|------|-------------|
| `CartItem` | Shopping cart item |
| `Cart` | Shopping cart with items |

### Order Types

| Type | Description |
|------|-------------|
| `Order` | Order entity |
| `OrderItem` | Order line item |
| `OrderStatus` | Order status enum |
| `ShippingAddress` | Shipping address |

## Examples

### Using API Response Types

```typescript
import type { ApiResponse, PaginatedResponse, Product } from '@ecom/shared-types';

// Single item response
async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}

// Paginated response
async function getProducts(page: number): Promise<PaginatedResponse<Product>> {
  const response = await fetch(`/api/products?page=${page}`);
  return response.json();
}
```

### Using Entity Types

```typescript
import type { User, Product, CartItem } from '@ecom/shared-types';

interface CartState {
  items: CartItem[];
  user: User | null;
}

function addToCart(product: Product, quantity: number): CartItem {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
    image: product.images[0],
  };
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on source files |
| `npm run typecheck` | Run TypeScript type checking |

## Nx Commands

From the monorepo root:

```bash
# Lint
npx nx lint shared-types

# Type check
npx nx typecheck shared-types
```

## Adding New Types

1. Add types to the appropriate section in `src/index.ts`
2. Export the type from the file
3. Run `npm run typecheck` to verify
4. Update this README if adding new categories

## Best Practices

1. **Use `type` for type aliases**: Prefer `type` over `interface` for simple types
2. **Use `interface` for objects**: Use `interface` for object shapes that may be extended
3. **Document with JSDoc**: Add JSDoc comments to all exported types
4. **Avoid `any`**: Use `unknown` or proper typing instead
5. **Use strict types**: Prefer specific types over broad ones (e.g., `'pending' | 'completed'` over `string`)

## Related Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Monorepo Guide](../../README.monorepo.md)
