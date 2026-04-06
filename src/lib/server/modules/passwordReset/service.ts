// src/lib/server/services/PasswordResetService.ts
import { PasswordResetRepository } from './repository';
import { encodeBase64url } from '@oslojs/encoding';
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

export class PasswordResetService {
	private repository: PasswordResetRepository;
	private PASSWORD_RESET_EXPIRATION_HOURS = 1;

	constructor(repository: PasswordResetRepository = new PasswordResetRepository()) {
		this.repository = repository;
	}

	generateToken(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(32));
		return encodeBase64url(bytes);
	}

	async requestReset(userId: string) {
		const token = this.generateToken();
		const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_EXPIRATION_HOURS * 60 * 60 * 1000);

		await this.repository.createToken(userId, token, expiresAt);
		return { token, expiresAt };
	}

	async resetPassword(token: string, newPassword: string) {
		const tokenData = await this.repository.findValidToken(token);
		if (!tokenData) throw new Error('Token tidak valid atau sudah kedaluwarsa');

		const passwordHash = await hash(newPassword, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		await db.update(table.users).set({ passwordHash }).where(eq(table.users.id, tokenData.userId));

		await this.repository.deleteToken(token);
	}
}
