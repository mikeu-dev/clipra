// src/lib/server/controllers/notification.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { NotificationService } from './service';
import type * as table from '$lib/server/database/schemas';

export class NotificationController extends BaseController<
	table.Notification,
	table.NewNotification
> {
	constructor(service = new NotificationService()) {
		super(service);
	}
	async getUserNotifications(userId: string) {
		return (this.service as NotificationService).getUserNotifications(userId);
	}
	async markAllAsRead(userId: string) {
		return (this.service as NotificationService).markAllAsRead(userId);
	}
}
