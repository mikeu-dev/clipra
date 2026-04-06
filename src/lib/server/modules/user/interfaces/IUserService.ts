// src/lib/server/services/interfaces/IUserService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';
import type { UpdateUserPasswordDTO } from '$lib/server/modules/user/dto/update-user-password.dto';
import type { UserResponseDTO } from '$lib/server/modules/user/dto/user-response.dto';
import type { UpdateUserRoleDTO } from '$lib/server/modules/user/dto/update-user-role.dto';

export interface IUserService extends IService<table.User, table.NewUser, UserResponseDTO> {
	updatePassword(dto: UpdateUserPasswordDTO): Promise<void>;
	updateRole(dto: UpdateUserRoleDTO): Promise<void>;
	getPaginatedWithDetails(
		page: number,
		limit: number,
		search?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }>;
}
