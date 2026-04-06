import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface ILeaveService extends IService<
	table.LeaveRequest,
	table.NewLeaveRequest,
	table.LeaveRequest
> {
	findAllByCompanyId(
		companyId: string
	): Promise<(table.LeaveRequest & { user: table.User | null })[]>;
	findAllByUserId(userId: string): Promise<table.LeaveRequest[]>;
	findAllByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<table.LeaveRequest[]>;
	approve(id: string, approvedBy: string): Promise<void>;
	reject(id: string, rejectedBy: string): Promise<void>;
}
