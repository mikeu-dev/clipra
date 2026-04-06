import { db } from '$lib/server/database';
import { purchaseOrders, purchaseOrderLines } from '$lib/server/database/schemas/purchase/orders';
import {
	purchaseRequisitions,
	purchaseRequisitionLines
} from '$lib/server/database/schemas/purchase/requisitions';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { clients, projects, products, users } from '$lib/server/database/schemas';
import type {
	NewPurchaseOrder,
	PurchaseOrder,
	NewPurchaseOrderLine,
	PurchaseOrderLine,
	NewPurchaseRequisition,
	PurchaseRequisition,
	NewPurchaseRequisitionLine,
	PurchaseRequisitionLine
} from '$lib/server/database/schemas';

export class PurchaseRepository {
	// --- Purchase Orders ---
	async createPurchaseOrder(
		order: NewPurchaseOrder,
		lines: NewPurchaseOrderLine[]
	): Promise<{ order: PurchaseOrder; lines: PurchaseOrderLine[] }> {
		return await db.transaction(async (tx) => {
			await tx.insert(purchaseOrders).values(order);

			if (lines.length > 0) {
				await tx.insert(purchaseOrderLines).values(lines);
			}

			const savedOrder = await tx
				.select()
				.from(purchaseOrders)
				.where(eq(purchaseOrders.id, order.id))
				.limit(1);
			const savedLines = await tx
				.select()
				.from(purchaseOrderLines)
				.where(eq(purchaseOrderLines.orderId, order.id));

			return {
				order: savedOrder[0],
				lines: savedLines
			};
		});
	}

