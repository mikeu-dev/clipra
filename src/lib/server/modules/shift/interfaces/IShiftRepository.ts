import type * as table from '$lib/server/database/schemas';

export interface IShiftRepository {
	findAll(): Promise<table.Shift[]>;
	findAllByCompanyId(companyId: string): Promise<table.Shift[]>;
	findById(id: string): Promise<table.Shift | null>;
	create(data: table.NewShift): Promise<table.Shift>;
	update(id: string, data: Partial<table.Shift>): Promise<void>;
	delete(id: string): Promise<void>;
}
