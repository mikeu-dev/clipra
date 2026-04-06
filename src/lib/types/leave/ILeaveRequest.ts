export interface LeaveRequest {
	id: string;
	userId: string;
	type: 'annual' | 'sick' | 'unpaid' | 'other';
	startDate: string | Date;
	endDate: string | Date;
	reason: string | null;
	status: 'pending' | 'approved' | 'rejected' | null;
	approvedBy: string | null;
	createdAt: string | Date | null;
	updatedAt: string | Date | null;
	user?: {
		id: string;
		name: string | null;
		email: string | null;
	} | null;
}
