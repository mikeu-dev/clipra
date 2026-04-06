// src/lib/server/repositories/interfaces/IBankRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IBankRepository {
	findAll(): Promise<table.Bank[]>;
	findById(id: string): Promise<table.Bank | null>;
	create(data: table.NewBank): Promise<table.Bank>;
	update(id: string, data: Partial<table.Bank>): Promise<void>;
	delete(id: string): Promise<void>;
}
