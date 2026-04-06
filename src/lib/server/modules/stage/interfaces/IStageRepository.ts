// src/lib/server/repositories/interfaces/IStageRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface IStageRepository {
	findAll(): Promise<table.Stage[]>;
	findById(id: string): Promise<table.Stage | null>;
	create(data: table.NewStage): Promise<table.Stage>;
	update(id: string, data: Partial<table.Stage>): Promise<void>;
	delete(id: string): Promise<void>;
}
