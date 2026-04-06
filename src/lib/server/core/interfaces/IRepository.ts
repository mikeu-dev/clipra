/**
 * Interface dasar repository (kontrak akses data).
 * Digunakan oleh semua repository di layer data.
 */
export interface IRepository<TEntity, TCreate> {
	findAll(): Promise<TEntity[]>;
	findById(id: string): Promise<TEntity | null>;
	create(data: TCreate & { id: string }): Promise<TEntity>;
	update(id: string, data: Partial<TCreate>): Promise<void>;
	delete(id: string): Promise<void>;
}
