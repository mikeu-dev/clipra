// src/lib/stores/sse-store.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

interface SSEState {
	connected: boolean;
	reconnecting: boolean;
	error: string | null;
	lastHeartbeat: Date | null;
}

interface SSEEvent {
	type: string;
	data: unknown;
	timestamp: Date;
}

class SSEStore {
	private eventSource: EventSource | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	// State store
	public state = writable<SSEState>({
		connected: false,
		reconnecting: false,
		error: null,
		lastHeartbeat: null
	});

	// Events store
	public events = writable<SSEEvent[]>([]);

	// Derived store for connection status
	public isConnected = derived(this.state, ($state) => $state.connected);

	/**
	 * Connect to SSE endpoint
	 */
	connect() {
		if (!browser) return;

		// Close existing connection if any
		this.disconnect();

		try {
			this.eventSource = new EventSource('/api/sse');

			// Connection opened
			this.eventSource.addEventListener('open', () => {
				console.log('SSE connection opened');
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;
				this.state.update((s) => ({
					...s,
					connected: true,
					reconnecting: false,
					error: null
				}));
			});

			// Connection established
			this.eventSource.addEventListener('connected', (e) => {
				const data = JSON.parse(e.data);
				console.log('SSE connected:', data);
			});

			// Heartbeat
			this.eventSource.addEventListener('heartbeat', (e) => {
				const data = JSON.parse(e.data);
				this.state.update((s) => ({
					...s,
					lastHeartbeat: new Date(data.timestamp)
				}));
			});

			// Notification created
			this.eventSource.addEventListener('notification_created', (e) => {
				const notification = JSON.parse(e.data);
				this.addEvent('notification_created', notification);
				this.handleNotification(notification);
			});

			// Task updated
			this.eventSource.addEventListener('task_updated', (e) => {
				const data = JSON.parse(e.data);
				this.addEvent('task_updated', data);
			});

			// Project updated
			this.eventSource.addEventListener('project_updated', (e) => {
				const data = JSON.parse(e.data);
				this.addEvent('project_updated', data);
			});

			// Error handling
			this.eventSource.addEventListener('error', (e) => {
				console.error('SSE error:', e);
				this.state.update((s) => ({
					...s,
					connected: false,
					error: 'Connection error'
				}));

				// Attempt reconnection with exponential backoff
				this.attemptReconnect();
			});
		} catch (err) {
			console.error('Failed to create SSE connection:', err);
			this.state.update((s) => ({
				...s,
				connected: false,
				error: err instanceof Error ? err.message : 'Unknown error'
			}));
		}
	}

	/**
	 * Disconnect from SSE
	 */
	disconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		this.state.update((s) => ({
			...s,
			connected: false,
			reconnecting: false
		}));
	}

	/**
	 * Attempt to reconnect with exponential backoff
	 */
	private attemptReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnect attempts reached');
			this.state.update((s) => ({
				...s,
				error: 'Failed to reconnect after multiple attempts'
			}));
			return;
		}

		this.state.update((s) => ({ ...s, reconnecting: true }));

		this.reconnectTimer = setTimeout(() => {
			console.log(
				`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`
			);
			this.reconnectAttempts++;
			this.reconnectDelay *= 2; // Exponential backoff
			this.connect();
		}, this.reconnectDelay);
	}

	/**
	 * Add event to events store
	 */
	private addEvent(type: string, data: unknown) {
		this.events.update((events) => {
			const newEvent: SSEEvent = {
				type,
				data,
				timestamp: new Date()
			};
			// Keep only last 100 events
			return [newEvent, ...events].slice(0, 100);
		});
	}

	/**
	 * Handle notification event
	 */
	private handleNotification(notification: unknown) {
		// You can integrate with toast/notification UI here
		console.log('New notification:', notification);

		// Example: Show toast notification
		if (browser && 'Notification' in window && Notification.permission === 'granted') {
			// You can show browser notification here
		}
	}

	/**
	 * Clear all events
	 */
	clearEvents() {
		this.events.set([]);
	}
}

// Export singleton instance
export const sseStore = new SSEStore();
