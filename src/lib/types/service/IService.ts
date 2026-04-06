export interface Service {
	id: string;
	companyId: string;
	image: string | null;
	titleId: string | null;
	titleEn: string | null;
	descriptionId: string | null;
	descriptionEn: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}
