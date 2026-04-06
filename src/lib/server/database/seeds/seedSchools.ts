// src/lib/server/db/seed/seedSchools.ts
import { SchoolService } from '../../../server/modules/school/service';
import { schools as schoolsData } from '../../../config/app';
import { db } from '../index';

const schoolService = new SchoolService();

export async function seedSchools() {
	console.log('Seeding schools...');
	for (const school of schoolsData) {
		const existing = await db.query.schools.findFirst({
			where: (t, { eq }) => eq(t.name, school.name)
		});

		if (!existing) {
			await schoolService.create({
				...school
			});
		}
	}
}
