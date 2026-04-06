// src/lib/server/repositories/school.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, getTableColumns } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { ISchoolRepository } from './interfaces/ISchoolRepository';

export class SchoolRepository
	extends BaseRepository<typeof table.schools, table.School, table.NewSchool>
	implements ISchoolRepository
{
	constructor() {
		super(table.schools);
	}

	async findAllWithUser() {
		const results = await db
			.select({
				...getTableColumns(table.schools),
				user: table.users
			})
			.from(table.schools)
			.leftJoin(table.users, eq(table.schools.userId, table.users.id));

		return results as (table.School & { user: table.User | null })[];
	}
}
