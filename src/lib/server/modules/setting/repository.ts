import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { and, eq } from 'drizzle-orm';

export class SettingRepository {
	async findAll() {
		return await db.select().from(table.settings);
	}

	async findById(id: string) {
		const result = await db.select().from(table.settings).where(eq(table.settings.id, id));
		return result[0] ?? null;
	}

	async findByKey(group: string, key: string) {
		return await db.query.settings.findFirst({
			where: and(eq(table.settings.group, group), eq(table.settings.key, key))
		});
	}

	async insert(data: table.NewSetting) {
		return await db.insert(table.settings).values(data);
	}

	async update(id: string, data: Partial<table.Setting>) {
		return await db.update(table.settings).set(data).where(eq(table.settings.id, id));
	}

	async delete(id: string) {
		return await db.delete(table.settings).where(eq(table.settings.id, id));
	}

	async findIdByGroupKey(group: string, key: string) {
		return await db
			.select({ id: table.settings.id })
			.from(table.settings)
			.where(and(eq(table.settings.group, group), eq(table.settings.key, key)))
			.limit(1);
	}

	async findMapByGroup(group: string): Promise<Record<string, string>> {
		const results = await db
			.select({
				key: table.settings.key,
				value: table.settings.value
			})
			.from(table.settings)
			.where(eq(table.settings.group, group));

		return Object.fromEntries(results.map((item) => [item.key, item.value]));
	}
}
