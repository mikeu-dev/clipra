import { desc, eq } from 'drizzle-orm';
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';

export class InvoiceRepository extends BaseRepository<
	typeof table.invoices,
	table.Invoice,
	table.NewInvoice
> {
	constructor(private companyId?: string) {
		super(table.invoices);
	}

	async getWithDetails(id: string) {
		const { db } = await import('$lib/server/database');

		// ... existing implementation ...

		// Fetch main invoice with relations manually to avoid lateral join issues
		const result = await db
			.select({
				invoice: table.invoices,
				project: table.projects,
				client: table.clients
			})
			.from(table.invoices)
			.leftJoin(table.projects, eq(table.invoices.projectId, table.projects.id))
			.leftJoin(table.clients, eq(table.invoices.clientId, table.clients.id))
			.where(eq(table.invoices.id, id))
			.limit(1);

		if (!result.length) return undefined;

		const row = result[0];

		// Verify company access if companyId is set
		if (this.companyId && row.client && row.client.companyId !== this.companyId) {
			return undefined;
		}

		// Fetch related items and payments separately
		const items = await db
			.select()
			.from(table.invoiceItems)
			.where(eq(table.invoiceItems.invoiceId, id));
		const payments = await db
			.select()
			.from(table.invoicePayments)
			.where(eq(table.invoicePayments.invoiceId, id));

		return {
			...row.invoice,
			project: row.project,
			client: row.client,
			items,
			payments
		};
	}

	async getAllWithClient() {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');

		let query = db
			.select({
				invoice: table.invoices,
				client: table.clients
			})
			.from(table.invoices)
			.leftJoin(table.clients, eq(table.invoices.clientId, table.clients.id))
			.orderBy(desc(table.invoices.issueDate));

		if (this.companyId) {
			// @ts-expect-error: pending fix Drizzle dynamic query type
			query = query.where(eq(table.clients.companyId, this.companyId));
		}

		const rows = await query;

		return rows.map((row) => ({
			...row.invoice,
			client: row.client
		}));
	}

	async updateStatus(id: string, status: string): Promise<void> {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');
		// @ts-expect-error: pending fix
		await db.update(table.invoices).set({ status }).where(eq(table.invoices.id, id));
	}
}
