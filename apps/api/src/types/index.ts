/**
 * @fileoverview Type definitions for the E-Commerce API
 * @module types
 * @description This module contains all TypeScript interfaces, types, and DTOs used throughout the API.
 * These types ensure type safety and provide documentation for API request/response structures.
 */

import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { Request } from 'express';

// ==========================================
// Auth Types
// ==========================================

/**
 * Data transfer object for user registration
 * @interface CreateUserDto
 * @category Auth
 * @example
 * ```typescript
 * const newUser: CreateUserDto = {
 *   email: 'user@example.com',
 *   password: 'SecureP@ss123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * };
 * ```
 */
export interface CreateUserDto {
  /** User's email address (must be unique) */
  email: string;
  /** User's password (min 8 characters, must include uppercase, lowercase, and number) */
  password: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** Optional phone number */
  phone?: string;
  /** Optional gender */
  gender?: string;
  /** Optional age */
  age?: number;
}

/**
 * Data transfer object for user login
 * @interface LoginDto
 * @category Auth
 * @example
 * ```typescript
 * const credentials: LoginDto = {
 *   email: 'user@example.com',
 *   password: 'SecureP@ss123'
 * };
 * ```
 */
export interface LoginDto {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * JWT access token payload structure
 * @interface TokenPayload
 * @category Auth
 * @description Contains the claims embedded in the JWT access token
 */
export interface TokenPayload {
  /** Subject - the user's ID */
  sub: number;
  /** User's email address */
  email: string;
  /** User's role (USER or ADMIN) */
  role: Role;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Optional JWT ID for token tracking */
  jti?: string;
}

/**
 * JWT refresh token payload structure
 * @interface RefreshTokenPayload
 * @category Auth
 */
export interface RefreshTokenPayload {
  /** Subject - the user's ID */
  sub: number;
  /** Token type identifier */
  type: 'refresh';
}

/**
 * Authenticated user information attached to requests
 * @interface AuthUser
 * @category Auth
 * @description This interface represents the user data available on authenticated requests
 */
export interface AuthUser {
  /** User's unique identifier */
  id: number;
  /** User's email address */
  email: string;
  /** User's role */
  role: Role;
}

/**
 * Extended Express Request with authenticated user
 * @interface AuthRequest
 * @extends Request
 * @category Auth
 * @description Use this type for route handlers that require authentication
 */
export interface AuthRequest extends Request {
  /** Authenticated user (populated by auth middleware) */
  user?: AuthUser;
}

// ==========================================
// Product Types
// ==========================================

/**
 * Data transfer object for creating a new product
 * @interface CreateProductDto
 * @category Products
 * @example
 * ```typescript
 * const product: CreateProductDto = {
 *   title: 'Wireless Headphones',
 *   description: 'High-quality wireless headphones',
 *   price: 99.99,
 *   category: 'electronics',
 *   brand: 'Sony',
 *   thumbnail: 'https://example.com/image.jpg'
 * };
 * ```
 */
export interface CreateProductDto {
  /** Product title/name */
  title: string;
  /** Detailed product description */
  description: string;
  /** Product price in USD */
  price: number;
  /** Optional discount percentage (0-100) */
  discountPercentage?: number;
  /** Main product image URL */
  thumbnail: string;
  /** Array of additional image URLs */
  images?: string[];
  /** Product category */
  category: string;
  /** Product brand name */
  brand: string;
  /** Available stock quantity (defaults to 0) */
  stock?: number;
}

/**
 * Data transfer object for updating an existing product
 * @interface UpdateProductDto
 * @category Products
 * @description All fields are optional - only provided fields will be updated
 */
export interface UpdateProductDto {
  /** Product title/name */
  title?: string;
  /** Detailed product description */
  description?: string;
  /** Product price in USD */
  price?: number;
  /** Discount percentage (0-100) */
  discountPercentage?: number;
  /** Main product image URL */
  thumbnail?: string;
  /** Array of additional image URLs */
  images?: string[];
  /** Product category */
  category?: string;
  /** Product brand name */
  brand?: string;
  /** Available stock quantity */
  stock?: number;
  /** Whether the product is active/visible */
  isActive?: boolean;
}

/**
 * Query parameters for filtering and paginating products
 * @interface ProductQuery
 * @category Products
 * @example
 * ```typescript
 * const query: ProductQuery = {
 *   category: 'electronics',
 *   minPrice: 50,
 *   maxPrice: 200,
 *   sortBy: 'price',
 *   order: 'asc',
 *   limit: 20
 * };
 * ```
 */
export interface ProductQuery {
  /** Number of items to skip (for pagination) */
  skip?: number;
  /** Maximum number of items to return (max 100) */
  limit?: number;
  /** Field to sort by (price, rating, createdAt, title) */
  sortBy?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Filter by brand name */
  brand?: string;
  /** Filter by category */
  category?: string;
  /** Only show products in stock */
  inStock?: boolean;
  /** Search query for title, description, brand */
  search?: string;
}

// ==========================================
// Cart Types
// ==========================================

/**
 * Data transfer object for adding an item to cart
 * @interface CartItemDto
 * @category Cart
 * @example
 * ```typescript
 * const cartItem: CartItemDto = {
 *   productId: 123,
 *   quantity: 2
 * };
 * ```
 */
export interface CartItemDto {
  /** Unique identifier of the product to add */
  productId: number;
  /** Quantity to add (must be positive) */
  quantity: number;
}

/**
 * Data transfer object for updating cart item quantity
 * @interface UpdateCartItemDto
 * @category Cart
 */
export interface UpdateCartItemDto {
  /** New quantity for the cart item (must be positive) */
  quantity: number;
}

/**
 * Cart item with full product details and calculated prices
 * @interface CartItemWithProduct
 * @category Cart
 * @description Used in cart responses to include product info and computed totals
 */
export interface CartItemWithProduct {
  /** Unique cart item ID */
  id: number;
  /** Cart ID this item belongs to */
  cartId: string;
  /** Product ID reference */
  productId: number;
  /** Quantity of this item in cart */
  quantity: number;
  /** Nested product information */
  product: {
    /** Product ID */
    id: number;
    /** Product title */
    title: string;
    /** Product base price */
    price: number;
    /** Optional discount percentage */
    discountPercentage?: number;
    /** Product thumbnail URL */
    thumbnail: string;
    /** Available stock */
    stock: number;
    /** Whether product is active */
    isActive: boolean;
  };
  /** Original unit price before discount */
  unitPrice: number;
  /** Unit price after discount applied */
  discountedPrice: number;
  /** Total for this item (discountedPrice * quantity) */
  itemTotal: number;
}

/**
 * Complete cart response including items and totals
 * @interface CartResponse
 * @category Cart
 */
export interface CartResponse {
  /** Unique cart identifier (UUID) */
  id: string;
  /** Array of cart items with product details */
  items: CartItemWithProduct[];
  /** Cart subtotal before tax/shipping */
  subtotal: number;
  /** Total number of items in cart */
  itemCount: number;
  /** Cart expiration timestamp */
  expiresAt: Date;
}

// ==========================================
// Order Types
// ==========================================

/**
 * Data transfer object for creating a new order
 * @interface CreateOrderDto
 * @category Orders
 * @example
 * ```typescript
 * const order: CreateOrderDto = {
 *   products: [{ id: 1, quantity: 2 }],
 *   shippingAddress: { firstName: 'John', ... },
 *   paymentIntentId: 'pi_xxx'
 * };
 * ```
 */
export interface CreateOrderDto {
  /** Array of products with quantities */
  products: Array<{
    /** Product ID */
    id: number;
    /** Quantity to order */
    quantity: number;
  }>;
  /** Shipping address details */
  shippingAddress: ShippingAddressDto;
  /** Stripe payment intent ID (optional for COD) */
  paymentIntentId?: string;
}

/**
 * Shipping address information for orders
 * @interface ShippingAddressDto
 * @category Orders
 */
export interface ShippingAddressDto {
  /** Recipient first name */
  firstName: string;
  /** Recipient last name */
  lastName: string;
  /** Street address */
  address: string;
  /** City name */
  city: string;
  /** State/Province */
  state: string;
  /** Postal/ZIP code */
  zipCode: string;
  /** Country */
  country: string;
  /** Contact phone number */
  phone: string;
}

/**
 * Data transfer object for updating order status
 * @interface UpdateOrderStatusDto
 * @category Orders
 * @description Used by admins to update order fulfillment status
 */
export interface UpdateOrderStatusDto {
  /** New order status */
  status: OrderStatus;
  /** Shipping tracking number */
  trackingNumber?: string;
  /** Shipping carrier (UPS, FedEx, etc.) */
  carrier?: string;
  /** Estimated delivery date */
  estimatedDelivery?: Date;
}

// ==========================================
// User Types
// ==========================================

/**
 * Data transfer object for updating user profile
 * @interface UpdateUserDto
 * @category Users
 */
export interface UpdateUserDto {
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** Phone number */
  phone?: string;
  /** Gender */
  gender?: string;
  /** User's age */
  age?: number;
  /** Profile image URL */
  image?: string;
}

/**
 * Data transfer object for password change
 * @interface UpdatePasswordDto
 * @category Users
 * @description Requires current password verification before updating
 */
export interface UpdatePasswordDto {
  /** Current password for verification */
  currentPassword: string;
  /** New password (min 6 characters) */
  newPassword: string;
}

/**
 * Data transfer object for creating a saved address
 * @interface CreateAddressDto
 * @category Users
 */
export interface CreateAddressDto {
  /** Address label (Home, Office, etc.) */
  label: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Street address */
  address: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** Postal/ZIP code */
  zipCode: string;
  /** Country */
  country: string;
  /** Phone number */
  phone: string;
  /** Whether this is the default address */
  isDefault?: boolean;
}

/**
 * Data transfer object for updating user preferences
 * @interface UpdatePreferencesDto
 * @category Users
 */
export interface UpdatePreferencesDto {
  /** UI theme preference */
  theme?: string;
  /** Enable push notifications */
  notifications?: boolean;
  /** Enable email notifications */
  emailNotifications?: boolean;
  /** Preferred currency code */
  currency?: string;
  /** Preferred language code */
  language?: string;
}

// ==========================================
// Payment Types
// ==========================================

/**
 * Data transfer object for creating a Stripe payment intent
 * @interface CreatePaymentIntentDto
 * @category Payments
 * @example
 * ```typescript
 * const payment: CreatePaymentIntentDto = {
 *   amount: 9999, // $99.99 in cents
 *   currency: 'usd',
 *   orderId: 'order_123'
 * };
 * ```
 */
export interface CreatePaymentIntentDto {
  /** Amount in cents (e.g., 9999 = $99.99) */
  amount: number;
  /** Currency code (defaults to 'usd') */
  currency?: string;
  /** Associated order ID for metadata */
  orderId?: string;
}

/**
 * Stripe webhook event payload structure
 * @interface PaymentWebhookEvent
 * @category Payments
 * @description Received from Stripe webhooks for payment events
 */
export interface PaymentWebhookEvent {
  /** Event type (e.g., 'payment_intent.succeeded') */
  type: string;
  /** Event data object */
  data: {
    /** The Stripe object that triggered the event */
    object: {
      /** Stripe object ID */
      id: string;
      /** Amount in cents */
      amount: number;
      /** Currency code */
      currency: string;
      /** Payment status */
      status: string;
      /** Custom metadata */
      metadata?: Record<string, string>;
    };
  };
}

// ==========================================
// Review Types
// ==========================================

/**
 * Data transfer object for creating a product review
 * @interface CreateReviewDto
 * @category Reviews
 */
export interface CreateReviewDto {
  /** ID of the product being reviewed */
  productId: number;
  /** Rating value (1-5) */
  rating: number;
  /** Optional review comment */
  comment?: string;
}

// ==========================================
// Wishlist Types
// ==========================================

/**
 * Data transfer object for adding a product to wishlist
 * @interface AddToWishlistDto
 * @category Wishlist
 */
export interface AddToWishlistDto {
  /** ID of the product to add */
  productId: number;
}

// ==========================================
// Common Types
// ==========================================

/**
 * Generic paginated response wrapper
 * @interface PaginatedResponse
 * @category Common
 * @typeParam T - The type of items in the data array
 * @example
 * ```typescript
 * const response: PaginatedResponse<Product> = {
 *   data: products,
 *   total: 100,
 *   skip: 0,
 *   limit: 10,
 *   page: 1,
 *   totalPages: 10
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Number of items skipped */
  skip: number;
  /** Page size limit */
  limit: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Generic service result wrapper for operations that may fail
 * @interface ServiceResult
 * @category Common
 * @typeParam T - The type of the data on success
 */
export interface ServiceResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
}
