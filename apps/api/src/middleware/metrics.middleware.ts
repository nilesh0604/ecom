import { NextFunction, Request, Response } from 'express';
import {
    incrementBusinessMetric,
    incrementCounter,
    metrics,
    recordDuration,
    recordError,
} from '../routes/metrics.routes';
import { logger } from '../utils/logger';

/**
 * Middleware to collect request metrics for Prometheus
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Increment in-flight requests
  metrics.httpRequestsInFlight++;

  // Get route pattern (e.g., /api/v1/products/:id)
  const getRoutePattern = (): string => {
    if (req.route?.path) {
      return `${req.baseUrl}${req.route.path}`;
    }
    return req.path;
  };

  // Capture response
  const originalEnd = res.end;
  res.end = function (this: Response, ...args: any[]): Response {
    const duration = Date.now() - start;
    const route = getRoutePattern();
    const method = req.method;
    const statusCode = res.statusCode;
    const statusClass = `${Math.floor(statusCode / 100)}xx`;

    // Decrement in-flight requests
    metrics.httpRequestsInFlight--;

    // Record metrics
    const labels = {
      method,
      route,
      status: String(statusCode),
      status_class: statusClass,
    };

    incrementCounter('http_requests', labels);
    recordDuration('http_request_duration', duration, { method, route });

    // Record errors
    if (statusCode >= 400) {
      recordError(statusClass);
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        path: req.path,
        duration,
        statusCode,
      });
    }

    return originalEnd.apply(this, args as any);
  };

  next();
};

/**
 * Middleware to track business metrics
 */
export const trackBusinessEvent = (
  eventType: 'order_created' | 'user_registered' | 'cart_item_added' | 
             'checkout_attempt' | 'checkout_success' | 'payment_attempt' | 
             'payment_success' | 'payment_failed' | 'product_viewed',
  value?: number
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Track on successful responses
    const originalJson = res.json;
    res.json = function (this: Response, body: any): Response {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        switch (eventType) {
          case 'order_created':
            incrementBusinessMetric('ordersCreated');
            if (value) {
              incrementBusinessMetric('ordersTotalValue', value);
            }
            break;
          case 'user_registered':
            incrementBusinessMetric('usersRegistered');
            break;
          case 'cart_item_added':
            incrementBusinessMetric('cartItemsAdded');
            break;
          case 'checkout_attempt':
            incrementBusinessMetric('checkoutAttempts');
            break;
          case 'checkout_success':
            incrementBusinessMetric('checkoutSuccess');
            break;
          case 'payment_attempt':
            incrementBusinessMetric('paymentAttempts');
            break;
          case 'payment_success':
            incrementBusinessMetric('paymentSuccess');
            break;
          case 'payment_failed':
            incrementBusinessMetric('paymentFailed');
            break;
          case 'product_viewed':
            incrementBusinessMetric('productsViewed');
            break;
        }
      }
      return originalJson.call(this, body);
    };
    next();
  };
};

/**
 * Track cache hits/misses
 */
export const trackCacheMetrics = {
  hit: (): void => {
    metrics.cacheHits++;
  },
  miss: (): void => {
    metrics.cacheMisses++;
  },
};

export default metricsMiddleware;
