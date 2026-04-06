export interface Setting {
	id: string;
	group: string;
	key: string;
	value: string;
	description: string;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}
