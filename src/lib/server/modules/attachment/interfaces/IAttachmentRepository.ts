// src/lib/server/repositories/interfaces/IAttachmentRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IAttachmentRepository {
	findAll(): Promise<table.Attachment[]>;
	findById(id: string): Promise<table.Attachment | null>;
	create(data: table.NewAttachment): Promise<table.Attachment>;
	update(id: string, data: Partial<table.Attachment>): Promise<void>;
	delete(id: string): Promise<void>;
	findByOwner(ownerType: string, ownerId: string): Promise<table.Attachment[]>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	permanentDelete(id: string): Promise<void>;
}
