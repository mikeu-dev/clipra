import * as table from '$lib/server/database/schemas';
import { PayrollBatchRepository, PayrollRepository } from './repository';
import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/database';
import { eq, and, isNull, sql, gte, lte, count } from 'drizzle-orm';
import { generateId } from '$lib/utils/useUserId';
import { EmailService } from '../email/service';
import { ExpenseRepository } from '../expense/repository';
import { PaymentGatewayFactory } from './payment-gateways/factory';

export class PayrollService {
	private batchRepo: PayrollBatchRepository;
	private payrollRepo: PayrollRepository;

	constructor() {
		this.batchRepo = new PayrollBatchRepository();
		this.payrollRepo = new PayrollRepository();
	}

	async getAllBatches(companyId: string) {
		return await this.batchRepo.findAllByCompanyId(companyId);
	}

	async getBatchById(id: string) {
		return await this.batchRepo.findById(id);
	}

	async getPayrollsByBatchId(batchId: string) {
		return await this.payrollRepo.findByBatchId(batchId);
	}

	async getPayrollById(id: string) {
		const results = await db
			.select({
				payroll: table.payrolls,
				employee: table.employees,
				user: table.users
			})
			.from(table.payrolls)
			.innerJoin(table.employees, eq(table.payrolls.employeeId, table.employees.id))
			.innerJoin(table.users, eq(table.employees.userId, table.users.id))
			.where(eq(table.payrolls.id, id))
			.limit(1);
		return results[0] || null;
	}

