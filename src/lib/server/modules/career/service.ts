import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import type { ICareerService } from './interfaces/ICareerService';
import { CareerRepository } from './repository';

export class CareerService extends BaseService<table.Job, table.NewJob> implements ICareerService {
	constructor(repository = new CareerRepository()) {
		super(repository);
	}

	async getPaginated(
		page: number,
		limit: number,
		search?: string,
		status?: 'published' | 'draft' | 'closed'
	) {
		return (this.repository as CareerRepository).getPaginated(page, limit, search, status);
	}

	async getById(id: string) {
		const item = await (this.repository as CareerRepository).getById(id);
		if (!item) throw new Error('Job not found');
		return item;
	}

	async getBySlug(slug: string) {
		return (this.repository as CareerRepository).getBySlug(slug);
	}

	async getApplicants(jobId: string) {
		return (this.repository as CareerRepository).getApplicants(jobId);
	}

	async updateApplicantStatus(id: string, status: string) {
		return (this.repository as CareerRepository).updateApplicantStatus(id, status);
	}

	async createApplicant(data: table.NewJobApplicant) {
		return (this.repository as CareerRepository).createApplicant(data);
	}
}
