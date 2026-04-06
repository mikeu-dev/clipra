import { BaseController } from '$lib/server/core/base.controller';
import { InvoiceService } from './service';
import type * as table from '$lib/server/database/schemas';

export class InvoiceController extends BaseController<table.Invoice, table.NewInvoice> {
	constructor(serviceOrCompanyId?: InvoiceService | string) {
		const service =
			serviceOrCompanyId instanceof InvoiceService
				? serviceOrCompanyId
				: new InvoiceService(serviceOrCompanyId);
		super(service);
	}

	async createFullInvoice(data: table.NewInvoice, items: table.NewInvoiceItem[]) {
		return (this.service as InvoiceService).createFullInvoice(data, items);
	}

	async getWithDetails(id: string) {
		return (this.service as InvoiceService).getWithDetails(id);
	}

	async getAllWithClient() {
		return (this.service as InvoiceService).getAllWithClient();
	}
}
