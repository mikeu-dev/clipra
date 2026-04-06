// src/lib/server/db/seed/seedStages.ts
import { StageService } from '../../../server/modules/stage/service';
import { stages as stagesData } from '../../../config/app';
import { db } from '../index';

const stageService = new StageService();

export async function seedStages() {
	console.log('Seeding stages...');
	for (const stage of stagesData) {
		const existing = await db.query.stages.findFirst({
			where: (t, { eq }) => eq(t.name, stage.name)
		});

		if (!existing) {
			await stageService.create({
				...stage
			});
		}
	}
}
