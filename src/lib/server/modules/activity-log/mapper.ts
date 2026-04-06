// src/lib/server/modules/activity-log/mapper.ts
import type * as table from '$lib/server/database/schemas';
import type { JsonObject, JsonValue } from '$lib/types/json/object';
import { BaseMapper } from '../../core/base.mapper';
import { InternalServerErrorException } from '../../core/exceptions';
import type { SafeActivityLogResponseDTO } from './dto/response.dto';

/**
 * Mapper untuk domain ActivityLog.
 * Mengonversi data log aktivitas dari entity database
 * ke DTO publik yang aman.
 */
export class ActivityLogMapper extends BaseMapper<table.ActivityLog, SafeActivityLogResponseDTO> {
	/**
	 * Helper function untuk membersihkan objek JSON dari field sensitif.
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

	toDTO(entity: table.ActivityLog): SafeActivityLogResponseDTO {
		if (!entity.createdAt)
			throw new InternalServerErrorException(`ActivityLog with id ${entity.id} has null createdAt`);

		const beforeObj: JsonObject =
			typeof entity.before === 'object' && entity.before !== null
				? (entity.before as JsonObject)
				: {};

		const afterObj: JsonObject =
			typeof entity.after === 'object' && entity.after !== null ? (entity.after as JsonObject) : {};

		let metaObj: JsonObject = {};
		if (entity.meta) {
			try {
				metaObj = JSON.parse(entity.meta);
			} catch (error) {
				throw new InternalServerErrorException(
					`Failed to parse meta JSON for ActivityLog id ${entity.id}`,
					error
				);
			}
		}

		return {
			id: entity.id,
			userId: entity.userId,
			action: entity.action,
			entityType: entity.entityType ?? undefined,
			entityId: entity.entityId ?? undefined,
			meta: metaObj,
			ipAddress: entity.ipAddress ?? undefined,
			userAgent: entity.userAgent ?? undefined,
			createdAt: entity.createdAt,
			before: this.sanitize(beforeObj),
			after: this.sanitize(afterObj)
		};
	}

	toEntity(dto: SafeActivityLogResponseDTO): table.ActivityLog {
		// Hati-hati: DTO tidak berisi semua field DB (mis. auto-generated ID)
		return {
			id: dto.id,
			userId: dto.userId,
			action: dto.action,
			entityType: dto.entityType ?? null,
			entityId: dto.entityId ?? null,
			meta: JSON.stringify(dto.meta ?? {}),
			ipAddress: dto.ipAddress ?? null,
			userAgent: dto.userAgent ?? null,
			before: dto.before ?? {},
			after: dto.after ?? {},
			createdAt: dto.createdAt
		};
	}
}
