// src/lib/server/repositories/PasswordResetRepository.ts
import { generateId } from '$lib/utils/useUserId';
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, and, gt } from 'drizzle-orm';

export class PasswordResetRepository {
	async createToken(userId: string, token: string, expiresAt: Date) {
		await db.insert(table.passwordResetTokens).values({
			id: generateId(),
			userId,
			token,
			expiresAt,
			createdAt: new Date()
		});
	}

	async findValidToken(token: string) {
		const [result] = await db
			.select({
				id: table.passwordResetTokens.id,
				userId: table.passwordResetTokens.userId,
				expiresAt: table.passwordResetTokens.expiresAt
			})
			.from(table.passwordResetTokens)
			.where(
				and(
					eq(table.passwordResetTokens.token, token),
					gt(table.passwordResetTokens.expiresAt, new Date())
				)
			);

		return result || null;
	}

	async deleteToken(token: string) {
		await db.delete(table.passwordResetTokens).where(eq(table.passwordResetTokens.token, token));
	}
}
