// src/lib/server/repositories/interfaces/IProjectRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IProjectRepository {
	findAll(): Promise<table.Project[]>;
	findById(id: string): Promise<table.Project | null>;
	create(data: table.NewProject): Promise<table.Project>;
	update(id: string, data: Partial<table.Project>): Promise<void>;
	delete(id: string): Promise<void>;
	getPaginatedProjects(
		page: number,
		limit: number,
		search?: string,
		userId?: string,
		isAdmin?: boolean,
		clientId?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getProjectByIdWithDetails(id: string): Promise<any>;
	createWithMembers(data: table.NewProject, memberIds: string[]): Promise<table.Project>;
	updateWithMembers(id: string, data: Partial<table.Project>, memberIds: string[]): Promise<void>;
}
