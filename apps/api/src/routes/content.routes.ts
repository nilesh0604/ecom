/**
 * Content Routes
 * API routes for editorial content / "The Journal"
 * DTC Feature: Content Studio / Blog (5.6)
 */

import { Router } from 'express';
import {
    createArticle,
    createCategory,
    deleteArticle,
    getArticleById,
    getArticleBySlug,
    getArticles,
    getArticlesForProduct,
    getBlogArticles,
    getCategories,
    getCategoryBySlug,
    getContentAnalytics,
    getFeaturedArticles,
    getRelatedArticles,
    publishArticle,
    toggleFeatured,
    unpublishArticle,
    updateArticle,
} from '../controllers/content.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// ===== Public Routes =====

/**
 * @route GET /api/v1/content/blog
 * @desc Get published blog articles (public)
 * @access Public
 */
router.get('/blog', getBlogArticles);

/**
 * @route GET /api/v1/content/blog/:slug
 * @desc Get single article by slug (public)
 * @access Public
 */
router.get('/blog/:slug', getArticleBySlug);

/**
 * @route GET /api/v1/content/featured
 * @desc Get featured articles
 * @access Public
 */
router.get('/featured', getFeaturedArticles);

/**
 * @route GET /api/v1/content/categories
 * @desc Get all content categories
 * @access Public
 */
router.get('/categories', getCategories);

/**
 * @route GET /api/v1/content/categories/:slug
 * @desc Get category by slug
 * @access Public
 */
router.get('/categories/:slug', getCategoryBySlug);

/**
 * @route GET /api/v1/content/products/:productId/articles
 * @desc Get articles related to a product (shoppable content)
 * @access Public
 */
router.get('/products/:productId/articles', getArticlesForProduct);

// ===== Protected Routes (Authentication Required) =====

/**
 * @route GET /api/v1/content/articles
 * @desc Get all articles with filters (admin view)
 * @access Admin/Editor
 */
router.get('/articles', authenticate, requireRole(['admin', 'editor']), getArticles);

/**
 * @route GET /api/v1/content/articles/:id
 * @desc Get article by ID (admin view)
 * @access Admin/Editor
 */
router.get('/articles/:id', authenticate, requireRole(['admin', 'editor']), getArticleById);

/**
 * @route GET /api/v1/content/articles/:id/related
 * @desc Get related articles
 * @access Public
 */
router.get('/articles/:id/related', getRelatedArticles);

/**
 * @route POST /api/v1/content/articles
 * @desc Create a new article
 * @access Admin/Editor
 */
router.post('/articles', authenticate, requireRole(['admin', 'editor']), createArticle);

/**
 * @route PUT /api/v1/content/articles/:id
 * @desc Update an article
 * @access Admin/Editor
 */
router.put('/articles/:id', authenticate, requireRole(['admin', 'editor']), updateArticle);

/**
 * @route DELETE /api/v1/content/articles/:id
 * @desc Delete an article
 * @access Admin
 */
router.delete('/articles/:id', authenticate, requireRole(['admin']), deleteArticle);

/**
 * @route POST /api/v1/content/articles/:id/publish
 * @desc Publish an article
 * @access Admin/Editor
 */
router.post('/articles/:id/publish', authenticate, requireRole(['admin', 'editor']), publishArticle);

/**
 * @route POST /api/v1/content/articles/:id/unpublish
 * @desc Unpublish an article
 * @access Admin/Editor
 */
router.post('/articles/:id/unpublish', authenticate, requireRole(['admin', 'editor']), unpublishArticle);

/**
 * @route POST /api/v1/content/articles/:id/toggle-featured
 * @desc Toggle featured status
 * @access Admin
 */
router.post('/articles/:id/toggle-featured', authenticate, requireRole(['admin']), toggleFeatured);

/**
 * @route POST /api/v1/content/categories
 * @desc Create a content category
 * @access Admin
 */
router.post('/categories', authenticate, requireRole(['admin']), createCategory);

/**
 * @route GET /api/v1/content/analytics
 * @desc Get content analytics
 * @access Admin/Editor
 */
router.get('/analytics', authenticate, requireRole(['admin', 'editor']), getContentAnalytics);

export default router;