	async generatePayrollBatch(companyId: string, name: string, period: Date) {
		// 1. Create batch
		const batchId = generateId();
		await this.batchRepo.create({
			id: batchId,
			companyId,
			name,
			period: period, // Drizzle date accepts Date object for MySql date column
			status: 'draft'
		});

		// 2. Get all active employees for this company
		const employees = await db
			.select({
				employee: table.employees,
				user: table.users
			})
			.from(table.employees)
			.innerJoin(table.users, eq(table.employees.userId, table.users.id))
			.where(
				and(eq(table.employees.companyId, companyId), eq(table.employees.status, 'permanent'))
			);

		// Also include probation if desired
		const probationEmployees = await db
			.select({
				employee: table.employees,
				user: table.users
			})
			.from(table.employees)
			.innerJoin(table.users, eq(table.employees.userId, table.users.id))
			.where(
				and(eq(table.employees.companyId, companyId), eq(table.employees.status, 'probation'))
			);

		const allEmployees = [...employees, ...probationEmployees];

		// 2.5 Validation: Ensure all employees have a base salary
		const missingSalaryEmployees: string[] = [];
		const employeeSalariesMap = new Map<string, number>();

		for (const { employee, user } of allEmployees) {
			const salaries = await db
				.select()
				.from(table.employeeSalaries)
				.where(
					and(
						eq(table.employeeSalaries.employeeId, employee.id),
						isNull(table.employeeSalaries.endDate)
					)
				)
				.limit(1);

			if (salaries.length === 0 || !salaries[0].amount) {
				missingSalaryEmployees.push(user.name || employee.id);
			} else {
				employeeSalariesMap.set(employee.id, parseFloat(salaries[0].amount));
			}
		}

		if (missingSalaryEmployees.length > 0) {
			throw new Error(
				`Gagal membuat payroll: Karyawan berikut belum memiliki Gaji Pokok aktif: ${missingSalaryEmployees.join(', ')}. Silakan atur gaji pokok mereka terlebih dahulu.`
			);
		}

		// 3. For each employee, create payroll record
		for (const { employee, user } of allEmployees) {
			const baseSalary = employeeSalariesMap.get(employee.id) || 0;

			// Calculate working days in period (assume 22 working days per month)
			const workingDaysInMonth = 22;
			const dailyRate = baseSalary / workingDaysInMonth;

			// Get attendance data for this period
			const periodStart = new Date(period.getFullYear(), period.getMonth(), 1);
			const periodEnd = new Date(period.getFullYear(), period.getMonth() + 1, 0);

			const periods = await db
				.select({
					count: count(),
					totalLate: sql<string | null>`sum(${table.presences.late})`,
					totalOvertime: sql<string | null>`sum(${table.presences.overtime})`
				})
				.from(table.presences)
				.where(
					and(
						eq(table.presences.userId, employee.userId),
						gte(table.presences.time, periodStart),
						lte(table.presences.time, periodEnd),
						eq(table.presences.category, 'in')
					)
				);

			const presentDays = periods[0]?.count ?? 0;
			const totalLateMinutes = Number(periods[0]?.totalLate || 0);
			const totalOvertimeMinutes = Number(periods[0]?.totalOvertime || 0);

			// 2.6 Fetch Approved Leaves
			const leaves = await db
				.select()
				.from(table.leaveRequests)
				.where(
					and(
						eq(table.leaveRequests.userId, employee.userId),
						eq(table.leaveRequests.status, 'approved'),
						// Overlap Check (simplified: start or end within period)
						// Ideally: leaveStart <= periodEnd AND leaveEnd >= periodStart
						gte(table.leaveRequests.endDate, periodStart),
						lte(table.leaveRequests.startDate, periodEnd)
					)
				);

			let paidLeaveDays = 0;
			for (const leave of leaves) {
				// Determine overlapping days
				const start = leave.startDate < periodStart ? periodStart : new Date(leave.startDate);
				const end = leave.endDate > periodEnd ? periodEnd : new Date(leave.endDate);

				// Calculate days diff (inclusive)
				if (start <= end) {
					const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

					// Only count if type is NOT unpaid (annual, sick, other assumed paid)
					if (leave.type !== 'unpaid') {
						paidLeaveDays += days;
					}
				}
			}

			const absentDays = Math.max(0, workingDaysInMonth - presentDays - paidLeaveDays);
			const absenceDeduction = absentDays * dailyRate;
			// Late deduction rule: 1000 IDR per minute (example)
			const lateDeduction = totalLateMinutes * 1000;
			// Overtime Pay rule: 2000 IDR per minute (example)
			const overtimePay = totalOvertimeMinutes * 2000;

			// Get employee salary components
			const components = await db
				.select({
					assignment: table.employeeSalaryComponents,
					component: table.salaryComponents
				})
				.from(table.employeeSalaryComponents)
				.innerJoin(
					table.salaryComponents,
					eq(table.employeeSalaryComponents.componentId, table.salaryComponents.id)
				)
				.where(
					and(
						eq(table.employeeSalaryComponents.employeeId, employee.id),
						eq(table.employeeSalaryComponents.isActive, true)
					)
				);

			// Calculate allowances and deductions
			let totalAllowance = 0;
			let totalDeduction = 0;
			const componentDetails: { name: string; type: string; amount: number; accountId?: string }[] =
				[];

			for (const { assignment, component } of components) {
				let amount = parseFloat(assignment.amount || '0');

				// If percentage, calculate from base salary
				if (component.calculationType === 'percentage') {
					amount = (baseSalary * amount) / 100;
				}

				if (component.type === 'allowance') {
					totalAllowance += amount;
				} else {
					totalDeduction += amount;
				}

				componentDetails.push({
					name: component.name,
					type: component.type,
					amount,
					accountId: component.accountId || undefined // Store for accounting integration
				});
			}

			// Add absence deduction to total
			totalDeduction += absenceDeduction;
			if (absenceDeduction > 0) {
				componentDetails.push({
					name: `Potongan Absen (${absentDays} hari)`,
					type: 'deduction',
					amount: absenceDeduction
				});
			}

			// Add late deduction
			totalDeduction += lateDeduction;
			if (lateDeduction > 0) {
				componentDetails.push({
					name: `Potongan Terlambat (${totalLateMinutes} menit)`,
					type: 'deduction',
					amount: lateDeduction
				});
			}

			// Add Overtime Pay
			totalAllowance += overtimePay;
			if (overtimePay > 0) {
				componentDetails.push({
					name: `Uang Lembur (${totalOvertimeMinutes} menit)`,
					type: 'allowance',
					amount: overtimePay
				});
			}

			const netSalary = baseSalary + totalAllowance - totalDeduction;

			await this.payrollRepo.create({
				id: generateId(),
				batchId,
				employeeId: employee.id,
				baseSalary: baseSalary.toFixed(2),
				totalAllowance: totalAllowance.toFixed(2),
				totalDeduction: totalDeduction.toFixed(2),
				netSalary: netSalary.toFixed(2),
				details: {
					employeeName: user.name,
					components: componentDetails,
					presentDays,
					absentDays,
					workingDaysInMonth
				},
				status: 'pending'
			});
		}

		return { batchId, employeeCount: allEmployees.length };
	}

