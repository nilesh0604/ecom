import { CartService } from '../../services/cart.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    cart: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        cart: {
          findFirst: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        cartItem: {
          create: jest.fn(),
          update: jest.fn(),
          upsert: jest.fn(),
          delete: jest.fn(),
          deleteMany: jest.fn(),
        },
      })
    ),
  },
}));

jest.mock('../../services/cache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { prisma } from '../../config/database';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    const mockCartWithItems = {
      id: 'cart-123',
      userId: 1,
      sessionId: null,
      items: [
        {
          id: 1,
          cartId: 'cart-123',
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            title: 'Test Product',
            price: 99.99,
            stock: 10,
            isActive: true,
            discountPercentage: 0,
          },
        },
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should return cart with computed totals for authenticated user', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCartWithItems);

      const result = await cartService.getCart(1);

      expect(result).toHaveProperty('id', 'cart-123');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('itemCount');
      expect(result.itemCount).toBe(2);
      expect(result.subtotal).toBeCloseTo(199.98, 2);
    });

    it('should return cart for guest user with session', async () => {
      const guestCart = { ...mockCartWithItems, userId: null, sessionId: 'session-123' };
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(guestCart);

      const result = await cartService.getCart(undefined, 'session-123');

      expect(result).toHaveProperty('id', 'cart-123');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('itemCount');
    });

    it('should create new cart if none exists', async () => {
      const newCart = {
        id: 'new-cart-123',
        userId: 1,
        sessionId: null,
        items: [],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.cart.create as jest.Mock).mockResolvedValue(newCart);

      const result = await cartService.getCart(1);

      expect(prisma.cart.create).toHaveBeenCalled();
      expect(result.items).toEqual([]);
      expect(result.itemCount).toBe(0);
      expect(result.subtotal).toBe(0);
    });
  });

  describe('addToCart', () => {
    const mockProduct = {
      id: 1,
      title: 'Test Product',
      price: 99.99,
      stock: 10,
      isActive: true,
      discountPercentage: 0,
    };

    const mockCart = {
      id: 'cart-123',
      userId: 1,
      items: [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should add item to cart', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.cartItem.upsert as jest.Mock).mockResolvedValue({
        id: 1,
        cartId: 'cart-123',
        productId: 1,
        quantity: 1,
      });

      // Second call for getCart after adding
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 1,
            product: mockProduct,
          },
        ],
      });

      const result = await cartService.addToCart(1, undefined, { productId: 1, quantity: 1 });

      expect(prisma.cartItem.upsert).toHaveBeenCalled();
      expect(result).toHaveProperty('items');
    });

    it('should throw error for non-existent product', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        cartService.addToCart(1, undefined, { productId: 999, quantity: 1 })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error for inactive product', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null); // findFirst with isActive: true returns null

      await expect(
        cartService.addToCart(1, undefined, { productId: 1, quantity: 1 })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error for insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 2 };
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(lowStockProduct);

      await expect(
        cartService.addToCart(1, undefined, { productId: 1, quantity: 5 })
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('updateCartItem', () => {
    const mockProduct = {
      id: 1,
      price: 99.99,
      stock: 10,
      isActive: true,
      discountPercentage: 0,
    };

    const mockCartWithItem = {
      id: 'cart-123',
      userId: 1,
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 1,
          product: mockProduct,
        },
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should update cart item quantity', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCartWithItem);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        cartId: 'cart-123',
        productId: 1,
        quantity: 1,
        product: mockProduct,
      });
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        id: 1,
        quantity: 3,
      });

      // After update, return updated cart
      (prisma.cart.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockCartWithItem)
        .mockResolvedValue({
          ...mockCartWithItem,
          items: [{ ...mockCartWithItem.items[0], quantity: 3 }],
        });

      const result = await cartService.updateCartItem(1, undefined, 1, { quantity: 3 });

      expect(prisma.cartItem.update).toHaveBeenCalled();
      expect(result).toHaveProperty('items');
    });

    it('should remove item when quantity is 0', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCartWithItem);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        cartId: 'cart-123',
        productId: 1,
        quantity: 1,
        product: mockProduct,
      });
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue({ id: 1 });

      // After delete, return empty cart
      (prisma.cart.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockCartWithItem)
        .mockResolvedValue({
          ...mockCartWithItem,
          items: [],
        });

      const result = await cartService.updateCartItem(1, undefined, 1, { quantity: 0 });

      expect(prisma.cartItem.delete).toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });
  });

  describe('removeFromCart', () => {
    const mockProduct = {
      id: 1,
      price: 99.99,
      stock: 10,
      isActive: true,
      discountPercentage: 0,
    };

    const mockCartWithItem = {
      id: 'cart-123',
      userId: 1,
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 2,
          product: mockProduct,
        },
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should remove item from cart', async () => {
      (prisma.cart.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockCartWithItem)
        .mockResolvedValue({
          ...mockCartWithItem,
          items: [],
        });
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await cartService.removeFromCart(1, undefined, 1);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });

    it('should throw error for non-existent cart item', async () => {
      const emptyCart = { ...mockCartWithItem, items: [] };
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(emptyCart);
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(cartService.removeFromCart(1, undefined, 999)).rejects.toThrow();
    });
  });

  describe('clearCart', () => {
    const mockCart = {
      id: 'cart-123',
      userId: 1,
      items: [{ id: 1 }, { id: 2 }],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should clear all items from cart', async () => {
      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await cartService.clearCart(1);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-123' },
      });
    });
  });

  describe('getCartSummary', () => {
    it('should return correct cart summary', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 1,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            product: { id: 1, price: 99.99, isActive: true, discountPercentage: 0 },
          },
          {
            id: 2,
            productId: 2,
            quantity: 1,
            product: { id: 2, price: 49.99, isActive: true, discountPercentage: 0 },
          },
        ],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (prisma.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.getCart(1);

      expect(result).toHaveProperty('itemCount');
      expect(result).toHaveProperty('subtotal');
      expect(result.itemCount).toBe(3);
      expect(result.subtotal).toBeCloseTo(249.97, 2);
    });
  });
});
