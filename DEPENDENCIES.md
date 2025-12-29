# NPM Dependencies Documentation

This document provides a comprehensive overview of all npm packages used in this project, including their purpose, why they were chosen, and available alternatives.

---

## 📦 Production Dependencies

### Core Framework

#### `react` (v18.3.1)
**Purpose:** The foundational UI library for building component-based user interfaces.

**Why we use it:**
- Industry-standard library with massive community support
- Component-based architecture promotes reusability
- Virtual DOM for efficient rendering
- Rich ecosystem of tools and libraries
- Excellent developer experience with React DevTools

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Vue.js** | Gentler learning curve, built-in state management | Smaller ecosystem than React |
| **Angular** | Full framework with everything included | Steeper learning curve, more opinionated |
| **Svelte** | No virtual DOM, smaller bundle size | Smaller ecosystem, fewer jobs |
| **Solid.js** | True reactivity, excellent performance | Newer, smaller community |
| **Preact** | Tiny (3KB), React-compatible API | Fewer features than React |

---

#### `react-dom` (v18.3.1)
**Purpose:** Provides DOM-specific methods for React, enabling rendering to the browser.

**Why we use it:**
- Required companion package for React web applications
- Handles reconciliation between React's virtual DOM and actual DOM
- Provides `createRoot` for React 18's concurrent features

**Alternatives:**
- `react-native` - For mobile applications
- `react-three-fiber` - For 3D/WebGL applications
- No true alternatives for web React apps

---

### Routing

#### `react-router-dom` (v7.11.0)
**Purpose:** Declarative routing for React single-page applications.

**Why we use it:**
- De facto standard for React routing
- Supports nested routes, dynamic segments, and route parameters
- Built-in hooks (`useNavigate`, `useParams`, `useLocation`)
- Data loading and form handling (v6.4+)
- Excellent TypeScript support

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **TanStack Router** | Type-safe, built-in data loading, search params | Newer, smaller community |
| **Wouter** | Tiny (~1.5KB), simple API | Fewer features |
| **Next.js Router** | File-based routing, SSR support | Requires Next.js framework |
| **Reach Router** | Accessible, simple | Merged into React Router v6 |

---

### State Management

#### `@reduxjs/toolkit` (v2.11.2)
**Purpose:** Official, opinionated toolset for efficient Redux development.

**Why we use it:**
- Simplifies Redux boilerplate significantly
- Built-in Immer for immutable updates
- `createSlice` for reducers and actions in one place
- `createAsyncThunk` for async operations
- RTK Query for data fetching and caching
- Excellent DevTools integration

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Zustand** | Minimal boilerplate, tiny bundle | Less structured for large apps |
| **Jotai** | Atomic state, minimal re-renders | Different mental model |
| **Recoil** | Atomic state by Facebook | Development stalled |
| **MobX** | Automatic tracking, less boilerplate | Magic can be confusing |
| **XState** | State machines, predictable | Steeper learning curve |
| **React Context** | Built-in, no dependencies | Performance issues at scale |

---

#### `react-redux` (v9.2.0)
**Purpose:** Official React bindings for Redux.

**Why we use it:**
- Required to connect Redux store to React components
- Provides `useSelector` and `useDispatch` hooks
- Optimized re-rendering with subscription batching
- TypeScript support out of the box

