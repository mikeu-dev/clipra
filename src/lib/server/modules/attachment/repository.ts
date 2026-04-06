// src/lib/server/repositories/attachment.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IAttachmentRepository } from './interfaces/IAttachmentRepository';

export class AttachmentRepository
	extends BaseRepository<typeof table.attachments, table.Attachment, table.NewAttachment>
	implements IAttachmentRepository
{
	constructor() {
		super(table.attachments);
	}

	async findByOwner(ownerType: string, ownerId: string) {
		return await db
			.select()
			.from(table.attachments)
			.where(
				and(
					eq(table.attachments.ownerType, ownerType),
					eq(table.attachments.ownerId, ownerId),
					isNull(table.attachments.deletedAt)
				)
			);
	}

	async softDelete(id: string): Promise<void> {
		await db
			.update(table.attachments)
			.set({ deletedAt: new Date() })
			.where(eq(table.attachments.id, id));
	}

	async restore(id: string): Promise<void> {
		await db.update(table.attachments).set({ deletedAt: null }).where(eq(table.attachments.id, id));
	}

	async permanentDelete(id: string): Promise<void> {
		await db.delete(table.attachments).where(eq(table.attachments.id, id));
	}
}
