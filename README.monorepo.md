# eCom Monorepo - React E-Commerce Application

A production-ready e-commerce application built as a monorepo using **Nx** and **Lerna**. Features React 18, TypeScript, Redux Toolkit, and Tailwind CSS.

## 📁 Monorepo Structure

```
ecom/
├── apps/                       # Application projects
│   └── web/                    # React frontend application
│       ├── src/
│       ├── e2e/
│       ├── public/
│       ├── package.json
│       └── project.json        # Nx project configuration
│
├── packages/                   # Shared libraries
│   ├── shared-types/           # TypeScript type definitions
│   │   ├── src/
│   │   ├── package.json
│   │   └── project.json
│   │
│   ├── shared-utils/           # Utility functions
│   │   ├── src/
│   │   ├── package.json
│   │   └── project.json
│   │
│   └── ui-components/          # Shared React components
│       ├── src/
│       ├── package.json
│       └── project.json
│
├── nx.json                     # Nx workspace configuration
├── lerna.json                  # Lerna configuration
├── tsconfig.base.json          # Base TypeScript config
└── package.json                # Root package.json with workspaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 10+

### Installation

```bash
# Install all dependencies (root + all packages)
npm install

# Start the web app in development mode
npm run dev
```

## 📜 Available Commands

### Root-level Commands (Nx orchestrated)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web app development server |
| `npm run build` | Build all projects |
| `npm run build:affected` | Build only affected projects |
| `npm run test` | Run tests for all projects |
| `npm run test:affected` | Run tests for affected projects |
| `npm run lint` | Lint all projects |
| `npm run lint:affected` | Lint affected projects |
| `npm run typecheck` | Type-check all projects |
| `npm run format` | Format all files with Prettier |
| `npm run graph` | Visualize project dependency graph |
| `npm run clean` | Clean all caches and node_modules |

### Running Specific Project Commands

```bash
# Run command for specific project
npx nx run web:dev
npx nx run web:build
npx nx run web:test

# Run command for multiple projects
npx nx run-many -t build -p web,shared-utils

# Run only affected projects
npx nx affected -t test
```

### Lerna Commands

```bash
# List all packages
npx lerna list

# Run script in all packages
npx lerna run test

# Version packages (conventional commits)
npx lerna version

# Publish packages
npx lerna publish
```

## 🏗️ Adding New Projects

### Add a New Application

```bash
# Create apps directory structure manually or use Nx generators
mkdir -p apps/new-app/src
```

Then create the necessary configuration files:
- `apps/new-app/package.json`
- `apps/new-app/project.json`
- `apps/new-app/tsconfig.json`

### Add a New Shared Package

```bash
mkdir -p packages/new-package/src
```

Then create:
- `packages/new-package/package.json`
- `packages/new-package/project.json`
- `packages/new-package/tsconfig.json`
- `packages/new-package/src/index.ts`

## 📦 Shared Packages

### @ecom/shared-types
TypeScript type definitions shared across the monorepo:
- API types (requests, responses, errors)
- Domain types (User, Product, Cart, Order)
- Common utility types

```typescript
import type { Product, CartItem, ApiResponse } from '@ecom/shared-types';
```

### @ecom/shared-utils
Utility functions shared across the monorepo:
- Currency formatting
- String manipulation
- Date formatting
- Validation helpers
- Async utilities (debounce, throttle)

```typescript
import { formatCurrency, slugify, debounce } from '@ecom/shared-utils';
```

### @ecom/ui-components
Shared React UI components:
- Button, Input, Badge
- Spinner
- More to be added...

```typescript
import { Button, Input, Badge, Spinner } from '@ecom/ui-components';
```

## 🔧 Nx Features

### Task Caching
Nx caches task results. Subsequent runs of cached tasks complete instantly:

```bash
# First run - executes build
npm run build

# Second run - uses cache (instant)
npm run build
```

### Affected Commands
Only run tasks for projects affected by your changes:

```bash
# Only test affected projects
npx nx affected -t test

# Only build affected projects
npx nx affected -t build
```

### Dependency Graph
Visualize project dependencies:

```bash
npm run graph
```

### Parallel Execution
Tasks run in parallel by default (configurable in `nx.json`):

```json
{
  "parallel": 3
}
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [REACT_ECOM_MASTER_PLAN.md](REACT_ECOM_MASTER_PLAN.md) | Master plan and roadmap |
| [BACKEND_API_REQUIREMENTS.md](BACKEND_API_REQUIREMENTS.md) | Backend API specifications |
| [FRONTEND_CONCEPTS.md](FRONTEND_CONCEPTS.md) | Frontend architecture concepts |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions |
| [TESTING.md](TESTING.md) | Testing strategy |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions |

## 🚦 Development Workflow

1. **Create a branch** for your feature/fix
2. **Make changes** to relevant apps/packages
3. **Run affected tests**: `npx nx affected -t test`
4. **Run affected lint**: `npx nx affected -t lint`
5. **Commit** with conventional commit messages
6. **Push** and create a pull request

## 📄 License

MIT License - see LICENSE file for details
