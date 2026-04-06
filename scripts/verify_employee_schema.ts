import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, employees, positions, shifts, users } from '../src/lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function main() {
	console.log('Verifying Employee Schema...');
	const client = postgres(process.env.DATABASE_URL!, { prepare: false });
	const db = drizzle(client);

	try {
		// 1. Create a Company
		const companyId = uuidv4();
		await db.insert(companies).values({
			id: companyId,
			name: 'Test Corp',
			code: 'TEST001',
			email: 'contact@testcorp.com'
		});
		console.log('Created Company:', companyId);

		// 2. Create/Get a User (Need a user for employee)
		const allUsers = await db.select().from(users).limit(1);
		let userId;

		if (allUsers.length > 0) {
			userId = allUsers[0].id;
			console.log('Using existing User:', userId);
		} else {
			console.log('No users found to link. Skipping employee creation.');
			return;
		}

		// 3. Create Position linked to Company
		const positionId = uuidv4();
		await db.insert(positions).values({
			id: positionId,
			companyId: companyId,
			name: 'Senior Developer'
		});
		console.log('Created Position:', positionId);

		// 4. Create Shift linked to Company
		const shiftId = uuidv4();
		await db.insert(shifts).values({
			id: shiftId,
			companyId: companyId,
			name: 'Morning Shift'
		});
		console.log('Created Shift:', shiftId);

		// 5. Create Employee
		const employeeId = uuidv4();
		await db.insert(employees).values({
			id: employeeId,
			userId: userId,
			companyId: companyId,
			positionId: positionId,
			shiftId: shiftId,
			nik: '1234567890',
			status: 'permanent',
			joinDate: new Date().toISOString().split('T')[0] // PG date as string
		});
		console.log('Created Employee:', employeeId);

		// Verify Fetch
		const emp = await db.select().from(employees).where(eq(employees.id, employeeId));
		console.log('Fetched Employee:', emp[0]);

		// Cleanup
		await db.delete(employees).where(eq(employees.id, employeeId));
		await db.delete(positions).where(eq(positions.id, positionId));
		await db.delete(shifts).where(eq(shifts.id, shiftId));
		await db.delete(companies).where(eq(companies.id, companyId));
		console.log('Cleanup successful.');
	} catch (e) {
		console.error('Verification failed:', e);
	} finally {
		await client.end();
	}
}

main();
