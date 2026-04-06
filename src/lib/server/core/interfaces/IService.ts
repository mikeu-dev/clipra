export interface IService<TEntity, TCreate, TDTO = TEntity> {
	getAll(): Promise<TDTO[]>;
	getById(id: string): Promise<TDTO>;
	create(data: Omit<TCreate, 'id'>): Promise<TDTO>;
	update(id: string, data: Partial<TCreate>): Promise<void>;
	delete(id: string): Promise<void>;
}
