import type * as table from '$lib/server/database/schemas';

export interface ITagRepository {
	findAll(): Promise<table.Tag[]>;
	findById(id: string): Promise<table.Tag | null>;
	create(data: table.NewTag): Promise<table.Tag>;
	update(id: string, data: Partial<table.Tag>): Promise<void>;
	delete(id: string): Promise<void>;
}
