export interface Role {
	id: string;
	companyId: string | null;
	name: string;
	description: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}
