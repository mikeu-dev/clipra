import 'dotenv/config';
import { db } from '../src/lib/server/database';
import * as table from '../src/lib/server/database/schemas';
import { eq } from 'drizzle-orm';

async function main() {
	console.log('🔗 Linking admin to second company...');

	const adminUser = await db.query.users.findFirst({
		where: eq(table.users.email, 'admin@example.com')
	});

	if (!adminUser) {
		console.error('❌ Admin user not found.');
		return;
	}

	const secondCompany = await db.query.companies.findFirst({
		where: eq(table.companies.code, 'MS-002')
	});

	if (!secondCompany) {
		console.error('❌ Second company (MS-002) not found.');
		return;
	}

	// Check if already exists
	const existing = await db.query.employees.findFirst({
		where: (employees, { and, eq }) =>
			and(eq(employees.userId, adminUser.id), eq(employees.companyId, secondCompany.id))
	});

	if (existing) {
		console.log('✅ Admin is already an employee of the second company.');
		return;
	}

	// Get any position/shift/role to satisfy constraints
	const position = await db.query.positions.findFirst();
	const shift = await db.query.shifts.findFirst();

	if (!position || !shift) {
		console.error('❌ Missing position/shift master data.');
		return;
	}

	await db.insert(table.employees).values({
		id: crypto.randomUUID(),
		userId: adminUser.id,
		companyId: secondCompany.id,
		positionId: position.id,
		shiftId: shift.id,
		idCard: 'ADMIN-MS002',
		nik: 'ADMIN-MS002',
		status: 'permanent',
		workEmail: 'admin-ms002@example.com',
		createdAt: new Date(),
		updatedAt: new Date()
	});

	console.log('✅ Successfully linked admin to second company.');
}

main()
	.catch(console.error)
	.finally(() => process.exit());
