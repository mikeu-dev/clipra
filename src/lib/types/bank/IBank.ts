export interface Bank {
	id: string;
	code: string;
	name: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}
