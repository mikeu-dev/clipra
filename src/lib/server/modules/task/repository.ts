import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { ITaskRepository } from './interfaces/ITaskRepository';
import { db } from '$lib/server/database';
import { eq, and, isNull, lte, gte, asc } from 'drizzle-orm';

export interface TaskFilters {
	assignee?: string;
	priority?: 'low' | 'medium' | 'high';
	columnId?: string;
	deadlineBefore?: Date;
	deadlineAfter?: Date;
}

export class TaskRepository
	extends BaseRepository<typeof table.tasks, table.Task, table.NewTask>
	implements ITaskRepository
{
	constructor() {
		super(table.tasks);
	}

	async getByProjectId(projectId: string): Promise<table.Task[]> {
		return await db.query.tasks.findMany({
			where: and(
				eq(table.tasks.projectId, projectId),
				isNull(table.tasks.parentId), // hanya parent tasks
				isNull(table.tasks.deletedAt)
			),
			orderBy: (tasks, { asc }) => [asc(tasks.position), asc(tasks.createdAt)],
			with: {
				assignee: true,
				column: true,
				subtasks: {
					with: {
						assignee: true
					}
				}
			}
		});
	}

	async getByProjectWithFilters(projectId: string, filters: TaskFilters): Promise<table.Task[]> {
		const conditions = [
			eq(table.tasks.projectId, projectId),
			isNull(table.tasks.parentId),
			isNull(table.tasks.deletedAt)
		];

		if (filters.assignee) {
			conditions.push(eq(table.tasks.assignedTo, filters.assignee));
		}
		if (filters.priority) {
			conditions.push(eq(table.tasks.priority, filters.priority));
		}
		if (filters.columnId) {
			conditions.push(eq(table.tasks.columnId, filters.columnId));
		}
		if (filters.deadlineBefore) {
			conditions.push(lte(table.tasks.deadline, filters.deadlineBefore));
		}
		if (filters.deadlineAfter) {
			conditions.push(gte(table.tasks.deadline, filters.deadlineAfter));
		}

		return await db.query.tasks.findMany({
			where: and(...conditions),
			orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
			with: {
				assignee: true,
				column: true,
				subtasks: {
					with: {
						assignee: true
					}
				}
			}
		});
	}

	async getSubtasks(parentId: string): Promise<table.Task[]> {
		return await db.query.tasks.findMany({
			where: and(eq(table.tasks.parentId, parentId), isNull(table.tasks.deletedAt)),
			orderBy: [asc(table.tasks.createdAt)],
			with: {
				assignee: true
			}
		});
	}

	async getByColumn(columnId: string): Promise<table.Task[]> {
		return await db.query.tasks.findMany({
			where: and(
				eq(table.tasks.columnId, columnId),
				isNull(table.tasks.parentId),
				isNull(table.tasks.deletedAt)
			),
			with: {
				assignee: true,
				subtasks: true
			}
		});
	}

	async countByColumn(columnId: string): Promise<number> {
		const tasks = await this.getByColumn(columnId);
		return tasks.length;
	}

	async updateColumn(taskId: string, columnId: string): Promise<void> {
		await db.update(table.tasks).set({ columnId }).where(eq(table.tasks.id, taskId));
	}

	async moveTasksToNewColumn(oldColumnId: string, newColumnId: string): Promise<void> {
		await db
			.update(table.tasks)
			.set({ columnId: newColumnId })
			.where(eq(table.tasks.columnId, oldColumnId));
	}

	async reorderInColumn(columnId: string, taskIds: string[]): Promise<void> {
		for (let i = 0; i < taskIds.length; i++) {
			await db
				.update(table.tasks)
				.set({ position: i })
				.where(and(eq(table.tasks.id, taskIds[i]), eq(table.tasks.columnId, columnId)));
		}
	}
}
