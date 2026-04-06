import { BaseRepository } from '../../core/base.repository';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database';

export class PayrollBatchRepository extends BaseRepository<
	typeof table.payrollBatches,
	table.PayrollBatch,
	table.NewPayrollBatch
> {
	constructor() {
		super(table.payrollBatches);
	}

	async findAllByCompanyId(companyId: string) {
		return await db
			.select()
			.from(table.payrollBatches)
			.where(eq(table.payrollBatches.companyId, companyId));
	}
}

export class PayrollRepository extends BaseRepository<
	typeof table.payrolls,
	table.Payroll,
	table.NewPayroll
> {
	constructor() {
		super(table.payrolls);
	}

	async findByBatchId(batchId: string) {
		return await db
			.select({
				payroll: table.payrolls,
				employee: table.employees,
				user: table.users
			})
			.from(table.payrolls)
			.innerJoin(table.employees, eq(table.payrolls.employeeId, table.employees.id))
			.innerJoin(table.users, eq(table.employees.userId, table.users.id))
			.where(eq(table.payrolls.batchId, batchId));
	}

	async updateGatewayInfo(
		id: string,
		data: {
			gatewayRefId?: string;
			gatewayStatus?: string;
			status?: 'pending' | 'processing' | 'paid' | 'failed';
		}
	) {
		return await db.update(table.payrolls).set(data).where(eq(table.payrolls.id, id));
	}
}
