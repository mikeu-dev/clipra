import { PurchaseRepository } from './repository';
import type {
	NewPurchaseOrder,
	NewPurchaseOrderLine,
	NewPurchaseRequisition,
	NewPurchaseRequisitionLine
} from '$lib/server/database/schemas';
import type { NewInvoice, NewInvoiceItem } from '$lib/server/database/schemas/invoices';
import { v4 as uuidv4 } from 'uuid';

export class PurchaseService {
	private repo: PurchaseRepository;

	constructor() {
		this.repo = new PurchaseRepository();
	}

	async createOrder(
		orderData: Omit<NewPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'number'>,
		linesData: Omit<NewPurchaseOrderLine, 'id' | 'createdAt' | 'orderId'>[]
	) {
		// Generate Order Number
		const number = `PO-${Date.now()}`;

		const orderId = uuidv4();
		const order: NewPurchaseOrder = {
			...orderData,
			id: orderId,
			number,
			state: 'draft',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const lines: NewPurchaseOrderLine[] = linesData.map((line) => ({
			...line,
			id: uuidv4(),
			orderId: orderId,
			companyId: orderData.companyId,
			createdAt: new Date()
		}));

		// Calculate totals
		const total = lines.reduce((sum, line) => sum + Number(line.subtotal || 0), 0);
		order.total = total.toString();
		order.subtotal = total.toString();

		return await this.repo.createPurchaseOrder(order, lines);
	}

	async getOrders(companyId: string) {
		return await this.repo.getPurchaseOrders(companyId);
	}

	async getOrder(id: string) {
		return await this.repo.getOrder(id);
	}

	async confirmOrder(orderId: string) {
		// 1. Get Order
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const order = (await this.repo.getOrder(orderId)) as any;
		if (!order || order.state !== 'draft') return;

		// 2. Integration Point: Create Receipt (Inventory)
		const { InventoryService } = await import('$lib/server/modules/inventory/service');
		const inventoryService = new InventoryService();
		const locations = await inventoryService.getLocations(order.companyId);

		// Logic: Source = Supplier Location, Dest = Our Warehouse Stock
		// Find 'Supplier' location or fallback
		const sourceLocation =
			locations.find(
				(l) =>
					l.name?.toLowerCase().includes('supplier') || l.name?.toLowerCase().includes('vendor')
			) || locations[0];
		// Find 'Stock' location
		const destLocation =
			locations.find(
				(l) => l.name?.toLowerCase().includes('stock') || l.name?.toLowerCase().includes('haupt')
			) || locations[0];

		if (sourceLocation && destLocation) {
			for (const line of order.lines) {
				await inventoryService.processStockMove({
					companyId: order.companyId,
					productId: line.productId,
					locationId: sourceLocation.id, // From Supplier
					locationDestId: destLocation.id, // To Our Stock
					quantity: line.quantity || '0',
					reference: order.number,
					state: 'confirmed'
				});
			}
		}

		// 3. Update State
		await this.repo.updateOrderState(orderId, 'purchase');
	}

	async createBill(orderId: string) {
		// 1. Get Order
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const order = (await this.repo.getOrder(orderId)) as any;
		if (!order) throw new Error('Order not found');

		// Check if bill already exists
		const existingBills = await this.repo.getOrderBills(orderId);
		if (existingBills.length > 0) {
			throw new Error('Vendor Bill already exists for this Purchase Order');
		}

		// 2. Prepare Invoice Header
		const { InvoiceService } = await import('$lib/server/modules/invoice/service');
		const invoiceService = new InvoiceService();
		const invoiceId = uuidv4();

		// Bill Number: BILL-{OrderNumber}
		const invoiceNumber = `BILL-${order.number}`;

		// Ensure we handle 'type' if it wasn't added to type definition properly yet, but we updated schema so it should be fine logic-wise.
		const invoiceData = {
			id: invoiceId,
			clientId: order.supplierId, // Vendor
			number: invoiceNumber,
			issueDate: new Date(),
			status: 'draft',
			type: 'in_invoice',
			subtotal: order.subtotal,
			taxTotal: order.taxTotal,
			total: order.total,
			purchaseOrderId: order.id,
			notes: `Generated from Purchase Order ${order.number}`
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
		return await invoiceService.createFullInvoice(invoiceData as NewInvoice, invoiceItems);
	}

	async receiveProducts(orderId: string) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const order = (await this.repo.getOrder(orderId)) as any;
		if (!order) throw new Error('Order not found');

		const { InventoryService } = await import('$lib/server/modules/inventory/service');
		const inventoryService = new InventoryService();

		const { InventoryRepository } = await import('$lib/server/modules/inventory/repository');
		const inventoryRepo = new InventoryRepository();

		// Find related stock moves
		const moves = await inventoryRepo.getStockMoveByReference(order.number);

		for (const move of moves) {
			if (move.state !== 'done') {
				await inventoryService.completeStockMove(move.id);
			}
		}

		// Update order state if needed
		// For now just keep stay in 'purchase' or move to 'done'
		await this.repo.updateOrderState(orderId, 'done');
	}

	// --- Requisition Methods ---

	async createRequisition(
		reqData: Omit<NewPurchaseRequisition, 'id' | 'createdAt' | 'updatedAt' | 'number'>,
		linesData: Omit<NewPurchaseRequisitionLine, 'id' | 'createdAt' | 'requisitionId'>[]
	) {
		const id = uuidv4();
		const number = `PR-${Date.now()}`;

		const requisition: NewPurchaseRequisition = {
			...reqData,
			id,
			number,
			state: 'requested',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const lines: NewPurchaseRequisitionLine[] = linesData.map((line) => ({
			...line,
			id: uuidv4(),
			requisitionId: id,
			companyId: reqData.companyId,
			createdAt: new Date()
		}));

		// Calculate total
		const total = lines.reduce((sum, line) => sum + Number(line.subtotal || 0), 0);
		requisition.totalAmount = total.toString();

		return await this.repo.createRequisition(requisition, lines);
	}

	async getRequisitions(companyId: string, requestedById?: string) {
		return await this.repo.getRequisitions(companyId, requestedById);
	}

	async getRequisition(id: string) {
		return await this.repo.getRequisition(id);
	}

	async approveRequisition(id: string, approvedById: string) {
		await this.repo.updateRequisitionState(id, 'approved', approvedById);
	}

	async rejectRequisition(id: string) {
		await this.repo.updateRequisitionState(id, 'rejected');
	}

	async convertToPurchaseOrder(requisitionId: string, supplierId: string) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const req = (await this.repo.getRequisition(requisitionId)) as any;
		if (!req || req.state !== 'approved') {
			throw new Error('Requisition not found or not approved');
		}

		const orderData: Omit<NewPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'number'> = {
			companyId: req.companyId,
			supplierId,
			userId: req.requestedById, // Set buyer as requester for now
			projectId: req.projectId,
			requisitionId: req.id,
			date: new Date(),
			notes: `Generated from PR ${req.number}`
		};

		const linesData: Omit<NewPurchaseOrderLine, 'id' | 'createdAt' | 'orderId'>[] =
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(req.lines as any[])
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((l: any) => ({
					productId: l.productId,
					companyId: req.companyId,
					description: l.description,
					quantity: l.quantity,
					unitPrice: l.estimatedUnitPrice,
					subtotal: l.subtotal
				}));

		const result = await this.createOrder(orderData, linesData);

		// Update PR state to ordered
		await this.repo.updateRequisitionState(requisitionId, 'ordered');

		return result;
	}
}
