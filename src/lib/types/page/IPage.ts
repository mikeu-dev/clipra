export interface Page {
	id: string;
	title: string;
	slug: string;
	content: string;
	published: boolean;
	published_at: string;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}
