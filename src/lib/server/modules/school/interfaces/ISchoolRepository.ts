// src/lib/server/repositories/interfaces/ISchoolRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface ISchoolRepository {
	findAll(): Promise<table.School[]>;
	findById(id: string): Promise<table.School | null>;
	create(data: table.NewSchool): Promise<table.School>;
	update(id: string, data: Partial<table.School>): Promise<void>;
	delete(id: string): Promise<void>;
	findAllWithUser(): Promise<table.School[]>;
}
