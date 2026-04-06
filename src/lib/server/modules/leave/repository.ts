import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { ILeaveRepository } from './interfaces/ILeaveRepository';

export class LeaveRepository
	extends BaseRepository<typeof table.leaveRequests, table.LeaveRequest, table.NewLeaveRequest>
	implements ILeaveRepository
{
	constructor() {
		super(table.leaveRequests);
	}

	async findAllByCompanyId(companyId: string) {
		const results = await db
			.select({
				leave: table.leaveRequests,
				user: table.users
			})
			.from(table.leaveRequests)
			.innerJoin(table.users, eq(table.leaveRequests.userId, table.users.id))
			.innerJoin(table.employees, eq(table.users.id, table.employees.userId))
			.where(eq(table.employees.companyId, companyId));

		return results.map((r) => ({
			...r.leave,
			user: r.user
		}));
	}

	async findAllByUserId(userId: string) {
		return await db
			.select()
			.from(table.leaveRequests)
			.where(eq(table.leaveRequests.userId, userId));
	}

	async findAllByStatus(status: 'pending' | 'approved' | 'rejected') {
		return await db
			.select()
			.from(table.leaveRequests)
			.where(eq(table.leaveRequests.status, status));
	}
}
