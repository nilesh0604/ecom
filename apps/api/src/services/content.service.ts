/**
 * Content/Blog Service
 * Handles editorial content, articles, and shoppable content
 * DTC Feature: Content Studio / "The Journal" (5.6)
 */

import { prisma } from '../config/database';

// Types
export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type ContentType = 'ARTICLE' | 'GUIDE' | 'STORY' | 'NEWS' | 'LOOKBOOK';

interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentType: ContentType;
  featuredImageUrl?: string;
  authorId: number;
  categoryId?: string;
  tags?: string[];
  productIds?: number[];
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
}

interface UpdateArticleInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  contentType?: ContentType;
  featuredImageUrl?: string;
  categoryId?: string;
  tags?: string[];
  productIds?: number[];
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  status?: ContentStatus;
}

interface ArticleFilters {
  status?: ContentStatus;
  contentType?: ContentType;
  categoryId?: string;
  authorId?: number;
  tag?: string;
  search?: string;
  featured?: boolean;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ContentService {
  /**
   * Create a new article
   */
  async createArticle(input: CreateArticleInput): Promise<object> {
    // Check if slug is unique
    const existingArticle = await prisma.article.findUnique({
      where: { slug: input.slug },
    });

    if (existingArticle) {
      throw new Error('An article with this slug already exists');
    }

    const article = await prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        contentType: input.contentType,
        featuredImageUrl: input.featuredImageUrl,
        authorId: input.authorId,
        categoryId: input.categoryId,
        tags: input.tags || [],
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        status: input.publishedAt && input.publishedAt <= new Date() ? 'PUBLISHED' : 'DRAFT',
        publishedAt: input.publishedAt,
      },
    });

    // Link products if provided (shoppable articles)
    if (input.productIds && input.productIds.length > 0) {
      await prisma.articleProduct.createMany({
        data: input.productIds.map((productId, index) => ({
          articleId: article.id,
          productId,
          position: index,
        })),
      });
    }

    return this.getArticleById(article.id);
  }

  /**
   * Update an article
   */
  async updateArticle(articleId: string, input: UpdateArticleInput): Promise<object> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Check slug uniqueness if changing
    if (input.slug && input.slug !== article.slug) {
      const existingArticle = await prisma.article.findUnique({
        where: { slug: input.slug },
      });

      if (existingArticle) {
        throw new Error('An article with this slug already exists');
      }
    }

    // Update article
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        contentType: input.contentType,
        featuredImageUrl: input.featuredImageUrl,
        categoryId: input.categoryId,
        tags: input.tags,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        status: input.status,
        publishedAt: input.publishedAt,
      },
    });

    // Update linked products if provided
    if (input.productIds !== undefined) {
      // Remove existing links
      await prisma.articleProduct.deleteMany({
        where: { articleId },
      });

      // Add new links
      if (input.productIds.length > 0) {
        await prisma.articleProduct.createMany({
          data: input.productIds.map((productId, index) => ({
            articleId,
            productId,
            position: index,
          })),
        });
      }
    }

    return this.getArticleById(articleId);
  }

  /**
   * Get article by ID
   */
  async getArticleById(articleId: string): Promise<object | null> {
    return prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { take: 1 },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  /**
   * Get article by slug (for public viewing)
   */
  async getArticleBySlug(slug: string): Promise<object | null> {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { take: 1 },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!article || article.status !== 'PUBLISHED') {
      return null;
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  /**
   * Get articles with filters and pagination
   */
  async getArticles(
    filters: ArticleFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<{ articles: object[]; total: number; pages: number }> {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      // Default to published for public queries
      where.status = 'PUBLISHED';
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    if (filters.featured) {
      where.featured = true;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
        },
        orderBy: {
          [pagination.sortBy || 'publishedAt']: pagination.sortOrder || 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles,
      total,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Get featured articles for homepage
   */
  async getFeaturedArticles(limit: number = 3): Promise<object[]> {
    return prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        featured: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(articleId: string, limit: number = 3): Promise<object[]> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return [];
    }

    // Find articles with matching tags or category
    return prisma.article.findMany({
      where: {
        id: { not: articleId },
        status: 'PUBLISHED',
        OR: [
          { categoryId: article.categoryId },
          { tags: { hasSome: article.tags } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get articles featuring a specific product
   */
  async getArticlesForProduct(productId: number, limit: number = 3): Promise<object[]> {
    const articleProducts = await prisma.articleProduct.findMany({
      where: { productId },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            category: true,
          },
        },
      },
      take: limit,
    });

    return articleProducts
      .filter((ap) => (ap.article as { status: string }).status === 'PUBLISHED')
      .map((ap) => ap.article);
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId: string): Promise<void> {
    await prisma.articleProduct.deleteMany({
      where: { articleId },
    });

    await prisma.article.delete({
      where: { id: articleId },
    });
  }

  /**
   * Publish an article
   */
  async publishArticle(articleId: string): Promise<object> {
    return prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Unpublish an article
   */
  async unpublishArticle(articleId: string): Promise<object> {
    return prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'DRAFT',
      },
    });
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(articleId: string): Promise<object> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return prisma.article.update({
      where: { id: articleId },
      data: {
        featured: !article.featured,
      },
    });
  }

  // ===== Categories =====

  /**
   * Create a content category
   */
  async createCategory(name: string, slug: string, description?: string): Promise<object> {
    return prisma.contentCategory.create({
      data: { name, slug, description },
    });
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<object[]> {
    return prisma.contentCategory.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<object | null> {
    return prisma.contentCategory.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  // ===== Analytics =====

  /**
   * Get content analytics
   */
  async getContentAnalytics(): Promise<object> {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      articlesByCategory,
      topArticles,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        where: { status: 'PUBLISHED' },
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          publishedAt: true,
        },
      }),
    ]);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews: totalViews._sum.viewCount || 0,
      articlesByCategory,
      topArticles,
    };
  }
}

export const contentService = new ContentService();
export default contentService;
