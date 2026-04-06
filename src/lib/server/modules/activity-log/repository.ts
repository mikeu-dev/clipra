// src/lib/server/repositories/activity-log.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, getTableColumns } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IActivityLogRepository } from './interfaces/IActivityLogRepository';

export class ActivityLogRepository
	extends BaseRepository<typeof table.activityLogs, table.ActivityLog, table.NewActivityLog>
	implements IActivityLogRepository
{
	constructor() {
		super(table.activityLogs);
	}

	async findAllWithUser() {
		const results = await db
			.select({
				...getTableColumns(table.activityLogs),
				user: table.users
			})
			.from(table.activityLogs)
			.leftJoin(table.users, eq(table.activityLogs.userId, table.users.id));

		return results as (table.ActivityLog & { user: table.User | null })[];
	}

	async findByUser(userId: string): Promise<table.ActivityLog[]> {
		return await db.select().from(table.activityLogs).where(eq(table.activityLogs.userId, userId));
	}
}