	private async logPaymentActivity(payrollId: string, action: string, payload: unknown) {
		try {
			await db.insert(table.payrollPaymentLogs).values({
				id: generateId(),
				payrollId,
				action,
				payload
			});
		} catch (error) {
			console.error(`[Payroll] Failed to log payment activity:`, error);
		}
	}

	async verifyEmployeeAccount(employeeId: string) {
		const employee = await db
			.select()
			.from(table.employees)
			.where(eq(table.employees.id, employeeId))
			.limit(1);

		if (!employee[0] || !employee[0].bankName || !employee[0].bankAccountNumber) {
			throw new Error('Employee bank details missing');
		}

		// Lookup bank code
		let bankCode = 'MOCK';
		const bankMatch = await db
			.select()
			.from(table.banks)
			.where(eq(table.banks.name, employee[0].bankName))
			.limit(1);
		if (bankMatch.length > 0) {
			bankCode = bankMatch[0].code;
		}

		const paymentGateway = PaymentGatewayFactory.getProvider();
		const result = await paymentGateway.inquiryAccount(bankCode, employee[0].bankAccountNumber);

		return result;
	}

	async updateBatchStatus(batchId: string, status: 'draft' | 'processed' | 'paid' | 'cancelled') {
		return await this.batchRepo.update(batchId, { status });
	}

	async markPayrollAsPaid(payrollId: string) {
		return await this.payrollRepo.update(payrollId, { status: 'paid', paidAt: new Date() });
	}

	async processBatchPayment(batchId: string) {
		const batch = await this.getBatchById(batchId);
		if (!batch) throw new Error('Batch not found');
		if (batch.status === 'paid') throw new Error('Batch already paid');

		const payrolls = await this.getPayrollsByBatchId(batchId);
		const totalAmount = payrolls.reduce(
			(sum, p) => sum + parseFloat(p.payroll.netSalary ?? '0'),
			0
		);

		// const expenseRepo = new ExpenseRepository(batch.companyId);
		const paymentGateway = PaymentGatewayFactory.getProvider();

		// 1. Create Expense Record (REMOVED: Now individual expense created in webhook upon success)
		// Removing the following block to improve financial accuracy
		/*
		await expenseRepo.create({
			id: generateId(),
			userId, // Current user who processed the payment
			projectId: null, // Oversight/Overhead expense
			category: 'Payroll',
			description: `Payroll Batch: ${batch.name} (${batch.period})`,
			amount: totalAmount.toFixed(2),
			date: new Date(),
			status: 'paid'
		});
		*/

		// 2. Process each payroll
		for (const p of payrolls) {
			// Skip if already paid or processing
			if (p.payroll.status === 'paid' || p.payroll.status === 'processing') {
				continue;
			}

			// Update status to processing first (Idempotency)
			await this.payrollRepo.updateGatewayInfo(p.payroll.id, {
				status: 'processing'
			});

			// 2a. Lookup Bank Code (Synchronize with master data)
			let bankCode = 'MOCK';
			if (p.employee.bankName) {
				const bankMatch = await db
					.select()
					.from(table.banks)
					.where(eq(table.banks.name, p.employee.bankName))
					.limit(1);
				if (bankMatch.length > 0) {
					bankCode = bankMatch[0].code;
				}
			}

			// 2b. Call Payment Gateway Disbursement
			try {
				const disbursement = await paymentGateway.createDisbursement({
					bankCode: bankCode,
					accountNumber: p.employee.bankAccountNumber || '0000000',
					amount: parseFloat(p.payroll.netSalary ?? '0'),
					description: `Gaji ${batch.name} - ${p.user.name}`,
					externalId: p.payroll.id,
					idempotencyKey: p.payroll.id
				});

				// Save Gateway Reference ID
				await this.payrollRepo.updateGatewayInfo(p.payroll.id, {
					gatewayRefId: disbursement.id,
					gatewayStatus: disbursement.status
				});

				// Log Request
				await this.logPaymentActivity(p.payroll.id, 'request_disbursement', {
					gateway: PaymentGatewayFactory.getProvider().constructor.name,
					disbursementId: disbursement.id,
					status: disbursement.status,
					raw: disbursement.rawResponse
				});

				console.log(`[Payroll] Disbursement created for ${p.user.name}:`, disbursement.id);
			} catch (error: unknown) {
				const err = error as { message?: string };
				console.error(`[Payroll] Gateway error for ${p.user.name}:`, error);
				// Mark as failed if gateway rejected it immediately
				await this.payrollRepo.updateGatewayInfo(p.payroll.id, {
					status: 'failed',
					gatewayStatus: err?.message || 'GATEWAY_ERROR'
				});

				// Log Error
				await this.logPaymentActivity(p.payroll.id, 'error', {
					message: (error as { message?: string })?.message,
					stack: (error as { stack?: string })?.stack
				});
			}
		}

		// Don't mark batch as 'paid' yet.
		// It will be updated by webhook when all payrolls are 'paid'.
		// Or we can mark it as 'processed' if we have that state.
		await this.updateBatchStatus(batchId, 'processed');

		return { success: true, totalAmount, count: payrolls.length };
	}

