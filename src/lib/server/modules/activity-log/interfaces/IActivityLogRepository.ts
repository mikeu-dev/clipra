// src/lib/server/repositories/interfaces/IActivityLogRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IActivityLogRepository {
	findAll(): Promise<table.ActivityLog[]>;
	findById(id: string): Promise<table.ActivityLog | null>;
	create(data: table.NewActivityLog): Promise<table.ActivityLog>;
	update(id: string, data: Partial<table.ActivityLog>): Promise<void>;
	delete(id: string): Promise<void>;
	findAllWithUser(): Promise<table.ActivityLog[]>;
	findByUser(userId: string): Promise<table.ActivityLog[]>;
}
