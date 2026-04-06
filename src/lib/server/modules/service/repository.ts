import { BaseRepository } from '../../core/base.repository';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database';

export class ServiceRepository extends BaseRepository<
	typeof table.services,
	table.Service,
	table.NewService
> {
	constructor() {
		super(table.services);
	}

	async findAllByCompanyId(companyId: string): Promise<table.Service[]> {
		return await db.select().from(table.services).where(eq(table.services.companyId, companyId));
	}
}
