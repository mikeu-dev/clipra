// src/lib/server/repositories/interfaces/IUserRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IUserRepository {
	findAll(): Promise<table.User[]>;
	findById(id: string): Promise<table.User | null>;
	create(data: table.NewUser): Promise<table.User>;
	update(id: string, data: Partial<table.User>): Promise<void>;
	delete(id: string): Promise<void>;
	updateUserPassword(userId: string, passwordHash: string): Promise<void>;
	updateUserRole(userId: string, roleId: string): Promise<void>;
	getSessions(): Promise<table.Session[]>;
	getProjects(): Promise<table.Project[]>;
	getTasks(): Promise<table.Task[]>;
	getPaginatedWithDetails(
		page: number,
		limit: number,
		search?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }>;
}
