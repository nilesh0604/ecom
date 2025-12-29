/**
 * Services Index - Central export for all API services
 * 
 * Usage:
 * import { productService, cartService, authService } from '@/services';
 */

export { authService } from './authService';
export type { RegisterRequest, RegisterResponse, ValidateTokenResponse } from './authService';

export { cartService } from './cartService';
export type { AddToCartRequest, CartResponse, UpdateCartItemRequest } from './cartService';

export { orderService } from './orderService';
export type { CreateOrderRequest, OrderStatusUpdate } from './orderService';

export { paymentService } from './paymentService';

export { productService } from './productService';
export type { CreateReviewRequest, ProductReview } from './productService';

export { userService } from './userService';
export type { UpdateProfileRequest, UserPreferencesRequest } from './userService';

export { wishlistService } from './wishlistService';
export type {
    WishlistCheckResponse, WishlistCountResponse, WishlistItem,
    WishlistResponse
} from './wishlistService';

