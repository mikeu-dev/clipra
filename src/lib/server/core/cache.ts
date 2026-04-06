import Redis from 'ioredis';
import { logger } from '$lib/server/modules/core/logger';

/**
 * Redis Cache Service
 * Provides caching functionality with TTL and invalidation support
 */
class CacheService {
	private _redis: Redis | null = null;
	private defaultTTL = 3600; // 1 hour in seconds

	constructor() {}

	/**
	 * Get Redis client instance (lazy initialization)
	 */
	private getRedis(): Redis {
		if (!this._redis) {
			const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
			this._redis = new Redis(redisUrl, {
				maxRetriesPerRequest: 3,
				retryStrategy: (times) => {
					const delay = Math.min(times * 50, 2000);
					return delay;
				},
				reconnectOnError: (err) => {
					const targetError = 'READONLY';
					if (err.message.includes(targetError)) {
						return true;
					}
					return false;
				}
			});

			this._redis.on('error', (err) => {
				logger.error('Redis connection error:', err);
			});

			this._redis.on('connect', () => {
				logger.info('Redis connected successfully');
			});
		}
		return this._redis;
	}

	/**
	 * Get value from cache
	 */
	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.getRedis().get(key);
			if (!value) return null;
			return JSON.parse(value) as T;
		} catch (error) {
			logger.error(`Cache get error for key ${key}:`, error);
			return null;
		}
	}

	/**
	 * Set value in cache with TTL
	 */
	async set(key: string, value: unknown, ttl: number = this.defaultTTL): Promise<boolean> {
		try {
			const serialized = JSON.stringify(value);
			await this.getRedis().setex(key, ttl, serialized);
			return true;
		} catch (error) {
			logger.error(`Cache set error for key ${key}:`, error);
			return false;
		}
	}

	/**
	 * Delete value from cache
	 */
	async del(key: string | string[]): Promise<boolean> {
		try {
			if (Array.isArray(key)) {
				await this.getRedis().del(...key);
			} else {
				await this.getRedis().del(key);
			}
			return true;
		} catch (error) {
			logger.error(`Cache delete error for key ${key}:`, error);
			return false;
		}
	}

	/**
	 * Delete all keys matching a pattern
	 */
	async delPattern(pattern: string): Promise<boolean> {
		try {
			const keys = await this.getRedis().keys(pattern);
			if (keys.length > 0) {
				await this.getRedis().del(...keys);
			}
			return true;
		} catch (error) {
			logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
			return false;
		}
	}

	/**
	 * Check if key exists
	 */
	async exists(key: string): Promise<boolean> {
		try {
			const result = await this.getRedis().exists(key);
			return result === 1;
		} catch (error) {
			logger.error(`Cache exists error for key ${key}:`, error);
			return false;
		}
	}

	/**
	 * Get or set pattern - fetch from cache or execute function and cache result
	 */
	async getOrSet<T>(key: string, fn: () => Promise<T>, ttl: number = this.defaultTTL): Promise<T> {
		const cached = await this.get<T>(key);
		if (cached !== null) {
			return cached;
		}

		const value = await fn();
		await this.set(key, value, ttl);
		return value;
	}

	/**
	 * Increment counter
	 */
	async incr(key: string): Promise<number> {
		try {
			return await this.getRedis().incr(key);
		} catch (error) {
			logger.error(`Cache incr error for key ${key}:`, error);
			return 0;
		}
	}

	/**
	 * Decrement counter
	 */
	async decr(key: string): Promise<number> {
		try {
			return await this.getRedis().decr(key);
		} catch (error) {
			logger.error(`Cache decr error for key ${key}:`, error);
			return 0;
		}
	}

	/**
	 * Set expiration time for a key
	 */
	async expire(key: string, seconds: number): Promise<boolean> {
		try {
			await this.getRedis().expire(key, seconds);
			return true;
		} catch (error) {
			logger.error(`Cache expire error for key ${key}:`, error);
			return false;
		}
	}

	/**
	 * Get TTL for a key
	 */
	async ttl(key: string): Promise<number> {
		try {
			return await this.getRedis().ttl(key);
		} catch (error) {
			logger.error(`Cache ttl error for key ${key}:`, error);
			return -1;
		}
	}

	/**
	 * Flush all cache
	 */
	async flush(): Promise<boolean> {
		try {
			await this.getRedis().flushdb();
			return true;
		} catch (error) {
			logger.error('Cache flush error:', error);
			return false;
		}
	}

	/**
	 * Close Redis connection
	 */
	async close(): Promise<void> {
		if (this._redis) {
			await this._redis.quit();
			this._redis = null;
		}
	}

	/**
	 * Get Redis client instance (for advanced operations)
	 */
	getClient(): Redis {
		return this.getRedis();
	}
}

// Export singleton instance
export const cache = new CacheService();

// Export cache key builders for consistency
export const CacheKeys = {
	session: (id: string) => `session:${id}`,
	user: (id: string) => `user:${id}`,
	users: (page: number, limit: number) => `users:${page}:${limit}`,
	project: (id: string) => `project:${id}`,
	projects: (page: number, limit: number) => `projects:${page}:${limit}`,
	task: (id: string) => `task:${id}`,
	tasks: (projectId: string) => `tasks:project:${projectId}`,
	client: (id: string) => `client:${id}`,
	clients: (page: number, limit: number) => `clients:${page}:${limit}`,
	invoice: (id: string) => `invoice:${id}`,
	invoices: (page: number, limit: number) => `invoices:${page}:${limit}`,
	expense: (id: string) => `expense:${id}`,
	expenses: (page: number, limit: number) => `expenses:${page}:${limit}`,
	dashboard: {
		stats: (companyId?: string) => `dashboard:stats:${companyId || 'global'}`,
		projectStatus: (companyId?: string) => `dashboard:project-status:${companyId || 'global'}`,
		taskStatus: (companyId?: string) => `dashboard:task-status:${companyId || 'global'}`,
		activities: (limit: number, companyId?: string) =>
			`dashboard:activities:${limit}:${companyId || 'global'}`
	},
	reporting: {
		financial: (start?: string, end?: string) =>
			`reporting:financial:${start || 'all'}:${end || 'all'}`,
		projectProfitability: () => 'reporting:project-profitability',
		projects: () => 'reporting:projects',
		payroll: (period?: string) => `reporting:payroll:${period || 'all'}`,
		attendance: (start?: string, end?: string) =>
			`reporting:attendance:${start || 'all'}:${end || 'all'}`
	},
	settings: (key: string) => `settings:${key}`,
	notifications: (userId: string, page: number) => `notifications:${userId}:${page}`
};
