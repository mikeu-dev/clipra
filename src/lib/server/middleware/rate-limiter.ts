import type { Handle } from '@sveltejs/kit';

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

// In-memory store for rate limiting (simple implementation)
// For production, consider using Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window

/**
 * Get client IP from request
 */
function getClientIP(request: Request): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		request.headers.get('x-real-ip') ||
		'unknown'
	);
}

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetTime <= now) {
			rateLimitStore.delete(key);
		}
	}
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * Limits requests per IP to prevent abuse
 */
export const rateLimitMiddleware: Handle = async ({ event, resolve }) => {
	const { request, url } = event;

	// Only apply rate limiting to API routes
	if (!url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	// Skip rate limiting for internal/webhook endpoints
	const skipPaths = ['/api/hikvision/event'];
	if (skipPaths.some((path) => url.pathname.startsWith(path))) {
		return resolve(event);
	}

	const ip = getClientIP(request);
	const key = `rate:${ip}`;
	const now = Date.now();

	let entry = rateLimitStore.get(key);

	if (!entry || entry.resetTime <= now) {
		// Create new entry
		entry = {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW_MS
		};
		rateLimitStore.set(key, entry);
	} else {
		// Increment count
		entry.count++;
	}

	// Check if over limit
	if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
		const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

		return new Response(
			JSON.stringify({
				error: 'Too Many Requests',
				message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
			}),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': retryAfter.toString(),
					'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
				}
			}
		);
	}

	// Add rate limit headers to response
	const response = await resolve(event);

	// Clone response to add headers
	const newHeaders = new Headers(response.headers);
	newHeaders.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
	newHeaders.set('X-RateLimit-Remaining', (RATE_LIMIT_MAX_REQUESTS - entry.count).toString());
	newHeaders.set('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

	return new Response(response.body, {
		status: response.status,
		headers: newHeaders
	});
};

/**
 * Check if request is rate limited (for use in specific endpoints)
 */
export function checkRateLimit(ip: string, limit = RATE_LIMIT_MAX_REQUESTS): boolean {
	const key = `rate:${ip}`;
	const entry = rateLimitStore.get(key);

	if (!entry) return false;
	return entry.count > limit;
}
