// src/lib/server/repositories/interfaces/INotificationRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface INotificationRepository {
	findAll(): Promise<table.Notification[]>;
	findById(id: string): Promise<table.Notification | null>;
	create(data: table.NewNotification): Promise<table.Notification>;
	update(id: string, data: Partial<table.Notification>): Promise<void>;
	delete(id: string): Promise<void>;
	getAllByUserId(userId: string): Promise<table.Notification[]>;
	markAllAsRead(userId: string): Promise<void>;
}
