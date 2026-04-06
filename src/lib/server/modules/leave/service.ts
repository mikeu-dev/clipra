import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { LeaveRepository } from './repository';
import type { ILeaveService } from './interfaces/ILeaveService';

export class LeaveService
	extends BaseService<table.LeaveRequest, table.NewLeaveRequest>
	implements ILeaveService
{
	constructor(protected readonly repository = new LeaveRepository()) {
		super(repository);
	}

	async findAllByCompanyId(companyId: string) {
		return await this.repository.findAllByCompanyId(companyId);
	}

	async findAllByUserId(userId: string) {
		return await this.repository.findAllByUserId(userId);
	}

	async findAllByStatus(status: 'pending' | 'approved' | 'rejected') {
		return await this.repository.findAllByStatus(status);
	}

	async approve(id: string, approvedBy: string) {
		return await this.repository.update(id, {
			status: 'approved',
			approvedBy
		});
	}

	async reject(id: string, rejectedBy: string) {
		return await this.repository.update(id, {
			status: 'rejected',
			approvedBy: rejectedBy
		});
	}
}
