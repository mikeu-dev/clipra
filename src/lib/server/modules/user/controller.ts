// src/lib/server/controllers/user.controller.ts
import * as table from '$lib/server/database/schemas';
import {
	UpdateUserPasswordSchema,
	type UpdateUserPasswordDTO
} from './dto/update-user-password.dto';
import type { IUserService } from './interfaces/IUserService';
import { UserService as UserServiceImpl } from '../user/service';
import type { UserResponseDTO } from './dto/user-response.dto';
import { BadRequestException } from '$lib/server/core/exceptions';
import { ZodError } from 'zod';
import { BaseController } from '$lib/server/core/base.controller';

/**
 * Controller untuk entitas `User`.
 *
 * Kelas ini bertanggung jawab menangani permintaan (request) dari lapisan
 * aplikasi atau API, lalu meneruskannya ke `UserService` untuk diproses.
 * `UserController` tidak melakukan logika bisnis secara langsung —
 * seluruh proses didelegasikan ke service agar kode tetap bersih,
 * terstruktur, dan mudah diuji.
 */
export class UserController extends BaseController<table.User, table.NewUser, UserResponseDTO> {
	// Deklarasikan ulang 'service' dengan tipe yang lebih spesifik (IUserService)
	// untuk mengakses metode kustom seperti 'updatePassword'.
	protected override service: IUserService;
	/**
	 * Membuat instance baru dari `UserController`.
	 *
	 * @param {IUserService} [service=new UserServiceImpl()] - Implementasi service pengguna.
	 */
	constructor(service: IUserService = new UserServiceImpl()) {
		super(service);
		this.service = service;
	}

	/**
	 * Mengubah hash kata sandi pengguna.
	 *
	 * Fungsi ini menerima `userId` dan `passwordHash` dari request layer,
	 * lalu meneruskannya ke service untuk diproses.
	 *
	 * [WARN] Pastikan password telah di-hash sebelum dikirim ke fungsi ini,
	 * karena controller tidak bertanggung jawab atas proses hashing.
	 *
	 * @async
	 * @param {string} userId - ID pengguna yang ingin diperbarui kata sandinya.
	 * @param {string} passwordHash - Hash kata sandi baru.
	 * @returns {Promise<void>} Tidak mengembalikan nilai.
	 */
	async updatePassword(rawData: unknown) {
		try {
			const dto: UpdateUserPasswordDTO = UpdateUserPasswordSchema.parse(rawData);
			await this.service.updatePassword(dto);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequestException('Invalid input data', error.flatten().fieldErrors);
			}
			throw error; // Lempar kembali error lain yang tidak terduga
		}
		return { message: 'Kata sandi berhasil diperbarui' };
	}
}
