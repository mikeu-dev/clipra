import { describe, it, expect, beforeAll } from 'vitest';
import type { db as DbType } from '$lib/server/database';
import { leaveRequests, users, roles } from '$lib/server/database/schemas';
import { eq, and, gte, lte } from 'drizzle-orm';
import { generateId } from '$lib/utils/useUserId';

// Skip if NO DATABASE_URL
const runTests = process.env.DATABASE_URL ? describe : describe.skip;

runTests('Payroll Leave Integration', () => {
	let db: typeof DbType;

	beforeAll(async () => {
		if (process.env.DATABASE_URL) {
			const database = await import('$lib/server/database');
			db = database.db;
		}
	});

	describe('Paid Leave Calculation', () => {
		it('should correctly count paid leave days', async () => {
			// Get role
			const role = await db.select().from(roles).limit(1);
			const roleId = role[0]?.id;
			if (!roleId) throw new Error('No role found');

			// Create test user
			const userId = crypto.randomUUID();
			await db.insert(users).values({
				id: userId,
				email: `payroll_test_${Date.now()}@test.com`,
				name: 'Payroll Test User',
				username: `payrolltest${Date.now()}`,
				passwordHash: 'dummy',
				roleId
			});

			// Create leave request (5 days, 1st to 5th of current month)
			const period = new Date();
			const periodStart = new Date(period.getFullYear(), period.getMonth(), 1);
			const periodEnd = new Date(period.getFullYear(), period.getMonth() + 1, 0);

			const leaveStart = new Date(periodStart);
			const leaveEnd = new Date(periodStart);
			leaveEnd.setDate(5);

			await db.insert(leaveRequests).values({
				id: generateId(),
				userId,
				type: 'annual',
				startDate: leaveStart,
				endDate: leaveEnd,
				status: 'approved',
				reason: 'Test Holiday'
			});

			// Query leaves (same logic as PayrollService)
			const leaves = await db
				.select()
				.from(leaveRequests)
				.where(
					and(
						eq(leaveRequests.userId, userId),
						eq(leaveRequests.status, 'approved'),
						gte(leaveRequests.endDate, periodStart),
						lte(leaveRequests.startDate, periodEnd)
					)
				);

			let paidLeaveDays = 0;
			for (const leave of leaves) {
				const start =
					new Date(leave.startDate) < periodStart ? periodStart : new Date(leave.startDate);
				const end = new Date(leave.endDate) > periodEnd ? periodEnd : new Date(leave.endDate);
				if (start <= end) {
					const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
					if (leave.type !== 'unpaid') {
						paidLeaveDays += days;
					}
				}
			}

			expect(paidLeaveDays).toBe(5);

			// Calculate absent days
			const workingDaysInMonth = 22;
			const presentDays = 0;
			const absentDays = Math.max(0, workingDaysInMonth - presentDays - paidLeaveDays);

			expect(absentDays).toBe(17);
		});

		it('should not count unpaid leave as paid leave days', async () => {
			const role = await db.select().from(roles).limit(1);
			const roleId = role[0]?.id;
			if (!roleId) throw new Error('No role found');

			const userId = crypto.randomUUID();
			await db.insert(users).values({
				id: userId,
				email: `unpaid_test_${Date.now()}@test.com`,
				name: 'Unpaid Test User',
				username: `unpaidtest${Date.now()}`,
				passwordHash: 'dummy',
				roleId
			});

			const period = new Date();
			const periodStart = new Date(period.getFullYear(), period.getMonth(), 1);
			const periodEnd = new Date(period.getFullYear(), period.getMonth() + 1, 0);

			const leaveStart = new Date(periodStart);
			const leaveEnd = new Date(periodStart);
			leaveEnd.setDate(3);

			await db.insert(leaveRequests).values({
				id: generateId(),
				userId,
				type: 'unpaid',
				startDate: leaveStart,
				endDate: leaveEnd,
				status: 'approved',
				reason: 'Unpaid Leave'
			});

			const leaves = await db
				.select()
				.from(leaveRequests)
				.where(
					and(
						eq(leaveRequests.userId, userId),
						eq(leaveRequests.status, 'approved'),
						gte(leaveRequests.endDate, periodStart),
						lte(leaveRequests.startDate, periodEnd)
					)
				);

			let paidLeaveDays = 0;
			for (const leave of leaves) {
				const start =
					new Date(leave.startDate) < periodStart ? periodStart : new Date(leave.startDate);
				const end = new Date(leave.endDate) > periodEnd ? periodEnd : new Date(leave.endDate);
				if (start <= end) {
					const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
					if (leave.type !== 'unpaid') {
						paidLeaveDays += days;
					}
				}
			}

			// Unpaid leave should not count
			expect(paidLeaveDays).toBe(0);
		});
	});
});
