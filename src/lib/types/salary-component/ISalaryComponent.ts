export interface SalaryComponent {
	id: string;
	companyId: string;
	name: string;
	type: 'allowance' | 'deduction';
	calculationType: 'fixed' | 'percentage' | null;
	defaultAmount: string | null;
	isActive: boolean | null;
	createdAt: string | Date | null;
	updatedAt: string | Date | null;
}
