import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';

export class SessionRepository {
	async create(session: table.NewSession) {
		await db.insert(table.sessions).values(session);
		return session;
	}

	async findById(sessionId: string) {
		const [session] = await db
			.select()
			.from(table.sessions)
			.where(eq(table.sessions.id, sessionId));
		return session || null;
	}

	async findWithUserAndRole(sessionId: string) {
		const [result] = await db
			.select({
				session: table.sessions,
				userId: table.users.id,
				userEmail: table.users.email,
				userName: table.users.name,
				roleId: table.roles.id,
				roleName: table.roles.name,
				roleLevel: table.roles.level
			})
			.from(table.sessions)
			.innerJoin(table.users, eq(table.sessions.userId, table.users.id))
			.leftJoin(table.roles, eq(table.users.roleId, table.roles.id))
			.where(eq(table.sessions.id, sessionId));

		return result || null;
	}

	async updateExpiry(sessionId: string, expiresAt: Date) {
		await db.update(table.sessions).set({ expiresAt }).where(eq(table.sessions.id, sessionId));
	}

	async delete(sessionId: string) {
		await db.delete(table.sessions).where(eq(table.sessions.id, sessionId));
	}
}
