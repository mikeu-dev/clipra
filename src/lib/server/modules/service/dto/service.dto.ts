export interface CreateServiceDTO {
	name: string; // Maps to title_id / title_en based on logic? Or we add separate fields
	description?: string;
	// Or strictly mirror DB
	titleId: string;
	titleEn?: string;
	descriptionId?: string;
	descriptionEn?: string;
	image?: string;
	companyId: string;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {
	id: string;
}
