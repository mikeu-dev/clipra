// activity-log/dto/response.dto.ts
import type { JsonObject } from '$lib/types/json/object';
import type { BaseResponseDTO } from '../../../dto/base/base.response.dto';

/**
 * DTO aman untuk dikirim ke klien.
 * Semua field sensitif sudah dihapus/di-sanitize.
 */
export interface SafeActivityLogResponseDTO extends BaseResponseDTO {
	userId: string;
	action: string;
	entityType?: string;
	entityId?: string;
	meta: JsonObject; // sudah disanitasi
	ipAddress?: string; // opsional, bisa dihilangkan jika perlu privasi
	userAgent?: string; // opsional
	createdAt: Date;
	before?: JsonObject; // sudah disanitasi
	after?: JsonObject; // sudah disanitasi
}

/**
 * Fungsi untuk membersihkan field sensitif dari object
 */
export function sanitizeActivityLog(
	log: SafeActivityLogResponseDTO,
	sensitiveFields: string[] = ['password', 'token', 'creditCardNumber']
): SafeActivityLogResponseDTO {
	const sanitize = (obj: JsonObject) => {
		const copy: JsonObject = {};
		for (const key in obj) {
			if (!sensitiveFields.includes(key)) {
				copy[key] = obj[key];
			}
		}
		return copy;
	};

	return {
		...log,
		meta: sanitize(log.meta),
		before: log.before ? sanitize(log.before) : {},
		after: log.after ? sanitize(log.after) : {}
	};
}
