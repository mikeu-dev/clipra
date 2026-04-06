import * as table from '$lib/server/database/schemas';

export interface IPositionRepository {
	findAll(): Promise<table.Position[]>;
	findAllByCompanyId(companyId: string): Promise<table.Position[]>;
	findById(id: string): Promise<table.Position | null>;
	create(data: table.NewPosition): Promise<table.Position>;
	update(id: string, data: Partial<table.Position>): Promise<void>;
	delete(id: string): Promise<void>;
}
