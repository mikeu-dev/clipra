import { sequence } from '@sveltejs/kit/hooks';
import { error, type Handle, type HandleServerError } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { SessionController } from '$lib/server/modules/session/controller';
import { logger } from '$lib/server/modules/core/logger';
import { initQueueWorker } from '$lib/server/modules/queue/worker';
import {
	compressionMiddleware,
	cacheMiddleware,
	performanceMiddleware,
	rateLimitMiddleware
} from '$lib/server/middleware';
import { getUserPermissions } from '$lib/server/modules/auth/service';

import { testConnection } from '$lib/server/database';

// Inisialisasi Worker Antrian
// Note: Pastikan ini hanya berjalan di server runtime, bukan saat build
if (process.env.NODE_ENV !== 'test') {
	initQueueWorker();
	testConnection();
}

const sessionController = new SessionController();

const handleLogger: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { method, url } = event.request;

	try {
		const response = await resolve(event);
		const duration = Date.now() - start;

		// Log request details
		logger.info('HTTP Request', {
			method,
			url: url,
			status: response.status,
			duration: `${duration}ms`,
			userId: event.locals.user?.id || 'guest',
			userAgent: event.request.headers.get('user-agent')
		});

		return response;
	} catch (err) {
		const duration = Date.now() - start;
		logger.error('Unhandled request error', {
			method,
			url: url,
			duration: `${duration}ms`,
			error: err
		});
		throw err;
	}
};

const handleRoute: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (response.status === 404) {
		throw error(404, `Halaman ${event.url.pathname} tidak ditemukan`);
	}
	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(
		event.request,
		({ request, locale }: { request: Request; locale: string }) => {
			event.request = request;

			return resolve(event, {
				transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
			});
		}
	);

const handleAuth: Handle = async ({ event, resolve }) => {
	// Validasi token menggunakan SessionController
	const { session, user } = await sessionController.validate(event);

	if (session) {
		sessionController['service'].setCookie(event, session.sessionToken, session.expiresAt);
	} else {
		sessionController['service'].deleteCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	if (user) {
		event.locals.permissions = await getUserPermissions(user.id);
	} else {
		event.locals.permissions = [];
	}

	return resolve(event);
};

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	return response;
};

const handleTenant: Handle = async ({ event, resolve }) => {
	const { url, locals } = event;

	// 1. Public Compro Context (based on URL structure, e.g., /p/slug)
	// Assuming public routes start with /p/
	const slugMatch = url.pathname.match(/^\/p\/([^/]+)/);
	if (slugMatch) {
		const slug = slugMatch[1];
		try {
			// Dynamic import/query to avoid circular dependency issues if any
			const { db } = await import('$lib/server/database');
			const { companies } = await import('$lib/server/database/schemas');
			const { eq } = await import('drizzle-orm');

			const company = await db.query.companies.findFirst({
				where: eq(companies.slug, slug),
				columns: {
					id: true,
					name: true,
					slug: true,
					themeConfig: true,
					isPublic: true
				}
			});

			if (company && company.isPublic) {
				event.locals.company = company;
			}
		} catch (e) {
			console.error('Failed to load company context', e);
		}
	}

	// 2. Dashboard Context (Logged in user)
	if (locals.user) {
		// Check for active company cookie or header
		let activeCompanyId = event.cookies.get('active_company_id');

		const { db } = await import('$lib/server/database');
		const { employees, companies, positions } = await import('$lib/server/database/schemas');
		const { eq, and } = await import('drizzle-orm');

		let resolvedCompany = null;

		// 1. Try to resolve from cookie if exists
		if (activeCompanyId) {
			const employeeWithCompany = await db
				.select({
					company: companies,
					position: positions
				})
				.from(employees)
				.leftJoin(companies, eq(employees.companyId, companies.id))
				.leftJoin(positions, eq(employees.positionId, positions.id))
				.where(and(eq(employees.userId, locals.user.id), eq(employees.companyId, activeCompanyId)))
				.limit(1);

			if (employeeWithCompany.length > 0 && employeeWithCompany[0].company) {
				resolvedCompany = employeeWithCompany[0];
			}
		}

		// 2. Fallback if cookie missing or invalid
		if (!resolvedCompany) {
			const firstEmployeeRecord = await db
				.select({
					company: companies,
					position: positions
				})
				.from(employees)
				.leftJoin(companies, eq(employees.companyId, companies.id))
				.leftJoin(positions, eq(employees.positionId, positions.id))
				.where(eq(employees.userId, locals.user.id))
				.limit(1);

			if (firstEmployeeRecord.length > 0 && firstEmployeeRecord[0].company) {
				const fallbackRecord = firstEmployeeRecord[0];
				resolvedCompany = fallbackRecord;
				activeCompanyId = fallbackRecord.company!.id;

				// Set/Update cookie for next request
				event.cookies.set('active_company_id', activeCompanyId, {
					path: '/',
					maxAge: 60 * 60 * 24 * 365, // 1 year
					httpOnly: false
				});
			}
		}

		// 3. Set locals if resolved
		if (resolvedCompany && resolvedCompany.company) {
			event.locals.activeCompany = {
				id: resolvedCompany.company.id,
				name: resolvedCompany.company.name,
				role: resolvedCompany.position?.name || 'Employee',
				themeConfig: resolvedCompany.company.themeConfig
			};
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(
	performanceMiddleware, // Track performance first
	handleLogger,
	handleSecurityHeaders,
	handleParaglide,
	handleAuth,
	rateLimitMiddleware, // Rate limit API requests
	handleTenant, // Add Tenant Context
	cacheMiddleware, // Cache API responses
	compressionMiddleware, // Compress responses
	handleRoute
);

export const handleError: HandleServerError = ({ error, event }) => {
	logger.error('Server Error', {
		error,
		path: event.url.pathname,
		method: event.request.method
	});

	return {
		message: 'Terjadi kesalahan internal pada server.',
		code: 'INTERNAL_SERVER_ERROR'
	};
};
