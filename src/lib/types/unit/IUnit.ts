export interface Unit {
	id: string;
	userId: string | null;
	userName?: string | null;
	name: string | null;
	createdAt: string | Date | null;
	updatedAt: string | Date | null;
	deletedAt?: string | Date | null;
	user?: {
		id: string;
		name: string | null;
		email: string | null;
	} | null;
}
