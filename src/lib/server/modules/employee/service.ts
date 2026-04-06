import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { IEmployeeService } from './interfaces/IEmployeeService';
import type { EmployeeRepository } from './repository';
import { EmployeeRepository as EmployeeRepositoryImpl } from './repository';
import { EmployeeMapper } from './mapper';
import type { EmployeeResponseDTO } from './dto/employee-response.dto';

export class EmployeeService
	extends BaseService<table.Employee, table.NewEmployee, EmployeeResponseDTO>
	implements IEmployeeService
{
	protected override repository: EmployeeRepository;
	protected mapper: EmployeeMapper;

	constructor(companyId?: string) {
		const repository = new EmployeeRepositoryImpl(companyId);
		const mapper = new EmployeeMapper();
		super(repository, mapper);
		this.repository = repository;
		this.mapper = mapper;
	}

	// Override getAll to ensure mapping and type safety
	async getAll(): Promise<EmployeeResponseDTO[]> {
		const entities = await this.repository.findAll();
		return entities.map((e) => this.mapper.toDTO(e));
	}

	async getAllWithDetails(): Promise<EmployeeResponseDTO[]> {
		const results = await this.repository.findAllWithDetails();
		return results.map((res) => {
			const entity = {
				...res.employee,
				user: {
					...res.user,
					avatar: res.userProfile?.avatar || undefined
				},
				position: res.position,
				shift: res.shift
			};
			return this.mapper.toDTO(entity);
		});
	}

	async getById(id: string): Promise<EmployeeResponseDTO> {
		const result = await this.repository.findById(id);
		if (!result) throw new Error('Data tidak ditemukan');
		return this.mapper.toDTO(result);
	}

	async create(data: table.NewEmployee): Promise<EmployeeResponseDTO> {
		const created = await super.create(data);
		return created as unknown as EmployeeResponseDTO;
	}

	async updateOrganizationInfo(
		id: string,
		data: {
			reportsTo?: string | null;
			division?: string | null;
			positionId?: string | null;
			isPublic?: boolean;
		}
	): Promise<EmployeeResponseDTO> {
		await this.repository.update(id, data);
		const updated = await this.getById(id);
		return updated;
	}
}
