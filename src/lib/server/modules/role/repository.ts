// src/lib/server/repositories/role.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';

export class RoleRepository {
	async findAll(companyId?: string) {
		const { or, isNull } = await import('drizzle-orm');
		const whereClause = companyId
			? or(eq(table.roles.companyId, companyId), isNull(table.roles.companyId))
			: isNull(table.roles.companyId); // If no companyId, return only global roles

		return await db.select().from(table.roles).where(whereClause);
	}

	async findById(id: string): Promise<table.Role | null> {
		const result = await db.select().from(table.roles).where(eq(table.roles.id, id));
		return result[0] ?? null;
	}

	async create(data: table.NewRole) {
		return await db.insert(table.roles).values(data);
	}

	async update(id: string, data: Partial<table.Role>) {
		return await db.update(table.roles).set(data).where(eq(table.roles.id, id));
	}

	async delete(id: string) {
		return await db.delete(table.roles).where(eq(table.roles.id, id));
	}
}
