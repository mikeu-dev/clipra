import { BaseService } from '$lib/server/core/base.service';
import * as table from '$lib/server/database/schemas';
import { ExpenseRepository } from './repository';

export class ExpenseService extends BaseService<table.Expense, table.NewExpense> {
	constructor(companyId?: string) {
		const repository = new ExpenseRepository(companyId);
		super(repository);
	}

	async getAllWithDetails() {
		return (this.repository as ExpenseRepository).getAllWithDetails();
	}
}
