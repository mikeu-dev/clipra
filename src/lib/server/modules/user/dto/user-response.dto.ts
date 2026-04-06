import type { BaseResponseDTO } from '../../../dto/base/base.response.dto';

/**
 * DTO untuk data pengguna yang dikirim ke klien (tanpa field sensitif).
 */
export interface UserResponseDTO extends BaseResponseDTO {
	name: string;
	email: string;
	roleId: string;
	roleLevel?: string;
	avatar?: string | null;
	createdAt: Date;
	updatedAt?: Date;
}
