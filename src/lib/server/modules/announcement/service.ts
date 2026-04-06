import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { AnnouncementRepository } from './repository';
import type { IAnnouncementService } from './interfaces/IAnnouncementService';
import { NotificationModule } from '$lib/server/modules/notification/module';
import { AttachmentModule } from '$lib/server/modules/attachment/module';
import { generateId } from '$lib/utils/useUserId';
import { db } from '$lib/server/database';
import { eq, isNull, sql } from 'drizzle-orm';
import * as schema from '$lib/server/database/schemas';

export class AnnouncementService
	extends BaseService<table.Announcement, table.NewAnnouncement>
	implements IAnnouncementService
{
	constructor(repository = new AnnouncementRepository()) {
		super(repository);
	}

	async getPaginated(page: number, limit: number, statusFilter?: string) {
		const { data, total } = await (this.repository as AnnouncementRepository).getPaginated(
			page,
			limit,
			statusFilter
		);

		const announcements = await Promise.all(
			data.map(async (a) => ({
				...a,
				targetSummary: await this.resolveTargetSummary(a)
			}))
		);

		return { data: announcements, total };
	}

	async publish(id: string): Promise<void> {
		const announcement = await this.repository.findById(id);
		if (!announcement) throw new Error('Pengumuman tidak ditemukan');
		if (announcement.publishedAt) throw new Error('Pengumuman sudah dipublish sebelumnya');

		// 1. Update status to published
		await this.repository.update(id, {
			status: 'published',
			publishedAt: new Date()
		});

		// 2. Resolve target users
		const userIds = await this.resolveTargetUsers(announcement);

		// 3. Create announcement recipients
		const recipients: table.NewAnnouncementRecipient[] = userIds.map((userId) => ({
			id: generateId(),
			announcementId: id,
			userId
		}));
		await (this.repository as AnnouncementRepository).createRecipients(recipients);

		// 4. Send notifications
		await this.broadcast(id);
	}

	async broadcast(id: string): Promise<void> {
		const announcement = await this.repository.findById(id);
		if (!announcement) throw new Error('Pengumuman tidak ditemukan');
		if (announcement.status !== 'published') {
			throw new Error('Hanya pengumuman yang sudah terbit yang dapat disiarkan');
		}

		// Add to queue for background processing
		const { getAnnouncementQueue } = await import('$lib/server/modules/queue/worker');
		const queue = getAnnouncementQueue();
		await queue.add('announcement-broadcast', { announcementId: id });
	}

	async processBroadcast(id: string): Promise<void> {
		const announcement = await this.repository.findById(id);
		if (!announcement) throw new Error('Pengumuman tidak ditemukan');

		const userIds = await this.resolveTargetUsers(announcement);
		if (userIds.length === 0) return;

		// Send notifications to each user
		const notificationService = NotificationModule.getService();
		const notificationPromises = userIds.map((userId) =>
			notificationService.create({
				id: generateId(),
				userId,
				title: announcement.title,
				message:
					announcement.content.replace(/<[^>]*>/g, '').substring(0, 150) +
					(announcement.content.length > 150 ? '...' : ''),
				type: 'system',
				actionUrl: `/panel/announcements/${id}`
			})
		);

		// Send in batches of 10 to avoid overwhelming the system
		const batchSize = 10;
		for (let i = 0; i < notificationPromises.length; i += batchSize) {
			const batch = notificationPromises.slice(i, i + batchSize);
			await Promise.allSettled(batch);
		}
	}

	async runAutoArchive(): Promise<void> {
		const repo = this.repository as AnnouncementRepository;
		const affected = await repo.archiveExpired();
		if (affected > 0) {
			const { logger } = await import('$lib/server/modules/core/logger');
			logger.info(`Auto-archived ${affected} expired announcements`);
		}
	}

	async archive(id: string): Promise<void> {
		const announcement = await this.repository.findById(id);
		if (!announcement) throw new Error('Pengumuman tidak ditemukan');
		await this.repository.update(id, { status: 'archived' });
	}

	async getDetailWithStats(id: string) {
		const repo = this.repository as AnnouncementRepository;
		const announcement = await repo.getByIdWithCreator(id);
		if (!announcement) return null;

		const attachmentService = AttachmentModule.getService();
		const attachments = await attachmentService.findByOwner('announcement', id);
		const stats = await repo.getRecipientStats(id);

		return { announcement, attachments, stats };
	}

	async markAsReadForUser(announcementId: string, userId: string) {
		await (this.repository as AnnouncementRepository).markRecipientAsRead(announcementId, userId);
	}

	private async resolveTargetSummary(announcement: table.Announcement): Promise<string> {
		const { targetType, targetValue } = announcement;
		const values = targetValue as string[] | null;

		if (targetType === 'all') return 'Semua User';
		if (!values || values.length === 0) return '-';

		if (targetType === 'role') {
			const roles = await db
				.select({ name: schema.roles.name })
				.from(schema.roles)
				.where(sql`${schema.roles.id} IN ${values}`);

			const names = roles.map((r) => r.name);
			if (names.length > 3) {
				return `Role: ${names.slice(0, 3).join(', ')} ... (+${names.length - 3})`;
			}
			return `Role: ${names.join(', ')}`;
		}

		if (targetType === 'user') {
			const users = await db
				.select({ name: schema.users.name })
				.from(schema.users)
				.where(sql`${schema.users.id} IN ${values}`);

			const names = users.map((u) => u.name);
			if (names.length > 2) {
				return `User: ${names.slice(0, 2).join(', ')} ... (+${names.length - 2})`;
			}
			return `User: ${names.join(', ')}`;
		}

		return '-';
	}

	private async resolveTargetUsers(announcement: table.Announcement): Promise<string[]> {
		const targetType = announcement.targetType;
		const targetValue = announcement.targetValue as string[] | null;

		if (targetType === 'all') {
			// Get all active users (not deleted)
			const users = await db
				.select({ id: schema.users.id })
				.from(schema.users)
				.where(isNull(schema.users.deletedAt));
			return users.map((u) => u.id);
		}

		if (targetType === 'role' && targetValue && targetValue.length > 0) {
			// Get users by role IDs
			const allUsers: { id: string }[] = [];
			for (const roleId of targetValue) {
				const users = await db
					.select({ id: schema.users.id })
					.from(schema.users)
					.where(eq(schema.users.roleId, roleId));
				allUsers.push(...users);
			}
			// Deduplicate
			return [...new Set(allUsers.map((u) => u.id))];
		}

		if (targetType === 'user' && targetValue && targetValue.length > 0) {
			return targetValue;
		}

		return [];
	}
}
