export interface Log {
	id: string;
	userId: string;
	action: string;
	entityType: string;
	entityId: string;
	meta: string;
	createdAt: string;
	[key: string]: unknown;
}
