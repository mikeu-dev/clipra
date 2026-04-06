import { db } from '../index';
import * as table from '../schemas/index';
import { sql } from 'drizzle-orm';

export async function seedPresences() {
	console.log('[SEED] Seeding presences...');

	const allEmployees = await db.select().from(table.employees);
	const datesToSeed = [1, 0].map((daysAgo) => {
		const d = new Date();
		d.setDate(d.getDate() - daysAgo);
		return d;
	});

	let newPresenceCount = 0;

	for (const employee of allEmployees) {
		for (const dateObj of datesToSeed) {
			const startOfDay = new Date(dateObj);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(dateObj);
			endOfDay.setHours(23, 59, 59, 999);

			const existing = await db
				.select({ id: table.presences.id })
				.from(table.presences)
				.where(
					sql`${table.presences.userId} = ${employee.userId} 
					AND ${table.presences.time} >= ${startOfDay.toISOString()} 
					AND ${table.presences.time} <= ${endOfDay.toISOString()}`
				)
				.limit(1);

			if (existing.length === 0) {
				const inTime = new Date(dateObj);
				inTime.setHours(8, Math.floor(Math.random() * 30), 0);

				const outTime = new Date(dateObj);
				outTime.setHours(17, Math.floor(Math.random() * 30), 0);

				await db.insert(table.presences).values({
					id: crypto.randomUUID(),
					userId: employee.userId,
					companyId: employee.companyId,
					positionId: employee.positionId,
					time: inTime,
					category: 'in',
					type: 'offline',
					late: 0,
					earlier: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				});

				await db.insert(table.presences).values({
					id: crypto.randomUUID(),
					userId: employee.userId,
					companyId: employee.companyId,
					positionId: employee.positionId,
					time: outTime,
					category: 'out',
					type: 'offline',
					late: 0,
					earlier: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				});
				newPresenceCount += 2;
			}
		}
	}
	console.log(`Created ${newPresenceCount} missing presence records.`);
}
