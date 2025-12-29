# Node.js Backend API Requirements Document

**Project:** E-Commerce Application Backend  
**Version:** 1.0  
**Last Updated:** December 24, 2025  
**Frontend Stack:** React 18 + TypeScript + Vite + Redux Toolkit

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [API Design Principles](#3-api-design-principles)
4. [Authentication Service](#4-authentication-service)
5. [Product Service](#5-product-service)
6. [Order Service](#6-order-service)
7. [User Service](#7-user-service)
8. [Payment Service](#8-payment-service)
9. [Data Models](#9-data-models)
10. [Error Handling](#10-error-handling)
11. [Security Requirements](#11-security-requirements)
12. [Performance Requirements](#12-performance-requirements)
13. [Environment Configuration](#13-environment-configuration)
14. [Database Schema](#14-database-schema)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Executive Summary

This document outlines the complete backend API requirements for the E-Commerce application. The backend must support **5 core service domains**:

| Service | Description | Base Path |
|---------|-------------|-----------|
| **Authentication** | User login, registration, token management | `/auth` |
| **Products** | Product catalog, categories, search | `/products` |
| **Orders** | Order lifecycle, tracking, history | `/orders` |
| **Users** | Profile management, addresses, preferences | `/users` |
| **Payments** | Payment intent creation, confirmation | `/payments` |

The frontend currently uses [DummyJSON](https://dummyjson.com) as a mock API. The production backend must maintain API contract compatibility while extending functionality.

---

## 2. Architecture Overview

### 2.1 Recommended Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        Node.js Backend                          │
├─────────────────────────────────────────────────────────────────┤
│  Framework:      Express.js or Fastify                          │
│  Language:       TypeScript                                      │
│  Database:       PostgreSQL (primary) + Redis (caching)         │
│  ORM:           Prisma or TypeORM                               │
│  Auth:          JWT with refresh tokens                          │
│  Validation:    Zod (shared schemas with frontend)              │
│  API Docs:      OpenAPI/Swagger                                  │
│  Testing:       Jest + Supertest                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Service Architecture

```
                    ┌──────────────────┐
                    │   API Gateway    │
                    │   (Rate Limit,   │
                    │   CORS, Auth)    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Auth Service  │  │  Core Service   │  │ Payment Service │
│  /auth/*      │  │  /products/*    │  │  /payments/*    │
│               │  │  /orders/*      │  │                 │
│               │  │  /users/*       │  │                 │
└───────┬───────┘  └────────┬────────┘  └────────┬────────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth DB      │  │  PostgreSQL     │  │  Stripe/Payment │
│  (Redis)      │  │  (Main Data)    │  │  Provider       │
└───────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.3 API Base URLs (Configurable)

| Environment | Base URL | Description |
|-------------|----------|-------------|
| Development | `http://localhost:3000/api/v1` | Local development |
| Staging | `https://api-staging.ecom.com/v1` | Testing environment |
| Production | `https://api.ecom.com/v1` | Production environment |

---

## 3. API Design Principles

### 3.1 REST Conventions

| Operation | HTTP Method | URL Pattern | Example |
|-----------|-------------|-------------|---------|
| List/Search | `GET` | `/resources` | `GET /products` |
| Read One | `GET` | `/resources/:id` | `GET /products/123` |
| Create | `POST` | `/resources` | `POST /products` |
| Update | `PUT` | `/resources/:id` | `PUT /products/123` |
| Partial Update | `PATCH` | `/resources/:id` | `PATCH /products/123` |
| Delete | `DELETE` | `/resources/:id` | `DELETE /products/123` |

### 3.2 Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <uuid>          # For request tracing
X-Client-Version: 1.0.0       # Frontend version
```

### 3.3 Response Format

**Success Response:**
```json
{
  "data": { ... },
  "status": 200,
  "message": "Success",
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-12-24T10:00:00Z"
  }
}
```

**Paginated Response:**
```json
{
  "products": [...],
  "total": 100,
  "skip": 0,
  "limit": 10
}
```

**Error Response:**
```json
{
  "message": "Validation failed",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Must be at least 8 characters"]
  }
}
```

### 3.4 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 422 | Unprocessable Entity | Business logic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Server overloaded or maintenance |

---

## 4. Authentication Service

### 4.1 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/register` | User registration | ❌ |
| `POST` | `/auth/validate` | Validate token | ✅ |
| `POST` | `/auth/logout` | Logout user | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | ✅ (refresh token) |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/auth/reset-password` | Reset password with token | ❌ |
| `POST` | `/auth/change-password` | Change password | ✅ |

### 4.2 API Contracts

#### 4.2.1 Login

```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```typescript
interface LoginRequest {
  email: string;      // Required, valid email format
  password: string;   // Required, min 8 characters
}
```

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```typescript
interface LoginResponse {
  token: string;           // JWT access token
  refreshToken?: string;   // Optional refresh token
  user: User;              // User object
  expiresAt?: string;      // Token expiration ISO date
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "image": "https://example.com/avatar.jpg",
    "phone": "+1234567890",
    "age": 30,
    "role": "user"
  },
  "expiresAt": "2025-12-25T10:00:00Z"
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_CREDENTIALS` | Email or password incorrect |
| 400 | `VALIDATION_ERROR` | Invalid request format |
| 423 | `ACCOUNT_LOCKED` | Too many failed attempts |

---

#### 4.2.2 Register

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```typescript
interface RegisterRequest {
  email: string;       // Required, valid email, unique
  password: string;    // Required, min 8 chars, 1 uppercase, 1 number
  firstName: string;   // Required, 2-50 chars
  lastName: string;    // Required, 2-50 chars
}
```

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 409 | `EMAIL_EXISTS` | Email already registered |

---

#### 4.2.3 Validate Token

```http
POST /auth/validate
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "isValid": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "isValid": false,
  "message": "Token expired or invalid"
}
```

---

#### 4.2.4 Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### 4.2.5 Refresh Token

```http
POST /auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-12-25T11:00:00Z"
}
```

---

#### 4.2.6 Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

> ⚠️ **Security Note:** Always return success even if email doesn't exist to prevent user enumeration.

---

#### 4.2.7 Reset Password

```http
POST /auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

#### 4.2.8 Change Password

```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

### 4.3 JWT Token Specification

```typescript
interface JWTPayload {
  sub: number;          // User ID
  email: string;        // User email
  role: 'admin' | 'user';
  iat: number;          // Issued at (Unix timestamp)
  exp: number;          // Expiration (Unix timestamp)
  jti: string;          // JWT ID for revocation
}
```

**Token Configuration:**
- Access Token TTL: 15 minutes - 1 hour
- Refresh Token TTL: 7 days
- Algorithm: RS256 (recommended) or HS256
- Store refresh tokens in database for revocation capability

---

## 5. Product Service

### 5.1 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/products` | Get paginated products | ❌ |
| `GET` | `/products/categories` | Get all categories | ❌ |
| `GET` | `/products/:id` | Get product by ID | ❌ |
| `GET` | `/products/search` | Search products | ❌ |
| `GET` | `/products/category/:category` | Get products by category | ❌ |
| `POST` | `/products/add` | Create product | ✅ Admin |
| `PUT` | `/products/:id` | Update product | ✅ Admin |
| `DELETE` | `/products/:id` | Delete product | ✅ Admin |

### 5.2 API Contracts

#### 5.2.1 Get All Products

```http
GET /products?skip=0&limit=10&sortBy=price&order=asc
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | number | 0 | Number of items to skip |
| `limit` | number | 10 | Number of items per page (max: 100) |
| `sortBy` | string | - | Field to sort by (price, rating, title) |
| `order` | string | asc | Sort order (asc, desc) |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `brand` | string | - | Filter by brand |
| `inStock` | boolean | - | Only show in-stock items |

**Success Response (200):**
```typescript
interface PaginatedProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
```

```json
{
  "products": [
    {
      "id": 1,
      "title": "iPhone 15 Pro",
      "description": "Latest Apple smartphone...",
      "price": 1199.99,
      "discountPercentage": 5.5,
      "thumbnail": "https://cdn.example.com/iphone15.jpg",
      "images": [
        "https://cdn.example.com/iphone15-1.jpg",
        "https://cdn.example.com/iphone15-2.jpg"
      ],
      "category": "smartphones",
      "brand": "Apple",
      "rating": 4.8,
      "stock": 50,
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Amazing phone!",
          "date": "2025-12-20",
          "reviewerName": "John Doe",
          "reviewerEmail": "john@example.com"
        }
      ],
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-20T15:30:00Z"
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}
```

---

#### 5.2.2 Get Categories

```http
GET /products/categories
```

**Success Response (200):**
```json
[
  "smartphones",
  "laptops",
  "fragrances",
  "skincare",
  "groceries",
  "home-decoration",
  "furniture",
  "tops",
  "womens-dresses",
  "womens-shoes"
]
```

---

#### 5.2.3 Get Product by ID

```http
GET /products/:id
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with A17 Pro chip...",
  "price": 1199.99,
  "discountPercentage": 5.5,
  "thumbnail": "https://cdn.example.com/iphone15.jpg",
  "images": ["..."],
  "category": "smartphones",
  "brand": "Apple",
  "rating": 4.8,
  "stock": 50,
  "reviews": [...]
}
```

**Error Response (404):**
```json
{
  "message": "Product not found",
  "status": 404,
  "code": "PRODUCT_NOT_FOUND"
}
```

---

#### 5.2.4 Search Products

```http
GET /products/search?q=laptop&skip=0&limit=10
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ | Search query (searches title, description, brand) |
| `skip` | number | ❌ | Pagination offset |
| `limit` | number | ❌ | Results per page |

**Success Response (200):**
```json
{
  "products": [...],
  "total": 25,
  "skip": 0,
  "limit": 10
}
```

---

#### 5.2.5 Get Products by Category

```http
GET /products/category/:category?skip=0&limit=10
```

**Success Response (200):**
```json
{
  "products": [...],
  "total": 15,
  "skip": 0,
  "limit": 10
}
```

---

#### 5.2.6 Create Product (Admin)

```http
POST /products/add
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateProductRequest {
  title: string;             // Required, 3-200 chars
  description: string;       // Required, 10-5000 chars
  price: number;             // Required, > 0
  discountPercentage?: number; // 0-100
  thumbnail: string;         // Required, valid URL
  images?: string[];         // Array of URLs
  category: string;          // Required, valid category
  brand: string;             // Required
  stock: number;             // Required, >= 0
}
```

```json
{
  "title": "New Product",
  "description": "Product description here...",
  "price": 99.99,
  "discountPercentage": 10,
  "thumbnail": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg"],
  "category": "electronics",
  "brand": "BrandName",
  "stock": 100
}
```

**Success Response (201):**
```json
{
  "id": 101,
  "title": "New Product",
  ...
}
```

---

#### 5.2.7 Update Product (Admin)

```http
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** Partial product fields
```json
{
  "price": 89.99,
  "stock": 150
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "price": 89.99,
  "stock": 150,
  ...
}
```

---

#### 5.2.8 Delete Product (Admin)

```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Deleted Product",
  "isDeleted": true,
  "deletedOn": "2025-12-24T10:00:00Z"
}
```

---

## 6. Order Service

### 6.1 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/orders` | Create order from cart | ✅ |
| `GET` | `/orders` | Get user's orders | ✅ |
| `GET` | `/orders/:id` | Get order details | ✅ |
| `GET` | `/orders/all` | Get all orders (admin) | ✅ Admin |
| `PUT` | `/orders/:id/status` | Update order status | ✅ Admin |
| `PUT` | `/orders/:id/cancel` | Cancel order | ✅ |
| `GET` | `/orders/:id/tracking` | Get tracking info | ✅ |
| `GET` | `/orders/:id/invoice` | Get invoice PDF | ✅ |
| `POST` | `/orders/:id/notes` | Add order note | ✅ |
| `POST` | `/orders/:id/return` | Request return | ✅ |

### 6.2 API Contracts

#### 6.2.1 Create Order

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateOrderRequest {
  products: Array<{
    id: number;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentMethod: string;
  paymentIntentId?: string;
}
```

```json
{
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 5, "quantity": 1 }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "card",
  "paymentIntentId": "pi_1234567890"
}
```

**Success Response (201):**
```typescript
interface Order {
  id: string;
  userId: number;
  products: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

```json
{
  "id": "ORD-2025122401",
  "userId": 1,
  "products": [
    {
      "id": 1,
      "title": "iPhone 15 Pro",
      "price": 1199.99,
      "quantity": 2,
      "total": 2399.98,
      "discountPercentage": 5.5,
      "discountedTotal": 2267.98,
      "thumbnail": "https://..."
    }
  ],
  "subtotal": 2267.98,
  "tax": 181.44,
  "shipping": 0,
  "total": 2449.42,
  "status": "pending",
  "shippingAddress": {...},
  "createdAt": "2025-12-24T10:00:00Z",
  "updatedAt": "2025-12-24T10:00:00Z"
}
```

---

#### 6.2.2 Get User's Orders

```http
GET /orders?skip=0&limit=10
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "products": [
    {
      "id": "ORD-2025122401",
      "status": "delivered",
      "total": 2449.42,
      "createdAt": "2025-12-24T10:00:00Z"
    }
  ],
  "total": 15,
  "skip": 0,
  "limit": 10
}
```

---

#### 6.2.3 Get Order Details

```http
GET /orders/:id
Authorization: Bearer <token>
```

**Success Response (200):** Full order object with all details.

**Error Response (404):**
```json
{
  "message": "Order not found",
  "status": 404,
  "code": "ORDER_NOT_FOUND"
}
```

**Error Response (403):**
```json
{
  "message": "You don't have permission to view this order",
  "status": 403,
  "code": "FORBIDDEN"
}
```

---

#### 6.2.4 Update Order Status (Admin)

```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784",
  "carrier": "UPS",
  "note": "Shipped via UPS Ground"
}
```

**Success Response (200):** Updated order object.

---

#### 6.2.5 Cancel Order

```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Business Rules:**
- Only orders with status `pending` or `processing` can be cancelled
- Cancelled orders trigger refund process

**Success Response (200):**
```json
{
  "id": "ORD-2025122401",
  "status": "cancelled",
  "cancelledAt": "2025-12-24T12:00:00Z",
  "cancelReason": "Changed my mind"
}
```

**Error Response (422):**
```json
{
  "message": "Cannot cancel order that has been shipped",
  "status": 422,
  "code": "ORDER_CANNOT_CANCEL"
}
```

---

#### 6.2.6 Get Tracking Info

```http
GET /orders/:id/tracking
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "orderId": "ORD-2025122401",
  "status": "in_transit",
  "carrier": "UPS",
  "trackingNumber": "1Z999AA10123456784",
  "trackingUrl": "https://ups.com/track/...",
  "estimatedDelivery": "2025-12-27",
  "events": [
    {
      "status": "picked_up",
      "location": "New York, NY",
      "timestamp": "2025-12-24T14:00:00Z",
      "description": "Package picked up"
    },
    {
      "status": "in_transit",
      "location": "Newark, NJ",
      "timestamp": "2025-12-25T08:00:00Z",
      "description": "In transit to destination"
    }
  ]
}
```

---

#### 6.2.7 Get Invoice

```http
GET /orders/:id/invoice
Authorization: Bearer <token>
Accept: application/pdf
```

**Success Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="invoice-ORD-2025122401.pdf"`
- Body: PDF binary data

---

## 7. User Service

### 7.1 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/me` | Get current user profile | ✅ |
| `GET` | `/users/:id` | Get user by ID | ✅ |
| `PUT` | `/users/me` | Update profile | ✅ |
| `GET` | `/users/me/preferences` | Get preferences | ✅ |
| `PUT` | `/users/me/preferences` | Update preferences | ✅ |
| `POST` | `/users/me/avatar` | Upload avatar | ✅ |
| `POST` | `/users/me/delete` | Delete account | ✅ |
| `GET` | `/users/me/addresses` | Get addresses | ✅ |
| `POST` | `/users/me/addresses` | Add address | ✅ |
| `PUT` | `/users/me/addresses/:id` | Update address | ✅ |
| `DELETE` | `/users/me/addresses/:id` | Delete address | ✅ |

### 7.2 API Contracts

#### 7.2.1 Get Current User Profile

```http
GET /users/me
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "image": "https://example.com/avatar.jpg",
  "phone": "+1234567890",
  "age": 30,
  "role": "user",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

#### 7.2.2 Update Profile

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
}
```

```json
{
  "firstName": "Jane",
  "phone": "+1987654321"
}
```

**Success Response (200):** Updated user object.

---

#### 7.2.3 Upload Avatar

```http
POST /users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `image`: File (JPEG, PNG, WebP, max 5MB)

**Success Response (200):**
```json
{
  "id": 1,
  "image": "https://cdn.example.com/avatars/user-1-avatar.jpg"
}
```

---

#### 7.2.4 User Preferences

```http
GET /users/me/preferences
Authorization: Bearer <token>
```

```http
PUT /users/me/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Request/Response Body:**
```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emailNotifications: boolean;
  currency: string;  // ISO currency code
  language: string;  // ISO language code
}
```

```json
{
  "theme": "dark",
  "notifications": true,
  "emailNotifications": false,
  "currency": "USD",
  "language": "en"
}
```

---

#### 7.2.5 Address Management

**Get Addresses:**
```http
GET /users/me/addresses
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "label": "Home",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "isDefault": true
  }
]
```

**Add Address:**
```http
POST /users/me/addresses
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "label": "Work",
  "firstName": "John",
  "lastName": "Doe",
  "address": "456 Office Blvd",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "country": "USA",
  "phone": "+1234567890",
  "isDefault": false
}
```

---

#### 7.2.6 Delete Account

```http
POST /users/me/delete
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "currentPassword123",
  "reason": "No longer needed"
}
```

**Success Response (200):**
```json
{
  "message": "Account scheduled for deletion"
}
```

> ⚠️ **Note:** Consider implementing soft delete with a 30-day grace period for recovery.

---

## 8. Payment Service

### 8.1 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/payments/intents` | Create payment intent | ✅ |
| `POST` | `/payments/intents/:id/confirm` | Confirm payment | ✅ |
| `GET` | `/payments/intents/:id/status` | Get payment status | ✅ |

### 8.2 API Contracts

#### 8.2.1 Create Payment Intent

```http
POST /payments/intents
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreatePaymentIntentRequest {
  amount: number;              // Amount in smallest currency unit (cents)
  currency?: string;           // ISO currency code (default: 'usd')
  metadata?: Record<string, unknown>;
}
```

```json
{
  "amount": 24942,
  "currency": "usd",
  "metadata": {
    "orderId": "ORD-2025122401",
    "customerId": "user-1"
  }
}
```

**Success Response (201):**
```typescript
interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed';
```

```json
{
  "id": "pi_1234567890",
  "clientSecret": "pi_1234567890_secret_abc123",
  "amount": 24942,
  "currency": "usd",
  "status": "requires_payment_method",
  "createdAt": "2025-12-24T10:00:00Z"
}
```

---

#### 8.2.2 Confirm Payment Intent

```http
POST /payments/intents/:id/confirm
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentMethodId": "pm_card_visa"
}
```

**Success Response (200):**
```json
{
  "id": "pi_1234567890",
  "status": "succeeded",
  "amount": 24942,
  "currency": "usd"
}
```

---

#### 8.2.3 Get Payment Status

```http
GET /payments/intents/:id/status
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "succeeded"
}
```

---

### 8.3 Payment Provider Integration

**Recommended:** Stripe Payment Intents API

```typescript
// Backend implementation example
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount: number, currency: string) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
  });
}
```

**Webhook Events to Handle:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

## 9. Data Models

### 9.1 Complete TypeScript Definitions

```typescript
// ============================================================================
// USER
// ============================================================================
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  phone: string;
  age: number;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PRODUCT
// ============================================================================
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  thumbnail: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  stock: number;
  reviews: Review[];
  createdAt?: string;
  updatedAt?: string;
}

interface Review {
  id: number;
  rating: number;          // 1-5
  comment: string;
  date: string;            // ISO date
  reviewerName: string;
  reviewerEmail: string;
}

// ============================================================================
// CART
// ============================================================================
interface Cart {
  id: string;
  products: CartItem[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

// ============================================================================
// ORDER
// ============================================================================
interface Order {
  id: string;
  userId: number;
  products: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentMethod: string;
  paymentIntentId?: string;
  trackingNumber?: string;
  carrier?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface BillingAddress extends ShippingAddress {}

// ============================================================================
// PAYMENT
// ============================================================================
interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;           // In cents
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed';

// ============================================================================
// API RESPONSES
// ============================================================================
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  products: T[];           // DummyJSON compatibility
  total: number;
  skip: number;
  limit: number;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emailNotifications: boolean;
  currency: string;
  language: string;
}

// ============================================================================
// ADDRESS
// ============================================================================
interface UserAddress {
  id: number;
  userId: number;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 10. Error Handling

### 10.1 Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 400 | Wrong email/password |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `PRODUCT_NOT_FOUND` | 404 | Product doesn't exist |
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INSUFFICIENT_STOCK` | 422 | Not enough stock for order |
| `ORDER_CANNOT_CANCEL` | 422 | Order already shipped |
| `PAYMENT_FAILED` | 422 | Payment processing failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 10.2 Error Response Examples

**Validation Error:**
```json
{
  "message": "Validation failed",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Must be at least 8 characters", "Must contain a number"]
  }
}
```

**Authentication Error:**
```json
{
  "message": "Invalid or expired token",
  "status": 401,
  "code": "TOKEN_EXPIRED"
}
```

**Rate Limit Error:**
```json
{
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "status": 429,
  "code": "RATE_LIMITED",
  "details": {
    "retryAfter": 60
  }
}
```

---

## 11. Security Requirements

### 11.1 Authentication & Authorization

- [ ] JWT tokens with short expiration (15 min - 1 hour)
- [ ] Refresh token rotation
- [ ] Token blacklisting for logout
- [ ] Role-based access control (RBAC)
- [ ] Password hashing with bcrypt (min cost factor: 12)

### 11.2 API Security

- [ ] HTTPS only (TLS 1.2+)
- [ ] CORS configuration (whitelist frontend domains)
- [ ] Rate limiting by IP and user
- [ ] Request size limits
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)

### 11.3 Security Headers

```typescript
// Recommended Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
}));
```

### 11.4 Rate Limiting Configuration

| Endpoint Pattern | Limit | Window |
|------------------|-------|--------|
| `/auth/login` | 5 requests | 15 minutes |
| `/auth/register` | 3 requests | 1 hour |
| `/auth/forgot-password` | 3 requests | 1 hour |
| `/products/*` | 100 requests | 1 minute |
| `/orders/*` | 30 requests | 1 minute |
| `/payments/*` | 10 requests | 1 minute |

### 11.5 PCI DSS Compliance (Payments)

- Never store full card numbers
- Use tokenization (Stripe tokens)
- Only store last 4 digits for display
- Payment form should use Stripe Elements (client-side)
- Backend only handles payment intents, not card data

---

## 12. Performance Requirements

### 12.1 Response Time Targets

| Endpoint Type | P50 | P95 | P99 |
|---------------|-----|-----|-----|
| Simple GET | < 50ms | < 100ms | < 200ms |
| List with pagination | < 100ms | < 200ms | < 500ms |
| Search | < 200ms | < 500ms | < 1s |
| Create/Update | < 100ms | < 300ms | < 500ms |
| Payment processing | < 2s | < 5s | < 10s |

### 12.2 Caching Strategy

```typescript
// Redis caching configuration
const cacheConfig = {
  products: {
    ttl: 300,        // 5 minutes
    strategy: 'cache-aside',
  },
  categories: {
    ttl: 3600,       // 1 hour
    strategy: 'cache-aside',
  },
  userProfile: {
    ttl: 60,         // 1 minute
    strategy: 'write-through',
  },
};
```

### 12.3 Database Indexing

```sql
-- Essential indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_users_email ON users(email);
```

### 12.4 Pagination Limits

- Default page size: 10
- Maximum page size: 100
- Use cursor-based pagination for large datasets

---

## 13. Environment Configuration

### 13.1 Environment Variables

```env
# Server
NODE_ENV=development|staging|production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ecom
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@ecom.com

# File Upload
UPLOAD_MAX_SIZE=5242880
CDN_URL=https://cdn.ecom.com

# Security
CORS_ORIGINS=http://localhost:5173,https://ecom.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info|debug|error
LOG_FORMAT=json|pretty

# Monitoring (optional)
SENTRY_DSN=https://...@sentry.io/...
```

### 13.2 Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_AUTH_URL=http://localhost:3000/api/v1
VITE_PAYMENT_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

---

## 14. Database Schema

### 14.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   products   │       │  categories  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ title        │       │ name         │
│ password     │       │ description  │       │ slug         │
│ firstName    │       │ price        │       └──────────────┘
│ lastName     │       │ discount     │              │
│ role         │       │ category_id  │──────────────┘
│ ...          │       │ brand        │
└──────┬───────┘       │ stock        │
       │               │ rating       │
       │               └──────┬───────┘
       │                      │
       │    ┌─────────────────┼─────────────────┐
       │    │                 │                 │
       ▼    ▼                 ▼                 ▼
┌──────────────┐       ┌──────────────┐   ┌──────────────┐
│   orders     │       │   reviews    │   │   images     │
├──────────────┤       ├──────────────┤   ├──────────────┤
│ id           │       │ id           │   │ id           │
│ user_id      │       │ product_id   │   │ product_id   │
│ status       │       │ user_id      │   │ url          │
│ total        │       │ rating       │   │ is_thumbnail │
│ ...          │       │ comment      │   └──────────────┘
└──────┬───────┘       │ date         │
       │               └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│ order_items  │       │  addresses   │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ order_id     │       │ user_id      │
│ product_id   │       │ label        │
│ quantity     │       │ address      │
│ price        │       │ city         │
│ discount     │       │ is_default   │
└──────────────┘       └──────────────┘
```

### 14.2 Prisma Schema (Recommended)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
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

model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  password      String
  firstName     String
  lastName      String
  phone         String?
  age           Int?
  gender        String?
  image         String?
  role          Role           @default(USER)
  orders        Order[]
  reviews       Review[]
  addresses     Address[]
  preferences   UserPreference?
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Product {
  id                 Int         @id @default(autoincrement())
  title              String
  description        String
  price              Float
  discountPercentage Float       @default(0)
  brand              String
  stock              Int         @default(0)
  rating             Float       @default(0)
  category           Category    @relation(fields: [categoryId], references: [id])
  categoryId         Int
  images             Image[]
  reviews            Review[]
  orderItems         OrderItem[]
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String
  slug     String    @unique
  products Product[]
}

model Image {
  id          Int     @id @default(autoincrement())
  url         String
  isThumbnail Boolean @default(false)
  product     Product @relation(fields: [productId], references: [id])
  productId   Int
}

model Review {
  id            Int      @id @default(autoincrement())
  rating        Int
  comment       String
  date          DateTime @default(now())
  reviewerName  String
  reviewerEmail String
  product       Product  @relation(fields: [productId], references: [id])
  productId     Int
  user          User?    @relation(fields: [userId], references: [id])
  userId        Int?
}

model Order {
  id              String      @id @default(uuid())
  user            User        @relation(fields: [userId], references: [id])
  userId          Int
  items           OrderItem[]
  subtotal        Float
  tax             Float
  shipping        Float
  total           Float
  status          OrderStatus @default(PENDING)
  shippingAddress Json
  billingAddress  Json?
  paymentMethod   String?
  paymentIntentId String?
  trackingNumber  String?
  carrier         String?
  cancelReason    String?
  cancelledAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id                 Int     @id @default(autoincrement())
  order              Order   @relation(fields: [orderId], references: [id])
  orderId            String
  product            Product @relation(fields: [productId], references: [id])
  productId          Int
  title              String
  price              Float
  quantity           Int
  discountPercentage Float   @default(0)
  thumbnail          String
}

model Address {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  label     String
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
}

model UserPreference {
  id                 Int     @id @default(autoincrement())
  user               User    @relation(fields: [userId], references: [id])
  userId             Int     @unique
  theme              String  @default("light")
  notifications      Boolean @default(true)
  emailNotifications Boolean @default(true)
  currency           String  @default("USD")
  language           String  @default("en")
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## 15. Future Enhancements

### 15.1 Phase 2 Features (Not Currently Implemented)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Cart Persistence** | High | Sync cart to backend for cross-device support |
| **Wishlist** | Medium | Save products for later |
| **Product Reviews** | Medium | Submit new reviews (currently read-only) |
| **Coupon Codes** | High | Apply discount codes at checkout |
| **Dynamic Shipping** | Medium | Calculate rates based on address |
| **Tax Calculation** | Medium | Location-based tax (currently 8% flat) |
| **Inventory Alerts** | Low | Notify when stock is low |
| **Email Notifications** | High | Order confirmation, shipping updates |
| **Webhook Integration** | Medium | For payment and shipping providers |

### 15.2 Proposed Additional Endpoints

```
# Cart Persistence
POST   /cart              - Sync cart to server
GET    /cart              - Get user's server-side cart

# Wishlist
GET    /wishlist          - Get wishlist items
POST   /wishlist          - Add to wishlist
DELETE /wishlist/:id      - Remove from wishlist

# Reviews
POST   /products/:id/reviews  - Submit a review
PUT    /reviews/:id           - Edit own review
DELETE /reviews/:id           - Delete own review

# Coupons
POST   /checkout/apply-coupon - Validate and apply coupon
DELETE /checkout/remove-coupon - Remove applied coupon

# Shipping
POST   /shipping/rates    - Calculate shipping rates
GET    /shipping/methods  - Get available shipping methods

# Notifications
GET    /notifications     - Get user notifications
PUT    /notifications/:id/read - Mark as read
```

### 15.3 Recommended Monitoring & Observability

- **APM:** New Relic, Datadog, or Elastic APM
- **Error Tracking:** Sentry
- **Logging:** Winston + ELK Stack or CloudWatch
- **Metrics:** Prometheus + Grafana
- **Health Check Endpoint:** `GET /health`

---

## Appendix A: API Checklist

### Authentication
- [ ] POST /auth/login
- [ ] POST /auth/register
- [ ] POST /auth/validate
- [ ] POST /auth/logout
- [ ] POST /auth/refresh
- [ ] POST /auth/forgot-password
- [ ] POST /auth/reset-password
- [ ] POST /auth/change-password

### Products
- [ ] GET /products
- [ ] GET /products/categories
- [ ] GET /products/:id
- [ ] GET /products/search
- [ ] GET /products/category/:category
- [ ] POST /products/add (admin)
- [ ] PUT /products/:id (admin)
- [ ] DELETE /products/:id (admin)

### Orders
- [ ] POST /orders
- [ ] GET /orders
- [ ] GET /orders/:id
- [ ] GET /orders/all (admin)
- [ ] PUT /orders/:id/status (admin)
- [ ] PUT /orders/:id/cancel
- [ ] GET /orders/:id/tracking
- [ ] GET /orders/:id/invoice
- [ ] POST /orders/:id/notes
- [ ] POST /orders/:id/return

### Users
- [ ] GET /users/me
- [ ] GET /users/:id
- [ ] PUT /users/me
- [ ] GET /users/me/preferences
- [ ] PUT /users/me/preferences
- [ ] POST /users/me/avatar
- [ ] POST /users/me/delete
- [ ] GET /users/me/addresses
- [ ] POST /users/me/addresses
- [ ] PUT /users/me/addresses/:id
- [ ] DELETE /users/me/addresses/:id

### Payments
- [ ] POST /payments/intents
- [ ] POST /payments/intents/:id/confirm
- [ ] GET /payments/intents/:id/status

---

## Appendix B: Testing Requirements

### B.1 Unit Tests
- Service layer logic
- Validation schemas (Zod)
- Utility functions
- Middleware functions

### B.2 Integration Tests
- API endpoint testing with Supertest
- Database operations
- Authentication flows

### B.3 E2E Tests
- Complete checkout flow
- User registration and login
- Order lifecycle

### B.4 Test Coverage Target
- Minimum: 70%
- Target: 80%
- Critical paths: 100%

---

**Document Prepared By:** Development Team  
**Review Status:** Ready for Backend Implementation  
**Next Steps:**
1. Set up Node.js project with TypeScript
2. Configure Prisma with PostgreSQL
3. Implement authentication endpoints first
4. Add product and order endpoints
5. Integrate Stripe for payments
6. Deploy to staging environment
7. Frontend integration testing
