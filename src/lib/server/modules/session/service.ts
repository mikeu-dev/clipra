import { SessionRepository } from './repository';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { cache, CacheKeys } from '$lib/server/core/cache';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const SESSION_COOKIE_NAME = 'auth-session';

export class SessionService {
	private repository: SessionRepository;

	constructor(repository: SessionRepository = new SessionRepository()) {
		this.repository = repository;
	}

	generateToken(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(18));
		return encodeBase64url(bytes);
	}

	async createSession(userId: string, expiresInDays: number = 30) {
		const token = this.generateToken();
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const expiresAt = new Date(Date.now() + DAY_IN_MS * expiresInDays);

		const session = {
			id: sessionId,
			userId,
			sessionToken: token,
			expiresAt,
			createdAt: new Date()
		};

		await this.repository.create(session);

		// Cache session partially (hanya meta, data user akan di-load di validateToken jika tidak ada)
		// Atau kita bisa simpan data lengkap di cache saat validateToken pertama kali.
		// Untuk create, kita hapus cache (jika ada sisa) untuk kebersihan.
		await cache.del(CacheKeys.session(sessionId));

		return session;
	}

	async validateToken(token: string) {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

		// 1. Coba ambil dari Redis
		const cachedData = await cache.get<{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			session: any;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			user: any;
		}>(CacheKeys.session(sessionId));

		if (cachedData) {
			// Rekonstruksi Date object karena JSON.parse mengubahnya menjadi string
			cachedData.session.expiresAt = new Date(cachedData.session.expiresAt);
			if (cachedData.session.createdAt) {
				cachedData.session.createdAt = new Date(cachedData.session.createdAt);
			}

			// Validasi expiry dari cache
			if (Date.now() >= cachedData.session.expiresAt.getTime()) {
				await this.invalidateSession(sessionId);
				return { session: null, user: null };
			}

			return cachedData;
		}

		// 2. Jika tidak ada di Redis, ambil dari Database
		const result = await this.repository.findWithUserAndRole(sessionId);
		if (!result) return { session: null, user: null };

		const { session, userId, userEmail, userName, roleId, roleName, roleLevel } = result;

		const user = {
			id: userId,
			email: userEmail,
			name: userName,
			role: roleId
				? {
						id: roleId,
						name: roleName || '',
						level: roleLevel || '50'
					}
				: null
		};

		// hapus jika expired
		const expired = Date.now() >= session.expiresAt.getTime();
		if (expired) {
			await this.invalidateSession(sessionId);
			return { session: null, user: null };
		}

		// 3. Simpan ke Redis (Cache-Aside)
		const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
		if (ttl > 0) {
			await cache.set(CacheKeys.session(sessionId), { session, user }, ttl);
		}

		// perpanjang masa aktif jika mendekati kadaluarsa
		const createdAt = session.createdAt ?? new Date(session.expiresAt.getTime() - DAY_IN_MS * 30);
		const sessionDuration = session.expiresAt.getTime() - createdAt.getTime();

		const isShortSession = sessionDuration < DAY_IN_MS * 2;
		const renewThreshold = isShortSession ? DAY_IN_MS / 2 : DAY_IN_MS * 15;

		const renew = Date.now() >= session.expiresAt.getTime() - renewThreshold;
		if (renew) {
			const extendBy = isShortSession ? DAY_IN_MS : DAY_IN_MS * 30;
			const newExpiry = new Date(Date.now() + extendBy);

			await this.repository.updateExpiry(session.id, newExpiry);
			session.expiresAt = newExpiry;

			// Update Redis dengan expiry baru
			const newTtl = Math.floor((newExpiry.getTime() - Date.now()) / 1000);
			if (newTtl > 0) {
				await cache.set(CacheKeys.session(sessionId), { session, user }, newTtl);
			}
		}

		return { session, user };
	}

	async invalidateSession(sessionId: string) {
		await this.repository.delete(sessionId);
		await cache.del(CacheKeys.session(sessionId));
	}

	setCookie(event: RequestEvent, token: string, expiresAt: Date) {
		event.cookies.set(SESSION_COOKIE_NAME, token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: import.meta.env.PROD,
			expires: expiresAt,
			path: '/'
		});
	}

	deleteCookie(event: RequestEvent) {
		event.cookies.set(SESSION_COOKIE_NAME, '', {
			httpOnly: true,
			sameSite: 'lax',
			secure: import.meta.env.PROD,
			maxAge: 0,
			path: '/'
		});
	}
}
