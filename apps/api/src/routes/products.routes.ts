import { Router } from 'express';
import * as productsController from '../controllers/products.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { uploadImages } from '../middleware/upload.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import {
    createProductSchema,
    createReviewSchema,
    idParamSchema,
    productQuerySchema,
    updateProductSchema,
} from '../validators';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     description: Retrieve a paginated list of products with optional filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, createdAt, title]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 */
// Public routes
router.get(
  '/',
  validateQuery(productQuerySchema),
  productsController.getProducts
);

/**
 * @swagger
 * /products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search products
 *     description: Search products by query string
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 */
router.get('/search', productsController.searchProducts);

/**
 * @swagger
 * /products/categories:
 *   get:
 *     tags: [Products]
 *     summary: Get all categories
 *     description: Retrieve list of all product categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/categories', productsController.getCategories);

/**
 * @swagger
 * /products/brands:
 *   get:
 *     tags: [Products]
 *     summary: Get all brands
 *     description: Retrieve list of all product brands
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get('/brands', productsController.getBrands);

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     tags: [Products]
 *     summary: Get products by category
 *     description: Retrieve all products in a specific category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: Products in category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 */
router.get('/category/:category', productsController.getProductsByCategory);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve a single product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  productsController.getProductById
);

/**
 * @swagger
 * /products/{id}/reviews:
 *   get:
 *     tags: [Products]
 *     summary: Get product reviews
 *     description: Retrieve all reviews for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/:id/reviews', productsController.getProductReviews);

/**
 * @swagger
 * /products/{id}/reviews:
 *   post:
 *     tags: [Products]
 *     summary: Add product review
 *     description: Add a review to a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// Protected routes
router.post(
  '/:id/reviews',
  authenticate,
  validateBody(createReviewSchema),
  productsController.addReview
);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (Admin)
 *     description: Create a new product (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 */
// Admin routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadImages,
  validateBody(createProductSchema),
  productsController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (Admin)
 *     description: Update an existing product (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadImages,
  validateBody(updateProductSchema),
  productsController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (Admin)
 *     description: Delete a product (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  productsController.deleteProduct
);

export default router;
