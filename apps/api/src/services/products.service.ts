import { Prisma, Product } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateProductDto, ProductQuery, UpdateProductDto } from '../types';
import { AppError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Products Service
 * 
 * @description Handles all product-related operations including:
 * - Product listing with advanced filtering and pagination
 * - Category and brand management
 * - Product CRUD operations (admin)
 * - Stock management
 * - Product reviews
 * 
 * @example
 * ```typescript
 * import { productsService } from './services/products.service';
 * 
 * // Get products with filters
 * const { products, total } = await productsService.getProducts({
 *   category: 'electronics',
 *   minPrice: 50,
 *   maxPrice: 500,
 *   sortBy: 'price',
 *   order: 'asc',
 *   limit: 20
 * });
 * ```
 * 
 * @class ProductsService
 * @category Services
 */
export class ProductsService {
  /**
   * Get products with advanced filtering and pagination
   * 
   * @description Retrieves products with support for:
   * - Price range filtering (minPrice, maxPrice)
   * - Brand and category filtering
   * - In-stock filtering
   * - Full-text search across title, description, brand, category
   * - Sorting by any field (price, rating, createdAt, title)
   * - Pagination with configurable limit (max 100)
   * 
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Object containing products array, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * const result = await productsService.getProducts({
   *   search: 'wireless',
   *   category: 'electronics',
   *   inStock: true,
   *   sortBy: 'rating',
   *   order: 'desc',
   *   limit: 10
   * });
   * ```
   */
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
      inStock,
      search,
    } = query;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (brand) {
      where.brand = {
        contains: brand,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = category;
    }

    if (inStock === true) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: order,
    };

    // Execute query
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Math.min(limit, 100),
        include: {
          reviews: {
            take: 3,
            orderBy: { date: 'desc' },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get a single product by ID with reviews
   * 
   * @description Retrieves full product details including the 10 most recent reviews.
   * Only returns active products.
   * 
   * @param id - Product ID to retrieve
   * @returns Full product object with reviews and reviewer info
   * @throws {NotFoundError} If product doesn't exist or is inactive
   * 
   * @example
   * ```typescript
   * const product = await productsService.getProductById(123);
   * console.log(product.reviews); // Recent reviews with user info
   * ```
   */
  async getProductById(id: number): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        reviews: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  /**
   * Search products by text query
   * 
   * @description Performs case-insensitive search across product title,
   * description, brand, and category fields.
   * 
   * @param query - Search text to match against products
   * @param skip - Number of results to skip (pagination offset)
   * @param limit - Maximum number of results to return (max 100)
   * @returns Object containing matched products, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * const { products } = await productsService.searchProducts('headphones', 0, 20);
   * ```
   */
  async searchProducts(query: string, skip = 0, limit = 10) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: Math.min(limit, 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get products filtered by category
   * 
   * @description Retrieves all active products in a specific category.
   * 
   * @param category - Category name to filter by (exact match)
   * @param skip - Number of results to skip (pagination offset)
   * @param limit - Maximum number of results to return (max 100)
   * @returns Object containing products, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * const { products } = await productsService.getProductsByCategory('electronics');
   * ```
   */
  async getProductsByCategory(category: string, skip = 0, limit = 10) {
    const where: Prisma.ProductWhereInput = {
      category,
      isActive: true,
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: Math.min(limit, 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get list of all distinct product categories
   * 
   * @description Returns unique category names from all active products.
   * Useful for building category navigation and filters.
   * 
   * @returns Array of category name strings
   * 
   * @example
   * ```typescript
   * const categories = await productsService.getCategories();
   * // ['electronics', 'clothing', 'books', ...]
   * ```
   */
  async getCategories(): Promise<string[]> {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map((c) => c.category);
  }

  /**
   * Get list of all distinct product brands
   * 
   * @description Returns unique brand names from all active products.
   * Useful for building brand filters.
   * 
   * @returns Array of brand name strings
   * 
   * @example
   * ```typescript
   * const brands = await productsService.getBrands();
   * // ['Apple', 'Samsung', 'Sony', ...]
   * ```
   */
  async getBrands(): Promise<string[]> {
    const brands = await prisma.product.findMany({
      where: { isActive: true },
      select: { brand: true },
      distinct: ['brand'],
    });

    return brands.map((b) => b.brand);
  }

  /**
   * Create a new product (Admin only)
   * 
   * @description Creates a new product in the database.
   * Requires admin role to access.
   * 
   * @param productData - Product data to create
   * @returns The created product object
   * 
   * @example
   * ```typescript
   * const product = await productsService.createProduct({
   *   title: 'New Product',
   *   description: 'Product description',
   *   price: 99.99,
   *   category: 'electronics',
   *   brand: 'BrandName',
   *   thumbnail: 'https://...',
   *   stock: 100
   * });
   * ```
   */
  async createProduct(productData: CreateProductDto): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        ...productData,
        images: productData.images || [],
      },
    });

    logger.info(`Product created: ${product.title} (ID: ${product.id})`);

    return product;
  }

  /**
   * Update an existing product (Admin only)
   * 
   * @description Updates product fields. Only provided fields are updated.
   * Requires admin role to access.
   * 
   * @param id - Product ID to update
   * @param updateData - Partial product data to update
   * @returns The updated product object
   * @throws {NotFoundError} If product doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await productsService.updateProduct(123, {
   *   price: 79.99,
   *   stock: 50
   * });
   * ```
   */
  async updateProduct(id: number, updateData: UpdateProductDto): Promise<Product> {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError('Product');
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Product updated: ${product.title} (ID: ${product.id})`);

    return product;
  }

  /**
   * Delete a product (Admin only - soft delete)
   * 
   * @description Performs a soft delete by setting isActive to false.
   * Product data is retained but hidden from queries.
   * 
   * @param id - Product ID to delete
   * @returns void
   * @throws {NotFoundError} If product doesn't exist
   * 
   * @example
   * ```typescript
   * await productsService.deleteProduct(123);
   * // Product is now inactive and won't appear in listings
   * ```
   */
  async deleteProduct(id: number): Promise<void> {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError('Product');
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Product deleted: ID ${id}`);
  }

  /**
   * Update product stock quantity
   * 
   * @description Increments (or decrements) the stock count for a product.
   * Use positive values to add stock, negative to remove.
   * 
   * @param id - Product ID to update
   * @param quantity - Amount to add (positive) or remove (negative)
   * @returns void
   * 
   * @example
   * ```typescript
   * // Add 10 units
   * await productsService.updateStock(123, 10);
   * 
   * // Remove 5 units (e.g., after purchase)
   * await productsService.updateStock(123, -5);
   * ```
   */
  async updateStock(id: number, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    logger.info(`Stock updated for product ID ${id}: ${quantity > 0 ? '+' : ''}${quantity}`);
  }

  /**
   * Add a review to a product
   * 
   * @description Creates a new review for a product. Each user can only
   * review a product once. Automatically updates the product's average rating.
   * 
   * @param productId - ID of the product to review
   * @param userId - ID of the user submitting the review
   * @param rating - Rating value (1-5)
   * @param comment - Optional review comment text
   * @returns The created review object
   * @throws {NotFoundError} If user or product doesn't exist
   * @throws {AppError} If user has already reviewed this product (409)
   * 
   * @example
   * ```typescript
   * const review = await productsService.addReview(
   *   123,           // productId
   *   456,           // userId
   *   5,             // rating
   *   'Great product!' // comment
   * );
   * ```
   */
  async addReview(
    productId: number,
    userId: number,
    rating: number,
    comment?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 409, 'REVIEW_EXISTS');
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating,
        comment,
        reviewerName: `${user.firstName} ${user.lastName}`,
        reviewerEmail: user.email,
      },
    });

    // Update product rating
    const reviews = await prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { rating: reviews._avg.rating || 0 },
    });

    logger.info(`Review added for product ${productId} by user ${userId}`);

    return review;
  }

  /**
   * Get paginated reviews for a product
   * 
   * @description Retrieves reviews for a specific product with pagination.
   * Includes reviewer user information (name, image).
   * 
   * @param productId - ID of the product to get reviews for
   * @param skip - Number of reviews to skip (pagination offset)
   * @param limit - Maximum number of reviews to return
   * @returns Object containing reviews array, total count, skip, and limit
   * 
   * @example
   * ```typescript
   * const { reviews, total } = await productsService.getProductReviews(123, 0, 10);
   * reviews.forEach(r => console.log(r.rating, r.comment));
   * ```
   */
  async getProductReviews(productId: number, skip = 0, limit = 10) {
    const where = { productId };

    const [reviews, total] = await prisma.$transaction([
      prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      }),
      prisma.productReview.count({ where }),
    ]);

    return {
      reviews,
      total,
      skip,
      limit,
    };
  }
}

export const productsService = new ProductsService();
export default productsService;
