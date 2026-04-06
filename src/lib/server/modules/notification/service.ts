import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { NotificationRepository } from './repository';
import type { INotificationService } from './interfaces/INotificationService';
import webpush from 'web-push';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/database';
import { eq } from 'drizzle-orm';
import { pushSubscriptions } from '$lib/server/database/schemas';

// Configure web-push
if (env.PUBLIC_VAPID_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT) {
	webpush.setVapidDetails(env.VAPID_SUBJECT, env.PUBLIC_VAPID_KEY, env.VAPID_PRIVATE_KEY);
}

export class NotificationService
	extends BaseService<table.Notification, table.NewNotification>
	implements INotificationService
{
	constructor(repository = new NotificationRepository()) {
		super(repository);
	}

	async create(data: table.NewNotification) {
		const notification = await super.create(data);

		// Non-blocking processing for SSE and Push
		(async () => {
			try {
				// 1. Broadcast to SSE
				const { notificationService: sseService } = await import('$lib/server/notifications');
				if (data.userId) {
					sseService.broadcastNotification(data.userId, notification);
				}

				// 2. Send Push Notification
				if (data.userId) {
					await this.sendPushNotification(data.userId, {
						title: data.title,
						body: data.message || '',
						url: data.actionUrl || '/panel/notifications'
					});
				}
			} catch (err) {
				console.error('Async notification processing failed:', err);
			}
		})();

		return notification;
	}

	async getUserNotifications(userId: string) {
		return (this.repository as NotificationRepository).getAllByUserId(userId);
	}

	async getPaginated(userId: string, page: number, limit: number, typeFilter?: string) {
		return (this.repository as NotificationRepository).getPaginated(
			userId,
			page,
			limit,
			typeFilter
		);
	}

	async getUnreadCount(userId: string) {
		return (this.repository as NotificationRepository).getUnreadCount(userId);
	}

	async markAllAsRead(userId: string) {
		await (this.repository as NotificationRepository).markAllAsRead(userId);
	}

	async sendPushNotification(
		userId: string,
		payload: { title: string; body: string; url?: string }
	) {
		try {
			if (!env.PUBLIC_VAPID_KEY || !env.VAPID_PRIVATE_KEY) {
				console.warn('VAPID keys not configured, skipping push notification');
				return;
			}

			const subscriptions = await db
				.select()
				.from(pushSubscriptions)
				.where(eq(pushSubscriptions.userId, userId));

			const notificationPayload = JSON.stringify(payload);

			const promises = subscriptions.map(async (sub) => {
				try {
					await webpush.sendNotification(
						{
							endpoint: sub.endpoint,
							keys: {
								p256dh: sub.p256dh,
								auth: sub.auth
							}
						},
						notificationPayload
					);
				} catch (error) {
					const err = error as { statusCode?: number };
					if (err.statusCode === 410 || err.statusCode === 404) {
						// Subscription has expired or is no longer valid
						await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
					} else {
						console.error('Error sending push notification:', error);
					}
				}
			});

			await Promise.all(promises);
		} catch (error) {
			console.error('Failed to send push notifications:', error);
		}
	}
}
