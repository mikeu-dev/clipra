import * as table from '$lib/server/database/schemas';

import { BaseRepository } from '../../core/base.repository';
import type { IEmployeeRepository } from './interfaces/IEmployeeRepository';

export class EmployeeRepository
	extends BaseRepository<typeof table.employees, table.Employee, table.NewEmployee>
	implements IEmployeeRepository
{
	constructor(private companyId?: string) {
		super(table.employees);
	}

	async findAll(): Promise<table.Employee[]> {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');

		let query = db.select().from(this.table);

		if (this.companyId) {
			// @ts-expect-error Drizzle dynamic query type issue
			query = query.where(eq(this.table.companyId, this.companyId));
		}

		return (await query) as table.Employee[];
	}

	async findAllWithDetails(): Promise<
		{
			employee: table.Employee;
			user: table.User;
			position: table.Position | null;
			shift: table.Shift | null;
			userProfile: table.UserProfiles | null;
		}[]
	> {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');
		const { users, positions, shifts, userProfiles } = await import('$lib/server/database/schemas');

		let query = db
			.select({
				employee: this.table,
				user: users,
				position: positions,
				shift: shifts,
				userProfile: userProfiles
			})
			.from(this.table)
			.innerJoin(users, eq(this.table.userId, users.id))
			.leftJoin(positions, eq(this.table.positionId, positions.id))
			.leftJoin(shifts, eq(this.table.shiftId, shifts.id))
			.leftJoin(userProfiles, eq(users.id, userProfiles.userId));

		if (this.companyId) {
			// @ts-expect-error Drizzle dynamic query type issue
			query = query.where(eq(this.table.companyId, this.companyId));
		}

		return await query;
	}
}