	async handleGatewayWebhook(payload: {
		externalId: string;
		status: 'success' | 'failed';
		gatewayStatus: string;
	}) {
		const { externalId, status, gatewayStatus } = payload;

		const payrollData = await this.getPayrollById(externalId);
		if (!payrollData) {
			console.error(`[Webhook] Payroll not found for ID: ${externalId}`);
			return;
		}

		if (payrollData.payroll.status === 'paid') {
			console.log(`[Webhook] Payroll ${externalId} already paid. Skipping.`);
			return;
		}

		const newStatus = status === 'success' ? 'paid' : 'failed';

		await this.payrollRepo.updateGatewayInfo(externalId, {
			status: newStatus,
			gatewayStatus: gatewayStatus
		});

		// Log Webhook Receipt
		await this.logPaymentActivity(externalId, 'webhook_callback', {
			status,
			gatewayStatus,
			payload
		});

		if (newStatus === 'paid') {
			await this.payrollRepo.update(externalId, { paidAt: new Date() });

			// 1. Create Individual Expense Record for this payment
			const expenseRepo = new ExpenseRepository(payrollData.employee.companyId);
			try {
				await expenseRepo.create({
					id: generateId(),
					userId: payrollData.employee.userId, // Referencing the employee's user for the record
					projectId: null,
					category: 'Payroll',
					description: `Payroll Payout: ${payrollData.user.name} - ${payrollData.payroll.id}`,
					amount: payrollData.payroll.netSalary ?? '0',
					date: new Date(),
					status: 'paid'
				});
			} catch (err) {
				console.error(`[Webhook] Failed to create expense for payroll ${externalId}:`, err);
			}

			// 2. Send Email Notification
			const emailService = new EmailService();
			try {
				if (payrollData.user.email) {
					await emailService.sendPayslip(
						payrollData.user.email,
						payrollData.user.name || '',
						new Date(payrollData.payroll.createdAt ?? new Date()).toLocaleDateString('id-ID', {
							month: 'long',
							year: 'numeric'
						}),
						payrollData.payroll.netSalary ?? '0'
					);
				}
			} catch (error) {
				console.error(`Failed to send email to ${payrollData.user.email}:`, error);
			}
		}

		// Check if all payrolls in the batch are finished
		const batchPayrolls = await this.getPayrollsByBatchId(payrollData.payroll.batchId);
		const allFinished = batchPayrolls.every(
			(p) => p.payroll.status === 'paid' || p.payroll.status === 'failed'
		);
		const anyPaid = batchPayrolls.some((p) => p.payroll.status === 'paid');

		if (allFinished && anyPaid) {
			// If all are finished, we mark batch as 'paid' or similar status.
			await this.updateBatchStatus(payrollData.payroll.batchId, 'paid');

			// INTEGRATION: Create Accounting Journal Entry for the whole batch
			try {
				await this.createPayrollJournal(payrollData.payroll.batchId);
			} catch (err) {
				console.error(
					`[Payroll] Failed to create journal for batch ${payrollData.payroll.batchId}:`,
					err
				);
			}
		} else if (allFinished) {
			// All finished but none paid (all failed?)
			await this.updateBatchStatus(payrollData.payroll.batchId, 'processed');
		}
	}

