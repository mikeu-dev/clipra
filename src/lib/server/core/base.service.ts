import { generateId } from '$lib/utils/useUserId';
import type { BaseMapper } from './base.mapper';
import type { IRepository } from './interfaces/IRepository';

/**
 * BaseService menyediakan operasi CRUD generik untuk semua entitas.
 * Mendukung penggunaan BaseMapper untuk otomatis mengubah Entity ↔ DTO.
 */
export abstract class BaseService<TEntity, TCreate, TDTO = TEntity> {
	protected repository: IRepository<TEntity, TCreate>;
	protected mapper?: BaseMapper<TEntity, TDTO>;

	constructor(repository: IRepository<TEntity, TCreate>, mapper?: BaseMapper<TEntity, TDTO>) {
		this.repository = repository;
		this.mapper = mapper;
	}

	/**
	 * Mengambil semua data dari repository.
	 * Jika mapper tersedia, hasil dikonversi menjadi DTO.
	 */
	async getAll(): Promise<(TDTO | TEntity)[]> {
		const results = await this.repository.findAll();
		return this.mapper ? this.mapper.toDTOs(results) : results;
	}

	/**
	 * Mengambil data berdasarkan ID.
	 * Mengembalikan DTO jika mapper tersedia.
	 * @throws Error jika data tidak ditemukan.
	 */
	async getById(id: string): Promise<TDTO | TEntity> {
		const result = await this.repository.findById(id);
		if (!result) throw new Error('Data tidak ditemukan');
		return this.mapper ? this.mapper.toDTO(result) : result;
	}

	/**
	 * Membuat entitas baru.
	 * ID akan dihasilkan otomatis menggunakan generateId().
	 */
	async create(data: Omit<TCreate, 'id'>): Promise<TDTO | TEntity> {
		const { id, ...rest } = data as unknown as { id?: string };
		const newData = { id: id || generateId(), ...rest } as TCreate & { id: string };
		const created = await this.repository.create(newData);
		return this.mapper ? this.mapper.toDTO(created) : created;
	}

	/**
	 * Memperbarui entitas berdasarkan ID.
	 * @throws Error jika data tidak ditemukan.
	 */
	async update(id: string, data: Partial<TCreate>): Promise<void> {
		const exists = await this.repository.findById(id);
		if (!exists) throw new Error('Data tidak ditemukan');
		await this.repository.update(id, data);
	}

	/**
	 * Menghapus entitas berdasarkan ID.
	 * @throws Error jika data tidak ditemukan.
	 */
	async delete(id: string): Promise<void> {
		const exists = await this.repository.findById(id);
		if (!exists) throw new Error('Data tidak ditemukan');
		await this.repository.delete(id);
	}
}
