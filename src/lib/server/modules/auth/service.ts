import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { PermissionService } from '../permission/service';

const permissionService = new PermissionService();

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const SESSION_COOKIE_NAME = 'auth-session';

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

export async function createSession(
	token: string,
	userId: string,
	expiresInDays: number = 30
): Promise<table.Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		sessionToken: token,
		expiresAt: new Date(Date.now() + DAY_IN_MS * expiresInDays),
		createdAt: new Date()
	};
	await db.insert(table.sessions).values(session);
	return session;
}

export async function validateSessionToken(
	token: string
): Promise<{ session: table.Session | null; user: table.User | null }> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	// Minimal implementation for now, assuming SessionRepository logic is similar
	// Join logic would be needed for full user object
	const result = await db.select().from(table.sessions).where(eq(table.sessions.id, sessionId));
	if (result.length < 1) return { session: null, user: null };
	const session = result[0];

	// Check expiry
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(table.sessions).where(eq(table.sessions.id, session.id));
		return { session: null, user: null };
	}

	// Renewal logic
	const createdAt = session.createdAt ?? new Date(session.expiresAt.getTime() - DAY_IN_MS * 30); // fallback if null
	const sessionDuration = session.expiresAt.getTime() - createdAt.getTime();

	// If session lasts ~1 day (allow some buffer)
	const isShortSession = sessionDuration < DAY_IN_MS * 2;

	const renewThreshold = isShortSession ? DAY_IN_MS / 2 : DAY_IN_MS * 15; // Renew if half passed for short, or 15 days for long

	if (Date.now() >= session.expiresAt.getTime() - renewThreshold) {
		const extendBy = isShortSession ? DAY_IN_MS : DAY_IN_MS * 30;
		session.expiresAt = new Date(Date.now() + extendBy);
		await db
			.update(table.sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.sessions.id, session.id));
	}

	// Fetch user
	const users = await db.select().from(table.users).where(eq(table.users.id, session.userId));
	if (users.length < 1) return { session: null, user: null };

	return { session, user: users[0] };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(table.sessions).where(eq(table.sessions.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		maxAge: 0,
		path: '/'
	});
}
export async function getUserPermissions(userId: string, companyId?: string): Promise<string[]> {
	const { and } = await import('drizzle-orm');

	const allPermissionNames = new Set<string>();

	// 1. If companyId provided, check employee role
	if (companyId) {
		const employeeResult = await db
			.select({ roleId: table.employees.roleId })
			.from(table.employees)
			.where(and(eq(table.employees.userId, userId), eq(table.employees.companyId, companyId)));

		if (employeeResult.length > 0 && employeeResult[0].roleId) {
			const rolePerms = await permissionService.getPermissionNamesByRole(employeeResult[0].roleId);
			rolePerms.forEach((p) => allPermissionNames.add(p));
		}
	}

	// 2. Fallback to User's Global Role if no permissions were found yet (e.g. superadmin might not be an employee)
	if (allPermissionNames.size === 0) {
		const userResult = await db
			.select({ roleId: table.users.roleId })
			.from(table.users)
			.where(eq(table.users.id, userId));
		if (userResult.length > 0) {
			const rolePerms = await permissionService.getPermissionNamesByRole(userResult[0].roleId);
			rolePerms.forEach((p) => allPermissionNames.add(p));
		}
	}

	// 3. Fetch specific User Permissions
	const userPermsResult = await db
		.select({
			name: table.permissions.name
		})
		.from(table.userPermissions)
		.innerJoin(table.permissions, eq(table.userPermissions.permissionId, table.permissions.id))
		.where(eq(table.userPermissions.userId, userId));

	userPermsResult.forEach((row) => allPermissionNames.add(row.name));

	return Array.from(allPermissionNames);
}
