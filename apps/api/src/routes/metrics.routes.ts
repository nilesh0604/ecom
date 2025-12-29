import { Request, Response, Router } from 'express';
import { prisma } from '../config/database';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

const router = Router();

// Prometheus metrics registry
const metrics = {
  httpRequestsTotal: new Map<string, number>(),
  httpRequestDuration: new Map<string, number[]>(),
  httpRequestsInFlight: 0,
  activeConnections: 0,
  dbConnectionsActive: 0,
  dbConnectionsIdle: 0,
  cacheHits: 0,
  cacheMisses: 0,
  ordersCreated: 0,
  ordersTotalValue: 0,
  usersRegistered: 0,
  productsViewed: 0,
  cartItemsAdded: 0,
  checkoutAttempts: 0,
  checkoutSuccess: 0,
  paymentAttempts: 0,
  paymentSuccess: 0,
  paymentFailed: 0,
  errorCount: new Map<string, number>(),
  startTime: Date.now(),
};

// Helper to increment counter
export function incrementCounter(name: string, labels: Record<string, string> = {}): void {
  const key = `${name}${JSON.stringify(labels)}`;
  metrics.httpRequestsTotal.set(key, (metrics.httpRequestsTotal.get(key) || 0) + 1);
}

// Helper to record duration
export function recordDuration(name: string, duration: number, labels: Record<string, string> = {}): void {
  const key = `${name}${JSON.stringify(labels)}`;
  const durations = metrics.httpRequestDuration.get(key) || [];
  durations.push(duration);
  // Keep only last 1000 samples
  if (durations.length > 1000) {
    durations.shift();
  }
  metrics.httpRequestDuration.set(key, durations);
}

// Helper to increment business metrics
export function incrementBusinessMetric(name: keyof typeof metrics, value: number = 1): void {
  if (typeof metrics[name] === 'number') {
    (metrics[name] as number) += value;
  }
}

// Helper to record error
export function recordError(errorType: string): void {
  metrics.errorCount.set(errorType, (metrics.errorCount.get(errorType) || 0) + 1);
}

