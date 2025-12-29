# API Contract Testing

This directory contains consumer-driven contract tests using [Pact](https://pact.io/).

## What is Contract Testing?

Contract testing is a testing methodology that ensures services (consumers and providers) can communicate with each other. Unlike integration tests, contract tests:

- **Run independently** - Consumer tests run without needing the actual provider
- **Detect breaking changes early** - Before deployment
- **Enable parallel development** - Frontend and backend teams can work independently
- **Are faster** - No need for full end-to-end setup

## Directory Structure

```
contract/
├── README.md                     # This file
├── index.ts                      # Configuration exports
├── auth.contract.test.ts         # Authentication API contracts
├── products.contract.test.ts     # Products API contracts
├── cart.contract.test.ts         # Cart API contracts
└── orders.contract.test.ts       # Orders API contracts
```

## Running Contract Tests

### Run All Contract Tests

```bash
cd apps/api
npm run test:contract
```

### Run Specific Contract Test

```bash
npm test -- --testPathPattern=contract/auth --runInBand
```

### Generate Pact Files

Contract tests generate Pact JSON files in the `pacts/` directory:

```bash
# After running tests, pacts are generated at:
apps/api/pacts/ecom-web-ecom-api.json
```

## Contract Test Endpoints

### Authentication (`auth.contract.test.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/logout` | POST | User logout |
| `/api/v1/auth/me` | GET | Get current user |

### Products (`products.contract.test.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products` | GET | List products (with pagination, filtering) |
| `/api/v1/products/:id` | GET | Get product by ID |
| `/api/v1/products/slug/:slug` | GET | Get product by slug |
| `/api/v1/products/featured` | GET | Get featured products |

### Cart (`cart.contract.test.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart` | GET | Get user's cart |
| `/api/v1/cart/items` | POST | Add item to cart |
| `/api/v1/cart/items/:itemId` | PUT | Update cart item quantity |
| `/api/v1/cart/items/:itemId` | DELETE | Remove item from cart |
| `/api/v1/cart` | DELETE | Clear entire cart |

### Orders (`orders.contract.test.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/orders` | GET | List user's orders |
| `/api/v1/orders/:id` | GET | Get order details |
| `/api/v1/orders` | POST | Create new order |
| `/api/v1/orders/:id/cancel` | PUT | Cancel an order |
| `/api/v1/orders/:id/tracking` | GET | Get order tracking info |

## How Contract Testing Works

### 1. Consumer Tests (This Project)

The frontend (consumer) defines what it expects from the API:

```typescript
await provider.addInteraction({
  state: 'user exists with email user@example.com',
  uponReceiving: 'a request to login',
  withRequest: {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { email: 'user@example.com', password: 'password' },
  },
  willRespondWith: {
    status: 200,
    body: {
      success: true,
      data: { user: like({}), token: like('jwt-token') },
    },
  },
});
```

### 2. Pact File Generation

Running tests generates a Pact contract file (JSON) documenting all expected interactions.

### 3. Provider Verification (Optional)

The backend can verify it meets the contract:

```bash
npm run test:pact:verify
```

## Pact Matchers

We use Pact matchers for flexible matching:

| Matcher | Description | Example |
|---------|-------------|---------|
| `like(value)` | Matches any value of same type | `like(1)` matches any integer |
| `eachLike(value)` | Matches array with elements of same type | `eachLike({id: like(1)})` |
| `term({generate, matcher})` | Matches regex pattern | `term({generate: 'PENDING', matcher: 'PENDING|SHIPPED'})` |
| `integer()` | Matches any integer | - |
| `decimal()` | Matches any decimal | - |
| `boolean()` | Matches any boolean | - |
| `string()` | Matches any string | - |

## CI/CD Integration

### Using Pact Broker (Optional)

For team collaboration, publish pacts to a broker:

```bash
# Publish pacts
npx pact-broker publish ./pacts \
  --broker-base-url=$PACT_BROKER_URL \
  --broker-token=$PACT_BROKER_TOKEN \
  --consumer-app-version=$GIT_COMMIT

# Verify provider
npm run test:pact:verify
```

### GitHub Actions Example

```yaml
- name: Run Contract Tests
  run: npm run test:contract
  working-directory: apps/api

- name: Publish Pact
  if: github.ref == 'refs/heads/main'
  run: npx pact-broker publish ./pacts ...
```

## Best Practices

1. **Keep contracts focused** - Test specific interactions, not entire workflows
2. **Use matchers** - Don't hardcode values, use `like()` for flexibility
3. **Document provider states** - Clear `state` descriptions help provider verification
4. **Version your contracts** - Use consumer version tags
5. **Run in CI** - Contract tests should run on every PR

## Troubleshooting

### Port Conflicts

Each test file uses a different port (1234-1237). If you get port conflicts:

```typescript
const provider = new Pact({
  port: 0, // Let Pact find an available port
});
```

### Pact Files Not Generated

Ensure tests pass completely. Failed tests may not generate pacts.

### Mock Server Not Starting

Check if the port is in use:

```bash
lsof -i :1234
```

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)
