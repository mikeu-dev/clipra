// src/lib/server/services/attachment.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { AttachmentRepository } from './repository';
import type { IAttachmentService } from './interfaces/IAttachmentService';
import { AttachmentRepository as AttachmentRepositoryImpl } from './repository';

export class AttachmentService
	extends BaseService<table.Attachment, table.NewAttachment>
	implements IAttachmentService
{
	protected override repository: AttachmentRepository;

	constructor(repository = new AttachmentRepositoryImpl()) {
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
