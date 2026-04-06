import { EventEmitter } from 'events';

interface SSEClient {
	controller: ReadableStreamDefaultController;
	userId: string;
}

class NotificationService extends EventEmitter {
	private clients: Map<ReadableStreamDefaultController, SSEClient>;
	private userClients: Map<string, Set<ReadableStreamDefaultController>>;

	constructor() {
		super();
		this.clients = new Map();
		this.userClients = new Map();
	}

	addClient(controller: ReadableStreamDefaultController, userId?: string) {
		const id = userId || '';
		this.clients.set(controller, { controller, userId: id });

		if (id) {
			if (!this.userClients.has(id)) {
				this.userClients.set(id, new Set());
			}
			this.userClients.get(id)?.add(controller);
		}

		console.log(`SSE client connected. User: ${id}. Total clients: ${this.clients.size}`);
	}

	removeClient(controller: ReadableStreamDefaultController) {
		const client = this.clients.get(controller);
		if (client) {
			if (client.userId) {
				const userSet = this.userClients.get(client.userId);
				userSet?.delete(controller);
				if (userSet?.size === 0) {
					this.userClients.delete(client.userId);
				}
			}
			this.clients.delete(controller);
		}
		console.log(`SSE client disconnected. Total clients: ${this.clients.size}`);
	}

	/**
	 * Broadcast message to all connected clients
	 */
	broadcast(event: string, data: unknown) {
		const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
		const encoder = new TextEncoder();
		const encoded = encoder.encode(message);

		this.clients.forEach((client) => {
			try {
				client.controller.enqueue(encoded);
			} catch (err) {
				console.error('Failed to send message to client', err);
				this.removeClient(client.controller);
			}
		});
	}

	/**
	 * Broadcast message to specific user(s)
	 */
	broadcastToUser(userId: string | string[], event: string, data: unknown) {
		const userIds = Array.isArray(userId) ? userId : [userId];
		const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
		const encoder = new TextEncoder();
		const encoded = encoder.encode(message);

		userIds.forEach((id) => {
			const controllers = this.userClients.get(id);
			if (controllers) {
				controllers.forEach((controller) => {
					try {
						controller.enqueue(encoded);
					} catch (err) {
						console.error('Failed to send message to user', id, err);
						this.removeClient(controller);
					}
				});
			}
		});
	}

	/**
	 * Broadcast task update event
	 */
	broadcastTaskUpdate(projectId: string, task: object) {
		this.broadcast('task_updated', { projectId, task });
	}

	/**
	 * Broadcast notification created event
	 */
	broadcastNotification(userId: string, notification: object) {
		this.broadcastToUser(userId, 'notification_created', notification);
	}

	/**
	 * Broadcast project update event
	 */
	broadcastProjectUpdate(projectId: string, project: object) {
		this.broadcast('project_updated', { projectId, project });
	}

	/**
	 * Get total connected clients
	 */
	getClientCount(): number {
		return this.clients.size;
	}
}

export const notificationService = new NotificationService();
