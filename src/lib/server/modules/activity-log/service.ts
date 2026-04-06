// src/lib/server/services/activity-log.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { ActivityLogRepository } from './repository';
import type { IActivityLogService } from './interfaces/IActivityLogService';
import { ActivityLogRepository as ActivityLogRepositoryImpl } from './repository';
import { ActivityLogMapper } from './mapper';
import type { SafeActivityLogResponseDTO } from './dto/response.dto';
import type { WithUserDTO } from './dto/with-user.dto';
import type { ByUserDTO } from './dto/by-user.dto';
import { NotFoundException } from '../../core/exceptions';
import { UserMapper } from '../user/mapper';

export class ActivityLogService
	extends BaseService<table.ActivityLog, table.NewActivityLog, SafeActivityLogResponseDTO>
	implements IActivityLogService
{
	protected override repository: ActivityLogRepository;
	protected mapper: ActivityLogMapper;
	protected userMapper: UserMapper;

	constructor(repository = new ActivityLogRepositoryImpl(), mapper = new ActivityLogMapper()) {
		super(repository, mapper);
		this.repository = repository;
		this.mapper = mapper;
		this.userMapper = new UserMapper();
	}

	override async getAll(): Promise<SafeActivityLogResponseDTO[]> {
		// Now that the mapper is in BaseService, super.getAll() returns SafeActivityLogResponseDTO[]
		return super.getAll() as Promise<SafeActivityLogResponseDTO[]>;
	}

	override async getById(id: string): Promise<SafeActivityLogResponseDTO> {
		// super.getById() now returns SafeActivityLogResponseDTO | null
		const dto = (await super.getById(id)) as SafeActivityLogResponseDTO | null;
		if (!dto) throw new NotFoundException(`ActivityLog with id ${id} not found`);
		return dto;
	}

	override async create(
		data: Omit<table.NewActivityLog, 'id'>
	): Promise<SafeActivityLogResponseDTO> {
		// super.create should return SafeActivityLogResponseDTO because the mapper is provided to BaseService
		return (await super.create(data)) as SafeActivityLogResponseDTO;
	}

	async getAllActivityLogWithUser(): Promise<WithUserDTO[]> {
		const logsWithUser = await this.repository.findAllWithUser();
		return logsWithUser
			.filter((log) => log.user) // Filter out logs where user is null
			.map((log) => {
				const activityLogDTO = this.mapper.toDTO(log);
				const userDTO = this.userMapper.toDTO(log.user!); // We know user is not null here
				return {
					...activityLogDTO,
					user: userDTO
				};
			});
	}

	async getByUser(userId: string): Promise<ByUserDTO[]> {
		const logs = await this.repository.findByUser(userId);
		// Assuming ByUserDTO is similar to SafeActivityLogResponseDTO but maybe with user info attached elsewhere
		// For now, let's map to a structure that fits ByUserDTO.
		// If ByUserDTO is meant to be a single object summarizing user activity, this logic will need adjustment.
		// Based on its structure, it seems to be a list of activities.
		return logs.map((log) => this.mapper.toDTO(log) as ByUserDTO);
	}
}
