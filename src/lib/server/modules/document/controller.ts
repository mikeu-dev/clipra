// src/lib/server/controllers/document.controller.ts
import { DocumentService as DocumentServiceImpl } from './service';
import { BaseController } from '../../core/base.controller';
import type * as table from '$lib/server/database/schemas';
import type { IDocumentService } from './interfaces/IDocumentService';

export class DocumentController extends BaseController<table.Document, table.NewDocument> {
	protected override service: IDocumentService;

	constructor(service: IDocumentService = new DocumentServiceImpl()) {
		super(service);
		this.service = service;
	}

	async findByOwner(ownerType: string, ownerId: string) {
		return this.service.findByOwner(ownerType, ownerId);
	}

	async softDelete(id: string) {
		return this.service.softDelete(id);
	}

	async restore(id: string) {
		return this.service.restore(id);
	}

	async permanentDelete(id: string) {
		return this.service.permanentDelete(id);
	}
}
