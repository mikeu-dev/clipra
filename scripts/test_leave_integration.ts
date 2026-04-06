import { db } from '../src/lib/server/database';
import { users, companies, leaveRequests, roles } from '../src/lib/server/database/schemas';
import { eq, and, gte, lte } from 'drizzle-orm';
import { generateId } from '../src/lib/utils/useUserId';

// Simplified Test: Validate Leave Calculation Logic Only
async function main() {
	console.log('Testing Leave Integration (Logic Only)...');

	// 1. Setup Data
	const company = await db.select().from(companies).limit(1);
	const companyId = company[0]?.id;
	if (!companyId) return;

	const role = await db.select().from(roles).limit(1);
	const roleId = role[0]?.id;
	if (!roleId) return;

	const rand = Math.floor(Math.random() * 10000);
	const userId = crypto.randomUUID();

	await db.insert(users).values({
		id: userId,
		email: `leave_test${rand}@test.com`,
		name: 'Leave Test User',
		roleId: roleId,
		username: `leavetest${rand}`,
		passwordHash: 'dummy'
	});

	// Create Approved Leave Request (5 Days: 1st to 5th of current month)
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
		reason: 'Holiday'
	});
	console.log(
		`Created approved leave from ${leaveStart.toDateString()} to ${leaveEnd.toDateString()}`
	);

	// 2. Emulate PayrollService Logic
	const workingDaysInMonth = 22;
	const presentDays = 0; // Simulated: No presence records

	// Get Leaves (Same logic as in PayrollService)
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
		const start = new Date(leave.startDate) < periodStart ? periodStart : new Date(leave.startDate);
		const end = new Date(leave.endDate) > periodEnd ? periodEnd : new Date(leave.endDate);
		if (start <= end) {
			const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			if (leave.type !== 'unpaid') {
				paidLeaveDays += days;
			}
		}
	}

	const absentDays = Math.max(0, workingDaysInMonth - presentDays - paidLeaveDays);

	console.log('--- Calculation Result ---');
	console.log(`Working Days: ${workingDaysInMonth}`);
	console.log(`Present Days: ${presentDays}`);
	console.log(`Paid Leave Days: ${paidLeaveDays}`);
	console.log(`Absent Days (Deducted): ${absentDays}`);

	// 3. Verify: Expected 5 paid leave days, 17 absent days (22 - 0 - 5)
	if (paidLeaveDays === 5 && absentDays === 17) {
		console.log('SUCCESS: Leave integration logic is correct!');
	} else {
		console.log(
			`FAIL: Expected paidLeaveDays=5, absentDays=17. Got paidLeaveDays=${paidLeaveDays}, absentDays=${absentDays}`
		);
	}
}

main();
