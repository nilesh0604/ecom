import { Prisma, User } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateAddressDto, UpdatePreferencesDto, UpdateUserDto } from '../types';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class UsersService {
  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateData: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        preferences: true,
      },
    });

    logger.info(`User profile updated: ${userId}`);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user addresses
   */
  async getAddresses(userId: number) {
    return prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Add new address
   */
  async addAddress(userId: number, addressData: CreateAddressDto) {
    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId,
        ...addressData,
      },
    });

    logger.info(`Address added for user ${userId}`);

    return address;
  }

  /**
   * Update address
   */
  async updateAddress(userId: number, addressId: number, addressData: Partial<CreateAddressDto>) {
    const existing = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address');
    }

    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.update({
      where: { id: addressId },
      data: addressData,
    });

    logger.info(`Address updated: ${addressId} for user ${userId}`);

    return address;
  }

  /**
   * Delete address
   */
  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const existing = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address');
    }

    await prisma.userAddress.delete({
      where: { id: addressId },
    });

    logger.info(`Address deleted: ${addressId} for user ${userId}`);
  }

  /**
   * Set default address
   */
  async setDefaultAddress(userId: number, addressId: number) {
    const existing = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address');
    }

    await prisma.$transaction([
      prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.userAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    logger.info(`Default address set: ${addressId} for user ${userId}`);
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: number) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          theme: 'light',
          notifications: true,
          emailNotifications: true,
          currency: 'USD',
          language: 'en',
        },
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: number, preferencesData: UpdatePreferencesDto) {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: preferencesData,
      create: {
        userId,
        ...preferencesData,
      },
    });

    logger.info(`Preferences updated for user ${userId}`);

    return preferences;
  }

  /**
   * Get user wishlist
   */
  async getWishlist(userId: number, skip = 0, limit = 10) {
    const [items, total] = await prisma.$transaction([
      prisma.wishlist.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      }),
      prisma.wishlist.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item) => item.product),
      total,
      skip,
      limit,
    };
  }

  /**
   * Add to wishlist
   */
  async addToWishlist(userId: number, productId: number) {
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

    await prisma.wishlist.create({
      data: { userId, productId },
    });

    logger.info(`Product ${productId} added to wishlist for user ${userId}`);
  }

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const deleted = await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });

    if (deleted.count === 0) {
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
   * Get all users (admin)
   */
  async getAllUsers(skip = 0, limit = 10, search?: string) {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      skip,
      limit,
    };
  }

  /**
   * Update user status (admin)
   */
  async updateUserStatus(userId: number, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    logger.info(`User ${userId} status updated: isActive=${isActive}`);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const usersService = new UsersService();
export default usersService;
