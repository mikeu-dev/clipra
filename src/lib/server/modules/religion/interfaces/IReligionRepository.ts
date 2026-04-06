// src/lib/server/repositories/interfaces/IReligionRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IReligionRepository {
	findAll(): Promise<table.Religion[]>;
	findById(id: string): Promise<table.Religion | null>;
	create(data: table.NewReligion): Promise<table.Religion>;
	update(id: string, data: Partial<table.Religion>): Promise<void>;
	delete(id: string): Promise<void>;
}
