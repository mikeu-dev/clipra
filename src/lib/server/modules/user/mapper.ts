// src/lib/server/modules/user/mapper.ts
import type { UserResponseDTO } from '$lib/server/modules/user/dto/user-response.dto';
import type * as table from '$lib/server/database/schemas';
import { BaseMapper } from '../../core/base.mapper';

import type { JsonObject, JsonValue } from '$lib/types/json/object';
import { InternalServerErrorException } from '../../core/exceptions';
/**
 * Mapper untuk domain User.
 * Mengonversi data pengguna dari entity (database)
 * ke DTO publik yang aman dan sesuai kontrak.
 */
export class UserMapper extends BaseMapper<table.User, UserResponseDTO> {
	/**
	 * Helper function untuk membersihkan objek JSON dari field sensitif.
	 * Mirip dengan yang ada di ActivityLogMapper.
	 * @param obj Objek JSON yang akan dibersihkan.
	 * @returns Objek JSON yang sudah dibersihkan.
	 */
	private sanitize(obj: JsonObject | null | undefined): JsonObject {
		if (!obj) return {};
		const copy: JsonObject = {};
		for (const key in obj) {
			const value = obj[key];
			// hanya assign jika value adalah JsonValue
			if (value !== undefined && value !== null) {
				copy[key] = value as JsonValue;
			}
		}
		// hapus field sensitif
		delete copy['password'];
		delete copy['token'];
		delete copy['creditCardNumber'];
		return copy;
	}

	toDTO(entity: table.User): UserResponseDTO {
		// Ensure createdAt is not null, as UserResponseDTO expects a Date.
		// Ini adalah kondisi yang tidak seharusnya terjadi jika data valid, jadi lempar InternalServerErrorException.
		if (!entity.createdAt)
			throw new InternalServerErrorException(`User with id ${entity.id} has null createdAt`);
		return {
			id: entity.id,
			name: entity.name,
			email: entity.email,
			roleId: entity.roleId || '',
			roleLevel: (entity as table.User & { role?: { level: string } }).role?.level || '50',
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt ?? undefined // Convert null to undefined for DTO
		};
	}

	toEntity(dto: UserResponseDTO): table.User {
		// Perlu hati-hati, karena DTO biasanya tidak berisi semua field entity.
		// Entitas yang dihasilkan dari DTO ini tidak akan lengkap.
		// Field seperti passwordHash, roleId, dll., akan diisi dengan nilai default/null.
		// Jangan gunakan entitas ini untuk operasi 'create' atau 'update' tanpa mengisi field yang hilang.
		return {
			id: dto.id,
			name: dto.name,
			email: dto.email,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt ?? null,
			// Field di bawah ini tidak ada di UserResponseDTO dan diisi dengan nilai default.
			passwordHash: '', // Placeholder, tidak aman untuk operasi tulis.
			username: '', // Placeholder, tidak ada di DTO.
			roleId: dto.roleId,
			emailVerified: null,
			verificationToken: null,
			deletedAt: null
		};
	}
}
