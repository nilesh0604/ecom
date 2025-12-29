import { Cart, CartItem } from '@prisma/client';
import config from '../config';
import { prisma } from '../config/database';
import { CartItemDto, CartResponse, UpdateCartItemDto } from '../types';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Cart Service
 * 
 * @description Manages shopping cart operations including:
 * - Cart creation and retrieval (supports both authenticated and guest users)
 * - Adding, updating, and removing cart items
 * - Cart merging when guest user authenticates
 * - Automatic price calculations with discounts
 * - Cart expiration handling
 * 
 * @example
 * ```typescript
 * import { cartService } from './services/cart.service';
 * 
 * // Get cart for authenticated user
 * const cart = await cartService.getCart(userId);
 * 
 * // Add item to cart
 * const updatedCart = await cartService.addToCart(userId, undefined, {
 *   productId: 123,
 *   quantity: 2
 * });
 * ```
 * 
 * @class CartService
 * @category Services
 */
export class CartService {
  /**
   * Get or create a cart for user or session
   * 
   * @description Finds existing cart or creates new one. Supports both
   * authenticated users (by userId) and guests (by sessionId).
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @returns Cart object with items and product details
   * 
   * @example
   * ```typescript
   * // For authenticated user
   * const cart = await cartService.getOrCreateCart(userId);
   * 
   * // For guest user
   * const guestCart = await cartService.getOrCreateCart(undefined, sessionId);
   * ```
   */
  async getOrCreateCart(userId?: number, sessionId?: string): Promise<Cart & { items: any[] }> {
    // Try to find existing cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
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
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // Create new cart
      cart = await prisma.cart.create({
        data: {
          userId,
          sessionId: userId ? null : sessionId,
          expiresAt: new Date(Date.now() + config.cart.expiryDays * 24 * 60 * 60 * 1000),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Get cart with calculated prices and totals
   * 
   * @description Retrieves cart and computes discounted prices, item totals,
   * subtotal, and item count. Filters out inactive products.
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @returns CartResponse with items, prices, and totals
   * 
   * @example
   * ```typescript
   * const cart = await cartService.getCart(userId);
   * console.log(cart.subtotal, cart.itemCount);
   * cart.items.forEach(item => {
   *   console.log(item.product.title, item.discountedPrice, item.itemTotal);
   * });
   * ```
   */
  async getCart(userId?: number, sessionId?: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Filter out inactive products and calculate totals
    const items = cart.items
      .filter((item: any) => item.product.isActive)
      .map((item: any) => {
        const price = Number(item.product.price);
        const discount = Number(item.product.discountPercentage || 0);
        const discountedPrice = price * (1 - discount / 100);

        return {
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          unitPrice: price,
          discountedPrice: Math.round(discountedPrice * 100) / 100,
          itemTotal: Math.round(discountedPrice * item.quantity * 100) / 100,
        };
      });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.itemTotal, 0);
    const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
      expiresAt: cart.expiresAt,
    };
  }

  /**
   * Add an item to the cart
   * 
   * @description Adds a product to the cart or increments quantity if already exists.
   * Validates product availability and stock before adding.
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @param data - Object containing productId and quantity to add
   * @returns Updated CartResponse with all items and totals
   * @throws {NotFoundError} If product doesn't exist or is inactive
   * @throws {AppError} If insufficient stock (400)
   * 
   * @example
   * ```typescript
   * const cart = await cartService.addToCart(userId, undefined, {
   *   productId: 123,
   *   quantity: 2
   * });
   * ```
   */
  async addToCart(
    userId: number | undefined,
    sessionId: string | undefined,
    data: CartItemDto
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Validate product
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check existing item in cart
    const existingItem = cart.items.find((item: any) => item.productId === data.productId);
    const totalQuantity = (existingItem?.quantity || 0) + data.quantity;

    if (product.stock < totalQuantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.stock}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Upsert cart item
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId,
        },
      },
      create: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      },
      update: {
        quantity: {
          increment: data.quantity,
        },
      },
    });

    logger.info(`Item added to cart: ${cart.id}, product: ${data.productId}, qty: ${data.quantity}`);

    return this.getCart(userId, sessionId);
  }

  /**
   * Update the quantity of a cart item
   * 
   * @description Updates item quantity. If quantity is 0 or less, removes the item.
   * Validates stock availability before updating.
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @param itemId - Cart item ID to update
   * @param data - Object containing new quantity
   * @returns Updated CartResponse
   * @throws {NotFoundError} If cart item doesn't exist
   * @throws {AppError} If insufficient stock (400)
   * 
   * @example
   * ```typescript
   * const cart = await cartService.updateCartItem(userId, undefined, itemId, {
   *   quantity: 3
   * });
   * ```
   */
  async updateCartItem(
    userId: number | undefined,
    sessionId: string | undefined,
    itemId: number,
    data: UpdateCartItemDto
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundError('Cart item');
    }

    // Validate stock
    if (data.quantity > cartItem.product.stock) {
      throw new AppError(
        `Insufficient stock. Available: ${cartItem.product.stock}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    if (data.quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      logger.info(`Item removed from cart: ${cart.id}, item: ${itemId}`);
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity },
      });
      logger.info(`Cart item updated: ${cart.id}, item: ${itemId}, qty: ${data.quantity}`);
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Remove an item from the cart
   * 
   * @description Completely removes a cart item regardless of quantity.
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @param itemId - Cart item ID to remove
   * @returns Updated CartResponse without the removed item
   * @throws {NotFoundError} If cart item doesn't exist
   * 
   * @example
   * ```typescript
   * const cart = await cartService.removeFromCart(userId, undefined, itemId);
   * ```
   */
  async removeFromCart(
    userId: number | undefined,
    sessionId: string | undefined,
    itemId: number
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const deleted = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundError('Cart item');
    }

    logger.info(`Item removed from cart: ${cart.id}, item: ${itemId}`);

    return this.getCart(userId, sessionId);
  }

  /**
   * Clear all items from the cart
   * 
   * @description Removes all items from the cart, leaving it empty.
   * Typically called after successful order placement.
   * 
   * @param userId - User ID for authenticated users
   * @param sessionId - Session ID for guest users
   * @returns void
   * 
   * @example
   * ```typescript
   * await cartService.clearCart(userId);
   * ```
   */
  async clearCart(userId?: number, sessionId?: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    logger.info(`Cart cleared: ${cart.id}`);
  }

  /**
   * Merge guest cart into authenticated user's cart
   * 
   * @description When a guest user logs in, their session cart items are
   * merged into their user cart. If an item already exists, quantities are added.
   * Guest cart is deleted after merging.
   * 
   * @param userId - Authenticated user's ID
   * @param sessionId - Guest session ID to merge from
   * @returns Merged CartResponse
   * 
   * @example
   * ```typescript
   * // After successful login
   * const mergedCart = await cartService.mergeGuestCart(userId, sessionId);
   * ```
   */
  async mergeGuestCart(userId: number, sessionId: string): Promise<CartResponse> {
    // Find guest cart
    const guestCart = await prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(userId);
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const item of guestCart.items) {
      await prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: userCart.id,
            productId: item.productId,
          },
        },
        create: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
        update: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // Delete guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    logger.info(`Guest cart merged: ${guestCart.id} -> ${userCart.id}`);

    return this.getCart(userId);
  }

  /**
   * Clean up expired guest carts (maintenance task)
   * 
   * @description Removes guest carts that have passed their expiration date.
   * Should be called periodically via cron job or scheduled task.
   * Does not delete user carts even if expired.
   * 
   * @returns Number of carts deleted
   * 
   * @example
   * ```typescript
   * // In a scheduled job
   * const deleted = await cartService.cleanupExpiredCarts();
   * console.log(`Cleaned up ${deleted} expired carts`);
   * ```
   */
  async cleanupExpiredCarts(): Promise<number> {
    const result = await prisma.cart.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        userId: null, // Only delete guest carts
      },
    });

    logger.info(`Cleaned up ${result.count} expired carts`);

    return result.count;
  }
}

export const cartService = new CartService();
export default cartService;
