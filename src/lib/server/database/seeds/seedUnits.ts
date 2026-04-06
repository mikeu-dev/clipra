// src/lib/server/db/seed/seedUnits.ts
import { UnitService } from '../../../server/modules/unit/service';
import { units as unitsData } from '../../../config/app';
import { db } from '../index';

const unitService = new UnitService();

export async function seedUnits() {
	console.log('Seeding units...');
	for (const unit of unitsData) {
		const existing = await db.query.units.findFirst({
			where: (t, { eq }) => eq(t.name, unit.name)
		});

		if (!existing) {
			await unitService.create({
				...unit
			});
		}
	}
}
