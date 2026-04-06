// src/lib/server/repositories/interfaces/IContactRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IContactRepository {
	findAll(): Promise<table.Contact[]>;
	findById(id: string): Promise<table.Contact | null>;
	create(data: table.NewContact): Promise<table.Contact>;
	update(id: string, data: Partial<table.Contact>): Promise<void>;
	delete(id: string): Promise<void>;
}