	private async createPayrollJournal(batchId: string) {
		const batch = await this.getBatchById(batchId);
		if (!batch || !batch.status?.includes('paid')) return; // Ensure batch is effectively paid

		const payrolls = await this.getPayrollsByBatchId(batchId);
		const { AccountingService } = await import('../accounting/service');
		const accountingService = new AccountingService();
		const companyId = batch.companyId;

		// 1. Get Accounts (Cache for performance)
		const expenseAccount = await accountingService.getAccountByType(companyId, 'expense'); // Fallback
		const bankAccount = await accountingService.getAccountByType(companyId, 'bank');

		if (!bankAccount) {
			console.error('[Payroll] Missing Bank Account for Journal Entry');
			return;
		}

		// 2. Aggregate Debits (Expenses)
		// Map: AccountID -> Amount
		const debits = new Map<string, number>();
		let totalCredit = 0; // Net Salary to Bank

		for (const p of payrolls) {
			if (p.payroll.status !== 'paid') continue;

			// Net Salary -> Credit Bank
			const net = parseFloat(p.payroll.netSalary || '0');
			totalCredit += net;

			// Base Salary -> Debit Salary Expense (Need a default account if not mapped)
			const base = parseFloat(p.payroll.baseSalary || '0');
			// Assuming we have a default Salary Expense Account or logic to find it
			// For now, let's use the generic expense account if no specific mapping
			const defaultSalaryAccountId = expenseAccount?.id;

			if (defaultSalaryAccountId) {
				debits.set(defaultSalaryAccountId, (debits.get(defaultSalaryAccountId) || 0) + base);
			}

			// Components
			const details = p.payroll.details as {
				components?: { type: string; amount: string; accountId?: string }[];
			};
			if (details && details.components) {
				for (const comp of details.components) {
					const amount = parseFloat(comp.amount);
					if (comp.type === 'allowance') {
						// Allowance = Expense
						const accId = comp.accountId || defaultSalaryAccountId;
						if (accId) {
							debits.set(accId, (debits.get(accId) || 0) + amount);
						}
					} else if (comp.type === 'deduction') {
						// Deduction = Reduces Expense? Or Credit Liability?
						// Usually: Debit Expense (Gross), Credit Bank (Net), Credit Deduction (Liability/Tax)
						// But here we are building from Net + Components.
						// Formula: Net = Base + Allowances - Deductions
						// Journal:
						// Debit Expenses (Base + Allowances)
						// Credit Bank (Net)
						// Credit Deductions (Liabilities) -> e.g. Tax Payable
						// So Deductions are CREDITS.
						// const accId = comp.accountId; // e.g. Tax Payable account
						// We need to handle this differently.
						// Let's simplified: We debit the FULL expense, and credit the deduction liability.
						// But we already added Base to Debits.
						// Logic needs refinement.
					}
				}
			}
		}

		// REVISIT LOGIC:
		// A standard payroll journal:
		// Dr. Salary Expense (Gross: Base + Allowances)
		// Cr. Bank (Net Pay)
		// Cr. Tax Payable (Deductions)
		// Cr. BPJS Payable (Deductions)

		// Let's rebuild the loop
		debits.clear();
		const credits = new Map<string, number>(); // For liabilities
		credits.set(bankAccount.id, totalCredit); // Bank

		for (const p of payrolls) {
			if (p.payroll.status !== 'paid') continue;

			const base = parseFloat(p.payroll.baseSalary || '0');
			// Default Salary Expense
			const defaultAccId = expenseAccount?.id;
			if (defaultAccId) debits.set(defaultAccId, (debits.get(defaultAccId) || 0) + base);

			const details = p.payroll.details as {
				components?: { type: string; amount: string; accountId?: string }[];
			};
			if (details && details.components) {
				for (const comp of details.components) {
					const amount = parseFloat(comp.amount);
					if (comp.type === 'allowance') {
						// Dr. Expense
						const accId = comp.accountId || defaultAccId;
						if (accId) debits.set(accId, (debits.get(accId) || 0) + amount);
					} else {
						// Cr. Liability (Deduction)
						// If no account mapped, we treat it as contra-expense? Or just ignore (implies it stays in expense)?
						// No, deduction MUST check out mathematically.
						// Net = (Base + Allowances) - Deductions
						// Dr (Base + Allowances) = Cr (Net) + Cr (Deductions)
						const accId = comp.accountId; // Must have liability account
						if (accId) {
							credits.set(accId, (credits.get(accId) || 0) + amount);
						} else {
							// If no account, maybe it's just a deduction that reduces the expense directly?
							// But we debited the Base Salary fully.
							// Fallback: Credit the default expense account (Contra-expense)
							if (defaultAccId)
								credits.set(defaultAccId, (credits.get(defaultAccId) || 0) + amount);
						}
					}
				}
			}
		}

		// 3. Create Journal Entries
		const purchaseJournal =
			(await accountingService.getJournals(companyId)).find((j) => j.type === 'purchase') ||
			(await accountingService.getJournals(companyId))[0];

		if (!purchaseJournal) return;

		const journalItems: Omit<
			table.NewJournalItem,
			'id' | 'journalEntryId' | 'createdAt' | 'companyId' | 'date'
		>[] = [];

		// Debits
		for (const [accId, amount] of debits.entries()) {
			if (amount > 0) {
				journalItems.push({
					accountId: accId,
					debit: amount.toFixed(2),
					credit: '0',
					name: `Payroll Expenses - ${batch.name}`
				});
			}
		}

		// Credits
		for (const [accId, amount] of credits.entries()) {
			if (amount > 0) {
				journalItems.push({
					accountId: accId,
					debit: '0',
					credit: amount.toFixed(2),
					name: accId === bankAccount.id ? `Payroll Payment - ${batch.name}` : `Payroll Deductions`
				});
			}
		}

		await accountingService.createEntry(
			{
				companyId,
				journalId: purchaseJournal.id,
				reference: `Payroll ${batch.name}`,
				number: `PAY/${batch.period}`, // improved numbering needed
				date: new Date(),
				state: 'posted'
			},
			journalItems
		);

		console.log(`[Payroll] Journal Entry created for batch ${batch.name}`);
	}

	async getBankTransferCsv(batchId: string) {
		const payrolls = await this.getPayrollsByBatchId(batchId);

		// Header CSV
		let csv = `${m.export_csv_emp_name()},${m.export_csv_bank_name()},${m.export_csv_account_num()},${m.export_csv_amount()},${m.export_csv_description()}\n`;

		for (const p of payrolls) {
			// In a real system, we'd fetch the employee's bank details.
			// For now, we'll assume they might be in the 'details' or we use placeholders if not available.
			const bankName = p.employee.bankName || '-';
			const accountNumber = p.employee.bankAccountNumber || '-';

			csv += `"${p.user.name}","${bankName}","${accountNumber}",${p.payroll.netSalary},"${m.export_csv_salary_period()} ${p.payroll.id}"\n`;
		}

		return csv;
	}
}
