import { BaseRepository } from '../../core/base.repository';
import type * as table from '$lib/server/database/schemas';
import { devices } from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database';

export class DevicesRepository extends BaseRepository<
	typeof devices,
	table.Device,
	table.NewDevice
> {
	constructor(private companyId?: string) {
		super(devices);
	}

	async findActiveByIp(ipAddress: string) {
		const result = await db
			.select()
			.from(this.table)
			.where(eq(this.table.ipAddress, ipAddress))
			.limit(1);

		// Check active status in memory or add .where(isActive) if needed.
		// Logic: Return device if exists, caller checks active status.
		return result[0];
	}

	async findAllByCompanyId(companyId: string) {
		return await db.select().from(this.table).where(eq(this.table.companyId, companyId));
	}
}
