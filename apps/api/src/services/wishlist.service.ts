import { Product, Wishlist } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface WishlistItem extends Wishlist {
  product: Product;
}

export class WishlistService {
  /**
   * Get user's wishlist
   */
  async getWishlist(userId: number): Promise<WishlistItem[]> {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return items as WishlistItem[];
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      throw new AppError('Product already in wishlist', 409, 'ALREADY_IN_WISHLIST');
    }

    // Add to wishlist
    const item = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true },
    });

    logger.info(`Product ${productId} added to wishlist for user ${userId}`);

    return item as WishlistItem;
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const result = await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });

    if (result.count === 0) {
      throw new NotFoundError('Wishlist item');
    }

    logger.info(`Product ${productId} removed from wishlist for user ${userId}`);
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return !!item;
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: number): Promise<void> {
    await prisma.wishlist.deleteMany({
      where: { userId },
    });

    logger.info(`Wishlist cleared for user ${userId}`);
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount(userId: number): Promise<number> {
    return await prisma.wishlist.count({
      where: { userId },
    });
  }

  /**
   * Move item from wishlist to cart
   */
  async moveToCart(
    userId: number,
    productId: number,
    cartService: any // Avoid circular dependency
  ): Promise<void> {
    // Check if in wishlist
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!item) {
      throw new NotFoundError('Wishlist item');
    }

    // Add to cart
    await cartService.addToCart(userId, undefined, { productId, quantity: 1 });

    // Remove from wishlist
    await this.removeFromWishlist(userId, productId);

    logger.info(`Product ${productId} moved from wishlist to cart for user ${userId}`);
  }
}

export const wishlistService = new WishlistService();
