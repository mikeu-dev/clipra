import type { EmployeeResponseDTO } from './dto/employee-response.dto';
import type { UserResponseDTO } from '../user/dto/user-response.dto';
import type * as table from '$lib/server/database/schemas';
import { BaseMapper } from '../../core/base.mapper';

export class EmployeeMapper extends BaseMapper<table.Employee, EmployeeResponseDTO> {
	toDTO(entity: table.Employee): EmployeeResponseDTO {
		// Ensure optional relationships are handled if they exist on the entity (joined data)
		// Note: Typescript might not see joined fields on table.Employee unless we define an expanded type or use 'any'.
		// For now, we stick to the basic entity fields and explicit optional props.

		const entityWithRelations = entity as table.Employee & {
			user?: UserResponseDTO;
			position?: { id: string; name: string | null };
			shift?: { id: string; name: string | null };
			company?: { id: string; name: string };
		}; // Cast to access joined props if present

		return {
			id: entity.id,
			userId: entity.userId,
			companyId: entity.companyId,
			idCard: entity.idCard,
			nik: entity.nik,
			positionId: entity.positionId,
			shiftId: entity.shiftId,
			status: entity.status,
			joinDate: entity.joinDate ? new Date(entity.joinDate) : null,
			taxNumber: entity.taxNumber,
			biometricImage: entity.biometricImage,
			isPublic: entity.isPublic,
			workPhone: entity.workPhone,
			workEmail: entity.workEmail,
			bankName: (entity as table.Employee & { bankName?: string }).bankName,
			bankAccountNumber: (entity as table.Employee & { bankAccountNumber?: string })
				.bankAccountNumber,
			reportsTo: entity.reportsTo || null,
			division: entity.division || null,
			createdAt: entity.createdAt ?? new Date(), // Fallback if null (shouldn't be)
			updatedAt: entity.updatedAt ?? undefined,

			// Populate relations if they were fetched (e.g. via join)
			user: entityWithRelations.user,
			position: entityWithRelations.position,
			shift: entityWithRelations.shift,
			company: entityWithRelations.company
		};
	}

	toEntity(dto: EmployeeResponseDTO): table.Employee {
		// Limited reverse mapping, primarily for completeness or specific use cases.
		return {
			id: dto.id,
			userId: dto.userId,
			companyId: dto.companyId,
			idCard: dto.idCard,
			nik: dto.nik,
			positionId: dto.positionId,
			shiftId: dto.shiftId,
			status: dto.status,
			joinDate: dto.joinDate ? dto.joinDate.toISOString().split('T')[0] : null, // Approx string for date
			taxNumber: dto.taxNumber,
			biometricImage: dto.biometricImage,
			isPublic: dto.isPublic,
			workPhone: dto.workPhone,
			workEmail: dto.workEmail,
			bankName: dto.bankName,
			bankAccountNumber: dto.bankAccountNumber,
			reportsTo: dto.reportsTo,
			division: dto.division,
			deletedAt: null,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt ?? null
		} as unknown as table.Employee; // Cast to avoid strict type mismatch on dates/enums if necessary
	}
}
