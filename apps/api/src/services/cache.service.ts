import config from '../config';
import { logger } from '../utils/logger';

// Simple in-memory cache implementation (can be replaced with Redis)
// For production, integrate with Redis using the configuration

interface CacheItem {
  value: string;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
    });
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.set(key, value, ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) deleted++;
    }
    return deleted;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0', 10) + 1).toString();
    const item = this.cache.get(key);
    await this.set(key, newValue, item?.expiresAt ? Math.floor((item.expiresAt - Date.now()) / 1000) : undefined);
    return parseInt(newValue, 10);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    item.expiresAt = Date.now() + ttlSeconds * 1000;
    return true;
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return -2; // Key doesn't exist
    if (!item.expiresAt) return -1; // No expiry
    const remaining = Math.floor((item.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Redis-like client interface (can be extended to use actual Redis)
export class CacheService {
  private client: InMemoryCache;
  private isConnected: boolean = false;

  constructor() {
    this.client = new InMemoryCache();
    this.isConnected = true;
    logger.info('Cache service initialized (in-memory)');
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Set cached value with expiration
   */
  async setex(key: string, ttlSeconds: number, value: any): Promise<void> {
    await this.set(key, value, ttlSeconds);
  }

  /**
   * Delete cached value(s)
   */
  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      logger.error(`Cache delete error for keys ${keys.join(', ')}:`, error);
      return 0;
    }
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Invalidate all keys matching pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.del(...keys);
        logger.debug(`Invalidated ${keys.length} cache keys matching ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache invalidate pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      return await this.client.expire(key, ttlSeconds);
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Cache ttl error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Check if cache is connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = '__health_check__';
      await this.set(testKey, 'ok', 1);
      const value = await this.get(testKey);
      return value === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Close connection
   */
  async quit(): Promise<void> {
    this.client.destroy();
    this.isConnected = false;
    logger.info('Cache service disconnected');
  }

  /**
   * Cache decorator factory
   */
  cached(ttlSeconds = 300) {
    const cacheService = this;
    return function (
      _target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const className = this.constructor?.name || 'Unknown';
        const cacheKey = `${className}:${propertyKey}:${JSON.stringify(args)}`;

        // Try to get from cache
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Cache result
        await cacheService.set(cacheKey, result, ttlSeconds);

        return result;
      };

      return descriptor;
    };
  }
}

export const cacheService = new CacheService();
