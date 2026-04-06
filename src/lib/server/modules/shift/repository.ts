import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import { db } from '$lib/server/database';
import { eq } from 'drizzle-orm';
import type { IShiftRepository } from './interfaces/IShiftRepository';

export class ShiftRepository
	extends BaseRepository<typeof table.shifts, table.Shift, table.NewShift>
	implements IShiftRepository
{
	constructor() {
		super(table.shifts);
	}

	async findAllByCompanyId(companyId: string) {
		return await db.select().from(table.shifts).where(eq(table.shifts.companyId, companyId));
	}
}
