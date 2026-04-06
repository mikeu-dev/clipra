import { BaseController } from '$lib/server/core/base.controller';
import { ExpenseService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ExpenseController extends BaseController<table.Expense, table.NewExpense> {
	constructor(serviceOrCompanyId?: ExpenseService | string) {
		const service =
			serviceOrCompanyId instanceof ExpenseService
				? serviceOrCompanyId
				: new ExpenseService(serviceOrCompanyId);
		super(service);
	}

	async getAllWithDetails() {
		return (this.service as ExpenseService).getAllWithDetails();
	}
}
