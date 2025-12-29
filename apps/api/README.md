# E-Commerce API

A robust and scalable Node.js + Express + TypeScript backend API for the e-commerce platform.

## Quick Start (Docker)

The fastest way to get started is using Docker:

```bash
# 1. Navigate to the API directory
cd apps/api

# 2. Start all services (PostgreSQL, Redis, API, Adminer)
docker-compose up -d

# 3. Push database schema
npx prisma db push

# 4. Seed sample data
npx prisma db seed

# 5. Verify the API is running
curl http://localhost:3000/api/v1/products
```

**Services Available:**
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/v1
- **Adminer (DB UI)**: http://localhost:8080 (System: PostgreSQL, Server: postgres, User: postgres, Password: postgres, Database: ecommerce)

**Test Credentials:**
- Admin: `admin@ecommerce.com` / `AdminPass123!`
- User: `user@ecommerce.com` / `UserPass123!`

> **Note for macOS users**: If using Rancher Desktop or Colima instead of Docker Desktop, see the [Container Runtime Configuration](#container-runtime-configuration) section.

## Features

- 🔐 **Authentication**: JWT-based authentication with refresh tokens
- 🛍️ **Products**: Full CRUD operations with search, filtering, and pagination
- 🛒 **Cart**: Shopping cart with guest and authenticated user support
- 📦 **Orders**: Order management with status tracking
- 👤 **Users**: Profile management, addresses, preferences
- ❤️ **Wishlist**: Product wishlist functionality
- 💳 **Payments**: Stripe integration for payment processing
- 📧 **Email**: Transactional email support (order confirmations, etc.)
- 🔄 **Events**: Internal event bus for service communication
- 💾 **Caching**: In-memory caching (Redis-compatible interface)
- 🔒 **Security**: Helmet, CORS, rate limiting, input validation
- 📝 **Logging**: Winston-based structured logging
- 🗃️ **Database**: PostgreSQL with Prisma ORM
- 🐳 **Docker**: Full Docker and Docker Compose support

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Payments**: Stripe
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration (especially `DATABASE_URL`)

5. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

6. Run database migrations:
   ```bash
   npm run db:migrate
   ```

7. Seed the database (optional):
   ```bash
   npm run db:seed
   ```

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Docker Setup

### Prerequisites

- **Docker Runtime**: One of the following:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - [Rancher Desktop](https://rancherdesktop.io/) (recommended for macOS)
  - [Colima](https://github.com/abiosoft/colima)

### Container Runtime Configuration

#### Using Rancher Desktop (Recommended for macOS)

1. Install and start Rancher Desktop
2. Set the Docker socket:
   ```bash
   export DOCKER_HOST=unix://$HOME/.rd/docker.sock
   ```

3. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
   ```bash
   echo 'export DOCKER_HOST=unix://$HOME/.rd/docker.sock' >> ~/.zshrc
   ```

#### Using Colima

1. Start Colima:
   ```bash
   colima start
   ```

2. The socket is typically at:
   ```bash
   export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
   ```

#### Using Docker Desktop

No additional configuration needed - uses the default socket.

---

## Docker Compose Files

This project includes multiple Docker Compose configurations for different environments:

| File | Purpose | Use Case |
|------|---------|----------|
| `docker-compose.yml` | Development | Local development with hot reload |
| `docker-compose.prod.yml` | Production | Optimized production deployment |
| `docker-compose.staging.yml` | Staging | Pre-production testing with QA tools |
| `docker-compose.monitoring.yml` | Monitoring | Prometheus, Grafana, exporters |

---

## Docker Images (Dockerfiles)

### Development Dockerfile (`Dockerfile`)

Used for local development with hot reload enabled.

```dockerfile
# Base: node:20-alpine
# Features:
# - OpenSSL for Prisma
# - Full node_modules mount
# - Nodemon for hot reload
# - Source code mounted as volume
```

**Key characteristics:**
- Uses `npm run dev` for hot reload
- Mounts source code as volume for live changes
- Includes all development dependencies
- No build optimization

### Production Dockerfile (`Dockerfile.prod`)

Multi-stage build optimized for production.

```dockerfile
# Stage 1 (builder): Compile TypeScript, generate Prisma client
# Stage 2 (production): Minimal runtime with compiled code only
```

**Key characteristics:**
- Multi-stage build for smaller image size
- Non-root user (`api`) for security
- Only production dependencies included
- Built-in health check
- Compiled JavaScript only (no TypeScript)

---

## Container Services Reference

### Development Environment (`docker-compose.yml`)

| Service | Container Name | Port | Image | Description |
|---------|----------------|------|-------|-------------|
| api | ecom-api | 3000 | Custom (Dockerfile) | Node.js API with hot reload |
| postgres | ecom-postgres | 5432 | postgres:15-alpine | PostgreSQL database |
| redis | ecom-redis | 6379 | redis:7-alpine | Redis cache with persistence |
| adminer | ecom-adminer | 8080 | adminer | Database management UI |

### Production Environment (`docker-compose.prod.yml`)

| Service | Container Name | Port | Image | Description |
|---------|----------------|------|-------|-------------|
| api | ecom-api-prod | 3000 | Custom (Dockerfile.prod) | Optimized API server |
| postgres | ecom-postgres-prod | - | postgres:15-alpine | PostgreSQL (no external port) |
| redis | ecom-redis-prod | - | redis:7-alpine | Redis with password auth |
| nginx | ecom-nginx-prod | 80, 443 | nginx:alpine | Reverse proxy with SSL |

### Staging Environment (`docker-compose.staging.yml`)

| Service | Container Name | Port | Image | Description |
|---------|----------------|------|-------|-------------|
| api | ecom-api-staging | 3000 | Custom (Dockerfile.prod) | API with debug logging |
| postgres | ecom-postgres-staging | 5432 | postgres:15-alpine | PostgreSQL database |
| redis | ecom-redis-staging | 6379 | redis:7-alpine | Redis with password |
| nginx | ecom-nginx-staging | 80, 443 | nginx:alpine | Reverse proxy |
| pgadmin | ecom-pgadmin-staging | 5050 | dpage/pgadmin4 | Database admin UI |
| mailhog | ecom-mailhog-staging | 1025, 8025 | mailhog/mailhog | Email testing |
| prometheus | ecom-prometheus-staging | 9090 | prom/prometheus:v2.47.0 | Metrics collection |
| grafana | ecom-grafana-staging | 3001 | grafana/grafana:10.1.0 | Dashboards |

### Monitoring Stack (`docker-compose.monitoring.yml`)

| Service | Container Name | Port | Image | Description |
|---------|----------------|------|-------|-------------|
| prometheus | prometheus | 9090 | prom/prometheus:v2.47.0 | Metrics collection |
| grafana | grafana | 3001 | grafana/grafana:10.1.0 | Visualization dashboards |
| node-exporter | node-exporter | 9100 | prom/node-exporter:v1.6.1 | System metrics |
| postgres-exporter | postgres-exporter | 9187 | prometheuscommunity/postgres-exporter:v0.14.0 | PostgreSQL metrics |
| redis-exporter | redis-exporter | 9121 | oliver006/redis_exporter:v1.54.0 | Redis metrics |
| alertmanager | alertmanager | 9093 | prom/alertmanager:v0.26.0 | Alert routing |

---

## Data Persistence & Volumes

### Named Volumes (Data Persists Across Restarts)

| Volume | Mount Path | Purpose | Environment |
|--------|------------|---------|-------------|
| `postgres_data` | `/var/lib/postgresql/data` | PostgreSQL database files | Development |
| `postgres_data_prod` | `/var/lib/postgresql/data` | PostgreSQL database files | Production |
| `redis_data` | `/data` | Redis persistence (AOF) | Development |
| `redis_data_prod` | `/data` | Redis persistence (AOF) | Production |
| `prometheus_data` | `/prometheus` | Prometheus metrics data | Monitoring |
| `grafana_data` | `/var/lib/grafana` | Grafana dashboards & config | Monitoring |
| `alertmanager_data` | `/alertmanager` | Alert history | Monitoring |
| `pgadmin_data` | `/var/lib/pgadmin` | pgAdmin configuration | Staging |

### Bind Mounts (Host Filesystem)

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `./uploads` | `/app/uploads` | User uploaded files |
| `./logs` | `/app/logs` | Application logs |
| `./src` | `/app/src` | Source code (dev only) |
| `./monitoring/prometheus` | `/etc/prometheus` | Prometheus config |
| `./monitoring/grafana` | `/etc/grafana/provisioning` | Grafana config |
| `./nginx/nginx.conf` | `/etc/nginx/nginx.conf` | Nginx config |
| `./nginx/ssl` | `/etc/nginx/ssl` | SSL certificates |

### ⚠️ Data Persistence Warning

**Data is PRESERVED when:**
```bash
docker-compose restart                    # Restart containers
docker-compose stop && docker-compose up  # Stop and start
docker-compose down                       # Stop and remove containers
docker-compose up --build                 # Rebuild and start
```

**Data is LOST when:**
```bash
docker-compose down -v                    # -v flag removes volumes!
docker volume rm postgres_data            # Manually remove volume
docker system prune --volumes             # Prune all unused volumes
```

---

## Environment Variables

### Development (`docker-compose.yml`)

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3000 | API port |
| `DATABASE_URL` | postgresql://postgres:postgres@postgres:5432/ecommerce | Database connection |
| `REDIS_URL` | redis://redis:6379 | Redis connection |
| `JWT_SECRET` | your-super-secret-jwt-key-change-in-production | JWT signing key |
| `JWT_REFRESH_SECRET` | your-refresh-secret-key-change-in-production | Refresh token key |

### Production (`docker-compose.prod.yml`)

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Secure JWT signing key |
| `JWT_REFRESH_SECRET` | ✅ | Secure refresh token key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook secret |
| `REDIS_PASSWORD` | Optional | Redis authentication |
| `SMTP_HOST` | ✅ | Email server host |
| `SMTP_PORT` | ✅ | Email server port |
| `SMTP_USER` | ✅ | Email username |
| `SMTP_PASS` | ✅ | Email password |
| `FROM_EMAIL` | ✅ | Sender email address |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `ALLOWED_ORIGINS` | ✅ | Allowed CORS origins |

### Staging (`docker-compose.staging.yml`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PASSWORD` | ✅ | Database password |
| `REDIS_PASSWORD` | ✅ | Redis password |
| `JWT_SECRET` | ✅ | JWT signing key |
| `CORS_ORIGIN` | Optional | CORS origin (default: http://localhost:3000) |
| `PGADMIN_EMAIL` | Optional | pgAdmin login email |
| `PGADMIN_PASSWORD` | Optional | pgAdmin login password |
| `GRAFANA_PASSWORD` | Optional | Grafana admin password |

---

## Docker Commands Quick Reference

### Development

```bash
# Start all services in background
docker-compose up -d

# Start with build (after code changes)
docker-compose up -d --build

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart api

# Execute command in container
docker exec -it ecom-api sh
docker exec -it ecom-postgres psql -U postgres -d ecommerce

# Check container status
docker-compose ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Production

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale API instances (requires load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale api=3

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

### Staging

```bash
# Start staging with environment file
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop staging services
docker-compose -f docker-compose.staging.yml down
```

### Monitoring

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access services:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
# - Alertmanager: http://localhost:9093

# Stop monitoring
docker-compose -f docker-compose.monitoring.yml down
```

### Maintenance

```bash
# View volume usage
docker system df -v

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Remove unused volumes (⚠️ CAREFUL - deletes data!)
docker volume prune

# Full cleanup (⚠️ DESTRUCTIVE)
docker system prune --volumes

# Backup PostgreSQL data
docker exec ecom-postgres pg_dump -U postgres ecommerce > backup.sql

# Restore PostgreSQL data
docker exec -i ecom-postgres psql -U postgres ecommerce < backup.sql
```

---

## Network Configuration

### Networks

| Network | Environment | Subnet | Description |
|---------|-------------|--------|-------------|
| `ecom-network` | Dev/Prod | default | Bridge network for service communication |
| `ecom-staging` | Staging | 172.28.0.0/16 | Isolated staging network |
| `monitoring` | Monitoring | default | Monitoring stack network |

### Internal DNS

Services communicate using container names as hostnames:
- `postgres:5432` - PostgreSQL database
- `redis:6379` - Redis cache
- `api:3000` - API server

---

## Health Checks

All critical services include health checks:

| Service | Check Command | Interval | Retries |
|---------|---------------|----------|---------|
| API | `wget http://localhost:3000/api/v1/health` | 30s | 3 |
| PostgreSQL | `pg_isready -U postgres` | 10s | 5 |
| Redis | `redis-cli ping` | 10s | 5 |
| Nginx | `nginx -t` | 30s | 3 |

---

## Resource Limits (Staging/Production)

| Service | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
|---------|-----------|--------------|--------------|-----------------|
| API | 1 | 1G | 0.5 | 512M |
| PostgreSQL | 1 | 1G | - | - |
| Redis | 0.5 | 256M | - | - |

---

## First-Time Setup

After starting Docker containers for the first time:

```bash
# Push database schema (creates tables)
npx prisma db push

# Seed the database with sample data
npx prisma db seed
```

### Seeded Test Data

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@ecommerce.com | AdminPass123! | ADMIN |
| Test User | user@ecommerce.com | UserPass123! | USER |

The seed also creates 10 sample products across various categories.

---

## Troubleshooting

#### Docker daemon not running

```bash
# Check if Docker is running
docker info

# For Rancher Desktop - start the application
open -a "Rancher Desktop"

# For Colima
colima start
```

#### Prisma Client initialization error

If you see `PrismaClientInitializationError` with OpenSSL issues:

1. The Dockerfile includes OpenSSL installation for Alpine Linux
2. The `prisma/schema.prisma` includes correct binary targets:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
   }
   ```

3. Rebuild the container:
   ```bash
   docker-compose up -d --build api
   ```

#### Container can't connect to database

1. Ensure PostgreSQL container is healthy:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

2. Check if the database exists:
   ```bash
   docker exec ecom-postgres psql -U postgres -c "\l"
   ```

#### Hot reload not working

The container uses nodemon for hot reload. If changes aren't detected:

```bash
# Trigger a manual restart
docker exec ecom-api touch /app/src/app.ts

# Or restart the container
docker-compose restart api
```

#### Port already in use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change the port in docker-compose.yml
```
| grafana | 3001 | Monitoring dashboards |

## Load Testing

The API includes k6 load tests for performance validation.

```bash
# Install k6 (macOS)
brew install k6

# Run smoke test
k6 run --vus 1 --duration 30s load-tests/k6/products.test.js

# Run full load tests
cd load-tests && ./run-all.sh
```

See [load-tests/README.md](load-tests/README.md) for more details.

## Monitoring

Prometheus metrics are available at `/metrics`. Use the provided Docker Compose for monitoring:

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Prometheus at http://localhost:9090
# Access Grafana at http://localhost:3001 (admin/admin)
```

See [monitoring/README.md](monitoring/README.md) for more details.

## Security

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for the complete security audit checklist and implementation details.

## API Endpoint Validation Status

All core endpoints have been validated and return expected responses:

| Category | Status | Notes |
|----------|--------|-------|
| Health Check | ✅ Validated | All 4 endpoints working |
| Authentication | ✅ Validated | Login, validate, me working |
| Products | ✅ Validated | CRUD, search, categories, reviews working |
| Cart | ✅ Validated | Guest and authenticated cart working |
| Orders | ✅ Validated | User and admin endpoints working |
| Users | ✅ Validated | Profile, addresses, preferences working |
| Wishlist | ✅ Validated | All CRUD operations working |
| Payments | ⚠️ Requires Config | Needs Stripe API keys |

### Endpoints Pending External Configuration

| Endpoint | Required Configuration |
|----------|----------------------|
| `POST /payments/create-intent` | Stripe API keys |
| `POST /payments/webhook` | Stripe webhook secret |
| `POST /auth/forgot-password` | Email/SMTP service |
| `POST /auth/reset-password` | Email/SMTP service |

## API Endpoints

### Health Check (`/api/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed health with dependencies |
| GET | `/ready` | Kubernetes readiness probe |
| GET | `/live` | Kubernetes liveness probe |

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| GET | `/validate` | Validate token |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout user |
| POST | `/logout-all` | Logout from all devices |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |
| POST | `/change-password` | Change password (auth) |
| GET | `/me` | Get current user |

### Products (`/api/v1/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products |
| GET | `/search` | Search products |
| GET | `/categories` | Get categories |
| GET | `/brands` | Get brands |
| GET | `/category/:category` | Get by category |
| GET | `/:id` | Get product by ID |
| GET | `/:id/reviews` | Get product reviews |
| POST | `/:id/reviews` | Add review (auth) |
| POST | `/` | Create product (admin) |
| PUT | `/:id` | Update product (admin) |
| DELETE | `/:id` | Delete product (admin) |

### Cart (`/api/v1/cart`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get cart |
| POST | `/items` | Add to cart |
| PUT | `/items/:itemId` | Update cart item |
| DELETE | `/items/:itemId` | Remove from cart |
| DELETE | `/` | Clear cart |
| POST | `/merge` | Merge guest cart (auth) |

### Orders (`/api/v1/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create order (auth) |
| GET | `/` | Get user orders (auth) |
| GET | `/:id` | Get order by ID (auth) |
| POST | `/:id/cancel` | Cancel order (auth) |
| GET | `/:id/tracking` | Get tracking info (auth) |
| GET | `/admin/all` | Get all orders (admin) |
| GET | `/admin/stats` | Get statistics (admin) |
| PATCH | `/:id/status` | Update status (admin) |

### Users (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get profile (auth) |
| PUT | `/profile` | Update profile (auth) |
| GET | `/addresses` | Get addresses (auth) |
| POST | `/addresses` | Add address (auth) |
| PUT | `/addresses/:id` | Update address (auth) |
| DELETE | `/addresses/:id` | Delete address (auth) |
| GET | `/preferences` | Get preferences (auth) |
| PUT | `/preferences` | Update preferences (auth) |
| GET | `/admin/all` | Get all users (admin) |
| PATCH | `/admin/:id/status` | Update user status (admin) |

### Wishlist (`/api/v1/wishlist`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get wishlist (auth) |
| GET | `/count` | Get wishlist count (auth) |
| GET | `/check/:productId` | Check if in wishlist (auth) |
| POST | `/` | Add to wishlist (auth) |
| DELETE | `/:productId` | Remove from wishlist (auth) |
| DELETE | `/` | Clear wishlist (auth) |

### Payments (`/api/v1/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-intent` | Create payment intent (auth) |
| GET | `/order/:orderId` | Get payment by order (auth) |
| POST | `/:paymentId/refund` | Process refund (admin) |
| POST | `/webhook` | Stripe webhook |

## Endpoints Requiring Additional Configuration

Some endpoints require external services or additional setup to function:

### Payments (Requires Stripe)

The payment endpoints require Stripe API keys to be configured:

```bash
# Add to .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

| Endpoint | Requirement |
|----------|-------------|
| `POST /payments/create-intent` | Stripe secret key |
| `POST /payments/:paymentId/refund` | Stripe secret key |
| `POST /payments/webhook` | Stripe webhook secret |

### Email Notifications (Requires SMTP/Email Service)

Password reset and order notification emails require email service configuration:

```bash
# Add to .env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
```

| Endpoint | Requirement |
|----------|-------------|
| `POST /auth/forgot-password` | Email service for sending reset link |
| `POST /auth/reset-password` | Valid reset token from email |
| Order confirmation emails | Email service |

### Staging Environment Email Testing

For staging, use MailHog (included in `docker-compose.staging.yml`):

```bash
# Start staging with MailHog
docker-compose -f docker-compose.staging.yml up -d

# Access MailHog UI at http://localhost:8025
# All emails are captured and viewable in the UI
```

### File Uploads (Requires Storage Configuration)

Product image uploads require storage configuration:

```bash
# Local storage (default)
UPLOAD_DIR=./uploads

# Or cloud storage (optional)
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Project Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── config/            # Configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── cart.service.ts
│   │   ├── orders.service.ts
│   │   ├── users.service.ts
│   │   ├── payments.service.ts
│   │   ├── wishlist.service.ts
│   │   ├── email.service.ts
│   │   ├── cache.service.ts
│   │   └── eventBus.service.ts
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   ├── validators/        # Zod schemas
│   └── app.ts             # Application entry
├── nginx/                 # Nginx configuration
├── docker-compose.yml     # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile             # Development Dockerfile
├── Dockerfile.prod        # Production Dockerfile
├── .env.example           # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- cart.integration.test.ts
```

### Test Coverage

The API has comprehensive integration tests covering:

| Test Suite | Tests | Description |
|------------|-------|-------------|
| Cart | 15 | Add, update, remove items, guest/auth cart |
| Orders | 20 | Create, cancel, track orders, admin operations |
| Users | 20 | Profile, addresses, preferences management |
| Wishlist | 19 | Add, remove, check products in wishlist |
| Payments | 14 | Payment intents, refunds, webhooks |

**Total: 88 integration tests**

### Load Testing

See [Load Testing](#load-testing) section for k6 performance tests.

## Architecture

### Services

- **AuthService**: User authentication, JWT management, password reset
- **ProductsService**: Product CRUD, search, categories, reviews
- **CartService**: Cart management with guest support
- **OrdersService**: Order lifecycle management
- **UsersService**: User profile and preferences
- **WishlistService**: Product wishlist functionality
- **PaymentsService**: Stripe payment integration
- **EmailService**: Transactional emails
- **CacheService**: In-memory caching
- **EventBus**: Internal event system for service communication
- **QueueService**: Async job queue for background processing
- **StreamService**: Streaming operations for large files
- **WorkerService**: Worker thread pool for CPU-intensive tasks
- **StorageService**: Local and S3 file storage

### Cluster Mode

For production, run the API in cluster mode to utilize all CPU cores:

```bash
# Start in cluster mode
node dist/cluster.js

# Or set the number of workers
CLUSTER_WORKERS=4 node dist/cluster.js
```

### Worker Threads

CPU-intensive operations are offloaded to worker threads:

```typescript
import { workerService } from './services/worker.service';

// Heavy computation in background thread
const result = await workerService.heavyComputation(largeArray);

// Hash large data
const hash = await workerService.hashData(fileBuffer);
```

### Queue System

Background jobs are processed asynchronously:

```typescript
import { queueService } from './services/queue.service';

// Add job to queue
await queueService.addJob('email', {
  type: 'orderConfirmation',
  to: 'user@example.com',
  orderId: '123'
});

// Add delayed job (1 hour)
await queueService.addJob('reminder', { userId: 1 }, { delay: 3600000 });
```

### Streaming

Efficient handling of large files:

```typescript
import { streamService } from './services/stream.service';

// Export data as CSV stream
const csvStream = streamService.createCsvExportStream(products);
csvStream.pipe(res);

// Process large file in chunks
await streamService.processLargeFile(filePath, async (chunk) => {
  // Process each chunk
});
```

### Event System

The API uses an internal event bus for decoupled service communication:

- `order.created` - Triggered when a new order is placed
- `order.status_updated` - Triggered when order status changes
- `order.cancelled` - Triggered when an order is cancelled
- `payment.succeeded` - Triggered on successful payment
- `payment.failed` - Triggered on failed payment
- `user.registered` - Triggered when a new user registers
- `product.stock_low` - Triggered when product stock is low

## License

MIT
