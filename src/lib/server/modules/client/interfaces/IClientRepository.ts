// src/lib/server/repositories/interfaces/IClientRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IClientRepository {
	findAll(): Promise<table.Client[]>;
	findById(id: string): Promise<table.Client | null>;
	create(data: table.NewClient): Promise<table.Client>;
	update(id: string, data: Partial<table.Client>): Promise<void>;
	delete(id: string): Promise<void>;
}
