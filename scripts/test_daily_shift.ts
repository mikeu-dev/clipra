import { db } from '../src/lib/server/database';
import {
	shifts,
	shiftSchedules,
	employees,
	users,
	companies,
	presences,
	roles
} from '../src/lib/server/database/schemas';
import { PresenceService } from '../src/lib/server/modules/presence/service';
import { eq } from 'drizzle-orm';

async function main() {
	console.log('Testing Daily Shift Logic...');

	// 1. Setup Data
	const company = await db.select().from(companies).limit(1);
	const companyId = company[0]?.id;

	if (!companyId) {
		console.error('No company found');
		return;
	}

	// Get Role
	const role = await db.select().from(roles).limit(1);
	const roleId = role[0]?.id;

	if (!roleId) {
		console.error('No role found');
		return;
	}

	// Create Shift
	const shiftId = crypto.randomUUID();
	await db.insert(shifts).values({
		id: shiftId,
		companyId: companyId,
		name: 'Flexi Shift',
		startTime: '09:00:00',
		endTime: '17:00:00'
	});

	// Create Schedule for TODAY (Day X)
	// Shift is 09:00 - 17:00. Daily Schedule is 10:00 - 16:00.
	const todayDay = new Date().getDay().toString();

	await db.insert(shiftSchedules).values({
		id: crypto.randomUUID(),
		shiftId: shiftId,
		day: todayDay as '0' | '1' | '2' | '3' | '4' | '5' | '6',
		startTime: '10:00:00',
		endTime: '16:00:00',
		breakTime: '12:00:00'
	});
	console.log(`Created special schedule for Day ${todayDay}: 10:00 - 16:00`);

	// Create Employee with this shift
	const userId = crypto.randomUUID();
	// Use random email/username to avoid unique collision if run multiple times
	const rand = Math.floor(Math.random() * 1000);

	await db.insert(users).values({
		id: userId,
		email: `shift_test${rand}@test.com`,
		name: 'Shift Test User',
		roleId: roleId,
		username: `shifttest${rand}`,
		passwordHash: 'dummyhash'
	});

	const empId = crypto.randomUUID();
	await db.insert(employees).values({
		id: empId,
		userId: userId,
		companyId: companyId,
		idCard: `SHIFT${rand}`,
		shiftId: shiftId,
		joinDate: new Date(),
		status: 'permanent'
	});

	// 2. Test Clock In at 09:30
	// Default shift starts 09:00 -> 09:30 is LATE (30m).
	// Daily Schedule starts 10:00 -> 09:30 is EARLY/ON TIME (Not Late).

	const service = new PresenceService(companyId);

	const clockInTime = new Date();
	clockInTime.setHours(9, 30, 0, 0);

	console.log(`Clocking in at ${clockInTime.toLocaleTimeString()} for SHIFT${rand}...`);

	await service.clockIn(`SHIFT${rand}`, clockInTime);

	// 3. Verify Result
	const presence = await db
		.select()
		.from(presences)
		.where(eq(presences.fingerprint, `SHIFT${rand}`))
		.limit(1);

	if (presence[0]) {
		console.log('Presence Created:', presence[0]);
		console.log(`Late Minutes: ${presence[0].late}`);

		if ((presence[0].late ?? 0) <= 0) {
			console.log('SUCCESS: Employee is NOT late (used Daily Schedule 10:00)');
		} else {
			console.log('FAIL: Employee is LATE (ignored Daily Schedule?)');
		}
	} else {
		console.log('FAIL: No presence created.');
	}
}

main();
