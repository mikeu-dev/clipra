// src/lib/server/controllers/attachment.controller.ts
import { AttachmentService as AttachmentServiceImpl } from './service';
import { BaseController } from '../../core/base.controller';
import type * as table from '$lib/server/database/schemas';
import type { IAttachmentService } from './interfaces/IAttachmentService';

export class AttachmentController extends BaseController<table.Attachment, table.NewAttachment> {
	protected override service: IAttachmentService;

	constructor(service: IAttachmentService = new AttachmentServiceImpl()) {
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
