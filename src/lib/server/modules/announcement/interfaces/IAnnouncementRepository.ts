import type * as table from '$lib/server/database/schemas';

export interface IAnnouncementRepository {
	findAll(): Promise<table.Announcement[]>;
	findById(id: string): Promise<table.Announcement | null>;
	create(data: table.NewAnnouncement): Promise<table.Announcement>;
	update(id: string, data: Partial<table.Announcement>): Promise<void>;
	delete(id: string): Promise<void>;
	getPaginated(
		page: number,
		limit: number,
		statusFilter?: string
	): Promise<{ data: table.Announcement[]; total: number }>;
	getByIdWithCreator(
		id: string
	): Promise<(table.Announcement & { creator?: { name: string } }) | null>;
	archiveExpired(): Promise<number>;
}