// Calculate percentile
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Format metrics in Prometheus format
function formatPrometheusMetrics(): string {
  const lines: string[] = [];
  const uptime = (Date.now() - metrics.startTime) / 1000;

  // Process info
  lines.push('# HELP process_uptime_seconds Process uptime in seconds');
  lines.push('# TYPE process_uptime_seconds gauge');
  lines.push(`process_uptime_seconds ${uptime}`);

  lines.push('# HELP nodejs_heap_size_bytes Node.js heap size');
  lines.push('# TYPE nodejs_heap_size_bytes gauge');
  const memUsage = process.memoryUsage();
  lines.push(`nodejs_heap_size_bytes{type="used"} ${memUsage.heapUsed}`);
  lines.push(`nodejs_heap_size_bytes{type="total"} ${memUsage.heapTotal}`);

  // HTTP metrics
  lines.push('# HELP http_requests_total Total HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  metrics.httpRequestsTotal.forEach((count, key) => {
    lines.push(`http_requests_total${key.replace(/^[^{]*/, '')} ${count}`);
  });

  lines.push('# HELP http_request_duration_seconds HTTP request duration');
  lines.push('# TYPE http_request_duration_seconds histogram');
  metrics.httpRequestDuration.forEach((durations, key) => {
    if (durations.length > 0) {
      const labelPart = key.replace(/^[^{]*/, '');
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      lines.push(`http_request_duration_seconds_sum${labelPart} ${durations.reduce((a, b) => a + b, 0) / 1000}`);
      lines.push(`http_request_duration_seconds_count${labelPart} ${durations.length}`);
      lines.push(`http_request_duration_seconds{quantile="0.5"${labelPart.slice(1)} ${percentile(durations, 50) / 1000}`);
      lines.push(`http_request_duration_seconds{quantile="0.9"${labelPart.slice(1)} ${percentile(durations, 90) / 1000}`);
      lines.push(`http_request_duration_seconds{quantile="0.99"${labelPart.slice(1)} ${percentile(durations, 99) / 1000}`);
    }
  });

  lines.push('# HELP http_requests_in_flight Current HTTP requests being processed');
  lines.push('# TYPE http_requests_in_flight gauge');
  lines.push(`http_requests_in_flight ${metrics.httpRequestsInFlight}`);

  // Cache metrics
  lines.push('# HELP cache_hits_total Total cache hits');
  lines.push('# TYPE cache_hits_total counter');
  lines.push(`cache_hits_total ${metrics.cacheHits}`);

  lines.push('# HELP cache_misses_total Total cache misses');
  lines.push('# TYPE cache_misses_total counter');
  lines.push(`cache_misses_total ${metrics.cacheMisses}`);

  // Business metrics
  lines.push('# HELP ecom_orders_created_total Total orders created');
  lines.push('# TYPE ecom_orders_created_total counter');
  lines.push(`ecom_orders_created_total ${metrics.ordersCreated}`);

  lines.push('# HELP ecom_orders_total_value_dollars Total order value in dollars');
  lines.push('# TYPE ecom_orders_total_value_dollars counter');
  lines.push(`ecom_orders_total_value_dollars ${metrics.ordersTotalValue}`);

  lines.push('# HELP ecom_users_registered_total Total users registered');
  lines.push('# TYPE ecom_users_registered_total counter');
  lines.push(`ecom_users_registered_total ${metrics.usersRegistered}`);

  lines.push('# HELP ecom_cart_items_added_total Total items added to cart');
  lines.push('# TYPE ecom_cart_items_added_total counter');
  lines.push(`ecom_cart_items_added_total ${metrics.cartItemsAdded}`);

  lines.push('# HELP ecom_checkout_attempts_total Total checkout attempts');
  lines.push('# TYPE ecom_checkout_attempts_total counter');
  lines.push(`ecom_checkout_attempts_total ${metrics.checkoutAttempts}`);

  lines.push('# HELP ecom_checkout_success_total Successful checkouts');
  lines.push('# TYPE ecom_checkout_success_total counter');
  lines.push(`ecom_checkout_success_total ${metrics.checkoutSuccess}`);

  lines.push('# HELP ecom_payment_attempts_total Total payment attempts');
  lines.push('# TYPE ecom_payment_attempts_total counter');
  lines.push(`ecom_payment_attempts_total ${metrics.paymentAttempts}`);

  lines.push('# HELP ecom_payment_success_total Successful payments');
  lines.push('# TYPE ecom_payment_success_total counter');
  lines.push(`ecom_payment_success_total ${metrics.paymentSuccess}`);

  lines.push('# HELP ecom_payment_failed_total Failed payments');
  lines.push('# TYPE ecom_payment_failed_total counter');
  lines.push(`ecom_payment_failed_total ${metrics.paymentFailed}`);

  // Error metrics
  lines.push('# HELP errors_total Total errors by type');
  lines.push('# TYPE errors_total counter');
  metrics.errorCount.forEach((count, type) => {
    lines.push(`errors_total{type="${type}"} ${count}`);
  });

  return lines.join('\n');
}

// Prometheus metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(formatPrometheusMetrics());
  } catch (error) {
    logger.error('Failed to generate metrics', { error });
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

// Health check endpoint (for Kubernetes probes)
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Basic health check
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
    });
  }
});

// Readiness check (checks dependencies)
router.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; latency?: number }> = {};

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = { status: 'unhealthy' };
  }

  // Check cache
  try {
    const cacheStart = Date.now();
    const cacheHealthy = await cacheService.healthCheck();
    checks.cache = {
      status: cacheHealthy ? 'healthy' : 'unhealthy',
      latency: Date.now() - cacheStart,
    };
  } catch (error) {
    checks.cache = { status: 'unhealthy' };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  });
});

// Liveness check (simple ping)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
export { incrementBusinessMetric, incrementCounter, metrics, recordDuration, recordError };

