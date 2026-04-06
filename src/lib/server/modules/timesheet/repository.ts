import { desc } from 'drizzle-orm';
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';

export class TimesheetRepository extends BaseRepository<
	typeof table.timesheets,
	table.Timesheet,
	table.NewTimesheet
> {
	constructor(private companyId?: string) {
		super(table.timesheets);
	}

	async getByUserId(userId: string) {
		const { db } = await import('$lib/server/database');
		const { eq, and } = await import('drizzle-orm');

		let query = db
			.select({
				timesheet: table.timesheets,
				project: table.projects,
				task: table.tasks
			})
			.from(table.timesheets)
			.leftJoin(table.projects, eq(table.timesheets.projectId, table.projects.id))
			.leftJoin(table.tasks, eq(table.timesheets.taskId, table.tasks.id))
			.where(eq(table.timesheets.userId, userId))
			.orderBy(desc(table.timesheets.date));

		if (this.companyId) {
			// Join clients to filter by company via project
			query = query
				.leftJoin(table.clients, eq(table.projects.clientId, table.clients.id))
				// @ts-expect-error Drizzle dynamic query type
				.where(
					and(eq(table.timesheets.userId, userId), eq(table.clients.companyId, this.companyId))
				);
		}

		const rows = await query;

		return rows.map((row) => ({
			...row.timesheet,
			project: row.project,
			task: row.task
		}));
	}
}
