import { desc, eq } from 'drizzle-orm';
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';

export class ExpenseRepository extends BaseRepository<
	typeof table.expenses,
	table.Expense,
	table.NewExpense
> {
	constructor(private companyId?: string) {
		super(table.expenses);
	}

	async getAllWithDetails() {
		const { db } = await import('$lib/server/database');

		let query = db
			.select({
				expense: table.expenses,
				project: table.projects,
				user: table.users
			})
			.from(table.expenses)
			.leftJoin(table.projects, eq(table.expenses.projectId, table.projects.id))
			.leftJoin(table.users, eq(table.expenses.userId, table.users.id))
			// Join clients to filter by company via project
			.leftJoin(table.clients, eq(table.projects.clientId, table.clients.id))
			.orderBy(desc(table.expenses.date));

		if (this.companyId) {
			// @ts-expect-error Drizzle dynamic query type
			query = query.where(eq(table.clients.companyId, this.companyId));
		}

		const rows = await query;

		return rows.map((row) => ({
			...row.expense,
			project: row.project,
			user: row.user
		}));
	}
}
