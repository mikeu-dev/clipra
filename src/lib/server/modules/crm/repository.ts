import { db } from '$lib/server/database';
import { leads, salesOrders, salesOrderLines } from '$lib/server/database/schemas/crm';
import { clients, projects } from '$lib/server/database/schemas';
import { eq, desc, inArray } from 'drizzle-orm';
import type {
	NewLead,
	Lead,
	NewSalesOrder,
	SalesOrder,
	NewSalesOrderLine,
	SalesOrderLine
} from '$lib/server/database/schemas/crm';

export class CRMRepository {
	// --- Leads ---
	async createLead(data: NewLead): Promise<Lead> {
		await db.insert(leads).values(data);
		const result = await db.select().from(leads).where(eq(leads.id, data.id)).limit(1);
		return result[0];
	}

	async getLeads(companyId: string): Promise<Lead[]> {
		return await db.select().from(leads).where(eq(leads.companyId, companyId));
	}

	// --- Sales Orders ---
	async createSalesOrder(
		order: NewSalesOrder,
		lines: NewSalesOrderLine[]
	): Promise<{ order: SalesOrder; lines: SalesOrderLine[] }> {
		return await db.transaction(async (tx) => {
			await tx.insert(salesOrders).values(order);

			if (lines.length > 0) {
				await tx.insert(salesOrderLines).values(lines);
			}

			const savedOrder = await tx
				.select()
				.from(salesOrders)
				.where(eq(salesOrders.id, order.id))
				.limit(1);
			const savedLines = await tx
				.select()
				.from(salesOrderLines)
				.where(eq(salesOrderLines.orderId, order.id));

			return {
				order: savedOrder[0],
				lines: savedLines
			};
		});
	}

	async getSalesOrders(companyId: string) {
		const orders = await db
			.select({
				order: salesOrders,
				client: clients,
				project: projects
			})
			.from(salesOrders)
			.leftJoin(clients, eq(salesOrders.clientId, clients.id))
			.leftJoin(projects, eq(salesOrders.projectId, projects.id))
			.where(eq(salesOrders.companyId, companyId))
			.orderBy(desc(salesOrders.createdAt));

		if (orders.length === 0) return [];

		const orderIds = orders.map((o) => o.order.id);

		const lines = await db
			.select()
			.from(salesOrderLines)
			.where(inArray(salesOrderLines.orderId, orderIds));

		return orders.map((o) => ({
			...o.order,
			client: o.client,
			project: o.project,
			lines: lines.filter((l) => l.orderId === o.order.id)
		}));
	}

	async updateOrderState(
		id: string,
		state: 'draft' | 'sent' | 'sale' | 'done' | 'cancelled'
	): Promise<void> {
		await db
			.update(salesOrders)
			.set({ state, updatedAt: new Date() })
			.where(eq(salesOrders.id, id));
	}

	async updateOrderProjectId(id: string, projectId: string): Promise<void> {
		await db
			.update(salesOrders)
			.set({ projectId, updatedAt: new Date() })
			.where(eq(salesOrders.id, id));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getOrder(id: string): Promise<any> {
		const orderResult = await db
			.select({
				order: salesOrders,
				client: clients,
				project: projects
			})
			.from(salesOrders)
			.leftJoin(clients, eq(salesOrders.clientId, clients.id))
			.leftJoin(projects, eq(salesOrders.projectId, projects.id))
			.where(eq(salesOrders.id, id))
			.limit(1);

		if (orderResult.length === 0) return undefined;
		const o = orderResult[0];

		const lines = await db.select().from(salesOrderLines).where(eq(salesOrderLines.orderId, id));

		return {
			...o.order,
			client: o.client,
			project: o.project,
			lines: lines
		};
	}

	async getLead(id: string): Promise<Lead | undefined> {
		const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
		return result[0];
	}

	async updateLead(id: string, data: Partial<Lead>): Promise<void> {
		await db.update(leads).set(data).where(eq(leads.id, id));
	}
}
