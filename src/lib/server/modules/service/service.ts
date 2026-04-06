import { BaseService } from '../../core/base.service';
import type * as table from '$lib/server/database/schemas';
import { ServiceRepository } from './repository';
import type { CreateServiceDTO, UpdateServiceDTO } from './dto/service.dto';

export class ServiceService extends BaseService<table.Service, table.NewService, table.Service> {
	protected override repository: ServiceRepository;

	constructor() {
		const repo = new ServiceRepository();
		super(repo);
		this.repository = repo;
	}

	async getAllByCompany(companyId: string) {
		return await this.repository.findAllByCompanyId(companyId);
	}

	async createService(dto: CreateServiceDTO) {
		return await this.create({
			...dto,
			// Fallbacks or mapping
			titleId: dto.titleId,
			titleEn: dto.titleEn || dto.titleId // Default EN to ID if missing
		});
	}

	async updateService(dto: UpdateServiceDTO) {
		const { id, ...data } = dto;
		return await this.update(id, data);
	}
}
