import type * as table from '$lib/server/database/schemas';

export interface ITaskRepository {
	findAll(): Promise<table.Task[]>;
	findById(id: string): Promise<table.Task | null>;
	create(data: table.NewTask): Promise<table.Task>;
	update(id: string, data: Partial<table.Task>): Promise<void>;
	delete(id: string): Promise<void>;
	getByProjectId(projectId: string): Promise<table.Task[]>;
}
