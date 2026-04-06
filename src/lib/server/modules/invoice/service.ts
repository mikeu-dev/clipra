import { BaseService } from '$lib/server/core/base.service';
import * as table from '$lib/server/database/schemas';
import { InvoiceRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceService extends BaseService<table.Invoice, table.NewInvoice> {
	constructor(companyId?: string) {
		const repository = new InvoiceRepository(companyId);
		super(repository);
	}

	async createFullInvoice(data: table.NewInvoice, items: table.NewInvoiceItem[]) {
		const invoice = await this.create(data);

		if (items.length > 0) {
			const { db } = await import('$lib/server/database');
			const itemsWithId = items.map((i) => ({ ...i, id: uuidv4(), invoiceId: invoice.id }));
			await db.insert(table.invoiceItems).values(itemsWithId);
		}

		return this.getWithDetails(invoice.id);
	}

	async getWithDetails(id: string) {
		return (this.repository as InvoiceRepository).getWithDetails(id);
	}

	async getAllWithClient() {
		return (this.repository as InvoiceRepository).getAllWithClient();
	}

	async updateStatus(id: string, status: string) {
		await (this.repository as InvoiceRepository).updateStatus(id, status);

		if (status === 'sent') {
			const invoice = await this.getWithDetails(id);
			if (!invoice || !invoice.client) return;

			const companyId = invoice.client.companyId;

			// Integration: Create Journal Entry
			const { AccountingService } = await import('$lib/server/modules/accounting/service');
			const accountingService = new AccountingService();

			// 1. Find Accounts
			if (invoice.type === 'in_invoice') {
				// VENDOR BILL: Debit Expense, Credit Payable
				const expenseAccount = await accountingService.getAccountByType(companyId, 'expense');
				const payableAccount = await accountingService.getAccountByType(companyId, 'payable');
				const purchaseJournal = (await accountingService.getJournals(companyId)).find(
					(j) => j.type === 'purchase'
				);

				if (!expenseAccount || !payableAccount || !purchaseJournal) {
					console.warn(
						'Accounting Integration Skipped: Missing Expense/Payable account or Purchase Journal'
					);
					return;
				}

				await accountingService.createEntry(
					{
						companyId: companyId,
						journalId: purchaseJournal.id,
						reference: invoice.number,
						number: invoice.number,
						date: new Date(invoice.issueDate),
						state: 'posted'
					},
					[
						{
							// Debit Expense
							accountId: expenseAccount.id,
							debit: invoice.total,
							credit: '0',
							name: `Bill ${invoice.number}`
						},
						{
							// Credit Payable
							accountId: payableAccount.id,
							debit: '0',
							credit: invoice.total,
							name: `Vendor Bill - ${invoice.client.name}`
						}
					]
				);
			} else {
				// CUSTOMER INVOICE: Debit Receivable, Credit Income
				const receivableAccount = await accountingService.getAccountByType(companyId, 'receivable');
				const incomeAccount = await accountingService.getAccountByType(companyId, 'income');
				const journals = await accountingService.getJournals(companyId);
				const salesJournal = journals.find((j) => j.type === 'sale') || journals[0];

				if (!receivableAccount || !incomeAccount || !salesJournal) {
					console.warn(
						'Accounting Integration Skipped: Missing Receivable/Income account or Sales Journal'
					);
					return;
				}

				await accountingService.createEntry(
					{
						companyId: companyId,
						journalId: salesJournal.id,
						reference: `Invoice ${invoice.number} - ${invoice.client.name}`,
						number: invoice.number,
						date: new Date(invoice.issueDate),
						state: 'posted'
					},
					[
						{
							// Debit Receivable
							accountId: receivableAccount.id,
							debit: invoice.total,
							credit: '0',
							name: `Invoice ${invoice.number}`
						},
						{
							// Credit Income
							accountId: incomeAccount.id,
							debit: '0',
							credit: invoice.total,
							name: `Product Sales`
						}
					]
				);
			}
		}
	}
}
