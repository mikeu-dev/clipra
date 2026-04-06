import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IAnnouncementService extends IService<
	table.Announcement,
	table.NewAnnouncement,
	table.Announcement
> {
	getPaginated(
		page: number,
		limit: number,
		statusFilter?: string
	): Promise<{ data: table.Announcement[]; total: number }>;
	publish(id: string): Promise<void>;
	archive(id: string): Promise<void>;
	getDetailWithStats(id: string): Promise<{
		announcement: table.Announcement & { creator?: { name: string } };
		attachments: table.Attachment[];
		stats: { total: number; read: number; unread: number };
	} | null>;
	broadcast(id: string): Promise<void>;
	processBroadcast(id: string): Promise<void>;
	runAutoArchive(): Promise<void>;
}
