// src/lib/server/services/document.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { DocumentRepository } from './repository';
import type { IDocumentService } from './interfaces/IDocumentService';
import { DocumentRepository as DocumentRepositoryImpl } from './repository';

export class DocumentService
	extends BaseService<table.Document, table.NewDocument>
	implements IDocumentService
{
	protected override repository: DocumentRepository;

	constructor(repository = new DocumentRepositoryImpl()) {
		super(repository);
		this.repository = repository;
	}

	async findByOwner(ownerType: string, ownerId: string) {
		return await this.repository.findByOwner(ownerType, ownerId);
	}

	async softDelete(id: string) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Dokumen tidak ditemukan');
		return await this.repository.softDelete(id);
	}

	async restore(id: string) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Dokumen tidak ditemukan');
		return await this.repository.restore(id);
	}

	async permanentDelete(id: string) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Dokumen tidak ditemukan');
		return await this.repository.permanentDelete(id);
	}
}
