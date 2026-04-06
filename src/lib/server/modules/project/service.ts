// src/lib/server/services/project.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { ProjectRepository } from './repository';

export class ProjectService extends BaseService<table.Project, table.NewProject> {
	constructor(repository = new ProjectRepository()) {
		super(repository);
	}

	async getPaginatedProjects(
		page: number,
		limit: number,
		search?: string,
		userId?: string,
		roleName: string = '',
		clientId?: string,
		companyId?: string
	) {
		const isAdmin =
			roleName.toLowerCase().includes('admin') ||
			roleName.toLowerCase().includes('director') ||
			roleName.toLowerCase().includes('manager');

		return (this.repository as ProjectRepository).getPaginatedProjects(
			page,
			limit,
			search,
			userId,
			isAdmin,
			clientId,
			companyId
		);
	}

	async getProjectById(id: string) {
		return (this.repository as ProjectRepository).getProjectByIdWithDetails(id);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async createProject(data: any, memberIds: string[] = []) {
		return (this.repository as ProjectRepository).createWithMembers(data, memberIds);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async updateProject(id: string, data: any, memberIds: string[] = []) {
		return (this.repository as ProjectRepository).updateWithMembers(id, data, memberIds);
	}
}
