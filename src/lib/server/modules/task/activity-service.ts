import { db } from '$lib/server/database';
import { taskActivities } from '$lib/server/database/schemas';
import type { NewTaskActivity, TaskActivity } from '$lib/server/database/schemas';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export class TaskActivityService {
	async logActivity(data: Omit<NewTaskActivity, 'id'>): Promise<TaskActivity> {
		const id = uuid();
		await db.insert(taskActivities).values({ ...data, id } as NewTaskActivity);
		const result = await db.select().from(taskActivities).where(eq(taskActivities.id, id)).limit(1);
		return result[0];
	}

	async getByTask(taskId: string): Promise<TaskActivity[]> {
		return await db
			.select()
			.from(taskActivities)
			.where(eq(taskActivities.taskId, taskId))
			.orderBy(desc(taskActivities.createdAt));
	}
}

export const taskActivityService = new TaskActivityService();
