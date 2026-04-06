import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, getTableColumns } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IUnitRepository } from './interfaces/IUnitRepository';

export class UnitRepository
	extends BaseRepository<typeof table.units, table.Unit, table.NewUnit>
	implements IUnitRepository
{
	constructor() {
		super(table.units);
	}

	async findAllWithUser() {
		const results = await db
			.select({
				...getTableColumns(table.units),
				user: table.users
			})
			.from(table.units)
			.leftJoin(table.users, eq(table.units.userId, table.users.id));

		return results as (table.Unit & { user: table.User | null })[];
	}
}
