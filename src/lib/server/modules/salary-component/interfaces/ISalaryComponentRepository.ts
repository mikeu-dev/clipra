import type * as table from '$lib/server/database/schemas';

export interface ISalaryComponentRepository {
	findAll(): Promise<table.SalaryComponent[]>;
	findAllByCompanyId(companyId: string): Promise<table.SalaryComponent[]>;
	findById(id: string): Promise<table.SalaryComponent | null>;
	create(data: table.NewSalaryComponent): Promise<table.SalaryComponent>;
	update(id: string, data: Partial<table.SalaryComponent>): Promise<void>;
	delete(id: string): Promise<void>;
}
