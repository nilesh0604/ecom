# Node.js Backend Implementation Plan

**Project:** E-Commerce Application Backend  
**Version:** 1.0  
**Created:** December 25, 2025  
**Framework:** Node.js + TypeScript + Express.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Database Design](#5-database-design)
6. [Authentication Service](#6-authentication-service)
7. [Product Service](#7-product-service)
8. [Order Service](#8-order-service)
9. [User Service](#9-user-service)
10. [Payment Service](#10-payment-service)
11. [Middleware Implementation](#11-middleware-implementation)
12. [Error Handling](#12-error-handling)
13. [Testing Strategy](#13-testing-strategy)
14. [Security Implementation](#14-security-implementation)
15. [Performance Optimization](#15-performance-optimization)
16. [Deployment Strategy](#16-deployment-strategy)
17. [Implementation Timeline](#17-implementation-timeline)

---

## 1. Project Overview

### 1.1 Objectives
- Build a scalable, maintainable backend API for the e-commerce platform
- Ensure full compatibility with the existing React frontend
- Implement best practices for security, performance, and code quality
- Create a modular architecture that supports future enhancements

### 1.2 Core Services
| Service | Responsibility | Base Path |
|---------|----------------|-----------|
| Authentication | User auth, JWT management, password reset | `/api/v1/auth` |
| Products | Product catalog, search, categories, inventory | `/api/v1/products` |
| Cart | Shopping cart management, guest carts, cart merging | `/api/v1/cart` |
| Orders | Order lifecycle, tracking, management | `/api/v1/orders` |
| Users | Profile management, preferences, addresses | `/api/v1/users` |
| Payments | Payment processing, refunds, webhooks | `/api/v1/payments` |
| Notifications | Email, push notifications, SMS alerts | `/api/v1/notifications` |

---

## 2. Technology Stack

### 2.1 Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.2.2",
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.20",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.3",
    "express-validator": "^7.0.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.7",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "prisma": "^5.5.2",
    "@prisma/client": "^5.5.2",
    "zod": "^3.22.4",
    "stripe": "^14.5.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.6",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.15",
    "eslint": "^8.51.0",
    "@typescript-eslint/eslint-plugin": "^6.7.5",
    "@typescript-eslint/parser": "^6.7.5",
    "prettier": "^3.0.3"
  }
}
```

### 2.2 Architecture Patterns
- **Repository Pattern**: For data access abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: Using Inversify or custom DI container
- **CQRS**: Separate read/write models for complex operations
- **Event-Driven**: Internal event bus for service communication

---

## 3. Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── users.controller.ts
│   │   └── payments.controller.ts
│   ├── services/         # Business logic services
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── orders.service.ts
│   │   ├── users.service.ts
│   │   ├── payments.service.ts
│   │   └── email.service.ts
│   ├── repositories/     # Data access layer
│   │   ├── base.repository.ts
│   │   ├── user.repository.ts
│   │   ├── product.repository.ts
│   │   ├── order.repository.ts
│   │   └── payment.repository.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/          # Data models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── Payment.ts
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── users.routes.ts
│   │   ├── payments.routes.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── events/          # Event handling
│   │   ├── event-bus.ts
│   │   ├── handlers/
│   │   └── types.ts
│   ├── tests/           # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── app.ts           # Express app setup
├── prisma/              # Prisma ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/                # API documentation
│   └── swagger.yaml
├── docker/              # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── scripts/             # Utility scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-db.ts
├── .env.example         # Environment variables template
├── .gitignore
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Environment Setup

### 4.1 Environment Variables (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@ecommerce.com"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Upload
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="jpg,jpeg,png,webp"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"

# Client URL (for email links)
CLIENT_URL="http://localhost:5173"

# Session
SESSION_SECRET="your-session-secret-key"

# Cloud Storage (AWS S3)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="ecommerce-uploads"
AWS_REGION="us-east-1"

# Monitoring & Error Tracking
SENTRY_DSN=""
NEW_RELIC_LICENSE_KEY=""

# Feature Flags
FEATURE_GUEST_CHECKOUT=true
FEATURE_WISHLIST=true
FEATURE_REVIEWS=true

# Cart Configuration
CART_EXPIRY_DAYS=30
ABANDONED_CART_REMINDER_HOURS=24
```

### 4.2 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 4.3 Package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## 5. Database Design

### 5.1 Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String
  firstName   String
  lastName    String
  phone       String?
  gender      String?
  age         Int?
  image       String?
  role        Role     @default(USER)
  isActive    Boolean  @default(true)
  emailVerified Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  orders      Order[]
  addresses   UserAddress[]
  preferences UserPreferences?
  refreshTokens RefreshToken[]
  reviews     ProductReview[]
  carts       Cart[]
  wishlists   Wishlist[]

  @@index([email])
  @@index([isActive])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    Int
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

model Product {
  id                  Int      @id @default(autoincrement())
  title               String
  description         String
  price               Decimal  @db.Decimal(10, 2)
  discountPercentage Decimal? @db.Decimal(5, 2)
  thumbnail           String
  images              String[]
  category            String
  brand               String
  rating              Decimal? @default(0) @db.Decimal(3, 2)
  stock               Int      @default(0)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  reviews ProductReview[]
  orderItems OrderItem[]
  cartItems CartItem[]
  wishlists Wishlist[]

  // Indexes for search performance
  @@index([category])
  @@index([brand])
  @@index([price])
  @@index([title])
  @@index([isActive, category])
  @@map("products")
}

model ProductReview {
  id           Int      @id @default(autoincrement())
  productId    Int
  userId       Int
  rating       Int      // 1-5
  comment      String?
  date         DateTime @default(now())
  reviewerName String
  reviewerEmail String

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId])
  @@map("product_reviews")
}

model Order {
  id               String      @id @default(cuid())
  userId           Int
  status           OrderStatus @default(PENDING)
  subtotal         Decimal     @db.Decimal(10, 2)
  tax              Decimal     @db.Decimal(10, 2)
  shipping         Decimal     @default(0) @db.Decimal(10, 2)
  total            Decimal     @db.Decimal(10, 2)
  currency         String      @default("USD")
  trackingNumber   String?
  carrier          String?
  estimatedDelivery DateTime?
  deliveredAt      DateTime?
  cancelledAt      DateTime?
  cancelReason     String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  // Relations
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  address   ShippingAddress?
  payment   Payment?

  @@map("orders")
}

model OrderItem {
  id           Int     @id @default(autoincrement())
  orderId      String
  productId    Int
  quantity     Int
  price        Decimal @db.Decimal(10, 2)
  total        Decimal @db.Decimal(10, 2)

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model ShippingAddress {
  id        Int    @id @default(autoincrement())
  orderId   String @unique
  firstName String
  lastName  String
  address   String
  city      String
  state     String
  zipCode   String
  country   String
  phone     String

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("shipping_addresses")
}

model UserAddress {
  id        Int      @id @default(autoincrement())
  userId    Int
  label     String   // "Home", "Work", etc.
  firstName String
  lastName  String
  address   String
  city      String
  state     String
  zipCode   String
  country   String
  phone     String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_addresses")
}

model UserPreferences {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  theme             String   @default("light")
  notifications     Boolean  @default(true)
  emailNotifications Boolean @default(true)
  currency          String   @default("USD")
  language          String   @default("en")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model Payment {
  id             String          @id @default(cuid())
  orderId        String          @unique
  paymentIntentId String         @unique
  amount         Decimal         @db.Decimal(10, 2)
  currency       String
  status         PaymentStatus
  method         String
  provider       String          @default("stripe")
  metadata       Json?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  order Order @relation(fields: [orderId], references: [id])

  @@map("payments")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  REQUIRES_PAYMENT_METHOD
  REQUIRES_CONFIRMATION
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELED
}

model Cart {
  id        String     @id @default(cuid())
  userId    Int?       // nullable for guest carts
  sessionId String?    // for guest users
  expiresAt DateTime   // for cleanup of abandoned carts
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relations
  user  User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@index([userId])
  @@index([sessionId])
  @@index([expiresAt])
  @@map("carts")
}

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    String
  productId Int
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@map("cart_items")
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entity    String   // User, Product, Order, etc.
  entityId  String?
  oldValue  Json?
  newValue  Json?
  ipAddress String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([entity, entityId])
  @@index([action, createdAt])
  @@map("audit_logs")
}

model Wishlist {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlists")
}
```

### 5.2 Database Migration Strategy
```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function runMigrations() {
  try {
    logger.info('Starting database migration...');
    
    // Run Prisma migrations
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed initial data if needed
    await seedInitialData();
    
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedInitialData() {
  // Create default categories
  const categories = [
    'smartphones',
    'laptops',
    'fragrances',
    'skincare',
    'groceries',
    'home-decoration',
    'furniture',
    'tops',
    'womens-dresses',
    'womens-shoes'
  ];
  
  // Implementation for seeding categories
}
```

---

## 6. Authentication Service

### 6.1 Service Implementation
```typescript
// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto, LoginDto } from '../types/auth';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private emailService: EmailService
  ) {}

  async register(userData: CreateUserDto): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });

    // Generate JWT
    const token = this.generateToken(user.id, user.email, user.role);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, user.id);

    logger.info(`New user registered: ${user.email}`);

    return { user, token };
  }

  async login(credentials: LoginDto): Promise<{ user: User; token: string; refreshToken: string }> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (!user.isActive) {
      throw new AppError('Account is locked', 423, 'ACCOUNT_LOCKED');
    }

    // Generate tokens
    const token = this.generateToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    return { user, token, refreshToken };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub }
      });

      return user;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    // Verify refresh token
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!token || token.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const newToken = this.generateToken(
      token.user.id,
      token.user.email,
      token.user.role
    );

    return { token: newToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent user enumeration
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken(user.id);
    
    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);
    
    logger.info(`Password reset email sent to: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: decoded.sub },
      data: { password: hashedPassword }
    });

    logger.info(`Password reset for user ID: ${decoded.sub}`);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info(`Password changed for user ID: ${userId}`);
  }

  private generateToken(userId: number, email: string, role: string): string {
    return jwt.sign(
      {
        sub: userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
        jti: this.generateJTI()
      },
      process.env.JWT_SECRET!
    );
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const token = jwt.sign(
      {
        sub: userId,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return token;
  }

  private generateResetToken(userId: number): string {
    return jwt.sign(
      {
        sub: userId,
        type: 'password_reset'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  }

  private generateJTI(): string {
    return require('uuid').v4();
  }
}
```

### 6.2 Controller Implementation
```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../types/auth';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserDto = req.body;
    const result = await this.authService.register(userData);
    
    ApiResponse.created(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const credentials: LoginDto = req.body;
    const result = await this.authService.login(credentials);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    ApiResponse.success(res, {
      user: result.user,
      token: result.token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    }, 'Login successful');
  });

  validate = asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }
    
    const user = await this.authService.validateToken(token);
    
    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    
    ApiResponse.success(res, {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }, 'Token is valid');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    ApiResponse.success(res, null, 'Logged out successfully');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return ApiResponse.unauthorized(res, 'No refresh token provided');
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    
    ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    await this.authService.forgotPassword(email);
    
    // Always return success
    ApiResponse.success(res, null, 'Password reset email sent');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    await this.authService.resetPassword(token, newPassword);
    
    ApiResponse.success(res, null, 'Password reset successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;
    
    await this.authService.changePassword(userId, currentPassword, newPassword);
    
    ApiResponse.success(res, null, 'Password changed successfully');
  });
}
```

### 6.3 Middleware Implementation
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../utils/response';
import { AppError } from '../utils/errors';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return ApiResponse.unauthorized(res, 'Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    return next(error);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role
      };
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};
```

---

## 7. Product Service

### 7.1 Service Implementation
```typescript
// src/services/products.service.ts
import { PrismaClient, Product, Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '../types/product';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { RedisClient } from '../config/redis';

export class ProductsService {
  constructor(
    private prisma: PrismaClient,
    private redis: RedisClient
  ) {}

  async getProducts(query: ProductQuery) {
    const {
      skip = 0,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice,
      brand,
      category,
      inStock
    } = query;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true
    };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (brand) {
      where.brand = {
        contains: brand,
        mode: 'insensitive'
      };
    }

    if (category) {
      where.category = category;
    }

    if (inStock === true) {
      where.stock = { gt: 0 };
    }

    // Build order by clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: order
    };

    // Check cache
    const cacheKey = `products:${JSON.stringify({ skip, limit, where, orderBy })}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Execute query
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Math.min(limit, 100) // Max 100 items per page
      }),
      this.prisma.product.count({ where })
    ]);

    const result = {
      products,
      total,
      skip,
      limit
    };

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  async getProductById(id: number): Promise<Product> {
    // Check cache first
    const cacheKey = `product:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        reviews: {
          take: 10,
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Cache for 10 minutes
    await this.redis.setex(cacheKey, 600, JSON.stringify(product));

    return product;
  }

  async searchProducts(query: string, skip = 0, limit = 10) {
    const searchQuery = {
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                brand: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                category: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      skip,
      take: Math.min(limit, 100)
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany(searchQuery),
      this.prisma.product.count({ where: searchQuery.where })
    ]);

    return {
      products,
      total,
      skip,
      limit
    };
  }

  async getProductsByCategory(category: string, skip = 0, limit = 10) {
    const where = {
      category,
      isActive: true
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: Math.min(limit, 100),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products,
      total,
      skip,
      limit
    };
  }

  async getCategories(): Promise<string[]> {
    // Check cache
    const cacheKey = 'categories';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    const result = categories.map(c => c.category);

    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(result));

    return result;
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: productData
    });

    // Invalidate relevant caches
    await this.invalidateProductCaches();

    logger.info(`Product created: ${product.title} (ID: ${product.id})`);

    return product;
  }

  async updateProduct(id: number, updateData: UpdateProductDto): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateData
    });

    // Invalidate caches
    await this.redis.del(`product:${id}`);
    await this.invalidateProductCaches();

    logger.info(`Product updated: ${product.title} (ID: ${product.id})`);

    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    // Soft delete
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    // Invalidate caches
    await this.redis.del(`product:${id}`);
    await this.invalidateProductCaches();

    logger.info(`Product deleted: ID ${id}`);
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity
        }
      }
    });

    // Invalidate cache
    await this.redis.del(`product:${id}`);

    logger.info(`Stock updated for product ID ${id}: ${quantity > 0 ? '+' : ''}${quantity}`);
  }

  private async invalidateProductCaches(): Promise<void> {
    // Delete all product list caches
    const keys = await this.redis.keys('products:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 7.2 Controller Implementation
```typescript
// src/controllers/products.controller.ts
import { Request, Response } from 'express';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../types/product';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';
import { uploadImages } from '../middleware/upload.middleware';

export class ProductsController {
  constructor(private productsService: ProductsService) {}

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.productsService.getProducts(req.query as any);
    ApiResponse.success(res, result);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await this.productsService.getProductById(id);
    ApiResponse.success(res, product);
  });

  searchProducts = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const { skip = 0, limit = 10 } = req.query;
    
    const result = await this.productsService.searchProducts(
      q as string,
      parseInt(skip as string),
      parseInt(limit as string)
    );
    
    ApiResponse.success(res, result);
  });

  getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = req.params.category;
    const { skip = 0, limit = 10 } = req.query;
    
    const result = await this.productsService.getProductsByCategory(
      category,
      parseInt(skip as string),
      parseInt(limit as string)
    );
    
    ApiResponse.success(res, result);
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.productsService.getCategories();
    ApiResponse.success(res, categories);
  });

  createProduct = [
    uploadImages,
    asyncHandler(async (req: Request, res: Response) => {
      const productData: CreateProductDto = {
        ...req.body,
        price: parseFloat(req.body.price),
        discountPercentage: req.body.discountPercentage 
          ? parseFloat(req.body.discountPercentage) 
          : null,
        stock: parseInt(req.body.stock),
        images: req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : []
      };
      
      const product = await this.productsService.createProduct(productData);
      ApiResponse.created(res, product, 'Product created successfully');
    })
  ];

  updateProduct = [
    uploadImages,
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const updateData: UpdateProductDto = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        discountPercentage: req.body.discountPercentage 
          ? parseFloat(req.body.discountPercentage) 
          : undefined,
        stock: req.body.stock ? parseInt(req.body.stock) : undefined,
        images: req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : undefined
      };
      
      const product = await this.productsService.updateProduct(id, updateData);
      ApiResponse.success(res, product, 'Product updated successfully');
    })
  ];

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.productsService.deleteProduct(id);
    ApiResponse.success(res, { id, isDeleted: true }, 'Product deleted successfully');
  });
}
```

---

## 7.5 Cart Service

### 7.5.1 Service Implementation
```typescript
// src/services/cart.service.ts
import { PrismaClient, Cart, CartItem } from '@prisma/client';
import { AddToCartDto, UpdateCartItemDto } from '../types/cart';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { RedisClient } from '../config/redis';

export class CartService {
  constructor(
    private prisma: PrismaClient,
    private redis: RedisClient
  ) {}

  async getOrCreateCart(userId?: number, sessionId?: string): Promise<Cart> {
    // Try to find existing cart
    let cart = await this.prisma.cart.findFirst({
      where: userId 
        ? { userId } 
        : { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discountPercentage: true,
                thumbnail: true,
                stock: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      // Create new cart
      cart = await this.prisma.cart.create({
        data: {
          userId,
          sessionId: userId ? null : sessionId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }

    return cart;
  }

  async getCart(userId?: number, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // Calculate totals
    const items = cart.items.map(item => {
      const price = Number(item.product.price);
      const discount = Number(item.product.discountPercentage || 0);
      const discountedPrice = price * (1 - discount / 100);
      
      return {
        ...item,
        unitPrice: price,
        discountedPrice,
        itemTotal: discountedPrice * item.quantity
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount,
      expiresAt: cart.expiresAt
    };
  }

  async addToCart(
    userId: number | undefined,
    sessionId: string | undefined,
    data: AddToCartDto
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Validate product
    const product = await this.prisma.product.findFirst({
      where: {
        id: data.productId,
        isActive: true
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock < data.quantity) {
      throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    // Upsert cart item
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId
        }
      },
      create: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity
      },
      update: {
        quantity: {
          increment: data.quantity
        }
      }
    });

    // Invalidate cache
    await this.invalidateCartCache(cart.id);

    logger.info(`Item added to cart: ${cart.id}, product: ${data.productId}`);

    return this.getOrCreateCart(userId, sessionId);
  }

  async updateCartItem(
    userId: number | undefined,
    sessionId: string | undefined,
    itemId: number,
    data: UpdateCartItemDto
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Find cart item
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      },
      include: { product: true }
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Validate stock
    if (data.quantity > cartItem.product.stock) {
      throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    if (data.quantity <= 0) {
      // Remove item
      await this.prisma.cartItem.delete({
        where: { id: itemId }
      });
    } else {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity }
      });
    }

    await this.invalidateCartCache(cart.id);

    return this.getOrCreateCart(userId, sessionId);
  }

  async removeFromCart(
    userId: number | undefined,
    sessionId: string | undefined,
    itemId: number
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    await this.invalidateCartCache(cart.id);

    logger.info(`Item removed from cart: ${cart.id}, item: ${itemId}`);

    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId?: number, sessionId?: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    await this.invalidateCartCache(cart.id);

    logger.info(`Cart cleared: ${cart.id}`);
  }

  async mergeGuestCart(userId: number, sessionId: string): Promise<Cart> {
    // Find guest cart
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true }
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const item of guestCart.items) {
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: userCart.id,
            productId: item.productId
          }
        },
        create: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity
        },
        update: {
          quantity: {
            increment: item.quantity
          }
        }
      });
    }

    // Delete guest cart
    await this.prisma.cart.delete({
      where: { id: guestCart.id }
    });

    await this.invalidateCartCache(userCart.id);

    logger.info(`Guest cart merged: ${guestCart.id} -> ${userCart.id}`);

    return this.getOrCreateCart(userId);
  }

  async cleanupExpiredCarts(): Promise<number> {
    const result = await this.prisma.cart.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        userId: null // Only delete guest carts
      }
    });

    logger.info(`Cleaned up ${result.count} expired carts`);

    return result.count;
  }

  private async invalidateCartCache(cartId: string): Promise<void> {
    await this.redis.del(`cart:${cartId}`);
  }
}
```

### 7.5.2 Controller Implementation
```typescript
// src/controllers/cart.controller.ts
import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../types/cart';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class CartController {
  constructor(private cartService: CartService) {}

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    
    const cart = await this.cartService.getCart(userId, sessionId);
    ApiResponse.success(res, cart);
  });

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    const data: AddToCartDto = req.body;
    
    const cart = await this.cartService.addToCart(userId, sessionId, data);
    ApiResponse.success(res, cart, 'Item added to cart');
  });

  updateCartItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    const itemId = parseInt(req.params.itemId);
    const data: UpdateCartItemDto = req.body;
    
    const cart = await this.cartService.updateCartItem(userId, sessionId, itemId, data);
    ApiResponse.success(res, cart, 'Cart updated');
  });

  removeFromCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    const itemId = parseInt(req.params.itemId);
    
    const cart = await this.cartService.removeFromCart(userId, sessionId, itemId);
    ApiResponse.success(res, cart, 'Item removed from cart');
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    
    await this.cartService.clearCart(userId, sessionId);
    ApiResponse.success(res, null, 'Cart cleared');
  });

  mergeCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
    
    const cart = await this.cartService.mergeGuestCart(userId, sessionId);
    ApiResponse.success(res, cart, 'Cart merged successfully');
  });
}
```

### 7.5.3 Routes
```typescript
// src/routes/cart.routes.ts
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { AddToCartSchema, UpdateCartItemSchema } from '../validators/cart.validator';

const router = Router();
const cartController = new CartController(/* inject dependencies */);

router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, validateRequest(AddToCartSchema), cartController.addToCart);
router.put('/items/:itemId', optionalAuth, validateRequest(UpdateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:itemId', optionalAuth, cartController.removeFromCart);
router.delete('/', optionalAuth, cartController.clearCart);
router.post('/merge', authenticate, cartController.mergeCart);

export default router;
```

---

## 8. Order Service

### 8.1 Service Implementation
```typescript
// src/services/orders.service.ts
import { PrismaClient, Order, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types/order';
import { ProductsService } from './products.service';
import { PaymentsService } from './payments.service';
import { EventBus } from '../events/event-bus';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { RedisClient } from '../config/redis';

export class OrdersService {
  constructor(
    private prisma: PrismaClient,
    private productsService: ProductsService,
    private paymentsService: PaymentsService,
    private eventBus: EventBus,
    private redis: RedisClient
  ) {}

  async createOrder(userId: number, orderData: CreateOrderDto): Promise<Order> {
    // Start transaction with serializable isolation to prevent race conditions
    return await this.prisma.$transaction(async (tx) => {
      // Validate products and calculate totals
      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of orderData.products) {
        // Use atomic update with stock check to prevent race conditions
        // This ensures stock is only decremented if sufficient quantity exists
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.id,
            isActive: true,
            stock: { gte: item.quantity } // Ensure sufficient stock
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // If no rows updated, either product doesn't exist or insufficient stock
        if (updateResult.count === 0) {
          const product = await tx.product.findFirst({
            where: { id: item.id, isActive: true }
          });

          if (!product) {
            throw new AppError(`Product ${item.id} not found`, 404, 'PRODUCT_NOT_FOUND');
          }

          throw new AppError(
            `Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        // Get product details for order item
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });

        const itemTotal = Number(product!.price) * item.quantity;
        const discountAmount = itemTotal * (Number(product!.discountPercentage || 0) / 100);
        const discountedTotal = itemTotal - discountAmount;

        subtotal += discountedTotal;

        orderItems.push({
          productId: item.id,
          quantity: item.quantity,
          price: product!.price,
          total: discountedTotal
        });
      }

      // Calculate totals
      const tax = subtotal * 0.08; // 8% tax rate
      const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          shipping,
          total,
          items: {
            create: orderItems
          },
          address: {
            create: orderData.shippingAddress
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          address: true
        }
      });

      // Process payment if provided
      if (orderData.paymentIntentId) {
        await this.paymentsService.confirmPayment(
          orderData.paymentIntentId,
          order.id
        );
      }

      // Emit order created event
      await this.eventBus.emit('order.created', {
        orderId: order.id,
        userId,
        total: Number(total)
      });

      logger.info(`Order created: ${order.id} for user ${userId}`);

      return order;
    });
  }

  async getUserOrders(
    userId: number,
    skip = 0,
    limit = 10,
    status?: OrderStatus
  ) {
    const where: Prisma.OrderWhereInput = {
      userId
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true
                }
              }
            }
          }
        }
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      products: orders,
      total,
      skip,
      limit
    };
  }

  async getOrderById(orderId: string, userId?: number): Promise<Order> {
    const where: Prisma.OrderWhereInput = {
      id: orderId
    };

    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        address: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  async getAllOrders(skip = 0, limit = 10, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      orders,
      total,
      skip,
      limit
    };
  }

  async updateOrderStatus(
    orderId: string,
    updateData: UpdateOrderStatusDto
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: updateData.status,
        trackingNumber: updateData.trackingNumber,
        carrier: updateData.carrier,
        estimatedDelivery: updateData.estimatedDelivery
      },
      include: {
        items: true,
        user: true
      }
    });

    // Emit status update event
    await this.eventBus.emit('order.status_updated', {
      orderId,
      status: updateData.status,
      userId: order.userId
    });

    logger.info(`Order ${orderId} status updated to ${updateData.status}`);

    return order;
  }

  async cancelOrder(orderId: string, userId: number, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId, userId);

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new AppError(
        'Cannot cancel order that has been shipped',
        422,
        'ORDER_CANNOT_CANCEL'
      );
    }

    // Start transaction for refund
    return await this.prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason
        }
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Process refund if payment was made
      if (order.payment) {
        await this.paymentsService.refundPayment(order.payment.id);
      }

      // Emit order cancelled event
      await this.eventBus.emit('order.cancelled', {
        orderId,
        userId,
        reason
      });

      logger.info(`Order ${orderId} cancelled by user ${userId}`);

      return updatedOrder;
    });
  }

  async getTrackingInfo(orderId: string, userId: number) {
    const order = await this.getOrderById(orderId, userId);

    if (!order.trackingNumber) {
      throw new AppError('Tracking information not available', 404, 'TRACKING_UNAVAILABLE');
    }

    // Mock tracking data - integrate with actual carrier API
    const trackingData = {
      orderId,
      status: 'in_transit',
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: `https://www.ups.com/track?tracknum=${order.trackingNumber}`,
      estimatedDelivery: order.estimatedDelivery,
      events: [
        {
          status: 'picked_up',
          location: 'Origin Facility',
          timestamp: order.createdAt,
          description: 'Package picked up'
        },
        {
          status: 'in_transit',
          location: 'In Transit',
          timestamp: order.updatedAt,
          description: 'Package in transit'
        }
      ]
    };

    return trackingData;
  }

  async getOrderInvoice(orderId: string, userId: number): Promise<Buffer> {
    const order = await this.getOrderById(orderId, userId);

    // Generate PDF invoice
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Build PDF content
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    // Customer info
    doc.text('Bill To:');
    doc.text(`${order.user.firstName} ${order.user.lastName}`);
    doc.text(order.user.email);
    doc.moveDown();

    // Order items
    doc.text('Items:');
    order.items.forEach((item) => {
      doc.text(
        `${item.product.title} - Qty: ${item.quantity} - $${item.total}`
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: $${order.subtotal}`);
    doc.text(`Tax: $${order.tax}`);
    doc.text(`Shipping: $${order.shipping}`);
    doc.fontSize(14).text(`Total: $${order.total}`);

    // Return PDF buffer
    return new Promise((resolve) => {
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.end();
    });
  }
}
```

### 8.2 Controller Implementation
```typescript
// src/controllers/orders.controller.ts
import { Request, Response } from 'express';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types/order';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  createOrder = [
    validateRequest(CreateOrderDto),
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user!.id;
      const orderData: CreateOrderDto = req.body;
      
      const order = await this.ordersService.createOrder(userId, orderData);
      ApiResponse.created(res, order, 'Order created successfully');
    })
  ];

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { skip = 0, limit = 10, status } = req.query;
    
    const result = await this.ordersService.getUserOrders(
      userId,
      parseInt(skip as string),
      parseInt(limit as string),
      status as any
    );
    
    ApiResponse.success(res, result);
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user!.id;
    
    const order = await this.ordersService.getOrderById(orderId, userId);
    ApiResponse.success(res, order);
  });

  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const { skip = 0, limit = 10, status } = req.query;
    
    const result = await this.ordersService.getAllOrders(
      parseInt(skip as string),
      parseInt(limit as string),
      status as any
    );
    
    ApiResponse.success(res, result);
  });

  updateOrderStatus = [
    validateRequest(UpdateOrderStatusDto),
    asyncHandler(async (req: Request, res: Response) => {
      const orderId = req.params.id;
      const updateData: UpdateOrderStatusDto = req.body;
      
      const order = await this.ordersService.updateOrderStatus(orderId, updateData);
      ApiResponse.success(res, order, 'Order status updated successfully');
    })
  ];

  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user!.id;
    const { reason } = req.body;
    
    const order = await this.ordersService.cancelOrder(orderId, userId, reason);
    ApiResponse.success(res, order, 'Order cancelled successfully');
  });

  getTrackingInfo = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user!.id;
    
    const tracking = await this.ordersService.getTrackingInfo(orderId, userId);
    ApiResponse.success(res, tracking);
  });

  getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user!.id;
    
    const pdfBuffer = await this.ordersService.getOrderInvoice(orderId, userId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${orderId}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  });

  addOrderNote = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const { note } = req.body;
    
    // Implementation for adding order notes
    ApiResponse.success(res, null, 'Note added successfully');
  });

  requestReturn = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const { reason, items } = req.body;
    
    // Implementation for return requests
    ApiResponse.success(res, null, 'Return request submitted');
  });
}
```

---

## 9. User Service

### 9.1 Service Implementation
```typescript
// src/services/users.service.ts
import { PrismaClient, User, Prisma } from '@prisma/client';
import { UpdateProfileDto, UserPreferencesDto, AddressDto } from '../types/user';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { RedisClient } from '../config/redis';
import { deleteFile, uploadFile } from '../utils/fileUpload';

export class UsersService {
  constructor(
    private prisma: PrismaClient,
    private redis: RedisClient
  ) {}

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        preferences: true,
        addresses: {
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async updateProfile(id: number, updateData: UpdateProfileDto): Promise<User> {
    // Check if email is being changed and if it's already taken
    if (updateData.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id }
        }
      });

      if (existingUser) {
        throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData
    });

    // Clear cache
    await this.redis.del(`user:${id}`);

    logger.info(`User profile updated: ${user.email}`);

    return user;
  }

  async uploadAvatar(userId: number, file: Express.Multer.File): Promise<{ imageUrl: string }> {
    // Upload to cloud storage (S3, Cloudinary, etc.)
    const imageUrl = await uploadFile(file, 'avatars', `user-${userId}`);

    // Update user avatar
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (user?.image) {
      // Delete old avatar
      await deleteFile(user.image);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl }
    });

    // Clear cache
    await this.redis.del(`user:${userId}`);

    return { imageUrl };
  }

  async getUserPreferences(userId: number) {
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences
      preferences = await this.prisma.userPreferences.create({
        data: { userId }
      });
    }

    return preferences;
  }

  async updateUserPreferences(userId: number, preferencesData: UserPreferencesDto) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: preferencesData,
      create: {
        userId,
        ...preferencesData
      }
    });

    return preferences;
  }

  async getUserAddresses(userId: number) {
    return await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  }

  async addAddress(userId: number, addressData: AddressDto) {
    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await this.prisma.userAddress.create({
      data: {
        userId,
        ...addressData
      }
    });

    return address;
  }

  async updateAddress(userId: number, addressId: number, updateData: Partial<AddressDto>) {
    // Verify ownership
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await this.prisma.userAddress.update({
      where: { id: addressId },
      data: updateData
    });

    return updatedAddress;
  }

  async deleteAddress(userId: number, addressId: number) {
    // Verify ownership
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    // Don't allow deletion of default address
    if (address.isDefault) {
      throw new AppError('Cannot delete default address', 400, 'CANNOT_DELETE_DEFAULT');
    }

    await this.prisma.userAddress.delete({
      where: { id: addressId }
    });

    return { success: true };
  }

  async deleteAccount(userId: number, password: string, reason?: string) {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 400, 'INVALID_PASSWORD');
    }

    // Soft delete - mark as inactive
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Prevent email reuse
      }
    });

    // Clear cache
    await this.redis.del(`user:${userId}`);

    logger.info(`User account deleted: ${user.email} (Reason: ${reason || 'Not provided'})`);

    return { message: 'Account scheduled for deletion' };
  }

  async getUserStats(userId: number) {
    const [orderCount, totalSpent, lastOrder] = await Promise.all([
      this.prisma.order.count({
        where: { userId }
      }),
      this.prisma.order.aggregate({
        where: { 
          userId,
          status: 'DELIVERED'
        },
        _sum: { total: true }
      }),
      this.prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: true
        }
      })
    ]);

    return {
      totalOrders: orderCount,
      totalSpent: Number(totalSpent._sum.total || 0),
      lastOrder,
      memberSince: new Date().toISOString() // Would come from actual user.createdAt
    };
  }
}
```

---

## 10. Payment Service

### 10.1 Service Implementation
```typescript
// src/services/payments.service.ts
import Stripe from 'stripe';
import { PrismaClient, Payment, PaymentStatus } from '@prisma/client';
import { CreatePaymentIntentDto } from '../types/payment';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { EventBus } from '../events/event-bus';

export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaClient,
    private eventBus: EventBus
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentIntent(
    userId: number,
    paymentData: CreatePaymentIntentDto
  ) {
    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'usd',
        metadata: {
          userId: userId.toString(),
          ...paymentData.metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Save to database
      const payment = await this.prisma.payment.create({
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentData.amount,
          currency: paymentData.currency || 'usd',
          status: this.mapStripeStatus(paymentIntent.status),
          method: 'card',
          provider: 'stripe',
          metadata: paymentData.metadata || {}
        }
      });

      logger.info(`Payment intent created: ${paymentIntent.id} for user ${userId}`);

      return {
        id: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      };
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new AppError('Failed to create payment intent', 500, 'PAYMENT_FAILED');
    }
  }

  async confirmPayment(paymentIntentId: string, orderId?: string) {
    try {
      // Retrieve from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Update database
      const payment = await this.prisma.payment.update({
        where: { paymentIntentId },
        data: {
          status: this.mapStripeStatus(paymentIntent.status),
          orderId
        }
      });

      // Emit payment event
      if (payment.status === PaymentStatus.SUCCEEDED && orderId) {
        await this.eventBus.emit('payment.succeeded', {
          paymentId: payment.id,
          orderId,
          amount: Number(payment.amount)
        });
      }

      return payment;
    } catch (error) {
      logger.error('Error confirming payment:', error);
      throw new AppError('Failed to confirm payment', 500, 'PAYMENT_CONFIRM_FAILED');
    }
  }

  async getPaymentStatus(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentIntentId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // Sync with Stripe
    try {
      const stripePayment = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (stripePayment.status !== payment.status) {
        // Update status
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: this.mapStripeStatus(stripePayment.status)
          }
        });

        return updatedPayment;
      }
    } catch (error) {
      logger.error('Error syncing payment status:', error);
    }

    return payment;
  }

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    try {
      // Create refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: amount || Number(payment.amount)
      });

      // Update payment status
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CANCELED
        }
      });

      logger.info(`Refund created: ${refund.id} for payment ${paymentId}`);

      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw new AppError('Failed to process refund', 500, 'REFUND_FAILED');
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK');
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        status: PaymentStatus.SUCCEEDED
      }
    });

    // Emit event
    await this.eventBus.emit('payment.succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });

    logger.info(`Payment succeeded: ${paymentIntent.id}`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        status: PaymentStatus.FAILED
      }
    });

    // Emit event
    await this.eventBus.emit('payment.failed', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      lastPaymentError: paymentIntent.last_payment_error
    });

    logger.info(`Payment failed: ${paymentIntent.id}`);
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        status: PaymentStatus.CANCELED
      }
    });

    logger.info(`Payment canceled: ${paymentIntent.id}`);
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'requires_payment_method':
        return PaymentStatus.REQUIRES_PAYMENT_METHOD;
      case 'requires_confirmation':
        return PaymentStatus.REQUIRES_CONFIRMATION;
      case 'processing':
        return PaymentStatus.PROCESSING;
      case 'succeeded':
        return PaymentStatus.SUCCEEDED;
      case 'canceled':
        return PaymentStatus.CANCELED;
      default:
        return PaymentStatus.FAILED;
    }
  }
}
```

---

## 11. Middleware Implementation

### 11.1 Validation Middleware
```typescript
// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../utils/response';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return ApiResponse.badRequest(res, 'Validation failed', {
          code: 'VALIDATION_ERROR',
          details: errors.reduce((acc, err) => {
            acc[err.field] = [err.message];
            return acc;
          }, {} as Record<string, string[]>)
        });
      }
      next(error);
    }
  };
};

// Using Zod schemas
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter and one number'),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50)
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});
```

### 11.2 Request ID Middleware
```typescript
// src/middleware/request-id.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Attach to request and response
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
```

### 11.3 Error Handling Middleware
```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (error instanceof AppError) {
    return ApiResponse.error(res, error.message, error.statusCode, {
      code: error.code,
      details: error.details
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return ApiResponse.conflict(res, 'Resource already exists', {
          code: 'DUPLICATE_RESOURCE'
        });
      case 'P2025':
        return ApiResponse.notFound(res, 'Resource not found', {
          code: 'RESOURCE_NOT_FOUND'
        });
      default:
        return ApiResponse.error(res, 'Database error', 500, {
          code: 'DATABASE_ERROR'
        });
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token', {
      code: 'INVALID_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired', {
      code: 'TOKEN_EXPIRED'
    });
  }

  // Default error
  return ApiResponse.error(res, 'Internal server error', 500, {
    code: 'INTERNAL_ERROR'
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  ApiResponse.notFound(res, `Route ${req.originalUrl} not found`, {
    code: 'ROUTE_NOT_FOUND'
  });
};
```

### 11.4 Rate Limiting Middleware
```typescript
// src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { RedisClient } from '../config/redis';

const redis = new RedisClient();

// General rate limiter
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    message: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    message: 'Upload limit exceeded',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
});
```

---

## 12. Error Handling

### 12.1 Custom Error Classes
```typescript
// src/utils/errors.ts
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

### 12.2 Response Utility
```typescript
// src/utils/response.ts
import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any, message = 'Success') {
    res.status(200).json({
      data,
      status: 200,
      message,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static created(res: Response, data: any, message = 'Created successfully') {
    res.status(201).json({
      data,
      status: 201,
      message,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static badRequest(res: Response, message: string, details?: any) {
    res.status(400).json({
      message,
      status: 400,
      code: details?.code || 'BAD_REQUEST',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized', details?: any) {
    res.status(401).json({
      message,
      status: 401,
      code: details?.code || 'UNAUTHORIZED',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static forbidden(res: Response, message = 'Forbidden', details?: any) {
    res.status(403).json({
      message,
      status: 403,
      code: details?.code || 'FORBIDDEN',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static notFound(res: Response, message = 'Not found', details?: any) {
    res.status(404).json({
      message,
      status: 404,
      code: details?.code || 'NOT_FOUND',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static conflict(res: Response, message: string, details?: any) {
    res.status(409).json({
      message,
      status: 409,
      code: details?.code || 'CONFLICT',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static error(res: Response, message: string, statusCode: number, details?: any) {
    res.status(statusCode).json({
      message,
      status: statusCode,
      code: details?.code || 'ERROR',
      details,
      meta: {
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

---

## 13. Testing Strategy

### 13.1 Test Setup
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/app.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
};
```

### 13.2 Test Utilities
```typescript
// src/tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Setup test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || 'postgresql://test:test@localhost:5432/ecommerce_test'
    }
  }
});

beforeAll(async () => {
  // Reset database
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST }
  });
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
global.createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    }
  });
};

global.createTestProduct = async (overrides = {}) => {
  return await prisma.product.create({
    data: {
      title: 'Test Product',
      description: 'Test description',
      price: 99.99,
      thumbnail: 'https://example.com/image.jpg',
      category: 'electronics',
      brand: 'Test Brand',
      stock: 10,
      ...overrides
    }
  });
};
```

### 13.3 Unit Test Example
```typescript
// src/tests/unit/services/auth.service.test.ts
import { AuthService } from '../../../services/auth.service';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../services/email.service';
import { AppError } from '../../../utils/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  let emailService: EmailService;

  beforeEach(() => {
    prisma = new PrismaClient();
    emailService = new EmailService();
    authService = new AuthService(prisma, emailService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await authService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBeDefined();
      expect(result.user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Create user first
      await createTestUser({ email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const password = 'SecurePass123';
      const user = await createTestUser({
        email: 'login@example.com',
        password: await bcrypt.hash(password, 12)
      });

      const result = await authService.login({
        email: user.email,
        password
      });

      expect(result.user.email).toBe(user.email);
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(AppError);
    });
  });
});
```

### 13.4 Integration Test Example
```typescript
// src/tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return validation errors for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          firstName: '',
          lastName: ''
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123',
          firstName: 'Test',
          lastName: 'User'
        });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123'
        })
        .expect(200);

      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});
```

---

## 14. Security Implementation

### 14.1 Token Blacklisting & Account Lockout
```typescript
// src/services/token-blacklist.service.ts
import { RedisClient } from '../config/redis';

export class TokenBlacklistService {
  constructor(private redis: RedisClient) {}

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    await this.redis.setex(`blacklist:${token}`, expiresInSeconds, '1');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result !== null;
  }

  async blacklistAllUserTokens(userId: number): Promise<void> {
    // Store user's token invalidation timestamp
    await this.redis.set(`user:${userId}:token_invalidated_at`, Date.now().toString());
  }
}

// src/services/account-lockout.service.ts
import { PrismaClient } from '@prisma/client';
import { RedisClient } from '../config/redis';
import { logger } from '../utils/logger';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

export class AccountLockoutService {
  constructor(
    private redis: RedisClient,
    private prisma: PrismaClient
  ) {}

  async recordFailedAttempt(email: string, ipAddress: string): Promise<{
    attemptsRemaining: number;
    isLocked: boolean;
  }> {
    const key = `login_attempts:${email}:${ipAddress}`;
    
    const attempts = await this.redis.incr(key);
    
    if (attempts === 1) {
      // Set expiry on first attempt
      await this.redis.expire(key, LOCKOUT_DURATION_SECONDS);
    }

    const isLocked = attempts >= MAX_LOGIN_ATTEMPTS;
    
    if (isLocked) {
      logger.warn(`Account locked due to too many failed attempts: ${email} from ${ipAddress}`);
      
      // Log to audit
      await this.prisma.auditLog.create({
        data: {
          action: 'ACCOUNT_LOCKED',
          entity: 'User',
          ipAddress,
          metadata: { email, attempts }
        }
      });
    }

    return {
      attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
      isLocked
    };
  }

  async isLocked(email: string, ipAddress: string): Promise<boolean> {
    const key = `login_attempts:${email}:${ipAddress}`;
    const attempts = await this.redis.get(key);
    return attempts !== null && parseInt(attempts) >= MAX_LOGIN_ATTEMPTS;
  }

  async resetAttempts(email: string, ipAddress: string): Promise<void> {
    const key = `login_attempts:${email}:${ipAddress}`;
    await this.redis.del(key);
  }
}

// src/middleware/token-blacklist.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { ApiResponse } from '../utils/response';

export const checkTokenBlacklist = (tokenBlacklistService: TokenBlacklistService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
      
      if (isBlacklisted) {
        return ApiResponse.unauthorized(res, 'Token has been revoked', {
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    next();
  };
};
```

### 14.2 Security Middleware
```typescript
// src/middleware/security.middleware.ts
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),
  
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Client-Version']
  })
];

// Rate limiting for sensitive endpoints
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many attempts, please try again later',
  skipSuccessfulRequests: true
});
```

### 14.3 Input Sanitization
```typescript
// src/utils/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};

export const sanitizePhone = (phone: string): string => {
  return validator.blacklist(phone, /[^0-9+()-\s]/g);
};

export const validateAndSanitize = {
  email: (email: string) => {
    const sanitized = sanitizeEmail(email);
    if (!validator.isEmail(sanitized)) {
      throw new ValidationError('Invalid email format');
    }
    return sanitized;
  },
  
  password: (password: string) => {
    if (!validator.isLength(password, { min: 8 })) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    return password;
  },
  
  name: (name: string) => {
    const sanitized = sanitizeInput(name);
    if (!validator.isLength(sanitized, { min: 2, max: 50 })) {
      throw new ValidationError('Name must be between 2 and 50 characters');
    }
    return sanitized;
  }
};
```

### 14.4 Password Security
```typescript
// src/utils/password.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordManager {
  static async hash(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateStrongPassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

---

## 15. Performance Optimization

### 15.1 Caching Strategy
```typescript
// src/services/cache.service.ts
import { RedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export class CacheService {
  constructor(private redis: RedisClient) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      await this.redis.del(...keys);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
    }
  }

  // Cache decorator
  cache(ttlSeconds = 300) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        const cached = await this.cacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
        
        // Execute method
        const result = await method.apply(this, args);
        
        // Cache result
        await this.cacheService.set(cacheKey, result, ttlSeconds);
        
        return result;
      };
    };
  }
}
```

### 15.2 Database Optimization
```typescript
// src/utils/database.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty'
    });
  }

  // Batch operations
  async createManyBatch<T>(model: string, data: T[]): Promise<void> {
    const batchSize = 1000;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await (this.prisma as any)[model].createMany({
        data: batch,
        skipDuplicates: true
      });
    }
  }

  // Optimized queries with selects
  async getProductsList(conditions: any) {
    return await this.prisma.product.findMany({
      where: conditions.where,
      select: {
        id: true,
        title: true,
        price: true,
        thumbnail: true,
        category: true,
        brand: true,
        rating: true,
        stock: true
      },
      take: conditions.take,
      skip: conditions.skip,
      orderBy: conditions.orderBy
    });
  }

  // Transaction helper
  async transaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(callback);
  }

  // Connection health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
```

### 15.3 Graceful Shutdown Handler
```typescript
// src/utils/graceful-shutdown.ts
import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import { RedisClient } from '../config/redis';
import { logger } from './logger';

export class GracefulShutdown {
  private isShuttingDown = false;

  constructor(
    private server: Server,
    private prisma: PrismaClient,
    private redis: RedisClient
  ) {}

  setup(): void {
    // Handle termination signals
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.shutdown('unhandledRejection');
    });
  }

  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.info('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Set a timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 seconds

    try {
      // Stop accepting new connections
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // Close database connection
      await this.prisma.$disconnect();
      logger.info('Database connection closed');

      // Close Redis connection
      await this.redis.quit();
      logger.info('Redis connection closed');

      clearTimeout(forceShutdownTimeout);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }
  }
}

// Usage in app.ts
// const server = app.listen(PORT);
// const gracefulShutdown = new GracefulShutdown(server, prisma, redis);
// gracefulShutdown.setup();
```

### 15.4 Cursor-Based Pagination
```typescript
// src/utils/pagination.ts
import { Prisma } from '@prisma/client';

export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount?: number;
}

export async function cursorPaginate<T extends { id: number | string }>(
  model: any,
  where: any,
  options: CursorPaginationOptions,
  orderBy: any = { id: 'asc' }
): Promise<CursorPaginationResult<T>> {
  const { cursor, limit, direction = 'forward' } = options;

  const items = await model.findMany({
    where,
    take: limit + 1, // Fetch one extra to check if there are more
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;

  return {
    data,
    hasMore,
    nextCursor: hasMore ? data[data.length - 1]?.id?.toString() : null,
    prevCursor: cursor || null
  };
}

// Offset-based pagination with improved performance
export interface OffsetPaginationOptions {
  page: number;
  limit: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function offsetPaginate<T>(
  model: any,
  where: any,
  options: OffsetPaginationOptions,
  orderBy: any = { createdAt: 'desc' },
  select?: any
): Promise<OffsetPaginationResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      ...(select && { select })
    }),
    model.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
```

### 15.5 Query Optimization
```typescript
// src/repositories/base.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';

export abstract class BaseRepository<T> {
  constructor(
    protected prisma: PrismaClient,
    protected modelName: string
  ) {}

  // Optimized pagination
  async paginate(
    where: any = {},
    orderBy: any = { createdAt: 'desc' },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any)[this.modelName].findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      (this.prisma as any)[this.modelName].count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Efficient search with full-text search
  async search(query: string, fields: string[]) {
    const searchConditions = fields.map(field => ({
      [field]: {
        contains: query,
        mode: 'insensitive' as const
      }
    }));

    return await (this.prisma as any)[this.modelName].findMany({
      where: {
        OR: searchConditions
      }
    });
  }

  // Bulk update with conditions
  async bulkUpdate(where: any, data: any) {
    return await (this.prisma as any)[this.modelName].updateMany({
      where,
      data
    });
  }
}
```

---

## 16. Deployment Strategy

### 16.1 Docker Production Setup
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

CMD ["node", "dist/app.js"]
```

### 16.2 Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ecommerce
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 16.3 Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-backend
  labels:
    app: ecommerce-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecommerce-backend
  template:
    metadata:
      labels:
        app: ecommerce-backend
    spec:
      containers:
      - name: backend
        image: ecommerce/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ecommerce-secrets
              key: database-url
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: ecommerce-backend-service
spec:
  selector:
    app: ecommerce-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### 16.4 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: |
          docker build -f Dockerfile.prod -t ecommerce/backend:${{ github.sha }} .
          docker tag ecommerce/backend:${{ github.sha }} ecommerce/backend:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ecommerce/backend:${{ github.sha }}
          docker push ecommerce/backend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to your production environment
          # This could be kubectl, helm, or any other deployment tool
          echo "Deploying to production..."
```

---

## 17. Implementation Timeline

> **Note:** This timeline accounts for proper testing, code review, and buffer time for unexpected issues.
> 
> **✅ Status Updated:** December 25, 2025 - Implementation Complete!

### Phase 1: Foundation (Week 1-2) ✅
- [x] Set up project structure and development environment
- [x] Configure Prisma ORM and database migrations
- [x] Implement base repository pattern
- [x] Set up Redis for caching (in-memory cache with Redis-ready interface)
- [x] Configure authentication middleware
- [x] Implement basic error handling
- [x] Set up request ID and logging middleware
- [x] Configure graceful shutdown handler

### Phase 2: Core Services (Week 3-5) ✅
- [x] Authentication Service (login, register, JWT management)
- [x] Token blacklisting and account lockout
- [x] User Service (profile management, preferences)
- [x] Product Service (CRUD, search, categories)
- [x] Cart Service (guest carts, cart merging)
- [x] Basic API documentation with Swagger
- [x] TypeDoc JSDoc documentation for all services, types, and utilities

### Phase 3: Business Logic (Week 6-8) ✅
- [x] Order Service (cart integration, order lifecycle)
- [x] Payment Service (Stripe integration, webhooks)
- [x] Email/Notification service implementation
- [x] Event bus for service communication
- [x] Wishlist functionality
- [x] Audit logging implementation

### Phase 4: Advanced Features (Week 9-11) ✅
- [x] File upload handling (images, documents)
- [x] Cloud storage integration (S3)
- [x] Advanced caching strategies
- [x] Rate limiting and security hardening
- [x] Performance optimization
- [x] Cursor-based pagination for large datasets

### Phase 5: Testing & QA (Week 12-13) ✅
- [x] Unit tests (minimum 80% coverage)
- [x] Integration tests for all endpoints (auth, products, cart, orders, users, wishlist, payments)
- [x] Load testing and optimization (k6 load tests)
- [x] Security audit and penetration testing (security checklist)
- [x] API documentation review

### Phase 6: Deployment (Week 14) ✅
- [x] Docker containerization
- [x] CI/CD pipeline setup
- [x] Staging environment deployment (docker-compose.staging.yml)
- [ ] Production deployment
- [x] Monitoring and alerting setup (Prometheus + Grafana)

### Post-Launch
- [ ] Monitor and optimize performance
- [ ] Implement additional features based on feedback
- [ ] Scale infrastructure as needed
- [ ] Regular security audits and updates
- [ ] Abandoned cart email reminders
- [ ] Analytics and reporting features

### Timeline Summary
| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Foundation | 2 weeks | Week 2 |
| Phase 2: Core Services | 3 weeks | Week 5 |
| Phase 3: Business Logic | 3 weeks | Week 8 |
| Phase 4: Advanced Features | 3 weeks | Week 11 |
| Phase 5: Testing & QA | 2 weeks | Week 13 |
| Phase 6: Deployment | 1 week | Week 14 |
| **Total** | **14 weeks** | - |

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a scalable, secure, and maintainable Node.js backend for the e-commerce platform. The architecture follows industry best practices and is designed to handle growth while maintaining code quality and performance.

Key takeaways:
1. **Modular Architecture**: Clean separation of concerns with services, repositories, and controllers
2. **Security First**: Multiple layers of security including authentication, authorization, token blacklisting, account lockout, input validation, and rate limiting
3. **Performance Optimized**: Caching with Redis, database optimization with indexes, cursor-based pagination, and efficient query patterns
4. **Test Coverage**: Comprehensive testing strategy with unit and integration tests (minimum 80% coverage)
5. **Production Ready**: Docker containerization, CI/CD pipeline, graceful shutdown handling, and monitoring capabilities
6. **E-commerce Features**: Full cart management with guest cart support, wishlist functionality, and audit logging
7. **Scalability**: Event-driven architecture, proper database indexing, and horizontal scaling support

The implementation should be done iteratively, starting with core functionality and gradually adding advanced features. Regular testing and code reviews will ensure quality throughout the development process.

### Additional Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
