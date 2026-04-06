// src/lib/server/services/interfaces/INotificationService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface INotificationService extends IService<
	table.Notification,
	table.NewNotification,
	table.Notification
> {
	getUserNotifications(userId: string): Promise<table.Notification[]>;
	markAllAsRead(userId: string): Promise<void>;
}
