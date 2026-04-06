import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Validates that the current request has an authenticated user session.
 * Throws a 401 error if not authenticated.
 *
 * Usage in +server.ts:
 * ```
 * import { requireAuth } from '$lib/server/middleware/auth-guard';
 *
 * export const GET: RequestHandler = async (event) => {
 *   requireAuth(event);
 *   // ... rest of handler
 * };
 * ```
 */
export function requireAuth(event: RequestEvent): void {
	if (!event.locals.user || !event.locals.session) {
		throw error(401, {
			message: 'Unauthorized: Authentication required'
		});
	}
}

/**
 * Validates that the current user has one of the required permissions.
 * Throws 403 if user lacks permission.
 */
export function requirePermission(event: RequestEvent, ...permissions: string[]): void {
	requireAuth(event);

	const userPermissions = event.locals.permissions || [];
	const hasPermission = permissions.some((p) => userPermissions.includes(p));

	if (!hasPermission) {
		throw error(403, {
			message: `Forbidden: Required permission(s): ${permissions.join(', ')}`
		});
	}
}

/**
 * Validates that the current user has a specific role.
 */
export function requireRole(event: RequestEvent, ...roles: string[]): void {
	requireAuth(event);

	const userRole = event.locals.user?.role?.name;
	if (!userRole || !roles.includes(userRole)) {
		throw error(403, {
			message: `Forbidden: Required role(s): ${roles.join(', ')}`
		});
	}
}
