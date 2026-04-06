// src/lib/server/services/interfaces/IDocumentService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IDocumentService extends IService<
	table.Document,
	table.NewDocument,
	table.Document
> {
	findByOwner(ownerType: string, ownerId: string): Promise<table.Document[]>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	permanentDelete(id: string): Promise<void>;
}
