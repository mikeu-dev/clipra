// src/lib/server/repositories/notification.repository.ts
import * as table from '$lib/server/database/schemas';
import { db } from '$lib/server/database';
import { eq, and, isNull, count, desc } from 'drizzle-orm';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { INotificationRepository } from './interfaces/INotificationRepository';

export class NotificationRepository
	extends BaseRepository<typeof table.notifications, table.Notification, table.NewNotification>
	implements INotificationRepository
{
	constructor() {
		super(table.notifications);
	}

	async getAllByUserId(userId: string) {
		return await db.query.notifications.findMany({
			where: eq(table.notifications.userId, userId),
			orderBy: (notifications, { desc: d }) => [d(notifications.createdAt)]
		});
	}

	async getPaginated(
		userId: string,
		page: number,
		limit: number,
		typeFilter?: string
	): Promise<{ data: table.Notification[]; total: number }> {
		const offset = (page - 1) * limit;

		// Build conditions
		const conditions = [eq(table.notifications.userId, userId)];

		if (
			typeFilter &&
			['info', 'warning', 'success', 'error', 'task', 'system'].includes(typeFilter)
		) {
			conditions.push(
				eq(
					table.notifications.type,
					typeFilter as 'info' | 'warning' | 'success' | 'error' | 'task' | 'system'
				)
			);
		}

		const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

		const data = await db
			.select()
			.from(table.notifications)
			.where(whereClause)
			.orderBy(desc(table.notifications.createdAt))
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({ count: count() })
			.from(table.notifications)
			.where(whereClause);

		return {
			data,
			total: countResult[0]?.count || 0
		};
	}

	async getUnreadCount(userId: string): Promise<number> {
		const result = await db
			.select({ count: count() })
			.from(table.notifications)
			.where(and(eq(table.notifications.userId, userId), isNull(table.notifications.readAt)));

		return result[0]?.count || 0;
	}

	async markAllAsRead(userId: string) {
		await db
			.update(this.table)
			.set({ readAt: new Date() })
			.where(and(eq(this.table.userId, userId), isNull(this.table.readAt)));
	}
}
