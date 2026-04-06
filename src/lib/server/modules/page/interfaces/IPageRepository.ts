// src/lib/server/repositories/interfaces/IPageRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IPageRepository {
	findAll(): Promise<table.Page[]>;
	findById(id: string): Promise<table.Page | null>;
	create(data: table.NewPage): Promise<table.Page>;
	update(id: string, data: Partial<table.Page>): Promise<void>;
	delete(id: string): Promise<void>;
}
