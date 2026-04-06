import { SessionService } from './service';
import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export class SessionController {
	private service: SessionService;

	constructor(service: SessionService = new SessionService()) {
		this.service = service;
	}

	async create(event: RequestEvent, userId: string, expiresInDays?: number) {
		const session = await this.service.createSession(userId, expiresInDays);
		this.service.setCookie(event, session.sessionToken, session.expiresAt);
		return session;
	}

	async validate(event: RequestEvent) {
		const token = event.cookies.get('auth-session');
		if (!token) return { session: null, user: null };

		return await this.service.validateToken(token);
	}

	async destroy(event: RequestEvent) {
		const token = event.cookies.get('auth-session');
		if (!token) return;

		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		await this.service.invalidateSession(sessionId);
		this.service.deleteCookie(event);
	}
}
