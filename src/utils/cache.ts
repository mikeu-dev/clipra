import NodeCache from 'node-cache';
import { env } from './env';
import logger from './logger';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: env.CACHE_TTL,
      checkperiod: env.CACHE_CHECK_PERIOD,
      useClones: false,
    });

    logger.info(`Initialized Cache with TTL: ${env.CACHE_TTL}s, Period: ${env.CACHE_CHECK_PERIOD}s`);
  }

  /**
   * Get an item from the cache
   */
  public get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value) {
      logger.debug(`[Cache] Hit: ${key}`);
    } else {
      logger.debug(`[Cache] Miss: ${key}`);
    }
    return value;
  }

  /**
   * Set an item in the cache
   */
  public set(key: string, value: any, ttl?: number): boolean {
    logger.debug(`[Cache] Setting: ${key}`);
    return this.cache.set(key, value, ttl || env.CACHE_TTL);
  }

  /**
   * Delete an item from the cache
   */
  public del(key: string): number {
    logger.debug(`[Cache] Deleting: ${key}`);
    return this.cache.del(key);
  }

  /**
   * Flush all data from the cache
   */
  public flush(): void {
    logger.info('[Cache] Flushing all data');
    this.cache.flushAll();
  }

  /**
   * Get statistics from the cache
   */
  public getStats() {
    return this.cache.getStats();
  }
}

// Export as a singleton
export const cacheService = new CacheService();
