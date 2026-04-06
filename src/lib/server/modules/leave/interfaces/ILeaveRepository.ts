import type * as table from '$lib/server/database/schemas';

export interface ILeaveRepository {
	findAll(): Promise<table.LeaveRequest[]>;
	findAllByCompanyId(
		companyId: string
	): Promise<(table.LeaveRequest & { user: table.User | null })[]>;
	findAllByUserId(userId: string): Promise<table.LeaveRequest[]>;
	findAllByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<table.LeaveRequest[]>;
	findById(id: string): Promise<table.LeaveRequest | null>;
	create(data: table.NewLeaveRequest): Promise<table.LeaveRequest>;
	update(id: string, data: Partial<table.LeaveRequest>): Promise<void>;
	delete(id: string): Promise<void>;
}
