import type { Handle } from '@sveltejs/kit';
import { cache } from '$lib/server/core/cache';
import { logger } from '$lib/server/modules/core/logger';

/**
 * Cache middleware for API routes
 * Caches GET requests based on URL and query parameters
 */
export const cacheMiddleware: Handle = async ({ event, resolve }) => {
	const { request, url } = event;

	// Only cache GET requests
	if (request.method !== 'GET') {
		return resolve(event);
	}

	// Skip caching for certain paths
	const skipPaths = ['/api/sse', '/api/auth', '/storage'];
	if (skipPaths.some((path) => url.pathname.startsWith(path))) {
		return resolve(event);
	}

	// Generate cache key from URL and query params
	const cacheKey = `api:${url.pathname}:${url.search}`;

	try {
		// Try to get from cache
		const cached = await cache.get<{ body: string; headers: Record<string, string> }>(cacheKey);

		if (cached) {
			logger.info(`Cache hit for ${cacheKey}`);
			return new Response(cached.body, {
				status: 200,
				headers: {
					...cached.headers,
					'X-Cache': 'HIT'
				}
			});
		}

		// Resolve request
		const response = await resolve(event);

		// Only cache successful responses
		if (response.status === 200) {
			const body = await response.text();
			const headers: Record<string, string> = {};

			response.headers.forEach((value, key) => {
				headers[key] = value;
			});

			// Cache for 5 minutes
			await cache.set(cacheKey, { body, headers }, 300);

			logger.info(`Cache miss for ${cacheKey}, cached response`);

			return new Response(body, {
				status: response.status,
				headers: {
					...headers,
					'X-Cache': 'MISS'
				}
			});
		}

		return response;
	} catch (error) {
		logger.error('Cache middleware error:', error);
		return resolve(event);
	}
};
