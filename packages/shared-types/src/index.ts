/**
 * @ecom/shared-types
 * 
 * Shared TypeScript types and interfaces used across the monorepo.
 * These types can be imported by any app or package in the workspace.
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Represents a unique identifier
 */
export type ID = string | number;

/**
 * Represents a timestamp in ISO 8601 format
 */
export type Timestamp = string;

/**
 * Represents currency amount in cents (to avoid floating point issues)
 */
export type CentsAmount = number;

// ============================================================================
// API Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Timestamp;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: Timestamp;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * User profile information
 */
export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// Product Types
// ============================================================================

/**
 * Product category
 */
export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  parentId?: ID;
}

/**
 * Product information
 */
export interface Product {
  id: ID;
  name: string;
  slug: string;
  description: string;
  price: CentsAmount;
  compareAtPrice?: CentsAmount;
  images: string[];
  thumbnail: string;
  categoryId: ID;
  category?: Category;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Cart Types
// ============================================================================

/**
 * Cart item
 */
export interface CartItem {
  id: ID;
  productId: ID;
  product: Product;
  quantity: number;
  price: CentsAmount;
}

/**
 * Shopping cart
 */
export interface Cart {
  id: ID;
  items: CartItem[];
  subtotal: CentsAmount;
  tax: CentsAmount;
  shipping: CentsAmount;
  total: CentsAmount;
  itemCount: number;
}

// ============================================================================
// Order Types
// ============================================================================

/**
 * Shipping address
 */
export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

/**
 * Order status
 */
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/**
 * Order item
 */
export interface OrderItem {
  id: ID;
  productId: ID;
  productName: string;
  productImage: string;
  quantity: number;
  price: CentsAmount;
  total: CentsAmount;
}

/**
 * Order
 */
export interface Order {
  id: ID;
  orderNumber: string;
  userId: ID;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: CentsAmount;
  tax: CentsAmount;
  shipping: CentsAmount;
  total: CentsAmount;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
