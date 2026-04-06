// src/lib/server/repositories/user.repository.ts
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq, or, like, and, count, inArray } from 'drizzle-orm';
import { BaseRepository } from '../../core/base.repository';
import type { IUserRepository } from './interfaces/IUserRepository';

/**
 * Repository untuk entitas `User`.
 *
 * Kelas ini bertanggung jawab mengelola semua operasi database
 * yang berhubungan dengan pengguna, seperti pembaruan kata sandi,
 * pengambilan sesi, proyek, dan tugas.
 *
 * Menurunkan `BaseRepository` agar tetap konsisten dengan pola umum
 * CRUD dan mengimplementasikan kontrak `IUserRepository`.
 */
export class UserRepository
	extends BaseRepository<typeof table.users, table.User, table.NewUser>
	implements IUserRepository
{
	constructor() {
		super(table.users);
	}

	/**
	 * Memperbarui hash kata sandi untuk pengguna tertentu.
	 *
	 * Fungsi ini hanya mengubah kolom `passwordHash` pada tabel `users`
	 * tanpa memengaruhi kolom lain.
	 * Akan melempar error jika operasi pembaruan gagal.
	 *
	 * @async
	 * @param {string} userId - ID pengguna yang kata sandinya akan diperbarui.
	 * @param {string} passwordHash - Hash kata sandi baru.
	 * @returns {Promise<void>} Tidak mengembalikan nilai.
	 */
	async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
		await db.update(table.users).set({ passwordHash }).where(eq(table.users.id, userId));
	}

	/**
	 * Memperbarui role untuk pengguna tertentu.
	 *
	 * @async
	 * @param {string} userId - ID pengguna.
	 * @param {string} roleId - ID role baru.
	 * @returns {Promise<void>}
	 */
	async updateUserRole(userId: string, roleId: string): Promise<void> {
		await db.update(table.users).set({ roleId }).where(eq(table.users.id, userId));
	}

	/**
	 * Mengambil semua sesi pengguna dari tabel `sessions`.
	 *
	 * [WARN] Saat ini belum dilakukan pemfilteran berdasarkan pengguna tertentu.
	 * Jika ingin hanya mengambil sesi dari pengguna tertentu,
	 * tambahkan parameter `userId` pada fungsi ini di masa depan.
	 *
	 * @async
	 * @returns {Promise<Array<table.Session>>} Daftar seluruh sesi yang tersimpan.
	 */
	async getSessions(): Promise<Array<table.Session>> {
		return await db.select().from(table.sessions);
	}

	/**
	 * Mengambil semua proyek dari tabel `projects`.
	 *
	 * [WARN] Belum difilter berdasarkan pengguna.
	 * Gunakan filter tambahan jika proyek ingin dipisahkan per pengguna.
	 *
	 * @async
	 * @returns {Promise<Array<table.Project>>} Daftar seluruh proyek yang tersimpan.
	 */
	async getProjects(): Promise<Array<table.Project>> {
		return await db.select().from(table.projects);
	}

	/**
	 * Mengambil semua tugas dari tabel `tasks`.
	 *
	 * [WARN] Belum difilter berdasarkan pengguna atau proyek tertentu.
	 * Cocok untuk keperluan administratif atau debugging.
	 *
	 * @async
	 * @returns {Promise<Array<table.Task>>} Daftar seluruh tugas yang tersimpan.
	 */
	async getTasks(): Promise<Array<table.Task>> {
		return await db.select().from(table.tasks);
	}

	/**
	 * Mengambil daftar pengguna dengan pagination dan relasi.
	 *
	 * Menggunakan Drizzle relational query untuk performa lebih baik (SQL Joins)
	 * daripada memuat semua data ke memori.
	 *
	 * @param {number} page - Halaman saat ini (1-indexed).
	 * @param {number} limit - Jumlah item per halaman.
	 * @param {string} [search] - Query pencarian (opsional) untuk nama/email.
	 */
	async getPaginatedWithDetails(
		page: number,
		limit: number,
		search?: string,
		companyId?: string
	): Promise<{ data: unknown[]; total: number }> {
		const offset = (page - 1) * limit;

		// Kondisi pencarian
		let searchCondition = undefined;
		if (search) {
			searchCondition = or(
				like(table.users.name, `%${search}%`),
				like(table.users.email, `%${search}%`)
			);
		}

		let whereCondition = searchCondition;

		// Query utama
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let query: any = db
			.select({
				user: table.users,
				role: table.roles
			})
			.from(table.users);

		// Query Total
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let countQuery: any = db.select({ count: count() }).from(table.users);

		if (companyId) {
			whereCondition = and(searchCondition, eq(table.employees.companyId, companyId));

			// Join employees to filter by company and get company role
			query = query
				.innerJoin(table.employees, eq(table.users.id, table.employees.userId))
				.leftJoin(table.roles, eq(table.employees.roleId, table.roles.id)) // Use Company Role
				.where(whereCondition);

			countQuery = countQuery
				.innerJoin(table.employees, eq(table.users.id, table.employees.userId))
				.where(whereCondition);
		} else {
			query = query
				.leftJoin(table.roles, eq(table.users.roleId, table.roles.id)) // Use Global Role
				.where(whereCondition);

			countQuery = countQuery.where(whereCondition);
		}

		const rows = await query.limit(limit).offset(offset);

		const usersData = rows.map((r: (typeof rows)[0]) => ({
			...r.user,
			role: r.role
		}));

		// Fetch Sessions, Projects, Tasks manually menggunakan IN array
		const userIds = usersData.map((u: (typeof usersData)[0]) => u.id);

		let sessionsData: table.Session[] = [];
		let projectsData: table.Project[] = [];
		let tasksData: table.Task[] = [];

		if (userIds.length > 0) {
			// Fetch sessions
			sessionsData = await db
				.select()
				.from(table.sessions)
				.where(inArray(table.sessions.userId, userIds));

			// Fetch projects
			projectsData = await db
				.select()
				.from(table.projects)
				.where(inArray(table.projects.clientId, userIds));

			// Fetch tasks
			tasksData = await db
				.select()
				.from(table.tasks)
				.where(inArray(table.tasks.assignedTo, userIds));
		}

		// Merge data into users
		const result = usersData.map((u: (typeof usersData)[0]) => ({
			...u,
			sessions: sessionsData.filter((s) => s.userId === u.id),
			projects: projectsData.filter((p) => p.clientId === u.id),
			tasks: tasksData.filter((t) => t.assignedTo === u.id)
		}));

		// Hitung total data untuk pagination
		const countResults = await countQuery;
		const totalResult = countResults[0];

		return {
			data: result,
			total: totalResult.count
		};
	}

	/**
	 * Mengambil opsi pengguna untuk dropdown (ID, Name, Role Name).
	 * Lebih ringan daripada fetch semua data.
	 */
	async getSelectOptions(): Promise<{ id: string; name: string; roleName: string | null }[]> {
		return await db
			.select({
				id: table.users.id,
				name: table.users.name,
				roleName: table.roles.name
			})
			.from(table.users)
			.leftJoin(table.roles, eq(table.users.roleId, table.roles.id));
	}
}
