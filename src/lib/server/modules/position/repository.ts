import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IPositionRepository } from './interfaces/IPositionRepository';

export class PositionRepository
	extends BaseRepository<typeof table.positions, table.Position, table.NewPosition>
	implements IPositionRepository
{
	constructor() {
		super(table.positions);
	}

	async findAllByCompanyId(companyId: string) {
		return await db.select().from(table.positions).where(eq(table.positions.companyId, companyId));
	}
}
