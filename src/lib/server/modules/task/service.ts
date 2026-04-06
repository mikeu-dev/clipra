import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { TaskRepository, type TaskFilters } from './repository';

export class TaskService extends BaseService<table.Task, table.NewTask> {
	constructor(repository = new TaskRepository()) {
		super(repository);
	}

	async getByProjectId(projectId: string) {
		return (this.repository as TaskRepository).getByProjectId(projectId);
	}

	async getByProjectWithFilters(projectId: string, filters: TaskFilters) {
		return (this.repository as TaskRepository).getByProjectWithFilters(projectId, filters);
	}

	async getSubtasks(parentId: string) {
		return (this.repository as TaskRepository).getSubtasks(parentId);
	}

	async getByColumn(columnId: string) {
		return (this.repository as TaskRepository).getByColumn(columnId);
	}

	async countByColumn(columnId: string) {
		return (this.repository as TaskRepository).countByColumn(columnId);
	}

	async updateColumn(taskId: string, columnId: string) {
		return (this.repository as TaskRepository).updateColumn(taskId, columnId);
	}

	async moveTasksToNewColumn(oldColumnId: string, newColumnId: string) {
		return (this.repository as TaskRepository).moveTasksToNewColumn(oldColumnId, newColumnId);
	}

	async reorderInColumn(columnId: string, taskIds: string[]) {
		return (this.repository as TaskRepository).reorderInColumn(columnId, taskIds);
	}
}
