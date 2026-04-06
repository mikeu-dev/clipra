import type * as table from '$lib/server/database/schemas';

export interface IUnitRepository {
	findAll(): Promise<table.Unit[]>;
	findAllWithUser(): Promise<(table.Unit & { user: table.User | null })[]>;
	findById(id: string): Promise<table.Unit | null>;
	create(data: table.NewUnit): Promise<table.Unit>;
	update(id: string, data: Partial<table.Unit>): Promise<void>;
	delete(id: string): Promise<void>;
}
