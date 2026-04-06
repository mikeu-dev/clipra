import { CRMRepository } from './repository';
import { InventoryService } from '$lib/server/modules/inventory/service';
import { InvoiceService } from '$lib/server/modules/invoice/service';
import { ProjectService } from '$lib/server/modules/project/service';
import type { NewSalesOrder, NewSalesOrderLine, Lead } from '$lib/server/database/schemas/crm';
import type { NewInvoice, NewInvoiceItem } from '$lib/server/database/schemas/invoices';
import type { Project } from '$lib/server/database/schemas';
import { v4 as uuidv4 } from 'uuid';

export class CRMService {
	private repo: CRMRepository;

	constructor() {
		this.repo = new CRMRepository();
	}

	async createQuotation(
		orderData: Omit<NewSalesOrder, 'id' | 'createdAt' | 'updatedAt' | 'number'>,
		linesData: Omit<NewSalesOrderLine, 'id' | 'createdAt' | 'orderId'>[]
	) {
		// Generate Order Number (Simple timestamp based for MVP)
		const number = `SO-${Date.now()}`;

		const orderId = uuidv4();
		const order: NewSalesOrder = {
			...orderData,
			id: orderId,
			number,
			state: 'draft',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const lines: NewSalesOrderLine[] = linesData.map((line) => ({
			...line,
			id: uuidv4(),
			orderId: orderId,
			companyId: orderData.companyId,
			createdAt: new Date()
		}));

		// Calculate totals
		const total = lines.reduce((sum, line) => sum + Number(line.subtotal || 0), 0);
		order.total = total.toString();
		order.subtotal = total.toString(); // assuming no tax for MVP logic yet

		return await this.repo.createSalesOrder(order, lines);
	}

	async confirmOrder(orderId: string) {
		// 1. Get Order with Lines
		const order = await this.repo.getOrder(orderId);
		if (!order || order.state !== 'draft') return;

		// 2. Trigger Delivery (Stock Move) for each line
		const inventoryService = new InventoryService();

		// Fetch locations to find Source and Dest
		const locations = await inventoryService.getLocations(order.companyId);
		// Simplified logic: Source = First Internal, Dest = First Customer (or create one if missing?)
		// For MVP, just grab any location or specific ones if we had types.
		// Assuming we have at least one location.
		const sourceLocation =
			locations.find((l) => l.name?.includes('Stock') || l.name?.includes('Haupt')) || locations[0];
		const destLocation =
			locations.find((l) => l.name?.includes('Customer')) || locations[1] || locations[0];

		if (sourceLocation && destLocation) {
			for (const line of order.lines) {
				await inventoryService.processStockMove({
					companyId: order.companyId,
					productId: line.productId,
					locationId: sourceLocation.id,
					locationDestId: destLocation.id,
					quantity: line.quantity || '0',
					reference: order.number,
					state: 'confirmed'
				});
			}
		}

		await this.repo.updateOrderState(orderId, 'sale');
	}

	async createInvoiceFromOrder(orderId: string) {
		// 1. Get Order
		const order = await this.repo.getOrder(orderId);
		if (!order) throw new Error('Order not found');

		// 2. Prepare Invoice Header
		const invoiceService = new InvoiceService();
		const invoiceId = uuidv4();

		// Simple Invoice Numbering: INV-{OrderNumber}
		const invoiceNumber = `INV-${order.number}`;

		const invoiceData: NewInvoice = {
			id: invoiceId,
			clientId: order.clientId,
			number: invoiceNumber,
			issueDate: new Date(),
			status: 'draft',
			subtotal: order.subtotal,
			taxTotal: order.taxTotal,
			total: order.total,
			notes: `Generated from Sales Order ${order.number}`
		};

		// 3. Prepare Invoice Items
		const invoiceItems: NewInvoiceItem[] = order.lines.map((line: (typeof order.lines)[0]) => ({
			id: uuidv4(),
			invoiceId: invoiceId,
			description: line.description,
			quantity: line.quantity,
			unitPrice: line.unitPrice,
			amount: line.subtotal
		}));

		// 4. Create in DB
		return await invoiceService.createFullInvoice(invoiceData, invoiceItems);
	}

	async createProjectFromOrder(orderId: string, userId: string): Promise<Project> {
		// 1. Get Order
		const order = await this.repo.getOrder(orderId);
		if (!order) throw new Error('Order not found');
		if (order.projectId) throw new Error('Order already has a project');

		// 2. Prepare Project Data
		const projectService = new ProjectService();
		const projectId = uuidv4();

		const projectData = {
			id: projectId,
			clientId: order.clientId,
			name: `Project: ${order.client?.name} - ${order.number}`,
			description: order.notes || `Project created from Sales Order ${order.number}`,
			status: 'active',
			totalBudget: order.total,
			startDate: new Date(),
			createdAt: new Date(),
			updatedAt: new Date()
		};

		// 3. Create Project with current user as member
		const project = await projectService.createProject(projectData, [userId]);

		// 4. Update Sales Order with projectId
		await this.repo.updateOrderProjectId(orderId, projectId);

		return project;
	}

	async getLeads(companyId: string) {
		return await this.repo.getLeads(companyId);
	}

	async getSalesOrders(companyId: string) {
		return await this.repo.getSalesOrders(companyId);
	}

	async getLead(id: string) {
		return await this.repo.getLead(id);
	}

	async updateLead(id: string, data: Partial<Lead>) {
		return await this.repo.updateLead(id, data);
	}
}
