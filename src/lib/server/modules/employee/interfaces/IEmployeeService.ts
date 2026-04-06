import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

import type { EmployeeResponseDTO } from '../dto/employee-response.dto';

export interface IEmployeeService extends IService<
	table.Employee,
	table.NewEmployee,
	EmployeeResponseDTO
> {
	getAllWithDetails(): Promise<EmployeeResponseDTO[]>;
	updateOrganizationInfo(
		id: string,
		data: {
			reportsTo?: string | null;
			division?: string | null;
			positionId?: string | null;
			isPublic?: boolean;
		}
	): Promise<EmployeeResponseDTO>;
}
