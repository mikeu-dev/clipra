// src/lib/server/db/seed/seedReligions.ts
import { ReligionService } from '../../../server/modules/religion/service';
import { religions as religionsData } from '../../../config/app';
import { db } from '../index';

const religionService = new ReligionService();

export async function seedReligions() {
	console.log('Seeding religions...');
	for (const religion of religionsData) {
		const existing = await db.query.religions.findFirst({
			where: (t, { eq }) => eq(t.name, religion.name)
		});

		if (!existing) {
			await religionService.create({
				...religion
			});
		}
	}
}
