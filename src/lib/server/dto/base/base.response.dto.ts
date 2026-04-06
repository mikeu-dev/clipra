/**
 * DTO dasar untuk output dari sistem (response ke klien).
 * Pastikan hanya field publik yang dimasukkan.
 */
export interface BaseResponseDTO {
	id: string;
	createdAt: Date;
	updatedAt?: Date;
}
