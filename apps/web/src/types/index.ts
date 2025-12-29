/**
 * Type Definitions for E-Commerce Application
 * 
 * This file defines all TypeScript interfaces and types used throughout the application.
 * 
 * Why we centralize types here:
 * - Ensures consistency across components - all parts of the app use the same data shapes
 * - Makes refactoring easier - change a type once, it updates everywhere
 * - Enables autocomplete in IDE - TypeScript knows exactly what properties exist
 * - Serves as API contract documentation - clearly shows what data comes from backend
 * - Prevents type-related bugs - catches mismatches at compile time, not runtime
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * Product - Represents a product item in the catalog
 * 
 * Used in:
 * - Product listing pages
 * - Product detail pages
 * - Search results
 * - Shopping cart items
 * 
 * Why these fields:
 * - id: Unique identifier for database queries and updates
 * - title/description: Display in UI
 * - price/discountPercentage: Calculate discounted price for checkout
 * - thumbnail/images: Show product visually to customers
 * - category/brand: For filtering and organizing products
 * - rating/reviews: Build trust, help customers decide
 * - stock: Determine if product can be added to cart
 */
export interface Product {
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

/**
 * Review - Customer feedback for a product
 * 
 * Used in:
 * - Product detail page review section
 * - Product recommendations
 * - Social proof
 */
export interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

// ============================================================================
// SHOPPING CART TYPES
// ============================================================================

/**
 * Cart - Represents the user's shopping cart
 * 
 * Used in:
 * - Cart page to display all items user selected
 * - Checkout page to calculate total
 * - Cart dropdown preview
 * 
 * Why separate from Product:
 * - Cart items have quantity and totals (computed fields)
 * - Product is from catalog, Cart is user-specific
 * - Allows tracking discounts applied to cart
 */
export interface Cart {
  id: string;
  products: CartItem[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

/**
 * CartItem - A product in the user's shopping cart
 * 
 * Extended from Product with:
 * - quantity: How many of this product user wants
 * - total: Original total (price × quantity)
 * - discountedTotal: Total after applying discounts
 * 
 * Used in:
 * - Rendering cart rows
 * - Calculating cart totals
 * - Update quantity operations
 */
export interface CartItem {
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
// USER TYPES
// ============================================================================

/**
 * User - Represents a registered user account
 * 
 * Used in:
 * - Authentication (login/logout)
 * - User profile page
 * - Order history (linked via userId)
 * - Admin controls (check if role === 'admin')
 * 
 * Why these fields:
 * - id: Reference user in orders, cart, reviews
 * - email: Login credential, contact, password recovery
 * - firstName/lastName: Display in UI, receipts, shipping
 * - gender/age: Optional user profile info
 * - image: User avatar in header
 * - phone: Shipping and customer support
 * - role: Determine admin features vs regular user features
 */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  phone: string;
  age: number;
  role: 'admin' | 'user';
}

// ============================================================================
// ORDER TYPES
// ============================================================================

/**
 * Order - Represents a completed purchase
 * 
 * Created from:
 * - User's cart when they click "Place Order"
 * - Snapshot of cart items + totals at that moment
 * 
 * Used in:
 * - Order history page
 * - Order tracking
 * - Admin order management
 * - Invoice generation
 * 
 * Why snapshot (CartItem[]) instead of Product[]:
 * - Products can change (price, availability) after order
 * - We need to preserve exact price/discount user paid
 * - History must be immutable
 */
export interface Order {
  id: string;
  userId: number;
  products: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * ApiResponse<T> - Generic wrapper for successful API responses
 * 
 * Why wrap responses:
 * - Provides consistent structure for all API calls
 * - Allows including metadata (status, message) with data
 * - Generic type T means it works with any response type
 * 
 * Example usage:
 * - ApiResponse<Product> when fetching a single product
 * - ApiResponse<Product[]> when fetching product list
 * - ApiResponse<User> when fetching user profile
 * 
 * Without this, we'd never know what data structure to expect
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * ApiError - Represents an error from API call
 * 
 * Used in:
 * - Catch blocks in async calls
 * - User-facing error messages
 * - Error logging and debugging
 * - Retry logic (some codes might be retryable)
 * 
 * Example:
 * try {
 *   await apiClient.get('/products/999');
 * } catch (error: ApiError) {
 *   if (error.code === 'NOT_FOUND') {
 *     // Handle 404 specifically
 *   }
 * }
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

/**
 * PaginatedResponse<T> - For large lists that need pagination
 * 
 * Used in:
 * - Product listing (show 10 per page, total 1000 products)
 * - Order history (show 5 per page)
 * - User comments/reviews
 * 
 * Why separate type:
 * - APIs return large data sets in chunks (pages)
 * - We need metadata to build pagination UI (page numbers, next/prev buttons)
 * - Reduces network load and improves performance
 * 
 * Note: DummyJSON uses 'products' key for product responses.
 * We use a generic 'products' field that works with their API.
 * 
 * Example:
 * PaginatedResponse<Product> when fetching page 2 of products
 * Returns products: [Product, Product, ...], total: 1000, skip: 10, limit: 10
 */
export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt?: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed';