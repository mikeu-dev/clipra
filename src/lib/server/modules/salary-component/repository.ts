import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { ISalaryComponentRepository } from './interfaces/ISalaryComponentRepository';

export class SalaryComponentRepository
	extends BaseRepository<
		typeof table.salaryComponents,
		table.SalaryComponent,
		table.NewSalaryComponent
	>
	implements ISalaryComponentRepository
{
	constructor() {
		super(table.salaryComponents);
	}

	async findAllByCompanyId(companyId: string) {
		return await db
			.select()
			.from(table.salaryComponents)
			.where(eq(table.salaryComponents.companyId, companyId));
	}
}