	async getPurchaseOrders(companyId: string, projectId?: string) {
		const conditions = [eq(purchaseOrders.companyId, companyId)];
		if (projectId) conditions.push(eq(purchaseOrders.projectId, projectId));

		const orders = await db
			.select({
				order: purchaseOrders,
				supplier: clients,
				project: projects
			})
			.from(purchaseOrders)
			.leftJoin(clients, eq(purchaseOrders.supplierId, clients.id))
			.leftJoin(projects, eq(purchaseOrders.projectId, projects.id))
			.where(and(...conditions))
			.orderBy(desc(purchaseOrders.createdAt));

		if (orders.length === 0) return [];

		const orderIds = orders.map((o) => o.order.id);

		const lines = await db
			.select()
			.from(purchaseOrderLines)
			.where(inArray(purchaseOrderLines.orderId, orderIds));

		return orders.map((o) => ({
			...o.order,
			supplier: o.supplier,
			project: o.project,
			lines: lines.filter((l) => l.orderId === o.order.id)
		}));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getOrder(id: string): Promise<any> {
		const oData = await db
			.select({
				order: purchaseOrders,
				supplier: clients,
				project: projects
			})
			.from(purchaseOrders)
			.leftJoin(clients, eq(purchaseOrders.supplierId, clients.id))
			.leftJoin(projects, eq(purchaseOrders.projectId, projects.id))
			.where(eq(purchaseOrders.id, id))
			.limit(1);

		if (oData.length === 0) return undefined;

		const order = oData[0].order;

		const linesRaw = await db
			.select({
				line: purchaseOrderLines,
				product: products
			})
			.from(purchaseOrderLines)
			.leftJoin(products, eq(purchaseOrderLines.productId, products.id))
			.where(eq(purchaseOrderLines.orderId, id));

		return {
			...order,
			supplier: oData[0].supplier,
			project: oData[0].project,
			lines: linesRaw.map((l) => ({ ...l.line, product: l.product })),
			bills: await this.getOrderBills(id)
		};
	}

	async getOrderBills(orderId: string) {
		const { invoices } = await import('$lib/server/database/schemas/invoices');
		return await db.select().from(invoices).where(eq(invoices.purchaseOrderId, orderId));
	}

	async updateOrderState(
		id: string,
		state: 'draft' | 'sent' | 'purchase' | 'done' | 'cancelled'
	): Promise<void> {
		await db
			.update(purchaseOrders)
			.set({ state, updatedAt: new Date() })
			.where(eq(purchaseOrders.id, id));
	}

	// --- Purchase Requisitions ---
	async createRequisition(
		requisition: NewPurchaseRequisition,
		lines: NewPurchaseRequisitionLine[]
	): Promise<{ requisition: PurchaseRequisition; lines: PurchaseRequisitionLine[] }> {
		return await db.transaction(async (tx) => {
			await tx.insert(purchaseRequisitions).values(requisition);

			if (lines.length > 0) {
				await tx.insert(purchaseRequisitionLines).values(lines);
			}

			const savedRequisition = await tx
				.select()
				.from(purchaseRequisitions)
				.where(eq(purchaseRequisitions.id, requisition.id))
				.limit(1);
			const savedLines = await tx
				.select()
				.from(purchaseRequisitionLines)
				.where(eq(purchaseRequisitionLines.requisitionId, requisition.id));

			return {
				requisition: savedRequisition[0],
				lines: savedLines
			};
		});
	}

	async getRequisitions(companyId: string, requestedById?: string, projectId?: string) {
		const conditions = [eq(purchaseRequisitions.companyId, companyId)];
		if (requestedById) conditions.push(eq(purchaseRequisitions.requestedById, requestedById));
		if (projectId) conditions.push(eq(purchaseRequisitions.projectId, projectId));

		const reqs = await db
			.select({
				req: purchaseRequisitions,
				requestedBy: users,
				project: projects
			})
			.from(purchaseRequisitions)
			.leftJoin(users, eq(purchaseRequisitions.requestedById, users.id))
			.leftJoin(projects, eq(purchaseRequisitions.projectId, projects.id))
			.where(and(...conditions))
			.orderBy(desc(purchaseRequisitions.createdAt));

		if (reqs.length === 0) return [];

		const reqIds = reqs.map((r) => r.req.id);

		const lines = await db
			.select()
			.from(purchaseRequisitionLines)
			.where(inArray(purchaseRequisitionLines.requisitionId, reqIds));

		return reqs.map((r) => ({
			...r.req,
			requestedBy: r.requestedBy,
			project: r.project,
			lines: lines.filter((l) => l.requisitionId === r.req.id)
		}));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getRequisition(id: string): Promise<any> {
		const rData = await db
			.select({
				req: purchaseRequisitions,
				requestedBy: users,
				project: projects
			})
			.from(purchaseRequisitions)
			.leftJoin(users, eq(purchaseRequisitions.requestedById, users.id))
			.leftJoin(projects, eq(purchaseRequisitions.projectId, projects.id))
			.where(eq(purchaseRequisitions.id, id))
			.limit(1);

		if (rData.length === 0) return undefined;

		const req = rData[0].req;

		const linesRaw = await db
			.select({
				line: purchaseRequisitionLines,
				product: products
			})
			.from(purchaseRequisitionLines)
			.leftJoin(products, eq(purchaseRequisitionLines.productId, products.id))
			.where(eq(purchaseRequisitionLines.requisitionId, id));

		return {
			...req,
			requestedBy: rData[0].requestedBy,
			project: rData[0].project,
			lines: linesRaw.map((l) => ({ ...l.line, product: l.product })),
			purchaseOrders: await db
				.select()
				.from(purchaseOrders)
				.where(eq(purchaseOrders.requisitionId, id))
		};
	}

	async updateRequisitionState(
		id: string,
		state: PurchaseRequisition['state'],
		approvedById?: string
	): Promise<void> {
		const updateData: Partial<PurchaseRequisition> = { state, updatedAt: new Date() };
		if (approvedById) {
			updateData.approvedById = approvedById;
		}
		await db.update(purchaseRequisitions).set(updateData).where(eq(purchaseRequisitions.id, id));
	}
}
