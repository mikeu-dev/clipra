import { BaseController } from '$lib/server/core/base.controller';
import { AnnouncementService } from './service';
import type * as table from '$lib/server/database/schemas';

export class AnnouncementController extends BaseController<
	table.Announcement,
	table.NewAnnouncement
> {
	constructor(service = new AnnouncementService()) {
		super(service);
	}

	async getPaginated(page: number, limit: number, statusFilter?: string) {
		return (this.service as AnnouncementService).getPaginated(page, limit, statusFilter);
	}

	async publish(id: string) {
		return (this.service as AnnouncementService).publish(id);
	}

	async archive(id: string) {
		return (this.service as AnnouncementService).archive(id);
	}

	async getDetailWithStats(id: string) {
		return (this.service as AnnouncementService).getDetailWithStats(id);
	}

	async markAsReadForUser(announcementId: string, userId: string) {
		return (this.service as AnnouncementService).markAsReadForUser(announcementId, userId);
	}
}
