import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { IUserService } from './interfaces/IUserService';
import type { UserRepository } from './repository';
import { UserRepository as UserRepositoryImpl } from './repository';
import { UserMapper } from './mapper';
import type { UserResponseDTO } from './dto/user-response.dto';
import type { UpdateUserPasswordDTO } from './dto/update-user-password.dto';
import type { UpdateUserRoleDTO } from './dto/update-user-role.dto';
import { NotFoundException } from '../../core/exceptions';

/**
 * Service untuk entitas `User`.
 *
 * Bertanggung jawab atas logika bisnis pengguna, seperti pembaruan
 * kata sandi, pengambilan sesi, proyek, dan tugas. Service ini
 * menjembatani antara controller dan repository tanpa berinteraksi langsung
 * dengan database.
 */
export class UserService
	extends BaseService<table.User, table.NewUser, UserResponseDTO>
	implements IUserService
{
	// Deklarasikan ulang 'repository' dengan tipe yang lebih spesifik (UserRepository)
	// untuk mengakses metode kustom seperti 'updateUserPassword'.
	protected override repository: UserRepository;
	protected mapper: UserMapper;

	/**
	 * Membuat instance baru dari `UserService`.
	 *
	 * @param {UserRepository} [repository=new UserRepositoryImpl()] - Implementasi repository pengguna.
	 * @param {UserMapper} [mapper=new UserMapper()] - Implementasi mapper pengguna.
	 */
	constructor(repository = new UserRepositoryImpl(), mapper = new UserMapper()) {
		super(repository, mapper);
		this.repository = repository;
		this.mapper = mapper;
	}

	/**
	 * Mengambil semua pengguna sebagai DTO.
	 * Metode ini meng-override `BaseService.getAll()` untuk memastikan
	 * tipe pengembalian yang benar (`Promise<UserResponseDTO[]>`) sesuai
	 * dengan `IUserService`.
	 */
	override async getAll(): Promise<UserResponseDTO[]> {
		// Panggil metode dasar dan lakukan type assertion untuk memenuhi kontrak interface.
		return super.getAll() as Promise<UserResponseDTO[]>;
	}

	/**
	 * Mengambil satu pengguna berdasarkan ID sebagai DTO.
	 * Metode ini meng-override `BaseService.getById()` untuk memastikan
	 * tipe pengembalian yang benar (`Promise<UserResponseDTO>`) sesuai
	 * dengan `IUserService`.
	 */
	override async getById(id: string): Promise<UserResponseDTO> {
		// Panggil metode dasar, periksa null, lalu lempar exception jika tidak ada.
		const user = (await super.getById(id)) as UserResponseDTO | null;
		if (!user) throw new NotFoundException(`User with id ${id} not found`);
		return user as UserResponseDTO;
	}

	async getByEmail(email: string): Promise<UserResponseDTO | null> {
		const users = await this.repository.findAll();
		const user = users.find((u) => u.email === email);
		return (user as UserResponseDTO) || null;
	}

	/**
	 * Membuat pengguna baru dan mengembalikannya sebagai DTO.
	 * Metode ini meng-override `BaseService.create()` untuk memastikan
	 * tipe pengembalian yang benar (`Promise<UserResponseDTO>`) sesuai
	 * dengan `IUserService`.
	 */
	override async create(data: Omit<table.NewUser, 'id'>): Promise<UserResponseDTO> {
		// Panggil metode dasar dan lakukan type assertion untuk memenuhi kontrak interface.
		// `super.create` akan membuat entitas, lalu `BaseService` akan memetakannya ke DTO karena mapper telah disediakan.
		const createdUser = await super.create(data);
		return createdUser as UserResponseDTO;
	}

	/**
	 * Memperbarui hash kata sandi pengguna.
	 *
	 * Pastikan hashing dilakukan sebelum pemanggilan fungsi ini.
	 * Service hanya meneruskan hash ke repository.
	 *
	 * @async
	 * @param {UpdateUserPasswordDTO} dto - DTO berisi ID dan hash kata sandi baru.
	 */
	async updatePassword(dto: UpdateUserPasswordDTO): Promise<void> {
		await this.repository.updateUserPassword(dto.id, dto.passwordHash);
	}

	async updateRole(dto: UpdateUserRoleDTO): Promise<void> {
		await this.repository.updateUserRole(dto.id, dto.roleId);
	}

	/**
	 * Memvalidasi apakah eksekutor memiliki wewenang hirarki untuk mengelola target.
	 *
	 * Aturan: Level eksekutor harus secara numerik lebih kecil (hirarki lebih tinggi)
	 * daripada level target.
	 *
	 * @param executorLevel Level hirarki eksekutor (string, misal '1')
	 * @param targetLevel Level hirarki target (string, misal '50')
	 * @returns boolean true jika diizinkan, false jika tidak.
	 */
	canManage(executorLevel: string | number, targetLevel: string | number): boolean {
		const exec = Number(executorLevel);
		const target = Number(targetLevel);

		// Superadmin (Level 1) bisa mengelola siapa saja kecuali (opsional) dirinya sendiri
		// (tapi logika 'dirinya sendiri' biasanya ditangani di level route).
		// Intinya: Angka lebih kecil = Hirarki lebih tinggi.
		return exec < target;
	}

	async getSessions() {
		return await this.repository.getSessions();
	}

	async getProjects() {
		return await this.repository.getProjects();
	}

	async getTasks() {
		return await this.repository.getTasks();
	}

	async getPaginatedWithDetails(
		page: number,
		limit: number,
		search?: string,
		companyId?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }> {
		return await this.repository.getPaginatedWithDetails(page, limit, search, companyId);
	}

	async getSelectOptions() {
		return await this.repository.getSelectOptions();
	}
}
