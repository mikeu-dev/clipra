// src/lib/server/services/interfaces/IActivityLogService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';
import type { ByUserDTO } from '../dto/by-user.dto';
import type { SafeActivityLogResponseDTO } from '../dto/response.dto';
import type { WithUserDTO } from '../dto/with-user.dto';

export interface IActivityLogService extends IService<
	table.ActivityLog,
	table.NewActivityLog,
	SafeActivityLogResponseDTO
> {
	getAllActivityLogWithUser(): Promise<WithUserDTO[]>;
	getByUser(userId: string): Promise<ByUserDTO[]>;
}
