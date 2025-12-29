import { Request, Response } from 'express';
import { productsService } from '../services/products.service';
import { AuthRequest, CreateProductDto, UpdateProductDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Get all products
 * GET /api/v1/products
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productsService.getProducts(req.query as any);

  ApiResponse.paginated(
    res,
    result.products,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const product = await productsService.getProductById(id);

  ApiResponse.success(res, product);
});

/**
 * Search products
 * GET /api/v1/products/search
 */
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, skip = '0', limit = '10' } = req.query;

  if (!q || typeof q !== 'string') {
    return ApiResponse.badRequest(res, 'Search query is required');
  }

  const result = await productsService.searchProducts(
    q,
    parseInt(skip as string),
    parseInt(limit as string)
  );

  ApiResponse.paginated(
    res,
    result.products,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Get products by category
 * GET /api/v1/products/category/:category
 */
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { skip = '0', limit = '10' } = req.query;

  const result = await productsService.getProductsByCategory(
    category,
    parseInt(skip as string),
    parseInt(limit as string)
  );

  ApiResponse.paginated(
    res,
    result.products,
    result.total,
    result.skip,
    result.limit
  );
});

/**
 * Get all categories
 * GET /api/v1/products/categories
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await productsService.getCategories();

  ApiResponse.success(res, categories);
});

/**
 * Get all brands
 * GET /api/v1/products/brands
 */
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await productsService.getBrands();

  ApiResponse.success(res, brands);
});

/**
 * Create product (admin)
 * POST /api/v1/products
 */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const productData: CreateProductDto = {
    ...req.body,
    price: parseFloat(req.body.price),
    discountPercentage: req.body.discountPercentage
      ? parseFloat(req.body.discountPercentage)
      : undefined,
    stock: req.body.stock ? parseInt(req.body.stock) : 0,
  };

  // Handle file uploads if present
  if (req.files && Array.isArray(req.files)) {
    productData.images = req.files.map((f: any) => f.path);
    if (req.files.length > 0) {
      productData.thumbnail = req.files[0].path;
    }
  }

  const product = await productsService.createProduct(productData);

  ApiResponse.created(res, product, 'Product created successfully');
});

/**
 * Update product (admin)
 * PUT /api/v1/products/:id
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updateData: UpdateProductDto = {
    ...req.body,
    price: req.body.price ? parseFloat(req.body.price) : undefined,
    discountPercentage: req.body.discountPercentage
      ? parseFloat(req.body.discountPercentage)
      : undefined,
    stock: req.body.stock ? parseInt(req.body.stock) : undefined,
  };

  // Handle file uploads if present
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    updateData.images = req.files.map((f: any) => f.path);
  }

  const product = await productsService.updateProduct(id, updateData);

  ApiResponse.success(res, product, 'Product updated successfully');
});

/**
 * Delete product (admin)
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  await productsService.deleteProduct(id);

  ApiResponse.success(res, { id, isDeleted: true }, 'Product deleted successfully');
});

/**
 * Add product review
 * POST /api/v1/products/:id/reviews
 */
export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = parseInt(req.params.id);
  const { rating, comment } = req.body;

  const review = await productsService.addReview(
    productId,
    req.user!.id,
    rating,
    comment
  );

  ApiResponse.created(res, review, 'Review added successfully');
});

/**
 * Get product reviews
 * GET /api/v1/products/:id/reviews
 */
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);
  const { skip = '0', limit = '10' } = req.query;

  const result = await productsService.getProductReviews(
    productId,
    parseInt(skip as string),
    parseInt(limit as string)
  );

  ApiResponse.paginated(
    res,
    result.reviews,
    result.total,
    result.skip,
    result.limit
  );
});
