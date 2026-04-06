// src/lib/server/repositories/user-profile.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';

export class UserProfileRepository {
	async findAll() {
		return await db.select().from(table.userProfiles);
	}

	async findById(id: string): Promise<table.UserProfiles | null> {
		const result = await db.select().from(table.userProfiles).where(eq(table.userProfiles.id, id));
		return result[0] ?? null;
	}

	async findByUserId(userId: string): Promise<table.UserProfiles | null> {
		const result = await db
			.select()
			.from(table.userProfiles)
			.where(eq(table.userProfiles.userId, userId));
		return result[0] ?? null;
	}

	async create(data: table.NewUserProfiles) {
		return await db.insert(table.userProfiles).values(data);
	}

	async update(id: string, data: Partial<table.UserProfiles>) {
		return await db.update(table.userProfiles).set(data).where(eq(table.userProfiles.id, id));
	}

	async delete(id: string) {
		return await db.delete(table.userProfiles).where(eq(table.userProfiles.id, id));
	}
}
