// src/lib/server/repositories/interfaces/IDocumentRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IDocumentRepository {
	findAll(): Promise<table.Document[]>;
	findById(id: string): Promise<table.Document | null>;
	create(data: table.NewDocument): Promise<table.Document>;
	update(id: string, data: Partial<table.Document>): Promise<void>;
	delete(id: string): Promise<void>;
	findByOwner(ownerType: string, ownerId: string): Promise<table.Document[]>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	permanentDelete(id: string): Promise<void>;
}