**Alternatives:**
- Use Redux Toolkit's hooks directly (still requires react-redux)
- Zustand, Jotai (don't need separate binding libraries)

---

### Form Handling

#### `react-hook-form` (v7.69.0)
**Purpose:** Performant, flexible form library with easy validation.

**Why we use it:**
- Minimal re-renders (uncontrolled inputs by default)
- Small bundle size (~8KB)
- Built-in validation and error handling
- Easy integration with UI libraries
- Excellent TypeScript support
- Form state management without boilerplate

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Formik** | Mature, widely used | More re-renders, larger bundle |
| **React Final Form** | Subscription-based, flexible | Less intuitive API |
| **TanStack Form** | Headless, framework agnostic | Newer, less documentation |
| **Native forms** | No dependencies | Manual validation, more code |

---

#### `@hookform/resolvers` (v5.2.2)
**Purpose:** Validation resolvers for react-hook-form to integrate with schema validation libraries.

**Why we use it:**
- Seamless integration with Zod schemas
- Single source of truth for validation
- Type inference from schemas
- Supports multiple validation libraries

**Alternatives:**
- Write custom resolver functions
- Use built-in react-hook-form validation (less powerful)

---

### Validation

#### `zod` (v4.2.1)
**Purpose:** TypeScript-first schema validation with static type inference.

**Why we use it:**
- TypeScript types inferred from schemas (DRY)
- Composable and chainable API
- Zero dependencies
- Works on both client and server
- Excellent error messages
- Small bundle size

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Yup** | Mature, widely used | Less TypeScript-friendly |
| **Joi** | Full-featured, popular in Node.js | Heavier, designed for server |
| **Valibot** | Smaller than Zod, modular | Newer, smaller community |
| **ArkType** | Excellent TypeScript inference | Very new |
| **Superstruct** | Composable, small | Less feature-rich |

---

### SEO & Meta Tags

#### `react-helmet-async` (v2.0.5)
**Purpose:** Manage document head (title, meta tags) for SEO and social sharing.

**Why we use it:**
- SSR-compatible (async variant of react-helmet)
- Declarative API within components
- Supports all head elements (title, meta, link, script)
- Nested components correctly override parent values

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **react-helmet** | Original library | Not SSR-safe, unmaintained |
| **Next.js Head** | Built into Next.js | Requires Next.js |
| **react-head** | Minimal, SSR-friendly | Smaller community |
| **Manual DOM** | No dependencies | Tedious, error-prone |

---

### Styling

#### `tailwindcss` (v4.1.18)
**Purpose:** Utility-first CSS framework for rapid UI development.

**Why we use it:**
- Rapid prototyping with utility classes
- Consistent design system
- Automatic purging of unused CSS
- Excellent responsive design utilities
- Dark mode support built-in
- High customizability via config

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **CSS Modules** | Scoped CSS, no library | More verbose, less utilities |
| **Styled Components** | CSS-in-JS, dynamic styles | Runtime overhead |
| **Emotion** | Flexible CSS-in-JS | Runtime overhead |
| **UnoCSS** | Faster, more flexible | Less documentation |
| **Bootstrap** | Pre-built components | Less flexible, larger bundle |
| **Chakra UI** | Component library + utilities | Opinionated, heavier |

---

#### `@tailwindcss/postcss` (v4.1.18)
**Purpose:** PostCSS plugin for Tailwind CSS v4.

**Why we use it:**
- Required for Tailwind CSS v4 integration
- Processes Tailwind directives in CSS files

**Alternatives:**
- `tailwindcss` CLI (standalone)
- Vite plugin for Tailwind (experimental)

---

#### `postcss` (v8.5.6)
**Purpose:** Tool for transforming CSS with JavaScript plugins.

**Why we use it:**
- Required by Tailwind CSS
- Enables CSS processing pipeline
- Plugin ecosystem (autoprefixer, nesting, etc.)

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Lightning CSS** | Faster, built-in features | Less plugin ecosystem |
| **Sass/SCSS** | Mature, powerful | Different approach |
| **Less** | Similar to Sass | Declining popularity |

---

#### `autoprefixer` (v10.4.23)
**Purpose:** Automatically adds vendor prefixes to CSS rules.

**Why we use it:**
- Browser compatibility without manual prefixes
- Uses Can I Use data for accuracy
- Works with PostCSS pipeline

**Alternatives:**
- Built into Lightning CSS
- Manual prefixing (not recommended)

---

### Performance Monitoring

#### `web-vitals` (v5.1.0)
**Purpose:** Library for measuring Core Web Vitals (LCP, FID, CLS, etc.).

**Why we use it:**
- Official Google library for Web Vitals
- Accurate measurement of user experience metrics
- Small footprint
- Easy integration with analytics

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Lighthouse** | Full audit | Not for real-user monitoring |
| **PerformanceObserver API** | Native browser API | More complex to use |
| **Custom implementation** | Full control | Time-consuming, error-prone |

---

## 🔧 Development Dependencies

### Build Tools

#### `vite` (v7.2.4)
**Purpose:** Next-generation frontend build tool with lightning-fast HMR.

**Why we use it:**
- Instant server start (no bundling in dev)
- Lightning-fast Hot Module Replacement (HMR)
- Optimized production builds with Rollup
- Native ESM support
- Excellent plugin ecosystem
- Built-in TypeScript support

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Webpack** | Mature, highly configurable | Slower, complex config |
| **Parcel** | Zero config, fast | Less control |
| **esbuild** | Extremely fast | Lower-level, less features |
| **Turbopack** | Very fast, Vercel-backed | Still in beta |
| **Rspack** | Webpack-compatible, fast | Newer |

---

#### `@vitejs/plugin-react` (v5.1.1)
**Purpose:** Official Vite plugin for React with Fast Refresh.

**Why we use it:**
- Enables React Fast Refresh in Vite
- JSX transformation
- Automatic React import (React 17+)

**Alternatives:**
- `@vitejs/plugin-react-swc` - Uses SWC for faster builds

---

#### `rollup-plugin-visualizer` (v5.12.0)
**Purpose:** Visualize bundle size and composition.

**Why we use it:**
- Identify large dependencies
- Optimize bundle size
- Visual treemap of modules

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **webpack-bundle-analyzer** | Webpack-specific, mature | Webpack only |
| **source-map-explorer** | Uses source maps | Less visual |

---

### TypeScript

#### `typescript` (v5.9.3)
**Purpose:** Typed superset of JavaScript that compiles to plain JavaScript.

**Why we use it:**
- Static type checking catches bugs early
- Better IDE support and autocomplete
- Self-documenting code
- Refactoring confidence
- Industry standard for large applications

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Flow** | Facebook's type checker | Declining popularity |
| **JSDoc** | No compilation, works with JS | Less powerful |
| **Plain JavaScript** | No build step | No type safety |

---

#### `typescript-eslint` (v8.46.4)
**Purpose:** TypeScript parser and plugin for ESLint.

**Why we use it:**
- Enables ESLint to understand TypeScript
- Type-aware linting rules
- Catches type-related issues

**Alternatives:**
- TSLint (deprecated, use typescript-eslint)

---

#### `@types/react` & `@types/react-dom` (v18.3.x)
**Purpose:** TypeScript type definitions for React.

**Why we use it:**
- Required for TypeScript + React
- Provides type definitions for all React APIs

**Alternatives:**
- None for React (these are the official types)

---

#### `@types/node` (v24.10.4)
**Purpose:** TypeScript definitions for Node.js APIs.

**Why we use it:**
- Required for Node.js types in config files
- Enables proper typing for build scripts

---

### Testing

#### `vitest` (v4.0.16)
**Purpose:** Blazing fast unit test framework powered by Vite.

**Why we use it:**
- Native Vite integration (same config)
- Jest-compatible API
- Out-of-the-box TypeScript support
- Watch mode with smart re-runs
- Built-in coverage reporting

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Jest** | Mature, widely used | Slower, separate config |
| **Mocha** | Flexible, long history | Requires more setup |
| **Ava** | Parallel execution | Smaller community |

---

#### `@testing-library/react` (v16.3.1)
**Purpose:** Simple and complete testing utilities for React components.

**Why we use it:**
- Tests components the way users interact with them
- Encourages accessible implementations
- Framework-agnostic queries
- Official recommendation for React testing

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Enzyme** | Shallow rendering | Deprecated, React 18 issues |
| **React Test Renderer** | Official, lightweight | Lower-level API |

---

#### `@testing-library/jest-dom` (v6.9.1)
**Purpose:** Custom Jest/Vitest matchers for DOM testing.

**Why we use it:**
- Readable assertions (`toBeVisible`, `toHaveTextContent`)
- Better error messages
- DOM-specific matchers

**Alternatives:**
- Use standard Jest/Vitest matchers (less readable)

---

#### `@testing-library/user-event` (v14.6.1)
**Purpose:** Simulate user interactions more realistically than `fireEvent`.

**Why we use it:**
- Simulates real browser behavior
- Handles focus, keyboard navigation
- More accurate event sequencing

**Alternatives:**
- `fireEvent` from Testing Library (less realistic)

---

#### `jsdom` (v27.3.0)
**Purpose:** JavaScript implementation of web standards for Node.js.

**Why we use it:**
- Required for DOM testing in Node.js
- Provides browser-like environment for tests

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Happy DOM** | Faster | Less complete |
| **Playwright Test** | Real browser | Slower for unit tests |

---

#### `@playwright/test` (v1.40.0)
**Purpose:** End-to-end testing framework with cross-browser support.

**Why we use it:**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait for elements
- Powerful selectors and assertions
- Trace viewer for debugging
- Visual regression testing support

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Cypress** | Great DX, time travel debugging | No Safari, slower |
| **Puppeteer** | Chrome DevTools Protocol | Chrome/Firefox only |
| **TestCafe** | No WebDriver, easy setup | Smaller community |
| **Selenium** | Multi-language, mature | Complex, slower |

---

### Storybook

#### `storybook` & Related Packages (v8.0.0)
**Purpose:** UI component development and documentation tool.

**Packages included:**
- `storybook` - Core framework
- `@storybook/react` - React support
- `@storybook/react-vite` - Vite builder
- `@storybook/addon-essentials` - Core addons bundle
- `@storybook/addon-a11y` - Accessibility testing
- `@storybook/addon-interactions` - Interaction testing
- `@storybook/addon-links` - Story linking
- `@storybook/test` - Testing utilities

**Why we use it:**
- Develop components in isolation
- Visual documentation of components
- Interactive component playground
- Accessibility testing built-in
- Snapshot and interaction testing

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Ladle** | Faster, simpler | Fewer features |
| **React Cosmos** | Lightweight | Smaller ecosystem |
| **Docz** | MDX-focused | Less maintained |
| **Styleguidist** | Documentation-focused | Less interactive |

---

### Linting & Formatting

#### `eslint` (v9.39.1)
**Purpose:** Pluggable linting utility for JavaScript and TypeScript.

**Why we use it:**
- Catches bugs and code quality issues
- Enforces consistent code style
- Highly configurable
- Huge plugin ecosystem
- Industry standard

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Biome** | Faster, formatter included | Fewer rules |
| **Standard** | Zero config | Opinionated, no customization |
| **XO** | Prettier integrated | Opinionated |

---

#### `@eslint/js` (v9.39.1)
**Purpose:** ESLint's official JavaScript rules.

**Why we use it:**
- Official recommended rules
- Required for ESLint v9+ flat config

---

#### `eslint-plugin-react-hooks` (v7.0.1)
**Purpose:** ESLint rules for React Hooks.

**Why we use it:**
- Enforces Rules of Hooks
- Validates dependency arrays
- Prevents common Hook mistakes

---

#### `eslint-plugin-react-refresh` (v0.4.24)
**Purpose:** Validates React components for Fast Refresh compatibility.

**Why we use it:**
- Ensures components work with HMR
- Catches issues that break Fast Refresh

---

#### `prettier` (v3.7.4)
**Purpose:** Opinionated code formatter.

**Why we use it:**
- Consistent code formatting
- Saves time on style discussions
- Integrates with most editors
- Supports many languages

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **Biome** | Faster | Less mature |
| **dprint** | Faster, pluggable | Smaller community |
| **ESLint --fix** | One tool | Less formatting coverage |

---

#### `eslint-config-prettier` (v10.1.8)
**Purpose:** Disables ESLint rules that conflict with Prettier.

**Why we use it:**
- Prevents ESLint/Prettier conflicts
- Lets Prettier handle formatting

---

#### `eslint-plugin-prettier` (v5.5.4)
**Purpose:** Runs Prettier as an ESLint rule.

**Why we use it:**
- Single command for linting and formatting
- Formatting errors shown as ESLint errors

---

#### `globals` (v16.5.0)
**Purpose:** Global identifier definitions for ESLint.

**Why we use it:**
- Defines browser/node globals for ESLint
- Prevents "undefined" errors for globals

---

### Git Hooks

#### `husky` (v8.0.0)
**Purpose:** Git hooks made easy.

**Why we use it:**
- Runs scripts on git events (pre-commit, pre-push)
- Ensures code quality before commits
- Easy to configure

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **simple-git-hooks** | Smaller, simpler | Fewer features |
| **lefthook** | Fast, Go-based | Different config format |
| **Native git hooks** | No dependencies | Manual setup |

---

#### `lint-staged` (v15.2.0)
**Purpose:** Run linters on staged git files only.

**Why we use it:**
- Fast pre-commit checks (only staged files)
- Works with any linter/formatter
- Prevents bad code from being committed

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **nano-staged** | Smaller, faster | Fewer features |
| **pretty-quick** | Prettier-specific | Limited to Prettier |

---

### Documentation

#### `typedoc` (v0.28.15)
**Purpose:** Documentation generator for TypeScript projects.

**Why we use it:**
- Generates docs from TypeScript source
- Uses JSDoc comments
- Produces navigable HTML documentation
- Supports themes and plugins

**Alternatives:**
| Package | Pros | Cons |
|---------|------|------|
| **JSDoc** | Works with JavaScript | Less TypeScript integration |
| **Documentation.js** | Modern output | Less TypeScript support |
| **Docusaurus** | Full documentation site | Overkill for API docs |
| **VitePress** | Fast, Vue-based | Manual API documentation |

---

## 📊 Bundle Size Considerations

| Package | Approx. Size (minified + gzipped) |
|---------|-----------------------------------|
| React + React DOM | ~42 KB |
| Redux Toolkit | ~11 KB |
| React Router DOM | ~14 KB |
| React Hook Form | ~8 KB |
| Zod | ~12 KB |
| Tailwind (after purge) | ~10-30 KB |

---

## 🔄 Upgrade Considerations

1. **React 19** - When stable, evaluate for new features (use, Actions, etc.)
2. **Tailwind v4** - Already using, monitor for breaking changes
3. **Vite** - Stay current for performance improvements
4. **TypeScript** - Upgrade cautiously, check compatibility

---

## 📝 Notes

- All packages are chosen for their strong TypeScript support
- Preference given to packages with active maintenance
- Bundle size was a consideration in all choices
- Community support and documentation quality influenced decisions

---

*Last updated: December 24, 2025*
