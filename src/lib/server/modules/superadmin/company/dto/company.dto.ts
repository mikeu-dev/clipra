export interface CreateCompanyDTO {
	name: string;
	slug: string;
	code: string;
	email?: string;
	logo?: string | null;
	themeConfig?: Record<string, unknown>;
}

export interface UpdateCompanyDTO extends Partial<CreateCompanyDTO> {
	isPublic?: boolean;
}
