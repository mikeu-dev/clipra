// src/lib/server/services/interfaces/IAttachmentService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IAttachmentService extends IService<
	table.Attachment,
	table.NewAttachment,
	table.Attachment
> {
	findByOwner(ownerType: string, ownerId: string): Promise<table.Attachment[]>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	permanentDelete(id: string): Promise<void>;
}
