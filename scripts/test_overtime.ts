import { db } from '../src/lib/server/database';
import {
	shifts,
	employees,
	users,
	companies,
	presences,
	roles
} from '../src/lib/server/database/schemas';
import { PresenceService } from '../src/lib/server/modules/presence/service';
import { eq } from 'drizzle-orm';

async function main() {
	console.log('Testing Overtime Logic...');

	// 1. Setup Data
	const company = await db.select().from(companies).limit(1);
	const companyId = company[0]?.id;
	const role = await db.select().from(roles).limit(1);
	const roleId = role[0]?.id;

	if (!companyId || !roleId) {
		console.error('Missing company or role');
		return;
	}

	// Create Standard Shift (09:00 - 17:00)
	const shiftId = crypto.randomUUID();
	await db.insert(shifts).values({
		id: shiftId,
		companyId: companyId,
		name: 'Standard Shift',
		startTime: '09:00:00',
		endTime: '17:00:00'
	});

	// Create Employee
	const rand = Math.floor(Math.random() * 10000);
	const userId = crypto.randomUUID();
	await db.insert(users).values({
		id: userId,
		email: `overtime_test${rand}@test.com`,
		name: 'Overtime Test User',
		roleId: roleId,
		username: `overtime${rand}`,
		passwordHash: 'dummy'
	});

	const empId = crypto.randomUUID();
	await db.insert(employees).values({
		id: empId,
		userId: userId,
		companyId: companyId,
		idCard: `OT${rand}`,
		shiftId: shiftId,
		joinDate: new Date(),
		status: 'permanent'
	});

	// 2. Test Clock Out at 19:00 (2 Hours Overtime)
	// Shift End: 17:00. Clock Out: 19:00. Diff: 120 mins.

	const service = new PresenceService(companyId);

	const clockOutTime = new Date();
	clockOutTime.setHours(19, 0, 0, 0);

	console.log(`Clocking OUT at ${clockOutTime.toLocaleTimeString()} for OT${rand}...`);

	// Note: clockIn service determines IN/OUT automatically based on logic we implemented
	// (if overtime > 0 -> OUT)
	await service.clockIn(`OT${rand}`, clockOutTime);

	// 3. Verify Result
	const presence = await db
		.select()
		.from(presences)
		.where(eq(presences.fingerprint, `OT${rand}`))
		.limit(1);

	if (presence[0]) {
		console.log('Presence Created:', presence[0]);
		console.log(`Category: ${presence[0].category}`);
		console.log(`Overtime Minutes: ${presence[0].overtime}`);

		if (presence[0].category === 'out' && presence[0].overtime === 120) {
			console.log(
				'SUCCESS: Overtime calculated correctly (120 mins) and Category identified as OUT'
			);
		} else {
			console.log('FAIL: Overtime calculation or Category mismatch');
		}
	} else {
		console.log('FAIL: No presence created.');
	}
}

main();
