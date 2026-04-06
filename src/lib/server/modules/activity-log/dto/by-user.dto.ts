// activity-log/dto/by-user.dto.ts
import type { JsonObject } from '$lib/types/json/object';
import type { BaseResponseDTO } from '../../../dto/base/base.response.dto';
import type { UserResponseDTO } from '../../user/dto/user-response.dto';

/**
 * DTO aman untuk dikirim ke klien.
 * Semua field sensitif sudah dihapus/di-sanitize.
 */
export interface ByUserDTO extends BaseResponseDTO {
	userId: string;
	user: UserResponseDTO;
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
