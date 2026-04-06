// src/lib/server/repositories/client.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IClientRepository } from './interfaces/IClientRepository';

export class ClientRepository
	extends BaseRepository<typeof table.clients, table.Client, table.NewClient>
	implements IClientRepository
{
	constructor(private companyId?: string) {
		super(table.clients);
	}

	async getPaginated(
		page: number,
		limit: number,
		search?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }> {
		const { db } = await import('$lib/server/database');
		const { like, or, count, inArray, and, eq } = await import('drizzle-orm');
		const offset = (page - 1) * limit;

		let whereCondition = search
			? or(like(table.clients.name, `%${search}%`), like(table.clients.contactEmail, `%${search}%`))
			: undefined;

		if (this.companyId) {
			whereCondition = whereCondition
				? and(eq(table.clients.companyId, this.companyId), whereCondition)
				: eq(table.clients.companyId, this.companyId);
		}

		// Fetch clients only (without relational query)
		const clientsData = await db.query.clients.findMany({
			limit,
			offset,
			where: whereCondition,
			orderBy: (clients, { desc }) => [desc(clients.createdAt)]
		});

		// Fetch projects separately
		const clientIds = clientsData.map((c) => c.id);
		let projectsData: table.Project[] = [];

		if (clientIds.length > 0) {
			projectsData = await db
				.select()
				.from(table.projects)
				.where(inArray(table.projects.clientId, clientIds));
		}

		// Manual merge
		const data = clientsData.map((client) => ({
			...client,
			projects: projectsData.filter((p) => p.clientId === client.id)
		}));

		// Count total
		const [totalResult] = await db
			.select({ count: count() })
			.from(table.clients)
			.where(whereCondition);

		return {
			data,
			total: totalResult.count
		};
	}

	async getSelectOptions() {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');

		let query = db
			.select({
				id: table.clients.id,
				name: table.clients.name
			})
			.from(table.clients);

		if (this.companyId) {
			// @ts-expect-error Drizzle dynamic query type issue
			query = query.where(eq(table.clients.companyId, this.companyId));
		}

		return await query;
	}
}
