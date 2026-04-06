// src/lib/server/modules/user.module.ts
import { UserController } from './controller';
import { UserRepository } from './repository';
import { UserMapper } from './mapper';
import { UserService } from './service';

/**
 * Modul untuk entitas `User`.
 *
 * Kelas ini bertugas menginisialisasi dan menyatukan seluruh komponen
 * yang berhubungan dengan pengguna — yaitu repository, service, dan controller.
 *
 * `UserModule` berfungsi sebagai *composition root* atau *dependency injector*,
 * memastikan setiap layer mendapatkan dependensi yang sesuai tanpa perlu
 * membuat instance secara manual di tempat lain.
 *
 * Contoh penggunaan:
 * ```ts
 * const userController = UserModule.create();
 * await userController.updatePassword('123', hashedPassword);
 * ```
 */
export class UserModule {
	/**
	 * Membuat dan menghubungkan seluruh dependensi modul `User`.
	 *
	 * Urutan inisialisasi:
	 * 1. Membuat instance `UserRepository`
	 * 2. Membuat instance `UserMapper`
	 * 3. Menyuntikkan repository dan mapper ke dalam `UserService`
	 * 4. Menyuntikkan service ke dalam `UserController`
	 *
	 * @static
	 * @returns {UserController} Instance `UserController` yang siap digunakan.
	 */
	static getService(): UserService {
		const repository = new UserRepository();
		const mapper = new UserMapper();
		return new UserService(repository, mapper);
	}

	static create(): UserController {
		const service = this.getService();
		return new UserController(service);
	}
}
