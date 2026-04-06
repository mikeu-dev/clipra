import { BaseRepository } from '../../core/base.repository';
import type * as table from '$lib/server/database/schemas';
import { presences } from '$lib/server/database/schemas';

export class PresenceRepository extends BaseRepository<
	typeof presences,
	table.Presence,
	table.NewPresence
> {
	constructor(private companyId?: string) {
		super(presences);
	}

	async findPaginated(
		page: number,
		limit: number,
		filters?: { month?: number; year?: number; search?: string }
	) {
		const { db } = await import('$lib/server/database');
		const { eq, and, desc, sql } = await import('drizzle-orm');
		// users import reserved for future search by user name

		let query = db.select().from(this.table);

		const whereConditions = [];

		if (this.companyId) {
			whereConditions.push(eq(this.table.companyId, this.companyId));
		}

		if (filters?.month && filters?.year) {
			// Filter by month/year
			// SQL: MONTH(time) = ? AND YEAR(time) = ?
			whereConditions.push(
				sql`EXTRACT(MONTH FROM ${this.table.time}) = ${filters.month}`,
				sql`EXTRACT(YEAR FROM ${this.table.time}) = ${filters.year}`
			);
		}

		if (filters?.search) {
			// Use subquery or join for user name if needed, but for now simple fingerprint search
			// Or if we want to search by User Name, we need to join users table.
			// Let's keep it simple first: search fingerprint.
			// Actually, joining users is better UX.
		}

		// Apply filters
		if (whereConditions.length > 0) {
			// @ts-expect-error Drizzle dynamic query type issue
			query = query.where(and(...whereConditions));
		}

		// Get Count first
		// We need a separate count query or clone.
		// For simplicity, let's just run count query separately with same filters.
		const countQuery = db.select({ count: sql<number>`count(*)` }).from(this.table);

		if (whereConditions.length > 0) {
			countQuery.where(and(...whereConditions));
		}

		const totalRes = await countQuery;
		const total = Number(totalRes[0].count);

		// Get Data
		const offset = (page - 1) * limit;

		const data = await query.limit(limit).offset(offset).orderBy(desc(this.table.time));

		return {
			data: data as table.Presence[],
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	}
}
