/**
 * Content/Blog Controller
 * REST API handlers for editorial content
 * DTC Feature: Content Studio / "The Journal" (5.6)
 */

import { Request, Response } from 'express';
import { contentService } from '../services/content.service';
import { ApiResponse } from '../utils/response';

// ===== Articles =====

/**
 * Create a new article
 * POST /api/v1/content/articles
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = (req as Request & { user?: { id: number } }).user?.id;
    if (!authorId) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    const {
      title,
      slug,
      excerpt,
      content,
      contentType,
      featuredImageUrl,
      categoryId,
      tags,
      productIds,
      publishedAt,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title || !slug || !content || !contentType) {
      ApiResponse.badRequest(res, 'Title, slug, content, and contentType are required');
      return;
    }

    const article = await contentService.createArticle({
      title,
      slug,
      excerpt,
      content,
      contentType,
      featuredImageUrl,
      authorId,
      categoryId,
      tags,
      productIds,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      seoTitle,
      seoDescription,
    });

    ApiResponse.created(res, article, 'Article created successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to create article');
  }
};

/**
 * Update an article
 * PUT /api/v1/content/articles/:id
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.publishedAt) {
      updateData.publishedAt = new Date(updateData.publishedAt);
    }

    const article = await contentService.updateArticle(id, updateData);
    ApiResponse.success(res, article, 'Article updated successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to update article');
  }
};

/**
 * Get article by ID (admin)
 * GET /api/v1/content/articles/:id
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await contentService.getArticleById(id);

    if (!article) {
      ApiResponse.notFound(res, 'Article not found');
      return;
    }

    ApiResponse.success(res, article);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get article');
  }
};

/**
 * Get article by slug (public)
 * GET /api/v1/content/blog/:slug
 */
export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const article = await contentService.getArticleBySlug(slug);

    if (!article) {
      ApiResponse.notFound(res, 'Article not found');
      return;
    }

    ApiResponse.success(res, article);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get article');
  }
};

/**
 * Get all articles with filters
 * GET /api/v1/content/articles
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      contentType,
      categoryId,
      authorId,
      tag,
      search,
      featured,
      page = '1',
      limit = '10',
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = req.query;

    const filters = {
      status: status as string | undefined,
      contentType: contentType as string | undefined,
      categoryId: categoryId as string | undefined,
      authorId: authorId ? parseInt(authorId as string) : undefined,
      tag: tag as string | undefined,
      search: search as string | undefined,
      featured: featured === 'true',
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const result = await contentService.getArticles(filters, pagination);
    ApiResponse.success(res, result);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get articles');
  }
};

/**
 * Get published articles (public blog)
 * GET /api/v1/content/blog
 */
export const getBlogArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      contentType,
      categoryId,
      tag,
      search,
      page = '1',
      limit = '10',
    } = req.query;

    const filters = {
      status: 'PUBLISHED' as const,
      contentType: contentType as string | undefined,
      categoryId: categoryId as string | undefined,
      tag: tag as string | undefined,
      search: search as string | undefined,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await contentService.getArticles(filters, pagination);
    ApiResponse.success(res, result);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get blog articles');
  }
};

/**
 * Get featured articles
 * GET /api/v1/content/featured
 */
export const getFeaturedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const articles = await contentService.getFeaturedArticles(limit);
    ApiResponse.success(res, articles);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get featured articles');
  }
};

/**
 * Get related articles
 * GET /api/v1/content/articles/:id/related
 */
export const getRelatedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;
    const articles = await contentService.getRelatedArticles(id, limit);
    ApiResponse.success(res, articles);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get related articles');
  }
};

/**
 * Get articles for a product
 * GET /api/v1/content/products/:productId/articles
 */
export const getArticlesForProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId);
    const limit = parseInt(req.query.limit as string) || 3;
    const articles = await contentService.getArticlesForProduct(productId, limit);
    ApiResponse.success(res, articles);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get articles for product');
  }
};

/**
 * Delete an article
 * DELETE /api/v1/content/articles/:id
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await contentService.deleteArticle(id);
    ApiResponse.success(res, null, 'Article deleted successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to delete article');
  }
};

/**
 * Publish an article
 * POST /api/v1/content/articles/:id/publish
 */
export const publishArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await contentService.publishArticle(id);
    ApiResponse.success(res, article, 'Article published successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to publish article');
  }
};

/**
 * Unpublish an article
 * POST /api/v1/content/articles/:id/unpublish
 */
export const unpublishArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await contentService.unpublishArticle(id);
    ApiResponse.success(res, article, 'Article unpublished successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to unpublish article');
  }
};

/**
 * Toggle featured status
 * POST /api/v1/content/articles/:id/toggle-featured
 */
export const toggleFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await contentService.toggleFeatured(id);
    ApiResponse.success(res, article, 'Featured status toggled');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to toggle featured');
  }
};

// ===== Categories =====

/**
 * Create a content category
 * POST /api/v1/content/categories
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      ApiResponse.badRequest(res, 'Name and slug are required');
      return;
    }

    const category = await contentService.createCategory(name, slug, description);
    ApiResponse.created(res, category, 'Category created successfully');
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to create category');
  }
};

/**
 * Get all categories
 * GET /api/v1/content/categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await contentService.getCategories();
    ApiResponse.success(res, categories);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get categories');
  }
};

/**
 * Get category by slug
 * GET /api/v1/content/categories/:slug
 */
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await contentService.getCategoryBySlug(slug);

    if (!category) {
      ApiResponse.notFound(res, 'Category not found');
      return;
    }

    ApiResponse.success(res, category);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get category');
  }
};

// ===== Analytics =====

/**
 * Get content analytics
 * GET /api/v1/content/analytics
 */
export const getContentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await contentService.getContentAnalytics();
    ApiResponse.success(res, analytics);
  } catch (error) {
    ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to get analytics');
  }
};
