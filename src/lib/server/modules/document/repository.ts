// src/lib/server/repositories/document.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IDocumentRepository } from './interfaces/IDocumentRepository';

export class DocumentRepository
	extends BaseRepository<typeof table.documents, table.Document, table.NewDocument>
	implements IDocumentRepository
{
	constructor() {
		super(table.documents);
	}

	async findByOwner(ownerType: string, ownerId: string) {
		return await db
			.select()
			.from(table.documents)
			.where(
				and(
					eq(table.documents.ownerType, ownerType),
					eq(table.documents.ownerId, ownerId),
					isNull(table.documents.deletedAt)
				)
			);
	}

	async softDelete(id: string): Promise<void> {
		await db
			.update(table.documents)
			.set({ deletedAt: new Date() })
			.where(eq(table.documents.id, id));
	}

	async restore(id: string): Promise<void> {
		await db.update(table.documents).set({ deletedAt: null }).where(eq(table.documents.id, id));
	}

	async permanentDelete(id: string): Promise<void> {
		await db.delete(table.documents).where(eq(table.documents.id, id));
	}
}
