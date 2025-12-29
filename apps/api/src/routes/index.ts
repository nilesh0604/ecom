import { Request, Response, Router } from 'express';
import { prisma } from '../config/database';
import { cacheService } from '../services/cache.service';
import { ApiResponse } from '../utils/response';
import authRoutes from './auth.routes';
import cartRoutes from './cart.routes';
import contentRoutes from './content.routes';
import customizationRoutes from './customization.routes';
import docsRoutes from './docs.routes';
import dropsRoutes from './drops.routes';
import loyaltyRoutes from './loyalty.routes';
import ordersRoutes from './orders.routes';
import paymentsRoutes from './payments.routes';
import productsRoutes from './products.routes';
import referralRoutes from './referral.routes';
import subscriptionRoutes from './subscription.routes';
import sustainabilityRoutes from './sustainability.routes';
import tradeinRoutes from './tradein.routes';
import ugcRoutes from './ugc.routes';
import usersRoutes from './users.routes';
import wishlistRoutes from './wishlist.routes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns the basic health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 */
// Health check - basic
router.get('/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Health check - detailed (for monitoring systems)
router.get('/health/detailed', async (req: Request, res: Response) => {
  const checks = {
    api: { status: 'healthy' as const },
    database: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown' },
    cache: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown' },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = 'healthy';
  } catch (error) {
    checks.database.status = 'unhealthy';
  }

  // Check cache
  try {
    const cacheHealthy = await cacheService.healthCheck();
    checks.cache.status = cacheHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    checks.cache.status = 'unhealthy';
  }

  const isHealthy = Object.values(checks).every((c) => c.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  });
});

// Readiness check (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: 'Database not ready' });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

// API info
router.get('/', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    name: 'E-Commerce API',
    version: 'v1',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      payments: '/api/v1/payments',
      wishlist: '/api/v1/wishlist',
      loyalty: '/api/v1/loyalty',
      referrals: '/api/v1/referrals',
      tradeIn: '/api/v1/trade-in',
      sustainability: '/api/v1/sustainability',
      subscriptions: '/api/v1/subscriptions',
      customization: '/api/v1/customization',
      drops: '/api/v1/drops',
      ugc: '/api/v1/ugc',
      content: '/api/v1/content',
    },
  });
});

// Mount routes
router.use('/docs', docsRoutes);
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/referrals', referralRoutes);
router.use('/trade-in', tradeinRoutes);
router.use('/sustainability', sustainabilityRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/customization', customizationRoutes);
router.use('/drops', dropsRoutes);
router.use('/ugc', ugcRoutes);
router.use('/content', contentRoutes);

export default router;
