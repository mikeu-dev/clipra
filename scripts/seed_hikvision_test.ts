import { db } from '../src/lib/server/database';
import { employees, users, companies, shifts } from '../src/lib/server/database/schemas';
import { eq } from 'drizzle-orm';

// Mock generateId if import fails or assumes different path.
// Step 260 used $lib/utils/useUserId, so likely correct.
// But in script context (bun), aliases might fail if tsconfig paths not respected?
// Bun respects tsconfig paths usually. Let's assume standard crypto UUID if needed.

async function main() {
	// 1. Ensure we have a company
	const company = await db.select().from(companies).limit(1);
	let companyId = company[0]?.id;

	if (!companyId) {
		console.log('Creating test company...');
		companyId = crypto.randomUUID();
		await db.insert(companies).values({
			id: companyId,
			name: 'Test Company'
		});
	}

	// 2. Ensure we have a shift
	const shift = await db.select().from(shifts).limit(1);
	let shiftId = shift[0]?.id;

	if (!shiftId) {
		console.log('Creating test shift...');
		shiftId = crypto.randomUUID();
		await db.insert(shifts).values({
			id: shiftId,
			companyId: companyId,
			name: 'Regular',
			startTime: '09:00:00',
			endTime: '17:00:00'
		});
	}

	// 3. Ensure EMP001 exists
	// We need a user first
	const existing = await db.select().from(employees).where(eq(employees.idCard, 'EMP001'));

	if (existing.length === 0) {
		console.log('Creating EMP001...');
		const userId = crypto.randomUUID();
		await db.insert(users).values({
			id: userId,
			email: 'emp001@test.com',
			username: 'emp001',
			name: 'Test Employee Hikvision',
			roleId: 'basic_role',
			passwordHash: 'dummyhash'
		});

		await db.insert(employees).values({
			id: crypto.randomUUID(),
			userId: userId,
			companyId: companyId,
			idCard: 'EMP001',
			shiftId: shiftId,
			joinDate: new Date(),
			status: 'permanent'
		});
		console.log('EMP001 created.');
	} else {
		console.log('EMP001 already exists.');
	}
}

main();
