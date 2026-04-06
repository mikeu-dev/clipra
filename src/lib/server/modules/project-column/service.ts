import { TaskModule } from '$lib/server/modules/task/module';
import type { NewProjectColumn, ProjectColumn } from '$lib/server/database/schemas';
import { ProjectColumnRepository } from './repository';

const DEFAULT_COLUMNS = [
	{ name: 'Backlog', color: '#6B7280', position: 0 },
	{ name: 'Selected for Dev', color: '#3B82F6', position: 1 },
	{ name: 'In Progress', color: '#F59E0B', position: 2 },
	{ name: 'Done', color: '#10B981', position: 3 }
];

export class ProjectColumnService {
	private repository: ProjectColumnRepository;

	constructor(repository = new ProjectColumnRepository()) {
		this.repository = repository;
	}

	async getByProject(projectId: string): Promise<ProjectColumn[]> {
		return this.repository.getByProject(projectId);
	}

	async getById(id: string): Promise<ProjectColumn | undefined> {
		return this.repository.getById(id);
	}

	async create(data: Omit<NewProjectColumn, 'id'>): Promise<ProjectColumn> {
		return this.repository.create(data);
	}

	async update(id: string, data: Partial<NewProjectColumn>): Promise<ProjectColumn | undefined> {
		return this.repository.update(id, data);
	}

	async delete(id: string): Promise<void> {
		const column = await this.repository.getById(id);
		if (!column) return;

		// Cari fallback column (kolom pertama selain yang akan dihapus)
		const columns = await this.repository.getByProject(column.projectId);
		const fallbackColumn = columns.find((c) => c.id !== id);

		if (fallbackColumn) {
			const taskService = TaskModule.getService();
			// Pindahkan semua tugas ke fallback column
			await taskService.moveTasksToNewColumn(id, fallbackColumn.id);
		}

		await this.repository.delete(id);
	}

	async reorder(projectId: string, columnIds: string[]): Promise<void> {
		await this.repository.reorder(projectId, columnIds);
	}

	/**
	 * Seed default columns saat project baru dibuat
	 */
	async seedDefaultColumns(projectId: string): Promise<void> {
		const existingColumns = await this.repository.getByProject(projectId);
		if (existingColumns.length > 0) return;

		const columnsToCreate = DEFAULT_COLUMNS.map((col) => ({
			...col,
			projectId
		}));
		await this.repository.createMany(columnsToCreate);
	}

	/**
	 * Mengecek apakah kolom sudah mencapai WIP limit
	 */
	async checkWipLimit(
		columnId: string,
		currentCount: number
	): Promise<{ exceeded: boolean; limit: number | null }> {
		const column = await this.repository.getById(columnId);
		if (!column || column.wipLimit === null) {
			return { exceeded: false, limit: null };
		}
		return {
			exceeded: currentCount >= column.wipLimit,
			limit: column.wipLimit
		};
	}
}
