import { db } from '$lib/server/database';
import { projectColumns } from '$lib/server/database/schemas';
import type { NewProjectColumn, ProjectColumn } from '$lib/server/database/schemas';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export class ProjectColumnRepository {
	async getByProject(projectId: string): Promise<ProjectColumn[]> {
		return db
			.select()
			.from(projectColumns)
			.where(eq(projectColumns.projectId, projectId))
			.orderBy(asc(projectColumns.position));
	}

	async getById(id: string): Promise<ProjectColumn | undefined> {
		const result = await db.select().from(projectColumns).where(eq(projectColumns.id, id)).limit(1);
		return result[0];
	}

	async create(data: Omit<NewProjectColumn, 'id'>): Promise<ProjectColumn> {
		const id = uuid();
		await db.insert(projectColumns).values({ ...data, id });
		return this.getById(id) as Promise<ProjectColumn>;
	}

	async createMany(data: Omit<NewProjectColumn, 'id'>[]): Promise<void> {
		const items = data.map((d) => ({ ...d, id: uuid() }));
		await db.insert(projectColumns).values(items);
	}

	async update(id: string, data: Partial<NewProjectColumn>): Promise<ProjectColumn | undefined> {
		await db.update(projectColumns).set(data).where(eq(projectColumns.id, id));
		return this.getById(id);
	}

	async delete(id: string): Promise<void> {
		await db.delete(projectColumns).where(eq(projectColumns.id, id));
	}

	async reorder(projectId: string, columnIds: string[]): Promise<void> {
		for (let i = 0; i < columnIds.length; i++) {
			await db
				.update(projectColumns)
				.set({ position: i })
				.where(eq(projectColumns.id, columnIds[i]));
		}
	}
}
