import type { BaseResponseDTO } from '../../../dto/base/base.response.dto';
import type { UserResponseDTO } from '../../user/dto/user-response.dto';

/**
 * DTO untuk data karyawan yang dikirim ke klien.
 */
export interface EmployeeResponseDTO extends BaseResponseDTO {
	userId: string;
	companyId: string;
	idCard: string | null;
	nik: string | null;
	positionId: string | null;
	shiftId: string | null;
	status: 'permanent' | 'contract' | 'probation' | 'internship' | 'resigned' | 'terminated' | null;
	joinDate: Date | null;
	taxNumber: string | null;
	biometricImage: string | null;
	isPublic: boolean | null;
	workPhone: string | null;
	workEmail: string | null;
	bankName: string | null;
	bankAccountNumber: string | null;
	reportsTo: string | null;
	division: string | null;

	// Relations (Optional, populated by mapper if available)
	user?: UserResponseDTO;
	position?: { id: string; name: string | null };
	shift?: { id: string; name: string | null };
	company?: { id: string; name: string };
}
